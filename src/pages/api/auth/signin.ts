import type { NextApiRequest, NextApiResponse } from "next";

import { errorHandler, Response } from "../../../helpers/errors";
import { authorizeLogin, SanitizedUser } from "../../../helpers/userHelper";

const endpoint = async (
  req: NextApiRequest
): Promise<Response<SanitizedUser>> => {
  const { email, password } = req.body;

  const user = await authorizeLogin(email, password);

  return {
    data: user,
    statusCode: 200,
    failed: false,
  };
};

export const handler = (req: NextApiRequest, res: NextApiResponse) =>
  errorHandler(req, res, endpoint);
