import { getPortfolioById, calculatePortfolioReturns } from '../helpers/portfolioHelper'
import { useState, useEffect } from 'react';
import { StockPosition } from './StockPosition';

type Props = {
    key: string
}

type PortfolioObject = {
    id: string
    title: string
    userId: string
    positions: string[]
}

type PortfolioReturns = {
    asAmount: number,
    asPercentage: number
}

// takes portfolio id as key from props
export const Portfolio = (props: Props) => {
    const portfolioId = props.key;
    const [portfolioData, setPortfolioData] = useState<PortfolioObject | undefined>(undefined);
    const [returnData, setReturnData] = useState<PortfolioReturns | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                const data = await getPortfolioById(portfolioId);

                const returns = await calculatePortfolioReturns(data);

                setPortfolioData(data);
                setReturnData(returns)
                setLoading(false);

            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        };
        fetchData
    }, []);

    if(loading) return (<p>Loading Position Data...</p>);
    if(!portfolioData || !returnData) return (<p>Error: Failed to fetch Portfolio</p>)

    const portfolioPositions = portfolioData.positions.map((positionId) => {
        return (<StockPosition key={positionId}/>);
    });

    return (
        <div id={portfolioData.id}>
            <div id='portfolio-header'>
                { portfolioData ? portfolioData.title : "Unknown Portfolio Title"}
            </div>
            <div>
                {portfolioPositions}
            </div>
        </div>
    )
};