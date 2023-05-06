// Red line here on Portfolio
import { PrismaClient, Portfolio, StockPosition } from "@prisma/client";
import { 
  getStockPositionById, 
  calculateStockPositionReturns, 
  getPriceAtTime 
} from '../helpers/StockPositionHelper'
import {
  NotFoundError,
  BadRequestError
} from "./errors";

type PortfolioReturns = {
  asAmount: number,
  asPercentage: number
}

export const createPortfolio = async (
  title: string,
  userId: string,
): Promise<Portfolio> => {
  const prisma = new PrismaClient();

  const portfolio = await prisma.portfolio.create({
    data: {
      title,
      userId
    }
  });

  return portfolio;
};

export const getPortfolioById = async (
  id: string
): Promise<Portfolio> => {
  const prisma = new PrismaClient();

  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id,
    }
  });

  if (!portfolio) throw new NotFoundError("Portfolio not found");

  return portfolio;
};

export const calculatePortfolioReturns = async (
  portfolio: Portfolio
): Promise<PortfolioReturns> => {
  const portfolioPositions = portfolio.positions;
  let totalReturns = 0;
  let initialInvestment = 0;

  Promise.all(
    portfolioPositions.map(async (stockPosition : StockPosition) => {
      const currStockPosition = await getStockPositionById(stockPosition);
      const purchasePrice = getPriceAtTime("TODO: get ticker", currStockPosition.createdAt);  // TODO: get price at createdAt
      initialInvestment += currStockPosition.amount * purchasePrice;  // cost basis
      totalReturns += calculateStockPositionReturns(currStockPosition).asAmount;
    })
  );

  return {
    asAmount: totalReturns,
    asPercentage: totalReturns / initialInvestment
  }
};