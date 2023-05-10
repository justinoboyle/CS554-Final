import { PrismaClient } from '@prisma/client';

import prisma from "./dbHelper";
import { getUserById } from './userHelper';
import { NotFoundError } from './errors';

export async function getWatchlistByUser(userId: string) {
  // also join securities

  const user = await getUserById(userId);

  if (!user) return null;

  console.log(user.watchlist);
  return user.watchlist;
} 