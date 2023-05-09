import { useRouter } from "next/router";
import { useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Loading } from "@/components/Loading";
import { Error } from "@/components/Error";

import { toast } from "react-toastify";

import styles from "@/styles/stock.module.css";
import { useStock } from "@/hooks/useStock";
import useTopLevelUserData from "@/hooks/useTopLevelUserData";

import { convertVolumeToShorthand, formatToDollar, calculateCostOfShares, checkValidAmount, createStockPosition } from "@/helpers/stockHelper";

function Stock() {
  const { data: topLevelData, error: topLevelError, mutate, helpers } = useTopLevelUserData();
  const router = useRouter();
  const { data: stockData, error: stockError } = useStock("" + router?.query?.ticker);
  const [amount, setAmount] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const stock = stockData?.data;
  const portfolios = topLevelData?.portfolios || [];

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
      checkValidAmount(amount, stock.volume);
      createStockPosition(stock.symbol, amount, portfolioId).then((response) => console.log(response));
    } catch(e) {
      console.log(e);
    }
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

  if (stockError) return <Error message={stockError}/>
  if (!stockData) return <Loading />
  if (stockData.doesSecurityExist === false) return <Error message={"Stock ticker does not exist!"}/>

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
          <h2>{stock.symbol}</h2>
          <p>Last updated: <span className={styles.italic}>{new Date(stock.date).toString()}</span></p>
          <table className={styles.table}>
            <tbody>
              <tr className={styles.table_row}>
                <th className={styles.table_header}>High:</th>
                <td className={styles.table_value}>{formatToDollar(stock.high)}</td>
              </tr>
              <tr className={styles.table_row}>
                <th className={styles.table_header}>Low:</th>
                <td className={styles.table_value}>{formatToDollar(stock.low)}</td>
              </tr>
              <tr className={styles.table_row}>
                <th className={styles.table_header}>Volume:</th>
                <td className={styles.table_value}>{convertVolumeToShorthand(stock.volume)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.form_wrapper}>
          <div className={styles.button_wrapper}>
            <button className={styles.watch_button} onClick={handleWatchOnClick}>{'\u2606'} Watch</button>
          </div>
            <form className={styles.form} onSubmit={handleFormSubmit}>
            <h2 className={styles.form_title}>Buy {stock.symbol}</h2>
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
                <span>{formatToDollar(stock.open)}</span>
              </div>
              <div className={styles.form_group}>
                <label className={styles.form_label}>Close price</label>
                <span>{formatToDollar(stock.close)}</span>
              </div>
              <hr className={styles.horizontal_line} />
              <div className={styles.form_group}>
                <label className={`${styles.form_label} ${styles.bold}`}>Cost (on close)</label>
                <span>{calculateCostOfShares(parseFloat(amount), stock.close)}</span>
              </div>
              <div className={styles.button_wrapper}>
                {portfolios.length ? <button type='submit' className={styles.buy_button}>Buy {stock.symbol}</button> : <button type='button' className={styles.blank_button}>Create a portfolio first!</button>}
              </div>
            </form>
        </div>
      </div>
    </div>
  )
}

export default Stock;
