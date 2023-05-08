import type { NextApiRequest, NextApiResponse } from "next";
import { Alert } from "@prisma/client";

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import {
  getAlertsByUserId,
  AlertWithTrigger,
} from "../../../helpers/alertHelper";

import type { UserSession } from "../../../helpers/userHelper";

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<AlertWithTrigger[] | null>> => {
  if (!session?.isLoggedIn || !session?.user?.id) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Not signed in",
    };
  }

  if (req.method !== "GET") {
    return {
      data: null,
      statusCode: 405,
      failed: true,
      error: "Method not allowed",
    };
  }

  const userId = session.user?.id;

  const alerts = await getAlertsByUserId(userId);

  return {
    data: alerts,
    statusCode: 200,
    failed: false,
  };
};

export default constructHandler(endpoint);
