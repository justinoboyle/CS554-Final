import { PortfolioComponent } from "../../components/PortfolioComponent";
import { StockPositionComponent } from "../../components/StockPositionComponent";
import type { PortfolioJoined } from "../../helpers/portfolioHelper";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "@/styles/portfolios.module.css";
import useTopLevelUserData from "../../hooks/useTopLevelUserData";
import { Navbar } from "../../components/Navbar";
import AddStockModal from "../../components/AddStockModal";
import moment from "moment-timezone";

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

  // TODO: Handle delete stock position
  async function handleDelete(portfolioId: string) {
    return alert("Not implemented yet.");
  }

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
            <div key={position.id} className={styles.position_wrapper}>
              <StockPositionComponent key={position.id} positionObj={position} />
              <div className={styles.button_wrapper}>
                <button
                  className={`${styles.button} ${styles.delete_button}`}
                  onClick={() => handleDelete(position.id)}
                >
                  Delete Position
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default PortfolioPage;
