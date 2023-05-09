import { PortfolioJoined } from "../helpers/portfolioHelper";
import { useState, useEffect } from "react";

type Props = {
  id: string;
  portfolioObj: PortfolioJoined;
};

type PortfolioReturns = {
  asAmount: number;
  asPercentage: number;
};

// takes portfolio id as key from props
export const PortfolioComponent = (props: Props) => {
  const portfolioData = props.portfolioObj;

  if (!portfolioData) return <p>Loading...</p>;

  const returns = portfolioData?.returns?.totalPercentChange;

  const formattedPercent =
    (returns > 0 ? "+" : "") + (returns * 100).toFixed(2) + "%";

  return (
    <div id={portfolioData.id}>
      <h2 id="portfolio-header">
        {portfolioData ? portfolioData.title : "Unknown Portfolio Title"}
      </h2>
      <div>
        {formattedPercent} with {portfolioData?.positions?.length} positions
      </div>
    </div>
  );
};
