import { NotFoundError, BadRequestError } from "./errors";
import { PrismaClient, Portfolio, StockPosition } from "@prisma/client";
import { getPriceAtTime } from '../helpers/stockPositionHelper';

export type PortfolioWithPositions = Portfolio & {
  positions: StockPosition[];
};

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

// takes portfolio with positions
export const calculatePortfolioReturns = async (
  portfolio: PortfolioWithPositions
): Promise<PortfolioReturns> => {
  const portfolioPositions = portfolio.positions;
  let totalReturns = 0;
  let initialInvestment = 0;

  Promise.all(
    portfolioPositions.map(async (stockPosition: StockPosition) => {
      const purchasePrice = await getPriceAtTime(stockPosition.ticker, stockPosition.createdAt);
      const currentPrice = await getPriceAtTime(stockPosition.ticker, new Date());
      initialInvestment += stockPosition.amount * purchasePrice;  // cost basis
      totalReturns += (currentPrice - purchasePrice) * stockPosition.amount;
    })
  );

  return {
    asAmount: totalReturns,
    asPercentage: totalReturns / initialInvestment
  };
};

export const getPortfoliosByUser = async (
  userId: string
): Promise<PortfolioWithPositions[]> => {
  // also join securities
  const prisma = new PrismaClient();

  const portfolios = await prisma.portfolio.findMany({
    where: {
      userId,
    },
    include: {
      positions: true,
    },
  });

  return portfolios;
};

export const deletePortfolio = async (
  portfolioId: string,
  userId: string
): Promise<boolean> => {
  const prisma = new PrismaClient();

  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id: portfolioId,
    },
  });

  if (!portfolio) throw new NotFoundError("Portfolio not found");

  // ensure user owns it
  if (portfolio.userId !== userId) throw new BadRequestError("Invalid user ID");

  await prisma.portfolio.delete({
    where: {
      id: portfolioId,
    },
  });

  return true;
};
