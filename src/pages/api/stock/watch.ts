import { Watchlist } from "@prisma/client";

import { BadRequestError, InternalResponse, constructHandler } from "@/helpers/errors";
import { NextApiRequest } from "next";

import prisma from "@/helpers/dbHelper";

const endpoint = async (
  req: NextApiRequest
): Promise<InternalResponse<Watchlist>> => {
  if (req.method !== 'POST') {
    return {
      data: undefined,
      statusCode: 405,
      failed: true,
      error: "Method not allowed",
    };
  }

  const { ticker, userId } = req.body;

  console.log("In add", ticker, userId);

  if (!ticker || !userId) throw new BadRequestError("Ticker and user ID are required");

  const watchlist = await prisma.watchlist.findUnique({
    where: {
      userId,
    }
  });

  const stocks = watchlist?.stocks;

  if (stocks?.includes(ticker)) throw new BadRequestError("Ticker already exists in watchlist");

  const newWatchlist = await prisma.watchlist.update({
    where: {
      userId,
    },
    data: {
      stocks: {
        push: ticker,
      }
    }
  })

  return {
    data: newWatchlist,
    failed: false,
    statusCode: 200,
  };
}

export default constructHandler(endpoint);