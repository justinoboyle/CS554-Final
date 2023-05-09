import { NotFoundError, BadRequestError } from "./errors";
import { PrismaClient, Portfolio, StockPosition } from "@prisma/client";
// import { getPriceAtTime } from "../helpers/stockPositionHelper";
import { getStockPriceOnDate } from "./marketstackHelper";

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
  }[];
  totalValue: number;
};
type WithReturns = {
  returns: {
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
  const positions = portfolio.positions;

  const today = moment().format("YYYY-MM-DD");

  const yearAgo = moment().subtract(1, "year").format("YYYY-MM-DD");

  // list of 0 to 365
  const listOfDays = Array.from(Array(365).keys());

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
          const price = await getStockPriceOnDate(position.ticker, day);
          return {
            ...position,
            price: price,
          };
        })
      );

      const earningsAt: EarningsAt = {
        date: day,
        positions: positionsOnDayWithPrice.map((position) => ({
          ticker: position.ticker,
          amount: position.amount,
          pricePerShare: position.price,
        })),
        totalValue: positionsOnDayWithPrice.reduce(
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
    i.push(x);
  }

  // get the total price we paid out of pocket
  // iterate through all positions, get the price of the position at the buy date
  // add all of those up

  const lastDayWithEarnings =
    daysWithEarnings?.length > 0
      ? daysWithEarnings[daysWithEarnings.length - 1]
      : null;

  // promise all
  const amountWePutIn = await Promise.all(
    positions.map(async (position) => {
      // not added after last day wit earnings!!!
      if (
        lastDayWithEarnings &&
        moment(position.createdAt).isAfter(lastDayWithEarnings.date)
      )
        return 0;
      const price = await getStockPriceOnDate(
        position.ticker,
        moment(position.createdAt).format("YYYY-MM-DD")
      );
      return price * position.amount;
    })
  );

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

  return {
    ...portfolio,
    returns: {
      earningsAt: i,
      totalPrincipal: reducedAmountWePutIn,
      totalValueToday: totalValueToday,
      totalPercentChange,
    },
  };
};

export const createPortfolio = async (
  title: string,
  userId: string
): Promise<PortfolioJoined> => {
  if (!userId) throw new NotFoundError("User not found");

  const prisma = new PrismaClient();

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

  const prisma = new PrismaClient();
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

// takes portfolio with positions
// export const calculatePortfolioReturns = async (
//   portfolio: PortfolioJoined
// ): Promise<PortfolioReturns> => {
//   const portfolioPositions = portfolio.positions;
//   let totalReturns = 0;
//   let initialInvestment = 0;

//   Promise.all(
//     portfolioPositions.map(async (stockPosition: StockPosition) => {
//       const purchasePrice = await getPriceAtTime(
//         stockPosition.ticker,
//         stockPosition.createdAt
//       );
//       const currentPrice = await getPriceAtTime(
//         stockPosition.ticker,
//         new Date()
//       );
//       initialInvestment += stockPosition.amount * purchasePrice; // cost basis
//       totalReturns += (currentPrice - purchasePrice) * stockPosition.amount;
//     })
//   );

//   return {
//     asAmount: totalReturns,
//     asPercentage: totalReturns / initialInvestment,
//   };
// };

export const getPortfoliosByUser = async (
  userId: string
): Promise<PortfolioJoined[]> => {
  // also join securities
  const prisma = new PrismaClient();

  const portfolios : PortfolioJoined[] = await prisma.portfolio.findMany({
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
  const prisma = new PrismaClient();

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
  const prisma = new PrismaClient();

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
  const prisma = new PrismaClient();

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
