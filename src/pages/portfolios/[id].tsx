import { PortfolioComponent } from "../../components/PortfolioComponent";
import Link from "next/link";
import type { PortfolioJoined } from "../../helpers/portfolioHelper";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "@/styles/portfolios.module.css";
import useTopLevelUserData from "../../hooks/useTopLevelUserData";
import { Navbar } from "../../components/Navbar";
import AddStockModal from "../../components/AddStockModal";
import moment from "moment-timezone";
import { toast } from "react-toastify";

import StockChart from "../../components/StockChart";

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

  async function handleDelete(positionId: string) {
    if (!portfolio) {
      toast.error("Unable to delete position: Portfolio not loaded.");
      return;
    }
    return await helpers.deletePositionFromPortfolio(portfolio.id, positionId);
  }

  if (isLoading) return <p>Loading Portfolio Data...</p>;

  if (!portfolio)
    return (
      <p>
        Error: Failed to fetch Portfolio (are you signed in and is it yours?)
      </p>
    );

  const findLocalizedReturnsForRendering = (
    ticker: string,
    amount: number,
    buyDay: string
  ) => {
    // return portfolio.returns?.earningsAt?.find((earnings) => earnings.positions.find(a=>a.ticker === ticker))?.positions.find(a=>a.ticker === ticker)?.price;
    // find ticker with same amount and get price
    let positions = portfolio.returns?.earningsAt?.filter((earnings) =>
      earnings.positions.find(
        (a) =>
          a.ticker === ticker && a.amount == amount && a.boughtAtDay == buyDay
      )
    );

    if (!positions || positions.length < 1)
      return {
        earnings: 0,
        percentEarnings: 0,
        todayPrice: 0,
      };

    // find newest
    let newest = positions
      ?.reduce((prev, current) =>
        moment(prev.date).isAfter(moment(current.date)) ? prev : current
      )
      ?.positions.find((a) => a.ticker === ticker && a.amount == amount);

    // price on buy day = most recent close price on buyDay
    let oldest = positions
      ?.reduce((prev, current) =>
        moment(prev.date).isBefore(moment(current.date)) ? prev : current
      )
      .positions.find((a) => a.ticker === ticker && a.amount == amount);
    if (!newest?.pricePerShare || !oldest?.pricePerShare) {
      console.log(newest, oldest);
      return {
        earnings: 0,
        percentEarnings: 0,
        todayPrice: 0,
      };
    }

    const earnings = (newest?.pricePerShare - oldest?.pricePerShare) * amount;
    const percentEarnings =
      ((newest?.pricePerShare - oldest?.pricePerShare) /
        oldest?.pricePerShare) *
      100;
    const todayPrice = newest?.pricePerShare;
    return {
      earnings,
      percentEarnings,
      todayPrice,
    };
  };

  return (
    <>
      <Navbar activePage={"portfolios"} />
      <AddStockModal
        modalIsOpen={showModal}
        setIsOpen={(isOpen: boolean) => setShowModal(isOpen)}
        onAdd={onAddStock}
      />
      <div>
        <Link href={"/portfolios/"} className={styles.return_link}>
          Return to portfolios ⮐
        </Link>
      </div>
      <div className={styles.layout}>
        <div className={styles.leftMajorSection}>
          <PortfolioComponent key={id} id={id} portfolioObj={portfolio} />
          {/* graph prices */}
          <div className={styles.graph}>
            <StockChart
              days={
                /* list of days */
                portfolio.returns?.earningsAt
                  ?.filter((e) => e.totalValue > 0)
                  .map((earnings) =>
                    moment(earnings.date).format("YYYY-MM-DD")
                  ) || []
              }
              prices={
                /* list of prices */
                portfolio.returns?.earningsAt
                  ?.filter((e) => e.totalValue > 0)
                  .map((earnings) => earnings.totalValue) || []
              }
            />
          </div>
        </div>

        <div className={styles.sideBarSection}>
          <div id={"positions-list"}>
            <div className={styles.positions_header}>
              <h4>Positions</h4>
              {/* add button */}
              <div
                className={styles.addButton}
                onClick={() => setShowModal(true)}
              >
                + Add
              </div>
            </div>
            {portfolio.positions.map((position) => {
              const { earnings, percentEarnings, todayPrice } =
                findLocalizedReturnsForRendering(
                  position.ticker,
                  position.amount,
                  moment(position.createdAt).format("YYYY-MM-DD")
                );
              return (
                <div key={position.id} className={styles.individualStock}>
                  <div className={styles.stockInfo}>
                    <div className={styles.header}>{position.ticker}</div>
                    <div className={styles.subheader}>
                      {position.amount}{" "}
                      {position.amount == 1 ? "share" : "shares"}
                    </div>
                    <div className={styles.subheader}>
                      on {moment(position.createdAt).format("MMM D YYYY")}
                    </div>
                  </div>
                  <div className={styles.stockPrice}>
                    {/* renderPercent */}
                    <div
                      className={
                        percentEarnings > 0
                          ? styles.positive
                          : percentEarnings == 0
                            ? styles.neutral
                            : styles.negative
                      }
                    >
                      {earnings > 0 ? "+" : ""}${earnings.toFixed(2)}
                    </div>
                    <div
                      className={
                        percentEarnings > 0
                          ? styles.positive
                          : percentEarnings == 0
                            ? styles.neutral
                            : styles.negative
                      }
                    >
                      {percentEarnings > 0 ? "+" : ""}
                      {percentEarnings.toFixed(2)}%
                    </div>
                  </div>
                  <div className={styles.button_wrapper}>
                    <button
                      className={`${styles.button} ${styles.delete_button}`}
                      onClick={() => handleDelete(position.id)}
                    >
                      X
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default PortfolioPage;
