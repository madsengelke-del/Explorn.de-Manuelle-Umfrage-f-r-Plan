'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const MONTHS_FULL = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const MONTHS_SHORT = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const MIN_AGE = 14, MAX_AGE = 40

const STRUKTUR_LABELS: Record<number, string> = {
  1: 'Komplett spontan — kein Plan',
  2: 'Eher offen — nur grobe Richtung',
  3: 'Ausgewogen — grober Plan, aber flexibel',
  4: 'Eher strukturiert — feste Etappen',
  5: 'Durchgeplant — klare Route',
}

export default function Home() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  // Alter drum
  const [alterIdx, setAlterIdx] = useState(6)
  const drumRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{y: number; idx: number} | null>(null)

  // Month picker
  const [mpOpen, setMpOpen] = useState(false)
  const [mpYear, setMpYear] = useState(new Date().getFullYear())
  const [mpSelected, setMpSelected] = useState<{year: number; month: number} | null>(null)

  // Tags (Länder)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [gruppe, setGruppe] = useState('')
  const [partner, setPartner] = useState('')
  const [beduerfnisse, setBeduerfnisse] = useState('')
  const [dauer, setDauer] = useState('')
  const [destOffen, setDestOffen] = useState('')
  const [stil, setStil] = useState('')
  const [budget, setBudget] = useState(8000)
  const [typen, setTypen] = useState<string[]>([])
  const [struktur, setStruktur] = useState(3)
  const [muss, setMuss] = useState('')
  const [nein, setNein] = useState('')
  const [sonstiges, setSonstiges] = useState('')

  const alter = MIN_AGE + alterIdx

  function handleDrumMouseDown(e: React.MouseEvent) {
    dragStart.current = { y: e.clientY, idx: alterIdx }
    document.addEventListener('mousemove', handleDrumMouseMove)
    document.addEventListener('mouseup', handleDrumMouseUp)
    e.preventDefault()
  }
  function handleDrumMouseMove(e: MouseEvent) {
    if (!dragStart.current) return
    const dy = dragStart.current.y - e.clientY
    const newIdx = Math.max(0, Math.min(MAX_AGE - MIN_AGE, dragStart.current.idx + Math.round(dy / 40)))
    setAlterIdx(newIdx)
  }
  function handleDrumMouseUp() {
    dragStart.current = null
    document.removeEventListener('mousemove', handleDrumMouseMove)
    document.removeEventListener('mouseup', handleDrumMouseUp)
  }
  function handleDrumWheel(e: React.WheelEvent) {
    e.preventDefault()
    setAlterIdx(i => Math.max(0, Math.min(MAX_AGE - MIN_AGE, i + (e.deltaY > 0 ? 1 : -1))))
  }
  function handleDrumTouch(e: React.TouchEvent) {
    const startY = e.touches[0].clientY
    const startIdx = alterIdx
    function move(ev: TouchEvent) {
      ev.preventDefault()
      const dy = startY - ev.touches[0].clientY
      setAlterIdx(Math.max(0, Math.min(MAX_AGE - MIN_AGE, startIdx + Math.round(dy / 40))))
    }
    document.addEventListener('touchmove', move, { passive: false })
    document.addEventListener('touchend', () => document.removeEventListener('touchmove', move), { once: true })
  }

  function addTag(val: string) {
    const v = val.trim()
    if (!v || tags.includes(v)) return
    setTags(t => [...t, v])
    setTagInput('')
  }
  function removeTag(v: string) { setTags(t => t.filter(x => x !== v)) }
  function toggleTyp(val: string) { setTypen(t => t.includes(val) ? t.filter(x => x !== val) : [...t, val]) }

  const now = new Date()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const data = {
      name, alter,
      gruppe, partner,
      beduerfnisse,
      abreise: mpSelected ? `${MONTHS_FULL[mpSelected.month]} ${mpSelected.year}` : '',
      dauer,
      destination_offenheit: destOffen,
      laender: tags.join(', '),
      reisestil: stil,
      budget: `${budget.toLocaleString('de-DE')} €`,
      typen: typen.join(', '),
      struktur: STRUKTUR_LABELS[struktur],
      muss, nein, sonstiges,
      timestamp: new Date().toISOString(),
    }
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch {}
    router.push('/erfolg')
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.logo}>
        <div className={styles.logoMark}><span>e</span></div>
        <span className={styles.logoName}>explorn</span>
      </div>

      <div className={styles.intro}>
        <p>Hey! Schön, dass du dabei bist. <strong>Beantworte einfach die folgenden Fragen</strong> — das dauert etwa 3–5 Minuten. Auf Basis deiner Antworten erstelle ich deinen persönlichen Reiseplan. Es gibt keine falschen Antworten.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1 */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Über dich</div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label>Dein Name</label>
              <input type="text" placeholder="z.B. Lena" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Alter</label>
              <div className={styles.drumWrap}>
                <div className={styles.drum} ref={drumRef}
                  onMouseDown={handleDrumMouseDown}
                  onWheel={handleDrumWheel}
                  onTouchStart={handleDrumTouch}
                >
                  <div className={styles.drumLine} />
                  <div className={styles.drumInner} style={{ transform: `translateY(${40 - alterIdx * 40}px)` }}>
                    <div className={styles.drumItem} />
                    {Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => (
                      <div key={i} className={`${styles.drumItem} ${i === alterIdx ? styles.drumActive : ''}`}>
                        {MIN_AGE + i}
                      </div>
                    ))}
                    <div className={styles.drumItem} />
                  </div>
                </div>
                <span className={styles.drumLabel}>Jahre</span>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label>Reist du alleine oder mit jemandem?</label>
            <div className={styles.pills}>
              {['alleine','zu zweit','gruppe'].map(v => (
                <label key={v} className={styles.pill}>
                  <input type="radio" name="gruppe" value={v} checked={gruppe===v} onChange={() => setGruppe(v)} />
                  <span>{v === 'gruppe' ? 'Gruppe' : v.charAt(0).toUpperCase() + v.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          {gruppe !== 'alleine' && gruppe !== '' && (
            <div className={styles.field}>
              <label>Wer reist mit dir?</label>
              <input type="text" placeholder="z.B. Freundin, Bruder, Freunde" value={partner} onChange={e => setPartner(e.target.value)} />
            </div>
          )}

          <div className={styles.field}>
            <label>Besondere Bedürfnisse oder Einschränkungen?</label>
            <p className={styles.hint}>Vegetarisch, gesundheitliche Einschränkungen, Medikamente — nur falls relevant.</p>
            <textarea placeholder="Falls nichts zutrifft, einfach freilassen." value={beduerfnisse} onChange={e => setBeduerfnisse(e.target.value)} />
          </div>
        </section>

        {/* SECTION 2 */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Zeitraum & Destination</div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label>Geplanter Abreisemonat</label>
              <div className={styles.monthPickerWrap}>
                <div className={styles.monthDisplay} onClick={() => setMpOpen(o => !o)}>
                  <span style={{ color: mpSelected ? 'inherit' : 'var(--gray)' }}>
                    {mpSelected ? `${MONTHS_FULL[mpSelected.month]} ${mpSelected.year}` : 'Monat wählen'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--gray)' }}>▾</span>
                </div>
                {mpOpen && (
                  <div className={styles.monthPopup}>
                    <div className={styles.mpHeader}>
                      <button type="button" className={styles.mpNav} onClick={() => setMpYear(y => y - 1)}>‹</button>
                      <span className={styles.mpYear}>{mpYear}</span>
                      <button type="button" className={styles.mpNav} onClick={() => setMpYear(y => y + 1)}>›</button>
                    </div>
                    <div className={styles.mpMonths}>
                      {MONTHS_SHORT.map((m, i) => {
                        const isPast = mpYear < now.getFullYear() || (mpYear === now.getFullYear() && i < now.getMonth())
                        const isSelected = mpSelected?.year === mpYear && mpSelected?.month === i
                        return (
                          <div key={i}
                            className={`${styles.mpMonth} ${isPast ? styles.mpPast : ''} ${isSelected ? styles.mpSelected : ''}`}
                            onClick={() => { if (!isPast) { setMpSelected({ year: mpYear, month: i }); setMpOpen(false) } }}
                          >{m}</div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.field}>
              <label>Wie lange?</label>
              <input type="text" placeholder="z.B. 6 Monate" value={dauer} onChange={e => setDauer(e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Hast du schon eine Destination im Kopf?</label>
            <div className={styles.pills}>
              {[['ja','Ja, konkrete Idee'],['region','Ja, grobe Region'],['offen','Komplett offen']].map(([v, label]) => (
                <label key={v} className={styles.pill}>
                  <input type="radio" name="dest_offen" value={v} checked={destOffen===v} onChange={() => setDestOffen(v)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {destOffen !== 'offen' && destOffen !== '' && (
            <div className={styles.field}>
              <label>Welche Länder oder Regionen?</label>
              <div className={styles.tagInputWrap} onClick={() => document.getElementById('tagInput')?.focus()}>
                {tags.map(t => (
                  <span key={t} className={styles.tag}>
                    {t}
                    <button type="button" className={styles.tagRemove} onClick={() => removeTag(t)}>×</button>
                  </span>
                ))}
                <input
                  id="tagInput"
                  className={styles.tagField}
                  placeholder={tags.length === 0 ? 'Land eingeben + Enter' : 'Weiteres Land...'}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) { e.preventDefault(); addTag(tagInput) }
                    if (e.key === 'Backspace' && !tagInput && tags.length) removeTag(tags[tags.length - 1])
                  }}
                />
              </div>
              <p className={styles.tagHint}>Mehrere Länder möglich — eingeben und Enter drücken.</p>
            </div>
          )}
        </section>

        {/* SECTION 3 */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Budget</div>
          <div className={styles.field}>
            <label>Reisestil</label>
            <div className={styles.budgetOptions}>
              {[
                ['backpacker','Backpacker','Günstig, flexibel, Hostel','🎒'],
                ['midrange','Mid-Range','Eigenes Zimmer, Komfort','🏨'],
                ['comfort','Comfort','Hotels, mehr Komfort','⭐'],
              ].map(([v, label, desc, icon]) => (
                <label key={v} className={styles.budgetCard}>
                  <input type="radio" name="stil" value={v} checked={stil===v} onChange={() => setStil(v)} />
                  <div className={`${styles.budgetCardInner} ${stil===v ? styles.budgetCardSelected : ''}`}>
                    <div className={styles.budgetIcon}>{icon}</div>
                    <div className={styles.budgetName}>{label}</div>
                    <div className={styles.budgetDesc}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <label>Gesamtbudget für die Reise (in €)</label>
            <p className={styles.hint}>Grobe Schätzung reicht — Flüge, Unterkunft, Essen, alles zusammen.</p>
            <div className={styles.rangeRow}>
              <input type="range" min={1000} max={30000} step={500} value={budget} onChange={e => setBudget(Number(e.target.value))} />
              <span className={styles.rangeVal}>{budget.toLocaleString('de-DE')} €</span>
            </div>
          </div>
        </section>

        {/* SECTION 4 */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Reisetyp & Stil</div>
          <div className={styles.field}>
            <label>Was soll deine Reise hauptsächlich sein?</label>
            <p className={styles.hint}>Mehreres möglich.</p>
            <div className={styles.pills}>
              {[['work-travel','Work & Travel'],['volunteer','Volunteering'],['sprachkurs','Sprachkurs / Studium'],['abenteuer','Abenteuer & Natur'],['kultur','Kultur & Städte'],['entspannung','Entschleunigung'],['skills','Skill aufbauen']].map(([v, label]) => (
                <label key={v} className={styles.pill}>
                  <input type="checkbox" checked={typen.includes(v)} onChange={() => toggleTyp(v)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <label>Wie strukturiert soll die Reise sein?</label>
            <p className={styles.hint}>Von komplett spontan bis durchgeplant.</p>
            <div className={styles.rangeRow}>
              <span className={styles.rangeLabel}>Spontan</span>
              <input type="range" min={1} max={5} step={1} value={struktur} onChange={e => setStruktur(Number(e.target.value))} style={{ flex: 1, margin: '0 10px' }} />
              <span className={styles.rangeLabel}>Durchgeplant</span>
            </div>
            <p className={styles.strukturLabel}>{STRUKTUR_LABELS[struktur]}</p>
          </div>
        </section>

        {/* SECTION 5 */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Interessen & Prioritäten</div>
          <div className={styles.field}>
            <label>Was darf auf deiner Reise auf keinen Fall fehlen?</label>
            <p className={styles.hint}>Aktivitäten, Erlebnisse, Orte — was auch immer dir wichtig ist.</p>
            <textarea placeholder="z.B. Tauchen, lokale Küche, ein paar Wochen Arbeiten, bestimmte Länder..." value={muss} onChange={e => setMuss(e.target.value.slice(0, 300))} />
            <p className={styles.charCount}>{muss.length} / 300</p>
          </div>
          <div className={styles.field}>
            <label>Gibt es etwas, das du auf keinen Fall möchtest?</label>
            <textarea placeholder="z.B. keine Großstädte, kein Hostel-Trubel, keine Gruppentouren..." value={nein} onChange={e => setNein(e.target.value.slice(0, 300))} />
            <p className={styles.charCount}>{nein.length} / 300</p>
          </div>
        </section>

        {/* SECTION 6 */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Sonstiges</div>
          <div className={styles.field}>
            <label>Noch etwas, das ich wissen sollte?</label>
            <p className={styles.hint}>Alles, was du für wichtig hältst und oben nicht gepasst hat.</p>
            <textarea placeholder="Freilassen, falls nichts." value={sonstiges} onChange={e => setSonstiges(e.target.value)} />
          </div>
        </section>

        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? 'Wird gesendet…' : 'Antworten absenden →'}
        </button>
      </form>
    </main>
  )
}
