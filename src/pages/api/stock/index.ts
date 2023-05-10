import { PrismaClient, StockEODData } from "@prisma/client";
import { NextApiRequest } from "next";

import { BadRequestError, InternalResponse, NotFoundError, constructHandler } from "@/helpers/errors";

const endpoint = async (
  req: NextApiRequest
): Promise<InternalResponse<StockEODData>> => {
  if (req.method !== 'POST') {
    return {
      data: undefined,
      statusCode: 405,
      failed: true,
      error: "Method not allowed",
    };
  }

  let { ticker, date } = req.body;

  if (!ticker) throw new BadRequestError("Ticker is required");
  let currentDate;

  const prisma = new PrismaClient();

  if (date) {
    date = new Date(date);
    currentDate = new Date();
    var stock = await prisma.stockEODData.findFirst({
      where: {
        symbol: ticker.toString(),
        date: {
          gte: date,
          lte: currentDate,
        }
      },
      orderBy: {
        date: "asc",
      }
    });
  } else {
    var stock = await prisma.stockEODData.findFirst({
      where: {
        symbol: ticker.toString(),
      },
      orderBy: {
        date: "desc",
      }
    });
  }

  if (!stock) throw new NotFoundError("Ticker not found");

  return {
    data: stock,
    statusCode: 200,
    failed: false
  }
}

export default constructHandler(endpoint);