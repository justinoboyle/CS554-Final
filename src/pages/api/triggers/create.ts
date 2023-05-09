import type { NextApiRequest, NextApiResponse } from "next";
import { Trigger } from "@prisma/client";

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import { createTrigger } from "../../../helpers/triggerHelper";

import type { UserSession } from "../../../helpers/userHelper";

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<Trigger | null>> => {
  if (!session?.isLoggedIn || !session?.user?.id) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Not signed in",
    };
  }

  if (req.method !== "POST") {
    return {
      data: null,
      statusCode: 405,
      failed: true,
      error: "Method not allowed",
    };
  }

  const { ticker, price, alertType } = req.body;

  const userId = session.user?.id;

  if (!ticker || !price || !alertType) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "All fields are required",
    };
  }

  const priceNum = parseFloat(price);

  if (isNaN(priceNum)) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Price must be a number",
    };
  }

  const trigger = await createTrigger(userId, ticker, priceNum, alertType);

  return {
    data: trigger,
    statusCode: 200,
    failed: false,
  };
};

export default constructHandler(endpoint);
