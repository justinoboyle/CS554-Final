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

    const stockPosition = await prisma.stockposition.create({  // TODO: check stockposition name (p vs P)
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
  
    const stockPosition = await prisma.stockposition.findUnique({
      where: {
        id,
      }
    });
  
    if (!stockPosition) throw new NotFoundError("Stock position not found");
  
    return stockPosition;
};

// TODO
export const getPriceAtTime = (  // TODO: Don't forget to make async once actually functioning
    ticker: string,
    time: Date
) : number => {
    return 10
}

export const calculateStockPositionReturns = (
    stockPosition: StockPosition
  ): StockPositionReturns => {
    const purchasePrice = getPriceAtTime("TODO: get ticker", stockPosition.createdAt);  // TODO: get price at createdAt
    const currentPrice = getPriceAtTime("TODO: get ticker", new Date());  // TODO: get price at now
    const returns = {
        asAmount: (currentPrice - purchasePrice) * stockPosition.amount,
        asPercentage: (currentPrice - purchasePrice) / purchasePrice
    }
    return returns;
};