// Red line here on Portfolio
import { PrismaClient, StockPosition } from "@prisma/client";
import {
    NotFoundError,
    BadRequestError
} from "./errors";

type StockPositionReturns = {
    asAmount: number,
    asPercentage: number
}

export const createStockPosition = async (
    createdAt: string,
    amount: string,
): Promise<StockPosition> => {
    const prisma = new PrismaClient();

    const stockPosition = await prisma.stockPosition.create({  // TODO: check stockposition name (p vs P)
        data: {
            createdAt,
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

// TODO
export const getPriceAtTime = async (
    ticker: string,
    time: Date
) : Promise<number> => {
    return 10;
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