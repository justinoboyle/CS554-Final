import axios from "axios";
import { PrismaClient, StockEODData, KnownHolidays } from "@prisma/client";
import prisma from "./dbHelper";

import moment from "moment-timezone";

export const { MARKETSTACK_API_KEY } = process.env;

export type MarketstackResponse<T> = {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: T;
};

export type MarketstackEod = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_high: number;
  adj_low: number;
  adj_close: number;
  adj_open: number;
  adj_volume: number;
  symbol: string;
  exchange: string;
  date: string;
};

export const getEODUncachedFromMarketstack = async (
  symbol: string,
  date: string
): Promise<MarketstackEod> => {
  // check if we're running in a browser
  if (typeof window !== "undefined") {
    throw new Error("Cannot call this function from the browser");
  }
  const { data, headers, status } = await axios.get(
    `http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&date_from=${date}&date_to=${date}`
  );

  const { data: eodData } = data as MarketstackResponse<MarketstackEod[]>;

  if (!eodData.length) {
    // check if we're being rate limited
    if (status === 429) {
      console.log("Rate limited!");
    } else {
      // add to known holidays
      await prisma.knownHolidays.create({
        data: {
          date: new Date(date),
        },
      });
    }
    throw new Error(
      "No data found for day " + date + " -- got status " + status
    );
  }

  return eodData[0];
};

export const getEODUncachedByDateRange = async (
  symbol: string,
  dateFrom: string,
  dateTo: string
): Promise<MarketstackEod[]> => {
  // check if we're running in a browser
  if (typeof window !== "undefined") {
    throw new Error("Cannot call this function from the browser");
  }
  const { data } = await axios.get(
    `http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&date_from=${dateFrom}&date_to=${dateTo}`
  );

  const { data: eodData } = data as MarketstackResponse<MarketstackEod[]>;

  if (!eodData.length) throw new Error("No data found");
  // find all gaps between days
  // const gaps = eodData.reduce((acc, curr, index) => {
  //   if (index === 0) return acc;
  //   const currDate = moment(curr.date);
  //   const prevDate = moment(eodData[index - 1].date);
  //   const diff = currDate.diff(prevDate, "days");
  //   if (diff > 1) {
  //     acc.push({
  //       dateFrom: prevDate.format("YYYY-MM-DD"),
  //       dateTo: currDate.format("YYYY-MM-DD"),
  //     });
  //   }
  //   return acc;
  // }, [] as { dateFrom: string; dateTo: string }[]);

  return eodData;
};

export const doesDatabaseHaveEODDataByDay = async (
  symbol: string,
  date: string
): Promise<StockEODData | null> => {
  // symbol = symbol and date = date, keep in mind date in the db is a DateTime
  const eodData = await prisma.stockEODData.findFirst({
    where: {
      symbol,
      date: new Date(date),
    },
  });
  return eodData;
};

export const persistEODDataByDay = async (
  eodData: MarketstackEod
): Promise<StockEODData> => {
  // check if the date and security is already persisted in db
  const existingEodData = await doesDatabaseHaveEODDataByDay(
    eodData.symbol,
    eodData.date
  );

  if (existingEodData) return existingEodData;

  console.log("Persisting", eodData?.symbol, "on", eodData?.date);

  const persistedEodData = await prisma.stockEODData.create({
    data: {
      symbol: eodData.symbol,
      date: new Date(eodData.date),
      open: eodData.open,
      high: eodData.high,
      low: eodData.low,
      close: eodData.close,
      volume: eodData.volume,
      adj_high: eodData.adj_high,
      adj_low: eodData.adj_low,
      adj_close: eodData.adj_close,
      adj_open: eodData.adj_open,
      adj_volume: eodData.adj_volume,
      exchange: eodData.exchange,
      dividend: 0,
      split_factor: 0,
    },
  });

  return persistedEodData;
};

// only allow 10,000 entries at a time
// format: YYYY-MM-DD-security
type key = `${string}-${string}-${string}-${string}`;
const localPriceCache = new Map<string, number>();

function checkLocalCache(symbol: string, date: string) {
  const key = `${symbol}-${date}`;
  return localPriceCache.get(key);
}

function setLocalCache(symbol: string, date: string, price: number) {
  const key = `${symbol}-${date}`;
  // check if already there
  if (localPriceCache.has(key)) return;
  localPriceCache.set(key, price);
  // check length, remove oldest
  if (localPriceCache.size > 10000) {
    localPriceCache.delete(localPriceCache.keys().next().value);
  }
}

export const getAllKnownPricesBetweenDateRange = async (
  symbol: string,
  dateFrom: string,
  dateTo: string
): Promise<StockEODData[]> => {
  // check if we're running in a browser
  if (typeof window !== "undefined") {
    throw new Error("Cannot call this function from the browser");
  }

  const eodData = await prisma.stockEODData.findMany({
    where: {
      symbol,
      date: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
    },
  });

  // put all close prices in memory
  eodData.forEach((eod) => {
    setLocalCache(eod.symbol, moment(eod.date).format("YYYY-MM-DD"), eod.close);
  });

  return eodData;
};

export const getStockPriceOnDate = async (
  symbol: string,
  date: string,
  iterations?: number
): Promise<number> => {
  const lcl = checkLocalCache(symbol, date);
  if (lcl) return lcl;

  // if it's a weekend go back one day
  const dayOfWeek = moment(date).day();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const res = await getStockPriceOnDate(
      symbol,
      moment(date).subtract(1, "days").format("YYYY-MM-DD"),
      iterations ? iterations + 1 : 0
    );
    setLocalCache(symbol, date, res);
    return res;
  }

  // check if it's on a known holiday
  const knownHoliday = await prisma.knownHolidays.findFirst({
    where: {
      date: new Date(date),
    },
  });

  if (knownHoliday) {
    const res = await getStockPriceOnDate(
      symbol,
      moment(date).subtract(1, "days").format("YYYY-MM-DD"),
      iterations ? iterations + 1 : 0
    );
    setLocalCache(symbol, date, res);
    return res;
  }

  let eodData = await prisma.stockEODData.findFirst({
    where: {
      symbol,
      date: new Date(date),
    },
  });

  try {
    let temp = await getEODUncachedFromMarketstack(symbol, date);
    eodData = await persistEODDataByDay(temp);
    // holidays
    if (!eodData) {
      if (iterations && iterations > 5)
        throw new Error("Can't find that security (" + symbol + ")");
      const res = await getStockPriceOnDate(
        symbol,
        moment(date).subtract(1, "days").format("YYYY-MM-DD"),
        iterations ? iterations + 1 : 0
      );
      setLocalCache(symbol, date, res);
      return res;
    }
    if (eodData) return eodData.close;

    return 0;
  } catch (e) {
    // maybe a holiday
    if (iterations && iterations > 5)
      throw new Error("Can't find that security (" + symbol + ")");
    const res = await getStockPriceOnDate(
      symbol,
      moment(date).subtract(1, "days").format("YYYY-MM-DD"),
      iterations ? iterations + 1 : 0
    );
    setLocalCache(symbol, date, res);
    return res;
  }
  // persistEODDataForPastNYears
  // get and persist data for that day
};

export const persistEODDataForPastNYears = async (
  symbol: string,
  years: number
): Promise<StockEODData[]> => {
  const today = new Date();

  const dateTo = today.toISOString().split("T")[0];

  const dateFrom = new Date(
    today.getFullYear() - years,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  const eodData = await getEODUncachedByDateRange(symbol, dateFrom, dateTo);

  // if invalid, stop and throw error immediately
  if (!eodData.length)
    throw new Error("Can't find that security (" + symbol + ")");

  const persistedEodData = await Promise.all(
    eodData.map(async (eod) => {
      const persistedEod = await persistEODDataByDay(eod);
      return persistedEod;
    })
  );

  return persistedEodData;
};

export const doesSecurityExist = async (symbol: string): Promise<boolean> => {
  // see if we have any EOD data for it?
  const eodData = await prisma.stockEODData.findMany({
    where: {
      symbol,
    },
  });

  if (eodData.length) return true;

  // check if we have it in any tracked positions in our db

  const trackedPositions = await prisma.stockPosition.findMany({
    where: {
      ticker: symbol,
    },
  });

  if (trackedPositions.length) return true;

  // if not, try to get data for it from marketstack for past 10 years
  try {
    await persistEODDataForPastNYears(symbol, 10);
    return true;
  } catch (error) {
    return false;
  }

  // if that fails, return false
  return false;
};
