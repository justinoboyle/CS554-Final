// Red line here on Portfolio
import { PrismaClient, Portfolio, StockPosition } from "@prisma/client";
<<<<<<< HEAD
import { 
  getStockPositionById, 
  calculateStockPositionReturns, 
  getPriceAtTime 
} from '../helpers/StockPositionHelper'
import {
  NotFoundError,
  BadRequestError
} from "./errors";
=======
import { NotFoundError, BadRequestError } from "./errors";

export type PortfolioWithPositions = Portfolio & {
  positions: StockPosition[];
};
>>>>>>> 6009341fe826779e76fb4a4de3fa935eefdfdee6

type PortfolioReturns = {
  asAmount: number,
  asPercentage: number
}

export const createPortfolio = async (
  title: string,
  userId: string
): Promise<PortfolioWithPositions> => {
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

  return portfolio;
};

export const getPortfolioById = async (
  portfolioId: string | undefined
): Promise<PortfolioWithPositions> => {
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

  return portfolio;
};
<<<<<<< HEAD

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
=======
>>>>>>> 6009341fe826779e76fb4a4de3fa935eefdfdee6
