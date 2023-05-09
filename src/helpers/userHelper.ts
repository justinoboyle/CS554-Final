import { PrismaClient, User, Portfolio, StockEODData } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  AlreadyExistsError,
  NotFoundError,
  UserError,
  BadRequestError,
} from "./errors";
import { getPortfolioById } from "./portfolioHelper";
import { PortfolioJoined, wrapReturns } from "./portfolioHelper";
import prisma from "./dbHelper";

// Don't send hashed password back to user
export type SanitizedUser = {
  id: string;
  email: string;
  name?: string;
  portfolioIds: string[];
  watchlist: string[];
};

export type UserSession = {
  isLoggedIn: boolean;
  login: string;
  user?: SanitizedUser;
};

export const createUser = async (
  email: string,
  password: string,
  name: string
): Promise<SanitizedUser> => {
  // check if the email exists
  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userExists) {
    throw new AlreadyExistsError("User with that username already exists!");
  }

  const passwordBcrypt = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordBcrypt: passwordBcrypt,
      name,
    },
  });

  return sanitizeUser(user);
};

export const authorizeLogin = async (
  email: string,
  password: string
): Promise<SanitizedUser> => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (!user.passwordBcrypt) {
    throw new NotFoundError("User does not have a password");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordBcrypt);

  if (!passwordMatch) {
    throw new BadRequestError("Bad request: password does not match");
  }

  return sanitizeUser(user);
};

export const sanitizeUser = (user: User): SanitizedUser => {
  return {
    id: user.id,
    email: user.email,
    name: user?.name || undefined,
    portfolioIds: user.portfolioIds,
    watchlist: user.watchlist,
  };
};

export const getUserById = async (
  id: string
): Promise<SanitizedUser | null> => {

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) return null;

  return sanitizeUser(user);
};

export const getUserPortfolios = async (
  userId: string | undefined
): Promise<PortfolioJoined[]> => {
  if (!userId) throw new BadRequestError("Invalid user ID");

  const portfolios = await prisma.portfolio.findMany({
    where: {
      userId,
    },
    include: {
      positions: true,
    },
  });

  if (!portfolios) {
    return [];
  }
  // map to wrapReturns
  const portfoliosWithReturns = await Promise.all(
    portfolios.map((portfolio) => wrapReturns(portfolio))
  );
  return portfoliosWithReturns;
};

export const getUserWatchlist = async (
  userId: string
): Promise<StockEODData[]> => {
  if (!userId) throw new BadRequestError("Invalid user ID");

  const user = await getUserById(userId);

  if (!user) throw new NotFoundError("User not found");

  let watchlist = Promise.all(
    user.watchlist.map(async (stockId) => {
      let stock = await prisma.stockEODData.findUnique({
        where: {
          id: stockId,
        },
      });
      if (!stock) throw new NotFoundError("Stock not found");
      return stock;
    })
  );

  return watchlist;
};
