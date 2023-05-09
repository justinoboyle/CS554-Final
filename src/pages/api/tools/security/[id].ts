// this API endpoint will verify if the stock is valid, and whether we've seen it before.
import type { NextApiRequest, NextApiResponse } from "next";
import { doesSecurityExist } from "../../../../helpers/marketstackHelper";

import { InternalResponse, constructHandler } from "../../../../helpers/errors";

import type { UserSession } from "../../../../helpers/userHelper";

export type SecurityResponse = {
  doesSecurityExist: boolean;
};

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<SecurityResponse | null>> => {
  if (req.method !== "GET") {
    return {
      data: null,
      statusCode: 405,
      failed: true,
      error: "Method not allowed",
    };
  }

  // dont allow unauthenticated users, to protect our api keys
  if (!session?.isLoggedIn || !session?.user) {
    return {
      data: null,
      statusCode: 401,
      failed: true,
      error: "Not signed in",
    };
  }

  const { id } = req.query;

  if (!id) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Ticker is required",
    };
  }

  // verify it's a string
  if (typeof id !== "string") {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Ticker must be a string",
    };
  }

  const security = await doesSecurityExist(id);

  return {
    data: {
      doesSecurityExist: security,
    },
    statusCode: 200,
    failed: false,
  };
};

export default constructHandler(endpoint);
