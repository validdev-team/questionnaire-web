import './globals.css'

export const metadata = {
  title: 'Survey App',
  description: 'Simple questionnaire application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Survey App</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/" className="text-gray-600 hover:text-gray-900">Survey</a>
                <a href="/results" className="text-gray-600 hover:text-gray-900">Results</a>
                <a href="/admin" className="text-gray-600 hover:text-gray-900">Admin</a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}