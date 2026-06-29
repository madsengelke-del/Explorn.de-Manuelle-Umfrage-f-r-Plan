'use client'
import { useState, useEffect } from 'react'
import styles from './admin.module.css'

type Submission = {
  id: number
  name: string
  alter: number
  gruppe: string
  partner: string
  beduerfnisse: string
  abreise: string
  dauer: string
  destination_offenheit: string
  laender: string
  reisestil: string
  budget: string
  typen: string
  struktur: string
  muss: string
  nein: string
  sonstiges: string
  timestamp: string
}

const FIELDS = [
  ['name', 'Name'],
  ['alter', 'Alter'],
  ['gruppe', 'Gruppe'],
  ['partner', 'Mitreisende'],
  ['beduerfnisse', 'Bedürfnisse'],
  ['abreise', 'Abreise'],
  ['dauer', 'Dauer'],
  ['destination_offenheit', 'Destination (Offenheit)'],
  ['laender', 'Länder'],
  ['reisestil', 'Reisestil'],
  ['budget', 'Budget'],
  ['typen', 'Reisetypen'],
  ['struktur', 'Strukturgrad'],
  ['muss', 'Muss dabei sein'],
  ['nein', 'Soll nicht dabei sein'],
  ['sonstiges', 'Sonstiges'],
]

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selected, setSelected] = useState<Submission | null>(null)

  function login() {
    if (pw === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || pw === 'explorn2024') {
      setAuthed(true)
      fetch('/api/submit').then(r => r.json()).then(setSubmissions)
    } else {
      setError('Falsches Passwort.')
    }
  }

  if (!authed) return (
    <main className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <div className={styles.logoMark}><span>e</span></div>
          <span className={styles.logoName}>explorn</span>
        </div>
        <p className={styles.loginHint}>Admin-Bereich</p>
        <input
          type="password"
          placeholder="Passwort"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          className={styles.pwInput}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button onClick={login} className={styles.loginBtn}>Einloggen</button>
      </div>
    </main>
  )

  return (
    <main className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoMark}><span>e</span></div>
          <span className={styles.logoName}>explorn</span>
        </div>
        <span className={styles.badge}>{submissions.length} Antwort{submissions.length !== 1 ? 'en' : ''}</span>
      </div>

      {submissions.length === 0 ? (
        <div className={styles.empty}>Noch keine Antworten eingegangen.</div>
      ) : (
        <div className={styles.grid}>
          <div className={styles.list}>
            {[...submissions].reverse().map(s => (
              <div
                key={s.id}
                className={`${styles.listItem} ${selected?.id === s.id ? styles.listItemActive : ''}`}
                onClick={() => setSelected(s)}
              >
                <div className={styles.listName}>{s.name || '–'}</div>
                <div className={styles.listMeta}>
                  {s.alter} Jahre · {s.abreise || '–'} · {s.dauer || '–'}
                </div>
                <div className={styles.listTime}>{new Date(s.timestamp).toLocaleDateString('de-DE')}</div>
              </div>
            ))}
          </div>

          <div className={styles.detail}>
            {selected ? (
              <>
                <h2 className={styles.detailName}>{selected.name || 'Anonym'}</h2>
                <p className={styles.detailTime}>{new Date(selected.timestamp).toLocaleString('de-DE')}</p>
                <table className={styles.detailTable}>
                  <tbody>
                    {FIELDS.map(([key, label]) => {
                      const val = (selected as Record<string, unknown>)[key]
                      if (!val) return null
                      return (
                        <tr key={key}>
                          <td className={styles.dtKey}>{label}</td>
                          <td className={styles.dtVal}>{String(val)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </>
            ) : (
              <div className={styles.detailEmpty}>← Antwort auswählen</div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
