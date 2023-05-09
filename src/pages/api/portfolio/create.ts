import type { NextApiRequest, NextApiResponse } from "next";
import { Portfolio } from '@prisma/client';

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import { createPortfolio } from "../../../helpers/portfolioHelper";

import type { PortfolioJoined } from "../../../helpers/portfolioHelper";

const endpoint = async (
  req: NextApiRequest
): Promise<InternalResponse<PortfolioJoined | null>> => {
  if (req.method !== "POST") {
    return {
      data: null,
      statusCode: 405,
      failed: true,
      error: "Method not allowed",
    };
  }

  const { title, userId } = req.body;

  if (!title || !userId) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Title and user ID are required",
    };
  }

  const portfolio = await createPortfolio(title, userId);

  return {
    data: portfolio,
    statusCode: 200,
    failed: false,
  };
};

export default constructHandler(endpoint);