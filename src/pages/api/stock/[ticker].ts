import { PrismaClient, StockEODData } from "@prisma/client";
import { NextApiRequest } from "next";

import { BadRequestError, InternalResponse, NotFoundError, constructHandler } from "@/helpers/errors";

const endpoint = async (
  req: NextApiRequest
): Promise<InternalResponse<StockEODData>> => {
  if (req.method !== 'GET') {
    return {
      data: undefined,
      statusCode: 405,
      failed: true,
      error: "Method not allowed",
    };
  }

  let { ticker } = req.query;

  if (!ticker) throw new BadRequestError("Ticker is required");

  const prisma = new PrismaClient();

  console.log(ticker.toString());
  const stock = await prisma.stockEODData.findFirst({
    where: {
      symbol: ticker.toString(),
    },
    orderBy: {
      date: "desc",
    }
  });

  
  if (!stock) throw new NotFoundError("Ticker not found");

  return {
    data: stock,
    statusCode: 200,
    failed: false
  }
}

export default constructHandler(endpoint);