import { PrismaClient } from '@prisma/client';

import prisma from "./dbHelper";
import { getUserById } from './userHelper';
import { NotFoundError } from './errors';

export async function getWatchlistByUser(userId: string) {

  const watchlist = await prisma.watchlist.findUnique({
    where: {
      userId
    },
  })

  if (!watchlist) {
    return await prisma.watchlist.create({
      data: {
        userId,
      }
    });
  }
  
  return watchlist;
} 