import { InternalResponse, constructHandler } from "@/helpers/errors";
import { PrismaClient, StockPosition } from "@prisma/client";
import { NextApiRequest } from "next";

import { toast } from "react-toastify";

const endpoint = async (
  req: NextApiRequest
): Promise<InternalResponse<StockPosition>> => {
  if (req.method !== 'POST') {
    return {
      data: undefined,
      statusCode: 405,
      failed: true,
      error: "Method not allowed",
    }
  }

  const { ticker, amount, portfolioId } = req.body;

  if (!portfolioId) {
    return {
      data: undefined,
      statusCode: 400,
      failed: true,
      error: "Select a portfolio"
    }
  }

  if (!ticker || !amount) {
    return {
      data: undefined,
      statusCode: 400,
      failed: true,
      error: "Ticker and amount are required"
    }
  }

  const prisma = new PrismaClient();

  console.log("Creating stock position");
  const stockPosition = await prisma.stockPosition.create({
    data: {
      ticker,
      amount,
      portfolioId
    },
  });
  console.log("Stock position", stockPosition);

  return {
    data: stockPosition,
    failed: false,
    statusCode: 200,
  }
}

export default constructHandler(endpoint);