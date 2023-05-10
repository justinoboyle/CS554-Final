import type { NextApiRequest, NextApiResponse } from "next";

import { constructHandler, InternalResponse } from "../../../helpers/errors";
import {
  deleteSinglePosition,
  addPosition,
} from "../../../helpers/portfolioHelper";
import { doesSecurityExist } from "../../../helpers/marketstackHelper";

import type { UserSession } from "../../../helpers/userHelper";

import { getPortfolioById } from "../../../helpers/portfolioHelper";

import moment from "moment";

const endpoint = async (
  req: NextApiRequest,
  session?: UserSession
): Promise<InternalResponse<boolean | null>> => {
  if (req.method !== "POST") {
    return {
      data: null,
      statusCode: 405,
      failed: true,
      error: "Method not allowed",
    };
  }

  const { portfolioId, ticker, shares, dayPurchased } = req.body;

  if (!portfolioId || !ticker || !shares || !dayPurchased) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Portfolio id, ticker, shares, and day purchased are required",
    };
  }

  // validate types for all
  if (
    typeof portfolioId !== "string" ||
    typeof ticker !== "string" ||
    typeof shares !== "number" ||
    typeof dayPurchased !== "string"
  ) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error:
        "Portfolio id must be a string, ticker must be a string, shares must be a number, and day purchased must be a string",
    };
  }

  // day purchased can't be in future
  if (new Date(dayPurchased) > new Date()) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Day purchased can't be in the future",
    };
  }

  // shares must be positive
  if (shares <= 0) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Shares must be positive",
    };
  }

  // position has to exist
  const doesExist = await doesSecurityExist(ticker);
  if (!doesExist) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Ticker does not exist",
    };
  }

  // must be logged in
  if (!session?.user?.id) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Must be logged in",
    };
  }

  const portfolio = await getPortfolioById(portfolioId);

  // check if portfolio exists
  if (!portfolio) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Portfolio does not exist",
    };
  }

  // check if portfolio belongs to user
  if (portfolio.userId !== session.user.id) {
    return {
      data: null,
      statusCode: 400,
      failed: true,
      error: "Portfolio does not belong to user",
    };
  }

  // check if position exists with same symbol and day purchased
  const positionExists = portfolio.positions.find(
    (position) =>
      position.ticker === ticker &&
      moment
        .utc(position.createdAt)
        .tz("America/New_York")
        .format("YYYY-MM-DD") ===
        moment(dayPurchased).tz("America/New_York").format("YYYY-MM-DD")
  );

  let newShareCount = shares;

  if (positionExists) {
    newShareCount += positionExists.amount;

    // delete old position
    await deleteSinglePosition(positionExists.id);
  }

  // add new position
  const res = await addPosition(
    portfolioId,
    ticker,
    newShareCount,
    dayPurchased
  );

  // temp return true
  return {
    data: !!res,
    statusCode: 200,
    failed: false,
  };
};

export default constructHandler(endpoint);
