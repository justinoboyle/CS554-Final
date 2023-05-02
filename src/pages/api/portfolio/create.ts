import type { NextApiRequest, NextApiResponse } from "next";
import { Portfolio } from '@prisma/client';

import { errorHandler, Response } from "../../../helpers/errors";
import { createPortfolio } from "../../../helpers/portfolioHelper";

const endpoint = async (
  req: NextApiRequest
): Promise<Response<Portfolio>> => {
  const { title } = req.body;

  const portfolio = await createPortfolio(title);

  return {
    data: portfolio,
    statusCode: 200,
    failed: false,
  };
};

export const handler = (req: NextApiRequest, res: NextApiResponse) =>
  errorHandler(req, res, endpoint);
