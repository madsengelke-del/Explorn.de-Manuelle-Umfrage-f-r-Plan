import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join('/tmp', 'submissions.json')

function loadSubmissions() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }
  } catch {}
  return []
}

function saveSubmissions(data: object[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Save to file
  const submissions = loadSubmissions()
  submissions.push({ ...body, id: Date.now() })
  saveSubmissions(submissions)

  // Send Gmail notification
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const fields = [
      ['Name', body.name],
      ['Alter', body.alter],
      ['Reisegruppe', body.gruppe],
      ['Mitreisende', body.partner],
      ['Besondere Bedürfnisse', body.beduerfnisse],
      ['Abreise', body.abreise],
      ['Dauer', body.dauer],
      ['Destination (Offenheit)', body.destination_offenheit],
      ['Länder / Regionen', body.laender],
      ['Reisestil', body.reisestil],
      ['Budget', body.budget],
      ['Reisetypen', body.typen],
      ['Strukturgrad', body.struktur],
      ['Muss dabei sein', body.muss],
      ['Soll nicht dabei sein', body.nein],
      ['Sonstiges', body.sonstiges],
    ]

    const htmlRows = fields
      .filter(([, v]) => v)
      .map(([k, v]) => `
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#1a2e44;white-space:nowrap;vertical-align:top;border-bottom:1px solid #f0ede8;font-size:13px;">${k}</td>
          <td style="padding:8px 12px;color:#4a5568;border-bottom:1px solid #f0ede8;font-size:13px;">${v}</td>
        </tr>
      `).join('')

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `🌍 Neuer Explorn-Fragebogen: ${body.name || 'Unbekannt'}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1a2e44;padding:20px 24px;border-radius:12px 12px 0 0;">
            <span style="color:#5DCAA5;font-size:20px;font-weight:700;">e</span>
            <span style="color:#ffffff;font-size:16px;font-weight:600;margin-left:8px;">explorn</span>
          </div>
          <div style="background:#ffffff;border:1px solid #e8e3db;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
            <h2 style="color:#1a2e44;font-size:18px;margin:0 0 4px;">Neuer Fragebogen eingegangen</h2>
            <p style="color:#6b7a8d;font-size:13px;margin:0 0 20px;">${new Date(body.timestamp).toLocaleString('de-DE')}</p>
            <table style="width:100%;border-collapse:collapse;">
              ${htmlRows}
            </table>
            <div style="margin-top:20px;padding:12px;background:#E1F5EE;border-radius:8px;font-size:13px;color:#0F6E56;">
              <strong>Admin-Dashboard:</strong> <a href="${process.env.NEXT_PUBLIC_URL}/admin" style="color:#1D9E75;">${process.env.NEXT_PUBLIC_URL}/admin</a>
            </div>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Email error:', err)
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const submissions = loadSubmissions()
  return NextResponse.json(submissions)
}
