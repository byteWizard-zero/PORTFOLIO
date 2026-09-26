import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo" id="footer" aria-label="Footer">
      <div className={styles.container}>
        <div className={styles.blackBlock} />
      </div>
    </footer>
  );
}
