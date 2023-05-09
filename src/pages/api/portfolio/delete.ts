import type { NextApiRequest, NextApiResponse } from "next";

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import { deletePortfolio } from "../../../helpers/portfolioHelper";

const endpoint = async (
  req: NextApiRequest
): Promise<InternalResponse<boolean | null>> => {
  if (req.method !== "POST") {
    return {
      data: null,
      statusCode: 405,
      failed: true,
      error: "Method not allowed",
    };
  }

  const { portfolioId, userId } = req.body;

  if (!portfolioId || !userId) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Portfolio id and user ID are required",
    };
  }

  const didDelete = await deletePortfolio(portfolioId, userId);

  return {
    data: didDelete,
    statusCode: 200,
    failed: false,
  };
};

export default constructHandler(endpoint);
