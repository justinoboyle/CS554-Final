import Link from "next/link";
import styles from "./Navbar.module.css";

import useUser from "../hooks/useUser";

type Pages = "home" | "about" | "portfolios" | "watchlist" | "";

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
              className={activePage === "about" ? styles.active : ""}
              href="/about"
            >
              About
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
          {!isLoading && isLoggedIn && <li>Hi, {user?.name} </li>}
        </ul>
      </div>
    </div>
  );
};
