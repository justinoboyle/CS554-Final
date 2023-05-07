// https://vercel.com/blog/cron-jobs

import { NextApiRequest, NextApiResponse } from "next";

import {
  getEODDataByDateRange,
  persistEODDataByDay,
} from "../../../helpers/marketstackHelper";

import { StockEODData, StockPosition, PrismaClient } from "@prisma/client";
import moment from "moment-timezone";

const getAllUniqueTrackedTickers = async (): Promise<string[]> => {
  const prisma = new PrismaClient();
  const allTrackedSecurities = await prisma.stockPosition.findMany({
    select: {
      ticker: true,
    },
    distinct: ["ticker"],
  });
  return allTrackedSecurities?.map((s) => s.ticker);
};

const getMostRecentClosePrice = async (
  ticker: string
): Promise<StockEODData | null> => {
  const prisma = new PrismaClient();
  const mostRecentClosePrice = await prisma.stockEODData.findFirst({
    where: {
      symbol: ticker,
    },
    orderBy: {
      date: "desc",
    },
  });
  return mostRecentClosePrice;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // get all tracked stocks
  // for each stock, get the latest close price and the date
  // then persist in db

  const trackedSecurities = await getAllUniqueTrackedTickers();

  // missing tickers
  const missingTickers: string[] = [];

  // for each tracked security, get the most recent close price + date we have
  const mostRecentClosePrices = (
    await Promise.all(
      trackedSecurities.map(async (ticker) => {
        const mostRecentClosePrice = await getMostRecentClosePrice(ticker);
        if (!mostRecentClosePrice) {
          missingTickers.push(ticker);
          return null;
        }
        return mostRecentClosePrice;
      })
    )
  ).filter((p) => p !== null) as StockEODData[];

  type TickerQuery = {
    ticker: string;
    startDate: moment.Moment;
    endDate: moment.Moment;
  };

  // We're going to need all tickers up to today's date if it's after 6 pm EST
  // on a weekday, or yesterday's date if it's before 6 pm EST on a weekday.

  // If it's a weekend, we'll need Friday's date.

  // Make sure all calculations are in Eastern Time/New York.

  let fetchFor = moment().tz("America/New_York");

  const isWeekend = fetchFor.day() === 0 || fetchFor.day() === 6;

  // add an extra hour on each end for padding
  const isMarketOpen = fetchFor.hour() >= 8 && fetchFor.hour() <= 17;

  // if market is open, back one day
  if (isMarketOpen) {
    fetchFor = fetchFor.day(-1);
  }

  // if it's a weekend, get closest friday
  // if it's a weekday, get today's date
  const endDate = isWeekend
    ? fetchFor.day(fetchFor.day() === 0 ? -2 : -1)
    : fetchFor;

  // we're going to generate the missing date ranges from [Jan 1 2013, fetchFor] inclusive. for any gaps, we'll need a TickerQuery entry

  const entries: TickerQuery[] = [];

  for (let data of mostRecentClosePrices) {
    const { symbol, date } = data;

    // time since
    const timeSince = moment(date)
      .tz("America/New_York")
      .diff(moment().tz("America/New_York"), "days");

    // if it's been more than 1 day, we need to fetch
    if (timeSince > 1) {
      entries.push({
        ticker: symbol,
        startDate: moment(date).tz("America/New_York"),
        endDate: endDate,
      });
    }
  }

  // if there are missing tickers, we need to fetch for all of them
  if (missingTickers.length > 0) {
    for (let ticker of missingTickers) {
      entries.push({
        ticker,
        startDate: moment("2013-01-01").tz("America/New_York"),
        endDate: endDate,
      });
    }
  }

  // if there are no entries, we're done
  if (entries.length === 0) {
    res.status(200).json({
      success: true,
      message: "No entries to fetch",
    });
    return;
  }

  // otherwise, we need to fetch
  const fetchResults = (
    await Promise.all(
      entries.map(async (entry) => {
        const { ticker, startDate, endDate } = entry;
        const data = await getEODDataByDateRange(
          ticker,
          startDate.format("YYYY-MM-DD"),
          endDate.format("YYYY-MM-DD")
        );
        return data;
      })
    )
  ).reduce((acc, val) => acc.concat(val), []);

  const persistResults = await Promise.all(
    fetchResults.map(async (data) => {
      const { symbol, date, close } = data;
      return await persistEODDataByDay(data);
    })
  );

  res.status(200).json({
    success: true,
    message: "Successfully fetched and persisted data",
    data: persistResults,
  });
};

export default handler;
