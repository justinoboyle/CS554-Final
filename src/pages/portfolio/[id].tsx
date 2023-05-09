import { PortfolioComponent } from "../../components/PortfolioComponent";
import { StockPositionComponent } from "../../components/StockPositionComponent";
import { PortfolioJoined } from "../../helpers/portfolioHelper";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "@/styles/portfolios.module.css";
import useTopLevelUserData from "../../hooks/useTopLevelUserData";
import { Navbar } from "../../components/Navbar";
import AddStockModal from "../../components/AddStockModal";
import moment from "moment-timezone";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Total portfolio close price over time",
    },
  },
};

function PortfolioPage() {
  const router = useRouter();
  const id = "" + router?.query?.id;
  const { data, isLoading, helpers } = useTopLevelUserData();
  const [showModal, setShowModal] = useState<boolean>(false);

  const portfolio = data?.portfolios?.find(
    (port: PortfolioJoined) => port.id === id
  );

  const onAddStock = async (
    symbol: string,
    shareCount: number,
    datePurchased: Date
  ) => {
    const formattedDate = moment(datePurchased).format("YYYY-MM-DD");
    await helpers?.addPositionToPortfolio(
      id,
      symbol,
      shareCount,
      formattedDate
    );
  };

  if (isLoading) return <p>Loading Portfolio Data...</p>;
  if (!portfolio) return <p>Error: Failed to fetch Portfolio</p>;

  return (
    <>
      <Navbar activePage={"portfolios"} />
      <AddStockModal
        modalIsOpen={showModal}
        setIsOpen={(isOpen: boolean) => setShowModal(isOpen)}
        onAdd={onAddStock}
      />
      <div>
        {portfolio && (
          <PortfolioComponent key={id} id={id} portfolioObj={portfolio} />
        )}

        <div className={styles.button_wrapper}>
          <button
            className={`${styles.button} ${styles.add_button}`}
            onClick={() => setShowModal(true)}
          >
            Add stock
          </button>
        </div>
        <div id={"positions-list"}>
          <p>Current Positions:</p>
          {portfolio.positions.map((position) => (
            <StockPositionComponent key={position.id} positionObj={position} />
          ))}
        </div>
      </div>
    </>
  );
}

export default PortfolioPage;
