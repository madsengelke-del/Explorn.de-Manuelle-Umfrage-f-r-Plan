import styles from './erfolg.module.css'
import Link from 'next/link'

export default function Erfolg() {
  return (
    <main className={styles.wrap}>
      <div className={styles.logo}>
        <div className={styles.logoMark}><span>e</span></div>
        <span className={styles.logoName}>explorn</span>
      </div>
      <div className={styles.card}>
        <div className={styles.checkIcon}>✓</div>
        <h1>Antworten erhalten!</h1>
        <p>Danke — ich habe deine Angaben bekommen und melde mich in den nächsten Tagen mit deinem persönlichen Reiseplan.</p>
        <p className={styles.sub}>Bei Fragen kannst du dich jederzeit melden.</p>
      </div>
    </main>
  )
}
