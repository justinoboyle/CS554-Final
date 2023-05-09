import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useStock } from "@/hooks/fetchers/useStock";
import styles from "./StockPositionComponent.module.css";
import { StockPosition } from "@prisma/client";

type Props = {
    positionObj: StockPosition;
};

// takes position id as key from props
export const StockPositionComponent = (props: Props) => {
    const positionObj = props.positionObj;
    const { data: stockData, error: stockError } = useStock("" + positionObj.ticker);

    const createdDate = positionObj.createdAt.toString().substring(0,10);

    return (
        <Link href={"/stock/" + positionObj.ticker}>
            <div id={positionObj.id} className={styles.position_wrapper}>
                <h3>{positionObj.ticker}</h3>
                <table className={styles.position_information}>
                    <tr>
                        <th className={styles.table_header}>Amount Held</th>
                        {/* <th {styles.table_header}>Current Price</th>
                        <th {styles.table_header}>Purchase Price</th>
                        <th {styles.table_header}>Returns</th>
                        <th {styles.table_header}>Total Value</th> */}
                        <th className={styles.table_header}>Purchase Date</th>
                    </tr>
                    <tr>
                        <th className={styles.table_entry}>{positionObj.amount}</th>
                        {/* <th className={styles.table_entry}>{currentPrice}</th>
                        <th className={styles.table_entry}>{purchasePrice}</th>
                        <th className={styles.table_entry}>{returnData.asAmount} ({returnData.asPercentage})</th>
                        <th className={styles.table_entry}>{currentPrice * stockPositionData.amount}</th> */}
                        {/* TODO: Format Date */}
                        <th className={styles.table_entry}>{createdDate}</th>
                    </tr>
                </table>
            </div>
        </Link>
    );
};
