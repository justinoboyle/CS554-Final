import type { NextApiRequest, NextApiResponse } from "next";
import { Portfolio } from '@prisma/client';

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import { createPortfolio } from "../../../helpers/portfolioHelper";

const endpoint = async (
  req: NextApiRequest
): Promise<InternalResponse<Portfolio | null>> => {
  if (req.method === 'POST') {
    const { title, userId } = req.body;
  
    const portfolio = await createPortfolio(title, userId);

    return {
      data: portfolio,
      statusCode: 200,
      failed: false,
    }
  }
  return {
    data: null,
    statusCode: 404,
    failed: true,
    error: "Route doesn't exist",
  }
};

export default constructHandler(endpoint);