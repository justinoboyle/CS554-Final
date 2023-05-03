import type { NextApiRequest, NextApiResponse } from "next";

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

export type Response<T> = {
  error?: string;
  failed: boolean;
  statusCode: number;
  data?: T;
};

// wrap api request
export const errorHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (req: NextApiRequest) => Promise<Response<any>>
) => {
  try {
    const ran = await fn(req);
    return res.status(ran.statusCode).json(ran);
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
