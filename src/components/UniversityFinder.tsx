'use client'

import { useState, useCallback } from 'react'
import type { ParsedUniversity, AppMetadata } from '@/utils/dataParser'
import SearchFilters from './SearchFilters'
import DataTable from './DataTable'
import DataVisualization from './DataVisualization'

interface UniversityFinderProps {
  universities: ParsedUniversity[]
  metadata: AppMetadata
}

export default function UniversityFinder({ universities, metadata }: UniversityFinderProps) {
  const [filteredUniversities, setFilteredUniversities] = useState<ParsedUniversity[]>(universities)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'table' | 'analytics'>('table')

  // Handle filter changes from SearchFilters component
  const handleFilterChange = useCallback((filtered: ParsedUniversity[], term: string) => {
    setFilteredUniversities(filtered)
    setSearchTerm(term)
  }, [])

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <SearchFilters 
        universities={universities}
        onFilterChange={handleFilterChange}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('table')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'table'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Data Table ({filteredUniversities.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Analytics & Insights
          </button>
        </nav>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            {filteredUniversities.length === universities.length ? (
              <span className="font-medium">Showing all {universities.length} universities</span>
            ) : (
              <span>
                Showing <span className="font-bold text-blue-600">{filteredUniversities.length}</span> of {universities.length} universities
              </span>
            )}
          </div>
          
          {searchTerm && (
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Search: "{searchTerm}"
            </div>
          )}
        </div>
        
        {filteredUniversities.length === 0 && universities.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>No universities match your current filters</span>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'table' ? (
        /* Data Table */
        filteredUniversities.length > 0 ? (
          <DataTable 
            universities={filteredUniversities}
            searchTerm={searchTerm}
          />
        ) : universities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-gray-500 space-y-4">
              <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a6 6 0 00-10.712-3.714M14 40H4v-4a6 6 0 016-6 6 6 0 016 6v4zm10-12a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">No universities data</h3>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">
                  Unable to load university data. Please check the data source and try again.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-gray-500 space-y-4">
              <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">No results found</h3>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">
                  Try adjusting your search terms or filters to find more universities.
                </p>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Analytics Tab */
        <DataVisualization universities={filteredUniversities} />
      )}
    </div>
  )
}