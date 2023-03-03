import Link from "next/link";
import styles from "./Navbar.module.css";

type Pages = "home" | "about";

export const Navbar = ({ activePage = "home" }: { activePage: Pages }) => {
  return (
    <div className={styles.navbar}>
      <ul>
        <li>
          <Link className={activePage === "home" ? styles.active : ""} href="/">
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
      </ul>
    </div>
  );
};
