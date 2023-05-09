import { Navbar } from "./Navbar";

import styles from "./Layout.module.css";

export function Loading({ activePage = '' }: any) {
  return (
    <div>
      <Navbar activePage={activePage}/>
      <div className={styles.main_wrapper}>
        <p>Loading...</p>
      </div>
    </div>
  );
}