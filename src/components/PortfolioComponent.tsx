import type { PortfolioJoined } from "../helpers/portfolioHelper";
import styles from "./PortfolioComponent.module.css";
import { useState, useEffect } from "react";

type Props = {
  id: string;
  portfolioObj: PortfolioJoined;
};

// takes portfolio id as key from props
export const PortfolioComponent = (props: Props) => {
  const portfolioData = props.portfolioObj;

  if (!portfolioData || !portfolioData.returns) return <p>Loading...</p>;

  const returns = portfolioData.returns.totalPercentChange;

  const formattedPercent =
    (returns > 0 ? "+" : "") + (returns * 100).toFixed(2) + "%";
  const returnsStyle = returns > 0 ? styles.positive_returns : styles.negative_returns;

  return (
    <div id={portfolioData.id} className={styles.portfolio_wrapper}>
      <h2 className={styles.portfolio_header}>
        {portfolioData ? portfolioData.title : "Unknown Portfolio Title"}
      </h2>
      <div>
        <span className = {returnsStyle}>{formattedPercent}</span> with {portfolioData?.positions?.length} positions
        (Overall Returns)
      </div>
    </div>
  );
};
