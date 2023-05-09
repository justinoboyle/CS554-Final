import type { NextApiRequest, NextApiResponse } from "next";
import { Portfolio } from "@prisma/client";

import { SanitizedUser } from "../../../helpers/userHelper";

import { constructHandler, InternalResponse } from "../../../helpers/errors";

import type { UserSession } from "../../../helpers/userHelper";
import { getPortfoliosByUser, calculatePortfolioReturns } from "../../../helpers/portfolioHelper";
// import { createPortfolio } from "../../../helpers/portfolioHelper";

import type { PortfolioWithReturns } from "../../../helpers/portfolioHelper";

// TODO update
export type Watchlist = {};
export type Notification = {};

async function dummyWatchlist(): Promise<Watchlist> {
  return {};
}

async function dummyNotifications(): Promise<Notification[]> {
  return [];
}

/* The home page/dashboard will have an overview of all of the user’s subscribed stocks and invested portfolios, as well as a notification feed (described below).
 */
export type TopLevelData = {
  portfolios: PortfolioWithReturns[];
  watchlist: Watchlist;
  notifications: Notification[];
  user: SanitizedUser;
};

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<TopLevelData | undefined>> => {
  // require login
  if (!session?.isLoggedIn || !session.user) {
    return {
      data: undefined,
      statusCode: 400,
      error: "Not signed in",
      failed: true,
    };
  }

  const user = session.user;

  const basePortfolios = await getPortfoliosByUser(user.id);
  const portfolios:PortfolioWithReturns[] = await Promise.all(basePortfolios.map(async (portfolio): Promise<PortfolioWithReturns> => {
    const returns = await calculatePortfolioReturns(portfolio);
    return {
      ...portfolio, 
      returns: returns
    }
  }))

  const [ watchlist, notifications] = await Promise.all([
    dummyWatchlist(),
    dummyNotifications(),
  ]);

  return {
    data: {
      portfolios,
      watchlist,
      notifications,
      user,
    },
    statusCode: 200,
    failed: false,
  };
};

export default constructHandler(endpoint);
