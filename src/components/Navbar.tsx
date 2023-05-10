import Link from "next/link";
import styles from "./Navbar.module.css";

import useUser from "../hooks/useUser";

type Pages = "home" | "portfolios" | "watchlist" | "alerts" | "";

// handle form submit
const handleLogout = async (e: any) => {
  e.preventDefault();
  // call api
  // api/auth/logout
  const response = await fetch("/api/auth/logout", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    window.location.href = "/";
  } else {
    // TODO: Handling?
  }
};

export const Navbar = ({ activePage = "home" }: { activePage: Pages }) => {
  const { user, isLoggedIn, isLoading } = useUser();

  return (
    <div className={styles.navbar}>
      <div className={styles.primary}>
        <ul>
          <li>
            <Link
              className={activePage === "home" ? styles.active : ""}
              href="/"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              className={activePage === "portfolios" ? styles.active : ""}
              href="/portfolios"
            >
              Portfolios
            </Link>
          </li>
          <li>
            <Link
              className={activePage === "alerts" ? styles.active : ""}
              href="/alerts"
            >
              Alerts
            </Link>
          </li>
          <li>
            <Link
              className={activePage === "watchlist" ? styles.active : ""}
              href="/watchlist"
            >
              Watchlist
            </Link>
          </li>
        </ul>
      </div>
      <div className={styles.secondary}>
        {/* right side */}
        <ul>
          {!isLoading && !isLoggedIn && (
            <li>
              <Link href="/auth/login">Login</Link>
            </li>
          )}
          {!isLoading && isLoggedIn && (
            <li>Hi, {user?.name}</li>
          )}
          {!isLoading && isLoggedIn && (
            <li>
              <button
                onClick={handleLogout}
              >
                Log Out
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
