import { 
    getStockPositionById,
    calculateStockPositionReturns,
    getPriceAtTime 
} from '../helpers/stockPositionHelper'
import { useState, useEffect } from 'react';
import { StockPosition } from "@prisma/client";

type Props = {
    key: string,
    positionObj: StockPosition
}

type StockPositionReturns = {
    asAmount: number,
    asPercentage: number
}

// takes position id as key from props
export const StockPositionComponent = (props: Props) => {
    const positionId = props.key;
    const positionObj = props.positionObj;
    const [stockPositionData, setStockPositionData] = useState<StockPosition | undefined>(undefined);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [purchasePrice, setPurchasePrice] = useState<number>(0);
    const [returnData, setReturnData] = useState<StockPositionReturns | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);  // shouldn't be needed but as a precaution

                let data;  // load data only if needed
                if(!positionObj){
                    data = await getStockPositionById(positionId);
                }
                else{
                    data = positionObj;
                }
                
                const currentPrice = await getPriceAtTime(data.ticker, data.createdAt);
                const purchasePrice = await getPriceAtTime(data.ticker, new Date());

                const returns = await calculateStockPositionReturns(data, purchasePrice, currentPrice);

                setStockPositionData(data);
                setCurrentPrice(currentPrice);
                setPurchasePrice(purchasePrice);
                setReturnData(returns);
                setLoading(false);

            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        };
        fetchData
    }, [positionId, positionObj]);

    if(loading) return (<p>Loading...</p>);
    if(!stockPositionData || !returnData) return (<p>Error: Failed to fetch Stock Position</p>)

    return (
        <div id={stockPositionData.id}>
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
                    <th>{stockPositionData.amount}</th>
                    <th>{currentPrice}</th>
                    <th>{purchasePrice}</th>
                    <th>{returnData.asAmount} ({returnData.asPercentage})</th>
                    <th>{currentPrice * stockPositionData.amount}</th>
                    {/* TODO: Format Date */}
                    <th>{stockPositionData.createdAt.toString()}</th>
                </tr>
            </table>
        </div>
    )
};