import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!

async function supabaseInsert(data: object) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  })
  return res.json()
}

async function supabaseSelect() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/submissions?select=*&order=created_at.desc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Save to Supabase
  try {
    await supabaseInsert({
      name: body.name,
      alter: body.alter,
      gruppe: body.gruppe,
      partner: body.partner,
      beduerfnisse: body.beduerfnisse,
      abreise: body.abreise,
      dauer: body.dauer,
      destination_offenheit: body.destination_offenheit,
      laender: body.laender,
      reisestil: body.reisestil,
      budget: body.budget,
      typen: body.typen,
      struktur: body.struktur,
      muss: body.muss,
      nein: body.nein,
      sonstiges: body.sonstiges,
      timestamp: body.timestamp,
    })
  } catch (err) {
    console.error('Supabase error:', err)
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  try {
    const submissions = await supabaseSelect()
    return NextResponse.json(submissions)
  } catch (err) {
    console.error('Supabase error:', err)
    return NextResponse.json([])
  }
}
