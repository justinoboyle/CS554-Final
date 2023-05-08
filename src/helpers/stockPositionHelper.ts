// Red line here on Portfolio
import { PrismaClient, StockPosition } from "@prisma/client";
import { NotFoundError } from "./errors";
import { MARKETSTACK_API_KEY, MarketstackResponse, MarketstackEod } from "./marketstackHelper"
import axios from "axios";

type StockPositionReturns = {
    asAmount: number,
    asPercentage: number
}

export const createStockPosition = async (
    createdAt: Date,
    ticker: string,
    amount: number,
): Promise<StockPosition> => {
    const prisma = new PrismaClient();

    const stockPosition = await prisma.stockPosition.create({
        data: {
            createdAt,
            ticker,
            amount
        }
    });

    return stockPosition;
};

export const getStockPositionById = async (
    id: string
  ): Promise<StockPosition> => {
    const prisma = new PrismaClient();
  
    const stockPosition = await prisma.stockPosition.findUnique({
      where: {
        id,
      }
    });
  
    if (!stockPosition) throw new NotFoundError("Stock position not found");
  
    return stockPosition;
};

// TODO: Needs more testing
export const getPriceAtTime = async (
    ticker: string,
    time: Date
) : Promise<number> => {
    const { data } = await axios.get(
        `http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${ticker}&date_from=${time}&date_to=${time}`
      );
    
      const { data: eodData } = data as MarketstackResponse<MarketstackEod[]>;
    
      if (!eodData.length) throw new Error("No data found");
    
      return eodData[0].close;
}

export const calculateStockPositionReturns = (
    stockPosition: StockPosition,
    purchasePrice: number,
    currentPrice: number,
  ): StockPositionReturns => {
   const returns = {
        asAmount: (currentPrice - purchasePrice) * stockPosition.amount,
        asPercentage: (currentPrice - purchasePrice) / purchasePrice
    }
    return returns;
};