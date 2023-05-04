import type { NextApiRequest, NextApiResponse } from "next";

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import { createUser, SanitizedUser } from "../../../helpers/userHelper";

import type { UserSession } from "../../../helpers/userHelper";

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<SanitizedUser>> => {
  // if not signed in, fail
  if (!session?.isLoggedIn) {
    return {
      data: undefined,
      statusCode: 400,
      error: "Not signed in",
      failed: true,
    };
  }

  return {
    data: undefined,
    statusCode: 200,
    failed: false,
    deleteSession: true,
    redirect: "/",
  };
};

export default constructHandler(endpoint);
