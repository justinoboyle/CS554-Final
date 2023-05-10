import type { NextApiRequest, NextApiResponse } from "next";
import { Trigger } from "@prisma/client";

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import { deleteTrigger } from "../../../helpers/triggerHelper";

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

  const { id } = req.body;

  if (!id) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "ID to delete is required",
    };
  }

  const trigger = await deleteTrigger(id);

  if (!trigger) {
    return {
      data: null,
      statusCode: 404,
      failed: true,
      error: "Trigger with that ID not found",
    };
  }

  return {
    data: trigger,
    statusCode: 200,
    failed: false,
  };
};

export default constructHandler(endpoint);
