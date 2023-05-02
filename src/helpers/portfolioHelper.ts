// Red line here on Portfolio
import { PrismaClient, Portfolio } from "@prisma/client";
import { 
  NotFoundError,
  BadRequestError
} from "./errors";

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
}

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
}