import Head from "next/head";
import { useState } from 'react';

import { Navbar } from "../components/Navbar";
import useUser from "../hooks/useUser"

import styles from '@/styles/portfolios.module.css'


export default function Home() {
  const { user, isLoading } = useUser();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (title.trim().length === 0) {
      setError("Please enter a title");
      return;
    }
    setDisabled(true);
    const response = await fetch("/api/portfolio/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({title, userId: user.id}), // Complains about user undefined here
    });
  }

  if (isLoading) {

  } else {
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
                disabled={isLoading || disabled}
              />
              <button className={styles.form_group} type='submit'>Submit</button>
              {error && <p className={styles.error}>{error}</p>}  
            </form>
            <div>
              List of portfolios go here
            </div>
          </div>
        </main>
      </>
    );
  }
}