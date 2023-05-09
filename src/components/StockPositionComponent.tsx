import { useState, useEffect } from "react";

import { StockPosition } from "@prisma/client";

type Props = {
  positionObj: StockPosition;
};

type StockPositionReturns = {
  asAmount: number;
  asPercentage: number;
};

// takes position id as key from props
export const StockPositionComponent = (props: Props) => {
  const positionObj = props.positionObj;
  return (
    // just print out stocks in list for now
    <div id={positionObj.id}>
      <h3>{positionObj.ticker}</h3>
      <p>Amount Held: {positionObj.amount}</p>
    </div>
  );
};
