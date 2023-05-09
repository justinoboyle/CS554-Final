import Head from "next/head";
import Link from "next/link";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Navbar } from "../components/Navbar";
import useHomePage from "../hooks/useTopLevelUserData";
import { PortfolioJoined } from "@/helpers/portfolioHelper";

import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data, isLoading } = useHomePage();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Something went wrong</div>;
  }

  const { notifications, watchlist, portfolios } = data;

  const makePortfolioCard = (portfolio:PortfolioJoined) => {
    return (
      <div key={portfolio.id} className={styles.portfolio}>
        <Link
          href={`/portfolios/${portfolio.id}`}
        >
          <div>
            <h3>{portfolio.title}</h3>
            <h3>{portfolio.returns?.totalValueToday}</h3>
          </div>
        </Link>
      </div>
    )
  }

  const makeNotification = (notification:Notification) => {
    return (
      <div className={styles.notification}>
        {/* TODO: Continue after notifications implemented */}
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>haptickrill</title>
        <meta name="description" content="Stock analysis application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Navbar activePage="home" />
        <div className={styles.content}>
          <div className={styles.main}>
            {/* portfolios */}
            <div className={styles.portfoliosBlock}>
              <h2>Portfolios</h2>
              <div className={styles.portfolioCards}>
                {portfolios.map(makePortfolioCard)}
              </div>
            </div>
          </div>
          <div className={styles.sidebar}>
            {/* notifications */}
            <div className={styles.notificationsBlock}>
              <h2>Notifications</h2>
              <div className={styles.notifications}>
                {notifications.map((notification, key) => (
                  <div
                    key={`notification` + key}
                    className={styles.notification}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
