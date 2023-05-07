// Red line here on Portfolio
import { PrismaClient, Portfolio, StockPosition } from "@prisma/client";
import { NotFoundError, BadRequestError } from "./errors";

export type PortfolioWithPositions = Portfolio & {
  positions: StockPosition[];
};

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
