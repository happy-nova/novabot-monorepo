import styles from '../legal.module.css';

export default function TermsPage() {
  return (
    <main className={styles.legal}>
      <div className={styles.container}>
        <a href="/" className={styles.backLink}>← Back to Dreams</a>
        
        <h1>SMS Terms & Conditions</h1>
        
        <p className={styles.label}>Program Name</p>
        <p>ais4ocho / Nova Nine Alerts</p>
        
        <p className={styles.label}>Description</p>
        <p>
          This program sends low-volume SMS notifications including development messages, 
          system alerts, and personal automation updates.
        </p>
        
        <p>
          Message frequency varies. Message and data rates may apply.
        </p>
        
        <p>
          To opt out, reply <strong>STOP</strong> at any time.
        </p>
        
        <p>
          For help, reply <strong>HELP</strong>.
        </p>
        
        <p className={styles.disclaimer}>
          Supported carriers are not liable for delayed or undelivered messages.
        </p>
        
        <div className={styles.footer}>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </main>
  );
}
