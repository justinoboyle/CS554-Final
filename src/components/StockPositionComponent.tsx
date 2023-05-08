import { 
    getStockPositionById,
    calculateStockPositionReturns,
    getPriceAtTime 
} from '../helpers/stockPositionHelper'
import { useState, useEffect } from 'react';
import { StockPosition } from "@prisma/client";

type Props = {
    positionObj: StockPosition
}

type StockPositionReturns = {
    asAmount: number,
    asPercentage: number
}

// takes position id as key from props
export const StockPositionComponent = (props: Props) => {
    const positionObj = props.positionObj;
    const positionId = positionObj.id;

    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [purchasePrice, setPurchasePrice] = useState<number>(0);
    const [returnData, setReturnData] = useState<StockPositionReturns | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                
                const currentPrice = await getPriceAtTime(positionObj.ticker, positionObj.createdAt);
                const purchasePrice = await getPriceAtTime(positionObj.ticker, new Date());

                const returns = await calculateStockPositionReturns(positionObj, purchasePrice, currentPrice);

                setCurrentPrice(currentPrice);
                setPurchasePrice(purchasePrice);
                setReturnData(returns);
                setLoading(false);

            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        };
        fetchData();
    }, [positionId, positionObj]);

    if(loading) return (<p>Loading...</p>);
    if(!positionObj || !returnData) return (<p>Error: Failed to fetch Stock Position</p>)

    return (
        <div id={positionObj.id}>
            <h3>stockPositionData.ticker</h3>
            <table>
                <tr>
                    <th>Amount Held</th>
                    <th>Current Price</th>
                    <th>Purchase Price</th>
                    <th>Returns</th>
                    <th>Total Value</th>
                    <th>Purchase Date</th>
                </tr>
                <tr>
                    <th>{positionObj.amount}</th>
                    <th>{currentPrice}</th>
                    <th>{purchasePrice}</th>
                    <th>{returnData.asAmount} ({returnData.asPercentage})</th>
                    <th>{currentPrice * positionObj.amount}</th>
                    {/* TODO: Format Date */}
                    <th>{positionObj.createdAt.toString()}</th>
                </tr>
            </table>
        </div>
    )
};