import styles from '../legal.module.css';

export default function PrivacyPage() {
  return (
    <main className={styles.legal}>
      <div className={styles.container}>
        <a href="/" className={styles.backLink}>← Back to Dreams</a>
        
        <h1>Privacy Policy</h1>
        
        <p>
          This messaging program is operated by <strong>ais4ocho / Nova Nine</strong> for personal use.
        </p>
        
        <p>
          We collect phone numbers solely for the purpose of sending requested SMS notifications 
          such as system alerts, development messages, and personal automation updates.
        </p>
        
        <p>
          We do not sell, rent, or share personal information with third parties.
        </p>
        
        <p>
          Message frequency varies. Message and data rates may apply.
        </p>
        
        <p>
          You can opt out at any time by replying <strong>STOP</strong>.
        </p>
        
        <p>
          For assistance, reply <strong>HELP</strong>.
        </p>
        
        <div className={styles.footer}>
          <a href="/terms">Terms & Conditions</a>
        </div>
      </div>
    </main>
  );
}
