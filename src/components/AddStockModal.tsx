// need date purchased picker and symbol field

import { useState } from "react";
import Modal from "react-modal";
import styles from "./AddStockModal.module.css";
import { doesSecurityExist } from "../hooks/fetchers/useSecurity";

type Props = {
  onAdd: (symbol: string, shareCount: number, datePurchased: Date) => void;
  modalIsOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function AddStockModal(props: Props) {
  const [symbol, setSymbol] = useState("");
  const [shareCount, setShareCount] = useState(1);
  const [datePurchased, setDatePurchased] = useState(new Date());

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const validData = () => {
    return symbol.trim() !== "";
  };

  // only allow letters and numbers in symbol field
  const handleSymbolChange = (e: any) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9]*$/;
    // cap length at 6
    if (value.length > 6) return;
    if (value === "" || regex.test(value)) {
      setSymbol(value.toUpperCase());
    }
    // capture enter button
    if (e.key === "Enter") {
      // dont submit form
      e.preventDefault();
    }
  };

  // only allow precision to 2 decimal places
  const handleShareCountChange = (e: any) => {
    const value = e.target.value;
    // only allow numbers and decimal
    // ignore all precision after 2 decimal places
    // also dont allow less than 0.01
    const regex = /^[0-9]+(\.[0-9]{0,2})?$/;
    if (value === "" || regex.test(value)) {
      if (parseFloat(value) < 0) return;
      setShareCount(parseFloat(value));
    }
  };

  const onChangeDatePicker = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    // make sure valid date
    try {
      const date = new Date(value);
      // convert to iso string
      date.toISOString()
      setDatePurchased(date);
    } catch (e) {}
  };
  // on close, wipe all data
  const handleClose = () => {
    setSymbol("");
    setDatePurchased(new Date());
    setError("");
    setLoading(false);
    props.setIsOpen(false);
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      setError("");
      // only support portfolios in the past 5 years
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      if (datePurchased < fiveYearsAgo) {
        setError("Date purchased must be within the past 5 years");
        setLoading(false);
        return;
      }
      // date can't be after today
      if (datePurchased > new Date()) {
        setError("Date purchased can't be in the future");
        setLoading(false);
        return;
      }
      // must be at least 0.01 shares
      if (shareCount < 0.01) {
        setError("Must have at least 0.01 shares");
        setLoading(false);

        return;
      }
      // validate stock exists
      try {
      } catch (e) {
        if (e instanceof Error) {
          setError(e?.message);
        }
        console.error(e);
        setLoading(false);
        return;
      }
      const stockExists = await doesSecurityExist(symbol);
      if (!stockExists) {
        setError("Couldn't find that security. Try again.");
        setLoading(false);
        return;
      }

      await props.onAdd(symbol, shareCount, datePurchased);
      handleClose();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={props.modalIsOpen}
      onRequestClose={() => props.setIsOpen(false)}
      contentLabel="Add a security"
      overlayClassName={styles.inset}
      ariaHideApp={false}
      className={styles.modal}
    >
      <h3>Add a security</h3>
      <p className={styles.error}>{error}</p>
      {loading && (
        <p className={styles.loading}>
          Fetching price data, this can take a minute...
        </p>
      )}
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formControl}>
          <label htmlFor="symbol">Symbol</label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            placeholder="AAPL"
            value={symbol}
            onChange={handleSymbolChange}
            disabled={loading}
          />
        </div>
        <div className={styles.formControl}>
          <label htmlFor="datePurchased">Purchased</label>
          <input
            type="date"
            id="datePurchased"
            name="datePurchased"
            // softly handle RangeError
            // datePurchased.toISOString().split("T")[0]
            value={
              datePurchased.toISOString().split("T")[0] ||
              new Date().toISOString().split("T")[0]
            }
            onChange={onChangeDatePicker}
            disabled={loading}
          />
        </div>
        <div className={styles.formControl}>
          <label htmlFor="shareCount">Shares</label>
          <input
            type="number"
            id="shareCount"
            name="shareCount"
            placeholder="1.00"
            value={shareCount}
            onChange={handleShareCountChange}
            disabled={loading}
          />
        </div>
        <div className={styles.formControlButton}>
          <button
            type="button"
            className={styles.buttonCancel}
            onClick={() => handleClose()}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!validData() || loading}
          >
            Add security
          </button>
        </div>
      </form>
    </Modal>
  );
}
