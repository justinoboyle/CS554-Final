// https://vercel.com/blog/cron-jobs

import { NextApiRequest, NextApiResponse } from "next";

const getAllTrackedSecurities = async () => {

}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // get all tracked stocks
    // for each stock, get the latest close price and the date
    // then persist in db

    const trackedSecurities = await getAllTrackedSecurities();

    
}

export default handler;