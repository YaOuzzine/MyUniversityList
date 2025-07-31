import { promises as fs } from 'fs'
import path from 'path'
import UniversityFinder from '@/components/UniversityFinder'
import { parseUniversityData, type ParsedUniversity, type AppMetadata } from '@/utils/dataParser'

// Server-side data fetching using App Router
async function getUniversitiesData(): Promise<{ universities: ParsedUniversity[], metadata: AppMetadata }> {
  try {
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'university_programs.json')
    const fileContents = await fs.readFile(jsonPath, 'utf8')
    const rawData = JSON.parse(fileContents)
    
    // Parse and clean the data using our data parser
    const { universities, metadata } = parseUniversityData(rawData)
    
    console.log(`Loaded and parsed ${universities.length} universities`)
    return { universities, metadata }
  } catch (error) {
    console.error('Error loading universities data:', error)
    return { universities: [], metadata: { generatedOn: '', rankingNote: '' } }
  }
}

export default async function HomePage() {
  const { universities, metadata } = await getUniversitiesData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                🎓 My University List
              </h1>
              <p className="mt-3 text-lg text-gray-700 max-w-2xl">
                Discover and explore top universities worldwide with comprehensive search, 
                filtering, and data visualization
              </p>
              <div className="mt-4 flex items-center space-x-4 text-sm">
                <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                  📊 {universities.length} Universities
                </span>
                <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-1.5 rounded-full font-medium">
                  🌍 Global Coverage
                </span>
                <span className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 px-3 py-1.5 rounded-full font-medium">
                  💰 Funding Info
                </span>
                {metadata.generatedOn && (
                  <span className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 px-3 py-1.5 rounded-full font-medium">
                    📅 Updated {metadata.generatedOn}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold">{universities.length}</div>
                  <div className="text-blue-100 text-sm">Universities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Ranking Note Section */}
      {metadata.rankingNote && (
        <section className="bg-blue-50/50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ranking Methodology
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {metadata.rankingNote}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <UniversityFinder universities={universities} metadata={metadata} />
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📊 Comprehensive Data</h3>
              <p className="text-sm text-gray-600">
                Complete information including rankings, deadlines, acceptance rates, and funding options
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔍 Advanced Search</h3>
              <p className="text-sm text-gray-600">
                Powerful filtering with real-time search, country selection, and acceptance rate ranges
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📈 Data Visualization</h3>
              <p className="text-sm text-gray-600">
                Interactive charts and analytics to help you understand university trends and patterns
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>
              Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
            </p>
            <p className="mt-2">
              Enhanced with Vercel Analytics and Speed Insights • Data parsed and formatted for optimal user experience
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}