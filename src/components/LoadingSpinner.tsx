import React from "react";
import styles from "./LoadingSpinner.module.css";

export function LoadingSpinner() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
}
