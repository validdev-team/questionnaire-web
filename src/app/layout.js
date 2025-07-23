import './globals.css'

export const metadata = {
  title: 'Survey App',
  description: 'Simple questionnaire application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-white">
        {children}
      </body>
    </html>
  )
}