// app/layout.js
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', // 👈 this makes --font-inter available in CSS
})

export const metadata = {
  title: 'Survey App',
  description: 'Simple questionnaire application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex items-center justify-center bg-white text-[#0F0251]">
        {children}
      </body>
    </html>
  )
}
