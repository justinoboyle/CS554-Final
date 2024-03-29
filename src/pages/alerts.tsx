import Head from "next/head";
import styles from "@/styles/portfolios.module.css";
import { Navbar } from "../components/Navbar";
import { useAlerts } from "../hooks/useAlerts";
import { useTriggers } from "../hooks/useTriggers";
import { stringify } from "querystring";
import { Trigger, Alert, Prisma } from "@prisma/client";
import { AlertWithTrigger } from "../helpers/alertHelper";
import moment from "moment";

const alertDetails = (alert: AlertWithTrigger) => {
  return (
    <>
      <td>{moment(alert.createdAt).format('MM-DD-YYYY HH:mm')}</td>
      <td>{alert.trigger.symbol}</td>
      <td>{alert.trigger.price}</td>
      <td>{alert.price}</td>
      <td>{alert.trigger.type}</td>
    </>
  );
};

export default function Alerts() {
  const { data: alertData, error: alertError } = useAlerts();
  const {
    data: triggerData,
    error: triggerError,
    deleteTrigger,
    createTrigger,
    isLoading
  } = useTriggers();

  const submitTrigger = async (e: any) => {
    e.preventDefault();
    const ticker = e.target.ticker.value;
    const price = e.target.price.value;
    const alertType = e.target.alertType.value;
    await createTrigger(ticker, price, alertType);
  };

  return (
    <>
      <Head>
        <title>Haptic Krill</title>
        <meta name="description" content="Haptic Krill" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Navbar activePage="alerts" />
        <div className={styles.content}>
          <h1 className={styles.title}>Price Alerts</h1>
          <div>
            <form onSubmit={submitTrigger}>
              <label htmlFor="ticker">Ticker:</label>
              <br></br>
              <input type="text" id="ticker" name="ticker" required></input>
              <br></br>
              <label htmlFor="price">Price:</label>
              <br></br>
              <input type="float" id="price" name="price" required></input>
              <br></br>
              <label htmlFor="alertType">Alert Type:</label>
              <br></br>
              <select id="alertType" name="alertType" required>
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
              <br></br>
              <input type="submit" value="Submit"></input>
            </form>
            {isLoading && <p>Creating trigger...</p>}
          </div>

          {alertData && (
            <>
              <h2>Recent alerts</h2>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Ticker</th>
                    <th>Target Price</th>
                    <th>Actual Price</th>
                    <th>Alert Type</th>
                  </tr>
                </thead>
                <tbody>
                  {alertData.map((alert) => (
                    <tr key={alert.id}>{alertDetails(alert)}</tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {triggerData && (
            <>
              <h2>Active Triggers</h2>
              <table>
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Price</th>
                    <th>Alert Type</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {triggerData.map((trigger) => (
                    <tr key={trigger.id}>
                      <td>{trigger.symbol}</td>
                      <td>{trigger.price}</td>
                      <td>{trigger.type}</td>
                      <td>
                        <button onClick={async () => deleteTrigger(trigger.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </main>
    </>
  );
}
