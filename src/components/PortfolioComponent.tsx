import { PortfolioWithPositions, calculatePortfolioReturns } from '../helpers/portfolioHelper'
import { useState, useEffect } from 'react';


type Props = {
    id: string,
    portfolioObj: PortfolioWithPositions
}

type PortfolioReturns = {
    asAmount: number,
    asPercentage: number
}

// takes portfolio id as key from props
export const PortfolioComponent = (props: Props) => {
    const portfolioData = props.portfolioObj;
    const [returnData, setReturnData] = useState<PortfolioReturns | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const returns = await calculatePortfolioReturns(portfolioData);
                setReturnData(returns)
                setLoading(false);

            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        };
        fetchData();
    }, [portfolioData]);

    if (loading) return (<p>Loading Portfolio Data...</p>);
    if (!portfolioData || !returnData) return (<p>Error: Failed to fetch Portfolio</p>)

    return (
        <div id={portfolioData.id}>
            <h2 id='portfolio-header'>
                {portfolioData ? portfolioData.title : "Unknown Portfolio Title"}
            </h2>
            <div>
                Portfolio Returns: {returnData.asAmount} ({returnData.asAmount ? returnData.asPercentage : "0%"})
            </div>
        </div>
    )
};