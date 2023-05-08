import { PortfolioComponent } from "../../components/PortfolioComponent";
import { StockPositionComponent } from "../../components/StockPositionComponent";
import { PortfolioWithPositions } from '../../helpers/portfolioHelper'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from "@/styles/portfolios.module.css";
import useTopLevelUserData from "../../hooks/useTopLevelUserData";


function PortfolioPage() {
    const router = useRouter();
    const id = "" + router?.query?.id;
    const { data, isLoading } = useTopLevelUserData();
    const [portfolioData, setPortfolioData] = useState<PortfolioWithPositions | undefined>(undefined);
    
    useEffect(() => {
        async function fetchData() {
            try {
                const portofolio = isLoading ? undefined : 
                    data?.portfolios?.find((port : PortfolioWithPositions) => port.id === id);
                setPortfolioData(portofolio);

            } catch (e) {
                console.log(e);
            }
        };
        fetchData();
    }, [isLoading])

    if(isLoading) return (<p>Loading Portfolio Data...</p>);
    if (!portfolioData) return (<p>Error: Failed to fetch Portfolio</p>)

    const portfolioHeader = (<PortfolioComponent key={id} id={id} portfolioObj={portfolioData}/>);

    const addStockButton = (
        <div className={styles.button_wrapper}>
              <button className={`${styles.button} ${styles.add_button}`}>
                Add stock
              </button>
        </div>
    );

    const currentPositions = portfolioData.positions.map((position) => {
        return <StockPositionComponent key={position.id} positionObj={position}/>
    });

    return (
        <div>
            {portfolioHeader}
            {addStockButton}
            <div id={"positions-list"}>
                <p>Current Positions:</p>
                {currentPositions}
            </div> 
        </div>
    );
}

export default PortfolioPage;
