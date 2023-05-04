import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { NextApiRequest, NextApiResponse } from "next";

import type { UserSession } from "../../helpers/userHelper";

async function userRoute(
  req: NextApiRequest,
  res: NextApiResponse<UserSession>
) {
  if (req.session.user) {
    res.json({
      ...req.session.user,
      isLoggedIn: true,
    });
  } else {
    res.json({
        
      isLoggedIn: false,
      login: "",
    });
  }
}

export default withIronSessionApiRoute(userRoute, sessionOptions);
