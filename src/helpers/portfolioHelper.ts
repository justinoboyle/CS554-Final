import { NotFoundError, BadRequestError } from "./errors";
import { PrismaClient, Portfolio, StockPosition } from "@prisma/client";
// import { getPriceAtTime } from "../helpers/stockPositionHelper";
import {
  getAllKnownPricesBetweenDateRange,
  doesDatabaseHaveEODDataByDay,
  persistEODDataForPastNYears,
} from "./marketstackHelper";
import prisma from "./dbHelper";

import moment from "moment-timezone";

type WithPositions = {
  positions: StockPosition[];
};
type EarningsAt = {
  date: string;
  positions: {
    ticker: string;
    amount: number;
    pricePerShare: number;
    boughtAtDay: string;
  }[];
  totalValue: number;
};
type WithReturns = {
  returns?: {
    earningsAt: EarningsAt[];
    totalPrincipal: number;
    totalValueToday: number;
    totalPercentChange: number;
  };
};

type PortfolioReturns = {
  asAmount: number;
  asPercent: number;
};

export type PortfolioJoined = Portfolio & WithPositions & WithReturns;

export const wrapReturns = async (
  portfolio: Portfolio & WithPositions
): Promise<PortfolioJoined> => {
  try {
    const positions = portfolio.positions;

    const today = moment().format("YYYY-MM-DD");

    const yearAgo = moment().subtract(1, "year").format("YYYY-MM-DD");

    // list of 0 to 365
    const listOfDays = Array.from(Array(365).keys());

    // create date ranges
    const startDate = moment(yearAgo).format("YYYY-MM-DD");
    const endDate = moment(today).format("YYYY-MM-DD");

    // pick a random weekday between startDay and endDay
    let randomDay = moment(startDate, "YYYY-MM-DD").add(
      Math.floor(Math.random() * 365),
      "day"
    );

    // make sure not a weekend
    while (randomDay.day() === 0 || randomDay.day() === 6) {
      randomDay = moment(startDate, "YYYY-MM-DD").add(
        Math.floor(Math.random() * 365),
        "day"
      );
    }

    // does db have that day for each position
    const doesNotHavePrice = (
      await Promise.all(
        positions.map(async (position) => {
          const ticker = position.ticker;
          // doesDatabaseHaveEODDataByDay
          const hasPrice = await doesDatabaseHaveEODDataByDay(
            position.ticker,
            randomDay.format("YYYY-MM-DD")
          );

          const ret = { ticker, hasPrice: !!hasPrice };

          return ret;
        })
      )
    ).filter(({ hasPrice }) => !hasPrice);

    // if any don't have that price, get past 10 years of prices for each
    await Promise.all(
      doesNotHavePrice.map(async ({ ticker, hasPrice }) => {
        // get all prices for that position
        // persistEODDataForPastNYears
        return await persistEODDataForPastNYears(ticker, 10);
      })
    );

    // for each security, generate a cache
    const cache = await Promise.all(
      positions.map(async (position) => {
        const prices = await getAllKnownPricesBetweenDateRange(
          position.ticker,
          startDate,
          endDate
        );
        return {
          positionId: position.id,
          createdAt: position.createdAt,
          ticker: position.ticker,
          prices: prices,
        };
      })
    );

    // for each day
    const daysWithEarnings = await Promise.all(
      listOfDays.map(async (i) => {
        // add to yearAgo make sure new
        const day = moment(yearAgo).add(i, "day").format("YYYY-MM-DD");
        // get all the positions we had on that day
        const positionsOnDay = positions.filter((position) => {
          // use moment is before
          const isAfter = moment(position.createdAt).isAfter(day);
          return !isAfter;
        });

        // get the price of each position on that day
        const positionsOnDayWithPrice = await Promise.all(
          positionsOnDay.map(async (position) => {
            // check local cache for positionId
            const cacheForPosition = cache.find(
              (cache) => cache.positionId === position.id
            );
            // if we have a cache for position, check if we have the price
            // for this day
            if (cacheForPosition) {
              const priceForDay = cacheForPosition.prices.find(
                (price) =>
                  new Date(day).getTime() === new Date(price.date).getTime()
              );
              // if we have the price, return it
              if (priceForDay) {
                return {
                  ...position,
                  price: priceForDay.close,
                };
              }
            }
            // check is weekend
            const isWeekend =
              moment(day).day() === 0 || moment(day).day() === 6;
            // we don't have that day. return -1
            return {
              ...position,
              price: -1,
            };
          })
        );

        const earningsAt: EarningsAt = {
          date: day,
          positions: positionsOnDayWithPrice.map((position) => ({
            ticker: position.ticker,
            amount: position.amount,
            pricePerShare: position.price,
            boughtAtDay: moment(position.createdAt).format("YYYY-MM-DD"),
          })),
          totalValue: positionsOnDayWithPrice
            ?.filter((a) => a.price != -1)
            .reduce(
              (acc, position) => acc + position.amount * position.price,
              0
            ),
        };
        //
        return earningsAt;
      })
    );

    let i: EarningsAt[] = [];
    let flag = false;
    for (let x of daysWithEarnings) {
      if (!flag) {
        if (x.totalValue == 0) continue;
      }
      flag = true;
      // remove -1
      x.positions = x.positions.filter(
        (position) => position.pricePerShare !== -1
      );
      i.push(x);
    }

    // get the total price we paid out of pocket
    // iterate through all positions, get the price of the position at the buy date
    // add all of those up

    // ignore today
    // const daysWithEarningsWithoutToday = daysWithEarnings.filter(
    //   (day) => day.date !== today
    // );
    const lastDayWithEarnings =
      daysWithEarnings?.length > 0
        ? daysWithEarnings[daysWithEarnings.length - 1]
        : null;

    // promise all
    const amountWePutIn = (
      await Promise.all(
        positions.map(async (position) => {
          // not added after last day wit earnings!!!
          if (
            lastDayWithEarnings &&
            moment(position.createdAt).isAfter(lastDayWithEarnings.date)
          )
            return 0;
          // check cache
          const cacheForPosition = cache.find(
            (cache) => cache.positionId === position.id
          );
          // if we have a cache for position, check if we have the price
          // for this day
          if (cacheForPosition) {
            const priceForDay = cacheForPosition.prices.find(
              (price) =>
                new Date(position.createdAt).getTime() ===
                new Date(price.date).getTime()
            );
            // if we have the price, return it
            if (priceForDay) {
              return priceForDay.close * position.amount;
            } else {
              // do we have one WITHIN TWO DAYS of it check (moment)
              const priceForDay = cacheForPosition.prices
                // sorted from newest to oldest
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .find((price) =>
                  moment(position.createdAt).isSameOrBefore(price.date)
                );
              console.log(
                "Using " + priceForDay?.date + " for " + position.createdAt
              );
              if (priceForDay) {
                return priceForDay.close * position.amount;
              }
            }
          }
          return -1;
        })
      )
    ).filter((a) => a !== -1);

    const reducedAmountWePutIn = amountWePutIn.reduce(
      (acc, amount) => acc + amount,
      0
    );

    // get the total value of the portfolio today
    const totalValueToday =
      daysWithEarnings?.length > 0
        ? daysWithEarnings[daysWithEarnings.length - 1]?.totalValue
        : 0;

    const totalPercentChange =
      reducedAmountWePutIn == 0
        ? 0
        : (totalValueToday - reducedAmountWePutIn) / reducedAmountWePutIn;

    console.log(totalValueToday, reducedAmountWePutIn, totalPercentChange);

    return {
      ...portfolio,
      returns: {
        earningsAt: i,
        totalPrincipal: reducedAmountWePutIn,
        totalValueToday: totalValueToday,
        totalPercentChange,
      },
    };
  } catch (e) {
    console.error(e);
    return portfolio;
  }
};

export const createPortfolio = async (
  title: string,
  userId: string
): Promise<PortfolioJoined> => {
  if (!userId) throw new NotFoundError("User not found");

  const portfolio = await prisma.portfolio.create({
    data: {
      title,
      userId,
    },
    include: {
      positions: true,
    },
  });

  return wrapReturns(portfolio);
};

export const getPortfolioById = async (
  portfolioId: string | undefined
): Promise<PortfolioJoined> => {
  if (!portfolioId) throw new NotFoundError("User not found");

  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
    include: {
      positions: true,
    },
  });

  if (!portfolio) throw new NotFoundError("Portfolio not found");

  return wrapReturns(portfolio);
};

export const getPortfoliosByUser = async (
  userId: string
): Promise<PortfolioJoined[]> => {
  // also join securities

  const portfolios = await prisma.portfolio.findMany({
    where: {
      userId,
    },
    include: {
      positions: true,
    },
  });

  //map to addReturns
  const portfoliosWithReturns = await Promise.all(
    portfolios.map((portfolio) => wrapReturns(portfolio))
  );
  return portfoliosWithReturns;
};

export const deletePortfolio = async (
  portfolioId: string,
  userId: string
): Promise<boolean> => {
  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });

  if (!portfolio) throw new NotFoundError("Portfolio not found");

  // ensure user owns it
  if (portfolio.userId !== userId) throw new BadRequestError("Invalid user ID");

  await prisma.portfolio.delete({
    where: {
      id: portfolioId,
    },
  });

  return true;
};

export const deleteSinglePosition = async (
  positionId: string
): Promise<boolean> => {
  console.log(positionId)
  const position = await prisma.stockPosition.findUnique({
    where: {
      id: positionId,
    },
  });

  if (!position) throw new NotFoundError("Position not found");

  await prisma.stockPosition.delete({
    where: {
      id: positionId,
    },
  });

  return true;
};

export const addPosition = async (
  portfolioId: string,
  ticker: string,
  shares: number,
  dayPurchased: string
): Promise<StockPosition> => {
  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });

  if (!portfolio) throw new NotFoundError("Portfolio not found");

  const position = await prisma.stockPosition.create({
    data: {
      portfolioId,
      ticker,
      amount: shares,
      createdAt: new Date(dayPurchased),
    },
  });

  return position;
};
