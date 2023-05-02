// Red line here on Portfolio
import { PrismaClient, Portfolio } from "@prisma/client";
import { 
  NotFoundError,
  BadRequestError
} from "./errors";

export const createPortfolio = async (
  title: String
): Promise<Portfolio> => {
  const prisma = new PrismaClient();

  // Red line here on portfolio
  const portfolio = await prisma.portfolio.create({

  });
}