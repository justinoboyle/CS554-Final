import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./StockPositionComponent.module.css";
import { StockPosition } from "@prisma/client";

type Props = {
    positionObj: StockPosition;
};

// takes position id as key from props
export const StockPositionComponent = (props: Props) => {
    const positionObj = props.positionObj;

    const [loading, setLoading] = useState<boolean>(false);
    const [purchasePrice, setPurchasePrice] = useState<number>(0);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);  // shouldn't be needed but as a precaution
                
                const currentPrice = 50;
                const purchasePrice = 10;
    
                setCurrentPrice(currentPrice);
                setPurchasePrice(purchasePrice);
                setLoading(false);
    
            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        };
        fetchData();
    }, [positionObj]);

    if (loading) return (<p>Loading...</p>);

    const amountHeld = positionObj.amount
    const returnsAsAmount = (currentPrice - purchasePrice) * positionObj.amount;
    const returnsAsPercent = (currentPrice - purchasePrice) / purchasePrice;
    const formattedPercent =
    (returnsAsPercent > 0 ? "+" : "") + (returnsAsPercent * 100).toFixed(2) + "%";
    const returnsStyle = returnsAsPercent > 0 ? styles.positive_returns :  returnsAsPercent < 0 ? styles.negative_returns : "";
    const totalValue = currentPrice * positionObj.amount
    const createdDate = positionObj.createdAt.toString().substring(0,10);

    return (
        <Link href={"/stock/" + positionObj.ticker}>
            <div id={positionObj.id} className={styles.position_wrapper}>
                <h3>{positionObj.ticker}</h3>
                <table className={styles.position_information}>
                    <thead>
                        <tr>
                            <th className={styles.table_header}>Amount Held</th>
                            <th className={styles.table_header}>Current Price</th>
                            <th className={styles.table_header}>Purchase Price</th>
                            <th className={styles.table_header}>Returns ($)</th>
                            <th className={styles.table_header}>Returns (%)</th>
                            <th className={styles.table_header}>Total Value</th>
                            <th className={styles.table_header}>Purchase Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={styles.table_entry}>{amountHeld}</td>
                            <td className={styles.table_entry}>{currentPrice}</td>
                            <td className={styles.table_entry}>{purchasePrice}</td>
                            <td className={styles.table_entry}><span className = {returnsStyle}>${returnsAsAmount}</span></td>
                            <td className={styles.table_entry}><span className = {returnsStyle}>{formattedPercent}</span></td>
                            <td className={styles.table_entry}>{totalValue}</td>
                            <td className={styles.table_entry}>{createdDate}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Link>
    );
};
