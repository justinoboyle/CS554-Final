import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { Navbar } from "@/components/Navbar";
import { Loading } from "@/components/Loading";
import { Error } from "@/components/Error";

import { toast } from "react-toastify";

import styles from "@/styles/stock.module.css";
import useTopLevelUserData from "@/hooks/useTopLevelUserData";
import { doesSecurityExist } from "@/hooks/fetchers/useSecurity";
import { fetchStock } from "@/hooks/fetchers/useStock";

import { convertVolumeToShorthand, formatToDollar, calculateCostOfShares, checkValidAmount } from "@/helpers/stockHelper";

function Stock() {
  const [amount, setAmount] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const router = useRouter();
  const [ticker, setTicker] = useState<string | undefined>(undefined);
  const { data: topLevelData, error: topLevelError, mutate, helpers } = useTopLevelUserData();
  const [stockData, setStockData] = useState<any>(undefined);

  const portfolios = topLevelData?.portfolios || [];  
  const stock = stockData?.data;

  useEffect(() => {
    async function fetchData() {
      try {
        if (router.isReady) {
          setTicker("" + router.query.ticker);
          let securityExists = await doesSecurityExist("" + router.query.ticker);
          if (!securityExists) {
            setError("Security doesn't exist");
            return;
          }
          console.log("Security", securityExists);
          let data = await fetchStock("" + router.query.ticker);
          setStockData(data);
        }
      } catch(e: any) {
        setError(e);
      }
    }
    fetchData();
  }, [router.isReady, router.query.ticker]);

  function handleWatchOnClick(e: any) {
    e.preventDefault();
  }

  async function handleFormSubmit(e: any) {
    e.preventDefault();
    setDisabled(true);
    setLoading(true);
    let amount = parseFloat(e.target.amount.value);
    let portfolioId = e.target.portfolio.value;
    console.log(amount, portfolioId);
    try {
      checkValidAmount(amount, stock.volume);
      helpers.addPositionToPortfolio(portfolioId, stock.symbol, amount, new Date().toString());
      toast.success("Successfully added to portfolio");
    } catch(e: any) {
      toast.error(e.message);
    }
    setLoading(false);
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

  console.log(stockData);
  if (!stockData || !topLevelData) return <Loading />;
  if (error) return <Error message={error.message} />

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
      <Navbar activePage="" />
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
            <button
              className={styles.watch_button}
              onClick={handleWatchOnClick}
            >
              {"\u2606"} Watch
            </button>
          </div>
            <form className={styles.form} onSubmit={handleFormSubmit}>
            <h2 className={styles.form_title}>Buy {stock.symbol as string}</h2>
              <div className={styles.form_group}>
                <label className={styles.form_label}>Shares</label>
                <input
                  className={styles.form_input}
                  name="amount"
                  placeholder="0"
                  onChange={handleAmountOnChange}
                  disabled={disabled || loading}
                />
              </div>
              <div className={styles.form_group}>
                <label className={styles.form_label}>Portfolio</label>
                {portfolios.length
                ?
                <select name="portfolio">
                  <option className={styles.first_option} value="">
                    Select a portfolio
                  </option>
                  {portfolios.map((portfolio) => {
                    return (
                      <option value={portfolio.id} key={portfolio.id}>
                        {portfolio.title}
                      </option>
                    );
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
  );
}

export default Stock;