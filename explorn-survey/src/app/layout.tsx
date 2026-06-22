import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Explorn – Dein persönlicher Reiseplan',
  description: 'Beantworte ein paar Fragen und erhalte deinen individuellen Reiseplan.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
