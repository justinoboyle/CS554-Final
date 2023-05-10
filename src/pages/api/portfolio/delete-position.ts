import type { NextApiRequest, NextApiResponse } from "next";

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import { deleteSinglePosition } from "../../../helpers/portfolioHelper";

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

  const { positionId } = req.body;

  if (!positionId) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Portfolio id are required",
    };
  }

  const didDelete = await deleteSinglePosition(positionId);

  return {
    data: didDelete,
    statusCode: 200,
    failed: false,
  };
};

export default constructHandler(endpoint);
