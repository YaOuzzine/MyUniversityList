'use client'

import { useState, useEffect, useMemo } from 'react'
import type { ParsedUniversity } from '@/utils/dataParser'
import { extractCountries, extractAcceptanceRates } from '@/utils/dataParser'
import CustomDropdown from './ui/CustomDropdown'
import CustomSlider from './ui/CustomSlider'
import FilterChips from './ui/FilterChips'

interface SearchFiltersProps {
  universities: ParsedUniversity[]
  onFilterChange: (filteredData: ParsedUniversity[], searchTerm: string) => void
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function SearchFilters({ universities, onFilterChange }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [rankingRange, setRankingRange] = useState([1, 100])
  const [acceptanceRateRange, setAcceptanceRateRange] = useState([0, 100])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Extract unique countries for filter dropdown
  const countries = useMemo(() => extractCountries(universities), [universities])

  // Get min and max ranking for slider
  const { minRank, maxRank } = useMemo(() => {
    const ranks = universities.map(uni => uni.rank).filter(rank => !isNaN(rank))
    return {
      minRank: Math.min(...ranks),
      maxRank: Math.max(...ranks)
    }
  }, [universities])

  // Get acceptance rate range
  const { minAcceptanceRate, maxAcceptanceRate } = useMemo(() => {
    const rates = extractAcceptanceRates(universities)
    return {
      minAcceptanceRate: rates.length > 0 ? Math.min(...rates) : 0,
      maxAcceptanceRate: rates.length > 0 ? Math.max(...rates) : 100
    }
  }, [universities])

  // Filter universities based on search criteria
  useEffect(() => {
    let filtered = universities

    // Text search across multiple fields
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(uni => 
        uni.universityName?.toLowerCase().includes(searchLower) ||
        uni.cityCountry?.toLowerCase().includes(searchLower) ||
        uni.programs?.some(program => program.toLowerCase().includes(searchLower)) ||
        uni.acceptanceCriteria?.toLowerCase().includes(searchLower) ||
        uni.ranking?.display?.toLowerCase().includes(searchLower) ||
        uni.scholarships?.some(scholarship => 
          scholarship.name.toLowerCase().includes(searchLower) ||
          scholarship.amount.toLowerCase().includes(searchLower)
        )
      )
    }

    // Country filter
    if (selectedCountry) {
      filtered = filtered.filter(uni => 
        uni.cityCountry?.includes(selectedCountry)
      )
    }

    // Ranking range filter
    filtered = filtered.filter(uni => {
      const rank = uni.rank
      return rank >= rankingRange[0] && rank <= rankingRange[1]
    })

    // Acceptance rate filter
    if (showAdvancedFilters) {
      filtered = filtered.filter(uni => {
        const rate = uni.acceptanceRate.value
        return rate >= acceptanceRateRange[0] && rate <= acceptanceRateRange[1]
      })
    }

    onFilterChange(filtered, debouncedSearchTerm)
  }, [debouncedSearchTerm, selectedCountry, rankingRange, acceptanceRateRange, showAdvancedFilters, universities, onFilterChange])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCountry('')
    setRankingRange([minRank, maxRank])
    setAcceptanceRateRange([minAcceptanceRate, maxAcceptanceRate])
    setShowAdvancedFilters(false)
  }

  // Generate filter chips
  const filterChips = useMemo(() => {
    const chips = []
    
    if (debouncedSearchTerm) {
      chips.push({
        id: 'search',
        label: 'Search',
        value: `"${debouncedSearchTerm}"`,
        color: 'blue' as const,
        removable: true
      })
    }
    
    if (selectedCountry) {
      chips.push({
        id: 'country',
        label: 'Country',
        value: selectedCountry,
        color: 'green' as const,
        removable: true
      })
    }
    
    if (rankingRange[0] !== minRank || rankingRange[1] !== maxRank) {
      chips.push({
        id: 'ranking',
        label: 'Ranking',
        value: `#${rankingRange[0]} - #${rankingRange[1]}`,
        color: 'purple' as const,
        removable: true
      })
    }
    
    if (showAdvancedFilters && (acceptanceRateRange[0] !== minAcceptanceRate || acceptanceRateRange[1] !== maxAcceptanceRate)) {
      chips.push({
        id: 'acceptance',
        label: 'Acceptance Rate',
        value: `${acceptanceRateRange[0]}% - ${acceptanceRateRange[1]}%`,
        color: 'orange' as const,
        removable: true
      })
    }
    
    return chips
  }, [debouncedSearchTerm, selectedCountry, rankingRange, acceptanceRateRange, showAdvancedFilters, minRank, maxRank, minAcceptanceRate, maxAcceptanceRate])

  // Handle chip removal
  const handleChipRemove = (chipId: string) => {
    switch (chipId) {
      case 'search':
        setSearchTerm('')
        break
      case 'country':
        setSelectedCountry('')
        break
      case 'ranking':
        setRankingRange([minRank, maxRank])
        break
      case 'acceptance':
        setAcceptanceRateRange([minAcceptanceRate, maxAcceptanceRate])
        break
    }
  }

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🔍 Search & Filter Universities</h2>
          <p className="text-sm text-gray-600 mt-1">Find your perfect university match</p>
        </div>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-150 flex items-center space-x-2"
        >
          <span>{showAdvancedFilters ? 'Basic' : 'Advanced'} Filters</span>
          <svg className={`w-4 h-4 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              🎯 Search Universities
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, location, programs, funding, or criteria..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                aria-describedby="search-help"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p id="search-help" className="mt-1 text-xs text-gray-500">
              Search across all university data including programs, funding, and contact info
            </p>
          </div>

          {/* Country Filter */}
          <div>
            <CustomDropdown
              label="🌍 Country"
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder={`All Countries (${countries.length})`}
              searchable
              options={[
                { value: '', label: `All Countries (${countries.length})`, count: universities.length },
                ...countries.map(country => ({
                  value: country,
                  label: country,
                  count: universities.filter(uni => uni.cityCountry.includes(country)).length,
                  icon: '🏛️'
                }))
              ]}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

        </div>
        
        {/* Ranking Range */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <CustomSlider
              label="🏆 University Ranking Range"
              min={minRank}
              max={maxRank}
              value={rankingRange as [number, number]}
              onChange={(value) => {
                const newValue = Array.isArray(value) ? value : [value, value]
                setRankingRange([newValue[0], newValue[1]])
              }}
              range
              showValue
              showTicks
              tickCount={4}
              color="blue"
              size="md"
              formatValue={(val) => `#${val}`}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col justify-end space-y-2">
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 flex items-center justify-center space-x-2"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Advanced Filters</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Acceptance Rate Filter */}
              <div>
                <CustomSlider
                  label="📊 Acceptance Rate Range"
                  min={minAcceptanceRate}
                  max={maxAcceptanceRate}
                  value={acceptanceRateRange as [number, number]}
                  onChange={(value) => {
                    const newValue = Array.isArray(value) ? value : [value, value]
                    setAcceptanceRateRange([newValue[0], newValue[1]])
                  }}
                  range
                  showValue
                  showTicks
                  tickCount={5}
                  color="green"
                  size="md"
                  formatValue={(val) => `${val}%`}
                />
              </div>
              
              {/* Additional Filter Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">🔧 Quick Filters</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAcceptanceRateRange([0, 10])}
                    className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Highly Selective (&le;10%)
                  </button>
                  <button
                    onClick={() => setAcceptanceRateRange([10, 30])}
                    className="px-3 py-2 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    Selective (10-30%)
                  </button>
                  <button
                    onClick={() => setAcceptanceRateRange([30, 60])}
                    className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Moderate (30-60%)
                  </button>
                  <button
                    onClick={() => setAcceptanceRateRange([60, 100])}
                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Open (&gt;60%)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Active Filter Chips */}
        {filterChips.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-6">
            <FilterChips
              chips={filterChips}
              onRemove={handleChipRemove}
              onClearAll={clearFilters}
              className="mb-4"
            />
          </div>
        )}
        
        {/* Results Summary */}
        <div className={`${filterChips.length > 0 ? '' : 'border-t border-gray-200 pt-4 mt-6'}`}>
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              Showing <span className="font-semibold text-blue-600">{universities.length}</span> universities
              {filterChips.length > 0 && (
                <span className="text-gray-500 ml-2">• {filterChips.length} filter{filterChips.length !== 1 ? 's' : ''} active</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {universities.length === 0 ? (
                <span className="text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  No matches
                </span>
              ) : (
                <span className="text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Results found
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}