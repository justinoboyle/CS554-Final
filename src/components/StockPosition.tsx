import { 
    getStockPositionById,
    calculateStockPositionReturns,
    getPriceAtTime 
} from '../helpers/StockPositionHelper'
import { useState, useEffect } from 'react';

type Props = {
    key: string
}

type StockPositionObject = {
    id: string
    createdAt: Date 
    amount: number,
    currentPrice: number,
    purchasePrice: number,
}

type StockPositionReturns = {
    asAmount: number,
    asPercentage: number
}

// takes position id as key from props
export const StockPosition = (props: Props) => {
    const positionId = props.key;
    const [stockPositionData, setStockPositionData] = useState<StockPositionObject | undefined>(undefined);
    const [returnData, setReturnData] = useState<StockPositionReturns | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);  // shouldn't be needed but as a precaution

                const data = await getStockPositionById(positionId);
                data.currentPrice = await getPriceAtTime("TODO: get ticker", data.createdAt);
                data.purchasePrice = await getPriceAtTime("TODO: get ticker", new Date());

                const returns = await calculateStockPositionReturns(data);

                setStockPositionData(data);
                setReturnData(returns);
                setLoading(false);

            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        };
        fetchData
    }, []);

    if(loading) return (<p>Loading...</p>);
    if(!stockPositionData || !returnData) return (<p>Error: Failed to fetch Stock Position</p>)

    return (
        <div id={stockPositionData?.id}>
            <h3>TODO: Ticker Name</h3>
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
                    <th>{stockPositionData.amount}</th>
                    <th>{stockPositionData.currentPrice}</th>
                    <th>{stockPositionData.purchasePrice}</th>
                    <th>{returnData.asAmount} ({returnData.asPercentage})</th>
                    <th>{stockPositionData.currentPrice * stockPositionData.amount}</th>
                    {/* TODO: Format Date */}
                    <th>{stockPositionData.createdAt.toString()}</th>
                </tr>
            </table>
        </div>
    )
};