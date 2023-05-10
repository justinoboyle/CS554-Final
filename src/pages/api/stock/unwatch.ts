import { Watchlist } from "@prisma/client";

import { InternalResponse, constructHandler } from "@/helpers/errors";
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

  console.log("In remove", ticker, userId);

  if (!ticker || !userId) throw Error("Ticker and user ID are required");

  const watchlist = await prisma.watchlist.delete({
    where: {
      userId
    }
  });

  if (!watchlist) throw Error("Ticker not in watchlist");

  return {
    data: watchlist,
    failed: false,
    statusCode: 200,
  };
}

export default constructHandler(endpoint);