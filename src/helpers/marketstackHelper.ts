const { MARKETSTACK_API_KEY } = process.env;

import axios from "axios";

import { PrismaClient, StockEODData } from "@prisma/client";

type MarketstackResponse<T> = {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: T;
};

type MarketstackEod = {
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

export const getEODDataByDay = async (
  symbol: string,
  date: string
): Promise<MarketstackEod> => {
  const { data } = await axios.get(
    `http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&date_from=${date}&date_to=${date}`
  );

  const { data: eodData } = data as MarketstackResponse<MarketstackEod[]>;

  if (!eodData.length) throw new Error("No data found");

  return eodData[0];
};

export const getEODDataByDateRange = async (
  symbol: string,
  dateFrom: string,
  dateTo: string
): Promise<MarketstackEod[]> => {
  const { data } = await axios.get(
    `http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&date_from=${dateFrom}&date_to=${dateTo}`
  );

  const { data: eodData } = data as MarketstackResponse<MarketstackEod[]>;

  if (!eodData.length) throw new Error("No data found");

  return eodData;
};

export const doesDatabaseHaveEODDataByDay = async (
  symbol: string,
  date: string
): Promise<StockEODData | null> => {
  const prisma = new PrismaClient();

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

  const prisma = new PrismaClient();

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

export const persistEODDataForPastNYears = async (
  symbol: string,
  years: number
): Promise<StockEODData[]> => {
  const prisma = new PrismaClient();

  const today = new Date();

  const dateTo = today.toISOString().split("T")[0];

  const dateFrom = new Date(
    today.getFullYear() - years,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  const eodData = await getEODDataByDateRange(symbol, dateFrom, dateTo);

  // if invalid, stop and throw error immediately
  if (!eodData.length) throw new Error("Can't find that security");

  const persistedEodData = await Promise.all(
    eodData.map(async (eod) => {
      const persistedEod = await persistEODDataByDay(eod);
      return persistedEod;
    })
  );

  return persistedEodData;
};

export const doesSecurityExist = async (symbol: string): Promise<boolean> => {
  const prisma = new PrismaClient();

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

  // if not, try to get data for it from marketstack for past year
  try {
    await persistEODDataForPastNYears(symbol, 1);
    return true;
  } catch (error) {
    return false;
  }
};
