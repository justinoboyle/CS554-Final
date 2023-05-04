import type { NextApiRequest, NextApiResponse } from "next";

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import { authorizeLogin, SanitizedUser } from "../../../helpers/userHelper";

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
  const { email, password } = req.body;

  // validate each
  if (!email || !password) {
    return {
      data: undefined,
      statusCode: 400,
      error: "Email and password are required",
      failed: true,
    };
  }

  const user = await authorizeLogin(email, password);

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
