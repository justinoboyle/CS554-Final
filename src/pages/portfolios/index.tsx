import Head from "next/head";
import { useState } from "react";

import Link from "next/link";

import { Navbar } from "@/components/Navbar";

import styles from "@/styles/portfolios.module.css";
import { PortfolioComponent } from "@/components/PortfolioComponent";
import useTopLevelUserData from "@/hooks/useTopLevelUserData";

function Portfolios() {
  const { data, error, mutate, helpers } = useTopLevelUserData();
  const [title, setTitle] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const portfolios = data?.portfolios || [];

  async function handleSubmit(e: any) {
    e.preventDefault();
    setIsLoading(true);
    setDisabled(true);
    try {
      await helpers.createPortfolio(title);
    } catch (e) {
      console.error(e);
    }
    setDisabled(false);
    setIsLoading(false);
    setTitle("");
  }

  async function handleDelete(portfolioId: string) {
    return await helpers.deletePortfolio(portfolioId);
  }

  function buildPortfolios() {
    if (!portfolios) return <h2>Could not load user portfolios</h2>;
    let result = [];
    for (let portfolio of portfolios) {
      result.push(
        <div className={styles.portfolio_wrapper} key={portfolio.id}>
          <div className={styles.portfolio_information}>
            <Link href={"/portfolios/" + portfolio.id}>
              <PortfolioComponent key={portfolio.id} id={portfolio.id} portfolioObj={portfolio} />
            </Link>
          </div>
          <div className={styles.button_wrapper}>
            <button
              className={`${styles.button} ${styles.delete_button}`}
              onClick={() => handleDelete(portfolio.id)}
            >
              Delete portfolio
            </button>
          </div>
        </div>
      );
    }
    return result;
  }

  const validatePortfolioTitle = (title: string) => {
    return title.length > 0 && title.length < 50;
  };

  if (error) return <div className={styles.content}>{error}</div>;
  if (!portfolios) return <div className={styles.content}>Loading...</div>;

  return (
    <>
      <Head>
        <title>Portfolios | haptickrill</title>
        <meta name="description" content="Haptic Krill" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Navbar activePage="portfolios" />
        <div className={styles.content}>
          <h1 className={styles.title}>Portfolios</h1>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.form_group}>Create a portfolio</label>
            <br />
            <input
              className={styles.form_group}
              name="symbol"
              placeholder="Enter a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={disabled}
            />
            <button
              className={styles.form_group}
              type="submit"
              disabled={!validatePortfolioTitle(title) || disabled || isLoading}
            >
              Submit
            </button>
          </form>
          <div>{buildPortfolios()}</div>
        </div>
      </main>
    </>
  );
}

export default Portfolios;
