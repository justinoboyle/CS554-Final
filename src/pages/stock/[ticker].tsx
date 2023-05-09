import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { Navbar } from "@/components/Navbar";
import { Loading } from "@/components/Loading";
import { Error } from "@/components/Error";

import { toast } from "react-toastify";

import styles from "@/styles/stock.module.css";
import useTopLevelUserData from "@/hooks/useTopLevelUserData";
import { useSecurity } from "@/hooks/fetchers/useSecurity";
import { useStock } from "@/hooks/fetchers/useStock";

import { convertVolumeToShorthand, formatToDollar, calculateCostOfShares, checkValidAmount, createStockPosition } from "@/helpers/stockHelper";
import { StockEODData } from "@prisma/client";

function Stock() {
  const [amount, setAmount] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const router = useRouter();
  const [ticker, setTicker] = useState<string | undefined>(undefined);
  const { data: topLevelData, error: topLevelError, mutate, helpers } = useTopLevelUserData();
  const { doesSecurityExist, error: securityError, loading: securityLoading, fn: fetchSecurity } = useSecurity();
  const { data: stockData, error: stockError, loading: stockLoading, fn: fetchStock } = useStock();

  const portfolios = topLevelData?.portfolios || [];  

  useEffect(() => {
    if (router.isReady) {
      setTicker("" + router.query.ticker);
      fetchSecurity("" + router.query.ticker);
      fetchStock("" + router.query.ticker);
    }
  }, [router.isReady]);

  function handleWatchOnClick(e: any) {
    e.preventDefault();
  }

  async function handleFormSubmit(e: any) {
    e.preventDefault();
    setDisabled(true);
    setIsLoading(true);
    let amount = parseFloat(e.target.amount.value);
    let portfolioId = e.target.portfolio.value;
    try {
      checkValidAmount(amount, stock?.volume as number);
      createStockPosition(stock?.symbol as string, amount, portfolioId).then((response) => console.log(response));
    } catch(e) {
      console.log(e);
    }
    toast.success("Successfully added to portfolio");
    setIsLoading(false);
    setDisabled(false);
  }

  // Set amount to input value and prevent non-numeric characters from being entered
  function handleAmountOnChange(e: any) {
    if (isNaN(e.nativeEvent.data)) {
      e.target.value = amount;
    } else {
      setAmount(e.target.value);
    }
  }

  if (securityLoading || stockLoading) return <Loading />;
  console.log(doesSecurityExist);
  if (doesSecurityExist === false) return <Error message="Security does not exist" />
  if (securityError) return <Error message={securityError} />
  if (stockError) return <Error message={stockError} />

  const stock = stockData?.data as StockEODData;

  /* 
  "open": 129.8,
  "high": 133.04,
  "low": 129.47,
  "close": 132.995,
  "volume": 106686703.0,
  "adj_high": 133.04,
  "adj_low": 129.47,
  "adj_close": 132.995,
  "adj_open": 129.8,
  "adj_volume": 106686703.0,
  "split_factor": 1.0,
  "dividend": 0.0,
  "symbol": "AAPL",
  "exchange": "XNAS",
  "date": "2021-04-09T00:00:00+0000"
  */

  return (
    <div>
      <Navbar activePage=""/>
      <div className={styles.main_wrapper}>
        <div className={styles.stock_wrapper}>
          <h2>{stock?.symbol}</h2>
          <p>Last updated: <span className={styles.italic}>{new Date(stock?.date as Date).toString()}</span></p>
          <table className={styles.table}>
            <tbody>
              <tr className={styles.table_row}>
                <th className={styles.table_header}>High:</th>
                <td className={styles.table_value}>{formatToDollar(stock?.high as number)}</td>
              </tr>
              <tr className={styles.table_row}>
                <th className={styles.table_header}>Low:</th>
                <td className={styles.table_value}>{formatToDollar(stock?.low as number)}</td>
              </tr>
              <tr className={styles.table_row}>
                <th className={styles.table_header}>Volume:</th>
                <td className={styles.table_value}>{convertVolumeToShorthand(stock?.volume as number)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.form_wrapper}>
          <div className={styles.button_wrapper}>
            <button className={styles.watch_button} onClick={handleWatchOnClick}>{'\u2606'} Watch</button>
          </div>
            <form className={styles.form} onSubmit={handleFormSubmit}>
            <h2 className={styles.form_title}>Buy {stock?.symbol as string}</h2>
              <div className={styles.form_group}>
                <label className={styles.form_label}>Shares</label>
                <input
                  className={styles.form_input}
                  name="amount"
                  placeholder="0"
                  onChange={handleAmountOnChange}
                  disabled={disabled || isLoading}
                />
              </div>
              <div className={styles.form_group}>
                <label className={styles.form_label}>Portfolio</label>
                {portfolios.length
                ?
                <select name="portfolio">
                  <option className={styles.first_option} value="">Select a portfolio</option>
                  {portfolios.map((portfolio) => {
                    return <option value={portfolio.id} key={portfolio.id}>{portfolio.title}</option>
                  })}
                </select>
                :
                <span className={styles.italic}>No portfolios yet!</span>}
              </div>
              <div className={styles.form_group}>
                <label className={styles.form_label}>Open price</label>
                <span>{formatToDollar(stock?.open as number)}</span>
              </div>
              <div className={styles.form_group}>
                <label className={styles.form_label}>Close price</label>
                <span>{formatToDollar(stock?.close as number)}</span>
              </div>
              <hr className={styles.horizontal_line} />
              <div className={styles.form_group}>
                <label className={`${styles.form_label} ${styles.bold}`}>Cost (on close)</label>
                <span>{calculateCostOfShares(parseFloat(amount), stock?.close as number)}</span>
              </div>
              <div className={styles.button_wrapper}>
                {portfolios.length ? <button type='submit' className={styles.buy_button}>Buy {stock?.symbol as string}</button> : <button type='button' className={styles.blank_button}>Create a portfolio first!</button>}
              </div>
            </form>
        </div>
      </div>
    </div>
  )
}

export default Stock;