import axios from "axios";
import { PrismaClient, StockEODData, KnownHolidays } from "@prisma/client";
import prisma from "./dbHelper";

const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});
client.connect().then(() => {});
const flatten = require('flat');
const unflatten = require('flat').unflatten;

import moment from "moment-timezone";

export const { MARKETSTACK_API_KEY } = process.env;

// only 5 requests allowed per second. wait and release functions
let lastQueryTimes: number[] = [];

const logQuery = () => {
  // add date.now
  lastQueryTimes.push(Date.now());
  // if any older than 20 seconds ago, remove
  const twentySecondsAgo = Date.now() - 20000;
  lastQueryTimes = lastQueryTimes.filter((t) => t > twentySecondsAgo);
};

const waitIfRequired = async () => {
  // count how many in last second
  const lastSecond = Date.now() - 1000;

  const lastSecondCount = lastQueryTimes.filter((t) => t > lastSecond).length;

  if (lastSecondCount >= 2) {
    // wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

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
  await waitIfRequired();
  const { data, headers, status } = await axios.get(
    `https://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&date_from=${date}&date_to=${date}`
  );
  logQuery();

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
  // if invalid symbol throw error
  if (!symbol || (symbol?.trim()?.length || 0) < 1) {
    throw new Error("Invalid symbol");
  }
  // check if we're running in a browser
  if (typeof window !== "undefined") {
    throw new Error("Cannot call this function from the browser");
  }

  // split calls into 2 year entities and then merge
  const dateFromMoment = moment(dateFrom);
  const dateToMoment = moment(dateTo);
  const diff = dateToMoment.diff(dateFromMoment, "years");
  if (diff > 2) {
    // split into 2 calls
    const dateFrom1 = dateFromMoment.format("YYYY-MM-DD");
    const dateTo1 = dateFromMoment.add(2, "years").format("YYYY-MM-DD");
    const dateFrom2 = dateFromMoment.add(1, "days").format("YYYY-MM-DD");
    const dateTo2 = dateToMoment.format("YYYY-MM-DD");
    try {
      const eodData1 = await getEODUncachedByDateRange(
        symbol,
        dateFrom1,
        dateTo1
      );
      const eodData2 = await getEODUncachedByDateRange(
        symbol,
        dateFrom2,
        dateTo2
      );

      return [...eodData1, ...eodData2];
    } catch (e) {
      console.error(e);
      return [];
    }
  }
  await waitIfRequired();
  const { data } = await axios.get(
    `https://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&date_from=${dateFrom}&date_to=${dateTo}&limit=1000`
  );
  logQuery();

  try {
    const { data: eodData } = data as MarketstackResponse<MarketstackEod[]>;

    if (!eodData.length) {
      return [];
    }

    // pagination
    const { pagination } = data as MarketstackResponse<MarketstackEod[]>;

    if (pagination.total > pagination.count) {
      console.error("Pagination not implemented yet");
    }

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
  } catch (e: any) {
    // check 429
    // check if type has response status
    if (e.response && e.response.status === 429) {
      console.log("Rate limited!" + e.response.status);
      throw e;
    }
    throw e;
  }
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

export const persistBulkEODDataByDay = async (
  eodData: MarketstackEod[]
): Promise<void> => {
  // get each unique security in eodData
  const securities = eodData.reduce((acc, curr) => {
    if (!acc.includes(curr.symbol)) {
      acc.push(curr.symbol);
    }
    return acc;
  }, [] as string[]);

  // get earliest and latest date in eodData
  const dates = eodData.reduce(
    (acc, curr) => {
      const currDate = moment(curr.date);
      if (currDate.isBefore(acc.earliest)) {
        acc.earliest = currDate;
      }
      if (currDate.isAfter(acc.latest)) {
        acc.latest = currDate;
      }
      return acc;
    },
    {
      earliest: moment(eodData[0].date),
      latest: moment(eodData[0].date),
    } as { earliest: moment.Moment; latest: moment.Moment }
  );

  // get all the known data between earliest and latest for known securities
  const knownData = await prisma.stockEODData.findMany({
    where: {
      symbol: {
        in: securities,
      },
      date: {
        gte: dates.earliest.toDate(),
        lte: dates.latest.toDate(),
      },
    },
  });

  // filter out known data from eodData
  const unknownData = eodData.filter((eod) => {
    const found = knownData.find(
      (known) =>
        known.symbol === eod.symbol &&
        // ignore time zone
        moment(known.date).format("YYYY-MM-DD") ===
          moment(eod.date).format("YYYY-MM-DD")
    );
    return !found;
  });

  // persist unknown data

  console.log("Persisting", unknownData.length, "entries");

  /* StockEODData without id */
  type Data = Omit<StockEODData, "id">;
  const data: Data[] = unknownData.map((eod) => ({
    symbol: eod.symbol,
    date: new Date(eod.date),
    open: eod.open,
    high: eod.high,
    low: eod?.low || 0,
    close: eod.close,
    volume: eod?.volume || 0,
    adj_high: eod?.adj_high || 0,
    adj_low: eod?.adj_low || 0,
    adj_close: eod?.adj_close || 0,
    adj_open: eod?.adj_open || 0,
    adj_volume: eod?.adj_volume || 0,
    exchange: eod?.exchange || "UNKNOWN",
    dividend: 0,
    split_factor: 0,
  }));
  try {
    if (data && data.length > 0) {
      const persistedEodData = await prisma.stockEODData.createMany({
        data,
      });
    }
  } catch (e) {
    console.error(e);
    console.log("...when trying to insert " + data.length + " entries")
  }

  return;
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

export const getAllKnownPricesBetweenDateRange = async (
  symbol: string,
  dateFrom: string,
  dateTo: string
): Promise<StockEODData[]> => {
  // check if we're running in a browser
  const key = symbol + '//' + dateFrom + '//' + dateTo;
  const inCache = await client.get(key);
  if (inCache !== null){
    const returnVal = unflatten(JSON.parse(inCache));
    return returnVal;
  }
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

  if (!(await client.exists(key))){
    await client.set(key, JSON.stringify(flatten(eodData)));
  }

  return eodData;
};

export const persistEODDataForPastNYears = async (
  symbol: string,
  years: number
): Promise<void> => {
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

  // const persistedEodData = await Promise.all(
  //   eodData.map(async (eod) => {
  //     const persistedEod = await persistEODDataByDay(eod);
  //     return persistedEod;
  //   })
  // );

  // persist bulk persistBulkEODDataByDay
  const persistedEodData = await persistBulkEODDataByDay(eodData);

  return;
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
};
