import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Navbar } from "../components/Navbar";
import useHomePage from "../hooks/useTopLevelUserData";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography
} from '@mui/material';

import { useState } from "react";
import { PortfolioWithReturns } from "@/helpers/portfolioHelper";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data, isLoading } = useHomePage();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Something went wrong</div>;
  }

  const { notifications, watchlist, portfolios } = data;

  const portfolioCard = (portfolio:PortfolioWithReturns) => {
    return (
      <Grid item xs={12} sm={7} md={5} lg={4} xl={3} key={portfolio.id}>
        <Card
          variant='outlined'
          sx={{
            maxWidth: 250,
            height: 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: 5,
            border: '1px solid #1e8678',
            boxShadow:
              '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
          }}
        >
          <CardActionArea>
            <CardContent>
              <Typography
                sx={{
                  borderBottom: '1px solid #1e8678',
                  fontWeight: 'bold'
                }}
                gutterBottom
                variant='h3'
                component='h3'
              >
                {portfolio.title}
              </Typography>
              <Typography variant='h3' color='textSecondary' component='p'>
                {portfolio.returns.asAmount}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    )
  }

  return (
    <>
      <Head>
        <title>haptickrill</title>
        <meta name="description" content="Stock analysis application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Navbar activePage="home" />
        <div className={styles.container}>
          <div className={styles.main}>
            {/* portfolios */}
            <div className={styles.portfolios}>
              <h2>Portfolios</h2>
              <div className={styles.portfoliosList}>
                <Grid
                  container
                  spacing={2}
                  sx={{
                    flexGrow: 1,
                    flexDirection: 'row'
                  }}
                >
                  {portfolios.map(portfolioCard)}
                </Grid>
              </div>
            </div>
          </div>
          <div className={styles.sidebar}>
            {/* notifications */}
            <div className={styles.notifications}>
              <h2>Notifications</h2>
              <div className={styles.notificationsList}>
                {notifications.map((notification, key) => (
                  <div
                    key={`notification` + key}
                    className={styles.notification}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
