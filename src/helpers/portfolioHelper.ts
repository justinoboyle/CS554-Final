// Red line here on Portfolio
import { PrismaClient, Portfolio } from "@prisma/client";
import { 
  NotFoundError,
  BadRequestError
} from "./errors";

export const createPortfolio = async (
  title: string
): Promise<Portfolio> => {
  const prisma = new PrismaClient();

  const portfolio = await prisma.portfolio.create({
    data: {
      title,
    }
  });

  return portfolio;
}