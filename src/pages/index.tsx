import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Navbar } from "../components/Navbar";
import useHomePage from "../hooks/useTopLevelUserData";

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
        <div className={styles.container}>
          <div className={styles.main}>
            {/* portfolios */}
            <div className={styles.portfolios}>
              <h2>Portfolios</h2>
              <div className={styles.portfoliosList}>
                {portfolios.map((portfolio) => (
                  <div key={portfolio.id} className={styles.portfolio}>
                    <h3>{portfolio.title}</h3>
                    {/* TODO returns */}
                    {/* <p>{}</p> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.sidebar}>
            {/* notifications */}
            <div className={styles.notifications}>
              <h2>Notifications</h2>
              <div className={styles.notificationsList}>
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
