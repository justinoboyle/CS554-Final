import type { NextApiRequest, NextApiResponse } from "next";
import { Trigger } from "@prisma/client";

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import { getTriggersByUserId } from "../../../helpers/triggerHelper";

import type { UserSession } from "../../../helpers/userHelper";

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<Trigger[] | null>> => {
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

  const triggers = await getTriggersByUserId(userId);

  return {
    data: triggers,
    statusCode: 200,
    failed: false,
  };
};

export default constructHandler(endpoint);
