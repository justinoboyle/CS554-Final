import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Portfolio } from "@prisma/client";

import type { UserSession } from "../../../helpers/userHelper";
import { InternalResponse, constructHandler } from "@/helpers/errors";
import { getUserPortfolios } from "@/helpers/userHelper";

export type Data = {
  userId: string | undefined;
  portfolios: Portfolio[];
}

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<Data>> => {
  const prisma = new PrismaClient();

  const portfolios = await getUserPortfolios(session?.user?.id);

  return {
    failed: false,
    statusCode: 200,
    data: {
      userId: session?.user?.id,
      portfolios,
    },
  }
};

export default constructHandler(endpoint);
