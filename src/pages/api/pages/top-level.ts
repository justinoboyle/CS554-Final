import type { NextApiRequest, NextApiResponse } from "next";
import { Portfolio, Watchlist } from "@prisma/client";

import { SanitizedUser } from "../../../helpers/userHelper";

import { constructHandler, InternalResponse } from "../../../helpers/errors";

import type { UserSession } from "../../../helpers/userHelper";
import { getPortfoliosByUser } from "../../../helpers/portfolioHelper";
import { getWatchlistByUser } from "@/helpers/watchlistHelper";

import type { PortfolioJoined } from "../../../helpers/portfolioHelper";

// TODO update
export type Notification = {};

async function dummyNotifications(): Promise<Notification[]> {
  return [];
}

/* The home page/dashboard will have an overview of all of the user’s subscribed stocks and invested portfolios, as well as a notification feed (described below).
 */
export type TopLevelData = {
  portfolios: PortfolioJoined[];
  watchlist: Watchlist | null;
  notifications: Notification[];
  user: SanitizedUser;
};

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<TopLevelData | undefined>> => {

  // start timing
  const start = Date.now();
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

  const [portfolios, watchlist, notifications] = await Promise.all([
    getPortfoliosByUser(user.id),
    getWatchlistByUser(user.id),
    dummyNotifications(),
  ]);

  // end timing
  const end = Date.now();
  console.log(`Debug: top level endpoint took ${end - start} ms`);

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
