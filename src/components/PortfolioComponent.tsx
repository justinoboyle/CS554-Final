import { PortfolioWithPositions, getPortfolioById, calculatePortfolioReturns } from '../helpers/portfolioHelper'
import { useState, useEffect } from 'react';
import { StockPositionComponent } from './StockPositionComponent';
import { StockPosition } from "@prisma/client";

type Props = {
    key: string
}

type PortfolioReturns = {
    asAmount: number,
    asPercentage: number
}

// takes portfolio id as key from props
export const PortfolioComponent = (props: Props) => {
    const portfolioId = props.key;
    const [portfolioData, setPortfolioData] = useState<PortfolioWithPositions | undefined>(undefined);
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
    }, [portfolioId]);

    if(loading) return (<p>Loading Position Data...</p>);
    if(!portfolioData || !returnData) return (<p>Error: Failed to fetch Portfolio</p>)

    // construct individual position components
    const portfolioPositions = portfolioData.positions.map((position : StockPosition) => {
        return (<StockPositionComponent key={position.id} positionObj={position}/>);
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