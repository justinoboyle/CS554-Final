import type { NextApiRequest, NextApiResponse } from "next";

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import { createUser, SanitizedUser } from "../../../helpers/userHelper";

import type { UserSession } from "../../../helpers/userHelper";

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<SanitizedUser>> => {
  // if already signed in, fail
  if (session?.isLoggedIn) {
    return {
      data: undefined,
      statusCode: 400,
      error: "Already signed in",
      failed: true,
    };
  }
  // if not post fail
  if (req.method !== "POST") {
    return {
      data: undefined,
      statusCode: 405,
      error: "Method not allowed",
      failed: true,
    };
  }
  const { email, password, name } = req.body;

  //validate
  if (!email || !password || !name) {
    return {
      data: undefined,
      statusCode: 400,
      error: "Email, password, and name are required",
      failed: true,
    };
  }

  const user = await createUser(email, password, name);

  const setSession = {
    isLoggedIn: true,
    login: user.email,
    user,
  };

  return {
    data: user,
    statusCode: 200,
    failed: false,
    setSession,
  };
};

export default constructHandler(endpoint);
