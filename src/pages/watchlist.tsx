import Head from "next/head";

import { Navbar } from "../components/Navbar";
import { Loading } from "@/components/Loading";
import { Error } from '@/components/Error';

import useTopLevelUserData from "@/hooks/useTopLevelUserData";

import styles from '@/styles/watchlist.module.css'
import Link from "next/link";


export default function Watchlist() {
  const { data: topLevelData, error, mutate, helpers } = useTopLevelUserData();

  const watchlist = topLevelData?.watchlist;

  function buildWatchlist() {
    if (watchlist?.stocks.length === 0) {
      return <p>No stocks in watchlist</p>;
    }
    return watchlist?.stocks.map((ticker) => {
      const watched = topLevelData?.watchlist?.stocks.includes("" + ticker);
      return (
        <Link href={`/stock/${ticker}`} key={ticker}>
          <div className={styles.stock_wrapper}>
            <h2 className={styles.stock_ticker}>{ticker}</h2>
          </div>
        </Link>
      );
    })
  }

  if (!watchlist) return <Loading />;
  if (error) return <Error message={error} />

  return (
    <>
      <Head>
        <title>Haptic Krill</title>
        <meta name="description" content="Haptic Krill" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Navbar activePage="watchlist" />
        <div className={styles.body}>
          <h1 className={styles.title}>Stocks of interest</h1>
          <div className={styles.main_wrapper}>
            <div className={styles.watchlist_wrapper}>{buildWatchlist()}</div>
          </div>
        </div>
      </main>
    </>
  );
}