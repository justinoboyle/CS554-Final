import type { NextApiRequest, NextApiResponse } from "next";

import { errorHandler, Response } from "../../../helpers/errors";
import { createUser, SanitizedUser } from "../../../helpers/userHelper";

const endpoint = async (
  req: NextApiRequest
): Promise<Response<SanitizedUser>> => {
  const { email, password, name } = req.body;

  const user = await createUser(email, password, name);

  return {
    data: user,
    statusCode: 200,
    failed: false,
  };
};

const handler = (req: NextApiRequest, res: NextApiResponse) =>
  errorHandler(req, res, endpoint);

export default handler;