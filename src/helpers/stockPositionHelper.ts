// Red line here on Portfolio
import { PrismaClient, StockPosition } from "@prisma/client";
import { NotFoundError } from "./errors";
import { MARKETSTACK_API_KEY, MarketstackResponse, MarketstackEod } from "./marketstackHelper"
import axios from "axios";
import prisma from "./dbHelper";

export type StockPositionReturns = {
    asAmount: number,
    asPercentage: number
}

export const createStockPosition = async (
    createdAt: Date,
    ticker: string,
    amount: number,
): Promise<StockPosition> => {

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
  
    const stockPosition = await prisma.stockPosition.findUnique({
      where: {
        id,
      }
    });
  
    if (!stockPosition) throw new NotFoundError("Stock position not found");
  
    return stockPosition;
};