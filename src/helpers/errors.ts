import type { NextApiRequest, NextApiResponse } from "next";

import { UserSession } from "./userHelper";

import { withIronSessionApiRoute } from "iron-session/next";

import { sessionOptions } from "../lib/session";

export class UserError extends Error {
  _statusCode: number;
  constructor(message: string) {
    super(message);
    this._statusCode = 400;
    this.name = "UserError";
  }
}

export class AlreadyExistsError extends UserError {
  constructor(message: string) {
    super(message);
    this.name = "AlreadyExistsError";
    this._statusCode = 409;
  }
}
export class NotFoundError extends UserError {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    this._statusCode = 404;
  }
}

export class BadRequestError extends UserError {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
    this._statusCode = 400;
  }
}

export type ExternalResponse<T> = {
  error?: string;
  failed: boolean;
  statusCode: number;
  data?: T;
};

export type InternalResponse<T> = ExternalResponse<T> & {
  setSession?: UserSession;
  deleteSession?: boolean;
  redirect?: string;
};

// wrap api request
const errorHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    session?: UserSession
  ) => Promise<InternalResponse<any>>
) => {
  try {
    const ran = await fn(req, req.session?.user);

    // cant have both setSession and deleteSession
    if (ran.setSession && ran.deleteSession) {
      throw new Error(
        "Cannot have both setSession and deleteSession in the same response"
      );
    }

    if (ran.setSession) {
      req.session.user = ran.setSession;
      await req.session.save();
    }

    if (ran.deleteSession) {
      req.session.destroy();
    }

    const toSend: ExternalResponse<any> = {
      data: ran?.data,
      error: ran?.error,
      failed: ran.failed,
      statusCode: ran.statusCode,
    };

    if(ran.redirect) {
      return res.redirect(ran.redirect);
    }

    return res.status(ran.statusCode).json(toSend);
  } catch (e) {
    if (e instanceof UserError) {
      res.status(e._statusCode).json({
        error: e.message,
        failed: true,
        data: null,
        statusCode: e._statusCode,
      });
    } else {
      console.log(e);
      res.status(500).json({
        error: "Internal Server Error",
        failed: true,
        statusCode: 500,
        data: null,
      });
    }
  }
};

// also use withIronSessionApiRoute
export const constructHandler = (
  fn: (
    req: NextApiRequest,
    session?: UserSession
  ) => Promise<InternalResponse<any>>
) =>
  withIronSessionApiRoute(
    (req: NextApiRequest, res: NextApiResponse) => errorHandler(req, res, fn),
    sessionOptions
  );
