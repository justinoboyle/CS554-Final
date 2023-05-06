import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Portfolio } from "@prisma/client";

import type { UserSession } from "../../../helpers/userHelper";
import { InternalResponse, constructHandler } from "@/helpers/errors";

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<Portfolio[]>> => {
  const prisma = new PrismaClient();

  const portfolios = await prisma.portfolio.findMany({
    where: {
      userId: session?.user?.id,
    }
  });

  console.log(portfolios);

  return {
    failed: false,
    statusCode: 200,
    data: portfolios,
  }
};

export default constructHandler(endpoint);
