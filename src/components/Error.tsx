import { Navbar } from "./Navbar";

import styles from "./Layout.module.css";

export function Error({ activePage = '', message }: any) {
  return (
    <div>
      <Navbar activePage={activePage}/>
      <div className={styles.main_wrapper}>
        <p>{message}</p>
      </div>
    </div>
  )
}