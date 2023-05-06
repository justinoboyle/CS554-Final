import Head from "next/head";
import { useState, useEffect } from 'react';

import { Navbar } from "../components/Navbar";
import { usePortfolios } from '../hooks/usePortfolios';

import styles from '@/styles/portfolios.module.css'
import { Portfolio } from "@prisma/client";

function Portfolios() {
  const { data, error } = usePortfolios();
  const [userId, setUserId] = useState<string>("");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [title, setTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setUserId(data.data.userId);
      setPortfolios(data.data.portfolios);
    }
  }, [data]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (title.trim().length === 0) {
      setErrorMessage("Please enter a title");
      return;
    }
    setDisabled(true);
    const response = await fetch("/api/portfolio/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({title, userId: userId}),
    });
    if (response.ok) {
      setSuccessMessage(`Successfully created portfolio \'${title}\'`);
      let json = await response.json();
      let newPortfolio = json.data as Portfolio;
      setPortfolios([...portfolios, newPortfolio]);
    } else {
      setErrorMessage("Unable to create portfolio");
      return;
    }
    setDisabled(false);
  }

  function handleDelete(portfolioId: string) {
    
    let newPortfolios = portfolios.filter((portfolio) => portfolio.id !== portfolioId);
    setPortfolios(newPortfolios);
  }

  function buildPortfolios() {
    if (!portfolios) return <h2>Could not load user portfolios</h2>;
    let result = [];
    for (let portfolio of portfolios) {
      result.push(
        <div className={styles.portfolio_wrapper} key={portfolio.id}>
          <div className={styles.portfolio_information}>
            <h2>{portfolio.title}</h2>
            <p>{portfolio.positions.length>0 ? portfolio.positions : "No stocks in portfolio"}</p>
          </div>
          <div className={styles.button_wrapper}>
            <button className={`${styles.button} ${styles.add_button}`}>Add stock</button>
            <button className={`${styles.button} ${styles.delete_button}`}>Delete portfolio</button>
          </div>
        </div>
      )
    }
    return result;
  }

  if (error) return <div className={styles.content}>{error.message}</div>;
  if (!portfolios) return <div className={styles.content}>Loading...</div>;

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Navbar activePage="portfolios" />
        <div className={styles.content}>
          <h1 className={styles.title}>Portfolios</h1>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.form_group}>Create a portfolio</label>
            <br/>
            <input 
              className={styles.form_group}
              name="symbol"
              placeholder="Enter a title"
              onChange={(e) => setTitle(e.target.value)}
              disabled={disabled}
            />
            <button className={styles.form_group} type='submit'>Submit</button>
            {errorMessage && <p className={`${styles.form_message} ${styles.error}`}>{errorMessage}</p>}  
            {successMessage && <p className={`${styles.form_message} ${styles.success}`}>{successMessage}</p>}
          </form>
          <div>
            {buildPortfolios()}
          </div>
        </div>
      </main>
    </>
  );
}

export default Portfolios;