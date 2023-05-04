import { PrismaClient, User, Portfolio } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  AlreadyExistsError,
  NotFoundError,
  UserError,
  BadRequestError,
} from "./errors";
import { getPortfolioById } from "./portfolioHelper";

// Don't send hashed password back to user
export type SanitizedUser = {
  id: string;
  email: string;
  name?: string;
  portfolioIds: string[];
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
  const prisma = new PrismaClient();

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
  const prisma = new PrismaClient();

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
  };
};

export const getUserById = async (
  id: string
): Promise<SanitizedUser | null> => {
  const prisma = new PrismaClient();

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) return null;

  return sanitizeUser(user);
};

export const getUserPortfolios = async (id: string): Promise<Portfolio[]> => {
  const prisma = new PrismaClient();

  const user = await getUserById(id);

  if (!user) throw new NotFoundError("User not found");

  let portfolios = Promise.all(
    user.portfolioIds.map(
      async (portfolioId) => await getPortfolioById(portfolioId)
    )
  );

  return portfolios;
};
