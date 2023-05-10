import styles from "./auth.module.css";
import { useState, useEffect } from "react";

import useUser from "../../hooks/useUser";

import Link from "next/link";

import type { ExternalResponse } from "../../helpers/errors";

import { useRouter } from "next/router";

export default function Login() {
  const { user, isLoading } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const isValid =
    email?.trim().length > 0 &&
    password?.trim().length > 0 &&
    email?.includes("@");

  // if signed in already, redirect to home page, use useffect
  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = "/";
    }
  }, [user, isLoading]);

  // handle form submit
  const handleLogin = async (e: any) => {
    e.preventDefault();
    // verify email format
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setDisabled(true);
    // call api
    // api/auth/signin
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      // redirect to home page
      window.location.href = "/";
    } else {
      // show error
      const data: ExternalResponse<any> = await response.json();
      setError(data.error || "Unknown error");
      setDisabled(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h1>Login</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              disabled={isLoading || disabled}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              disabled={isLoading || disabled}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <button
              type="submit"
              disabled={!isValid || isLoading || disabled}
              onClick={handleLogin}
            >
              Login
            </button>
            {/* register button */}
            <div
              className={styles.register}
              onClick={() => router.push("/auth/register")}
            >
              <Link href="/auth/register">Sign up</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
