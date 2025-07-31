'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import type { ParsedUniversity } from '@/utils/dataParser'
import FormattedCell from './FormattedCell'

interface DataTableProps {
  universities: ParsedUniversity[]
  searchTerm: string
}

type SortDirection = 'asc' | 'desc' | null
type SortableColumn = keyof ParsedUniversity

interface SortConfig {
  column: SortableColumn
  direction: SortDirection
}

const ITEMS_PER_PAGE = 25

// Column configuration for better display names and widths - optimized for full browser width
const COLUMN_CONFIG: Record<keyof ParsedUniversity, { displayName: string; width: string; minWidth: string; priority: number }> = {
  'rank': { displayName: 'Rank', width: 'w-16', minWidth: 'min-w-16', priority: 1 },
  'universityName': { displayName: 'University', width: 'w-72', minWidth: 'min-w-72', priority: 1 },
  'cityCountry': { displayName: 'Location', width: 'w-56', minWidth: 'min-w-56', priority: 2 },
  'ranking': { displayName: 'Global Ranking', width: 'w-48', minWidth: 'min-w-48', priority: 3 },
  'programs': { displayName: 'Programs', width: 'w-80', minWidth: 'min-w-80', priority: 2 },
  'programStart': { displayName: 'Start Date', width: 'w-32', minWidth: 'min-w-32', priority: 4 },
  'appDeadline': { displayName: 'Application Deadline', width: 'w-56', minWidth: 'min-w-56', priority: 2 },
  'acceptanceRate': { displayName: 'Acceptance Rate', width: 'w-44', minWidth: 'min-w-44', priority: 3 },
  'acceptanceCriteria': { displayName: 'Acceptance Criteria', width: 'w-80', minWidth: 'min-w-80', priority: 4 },
  'scholarships': { displayName: 'Scholarships & Funding', width: 'w-80', minWidth: 'min-w-80', priority: 3 },
  'contact': { displayName: 'Contact', width: 'w-48', minWidth: 'min-w-48', priority: 4 },
  'url': { displayName: 'Website', width: 'w-48', minWidth: 'min-w-48', priority: 4 },
  'imageUrl': { displayName: 'Image', width: 'w-24', minWidth: 'min-w-24', priority: 5 },
  'citations': { displayName: 'Citations', width: 'w-64', minWidth: 'min-w-64', priority: 5 }
}

export default function DataTable({ universities, searchTerm }: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'rank', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null)
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof ParsedUniversity>>(
    new Set(Object.keys(COLUMN_CONFIG) as (keyof ParsedUniversity)[])
  )
  const [isCompactView, setIsCompactView] = useState(false)
  const tableRef = useRef<HTMLTableElement>(null)

  // Reset to first page when universities data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [universities])

  // Sort universities based on current sort configuration
  const sortedUniversities = useMemo(() => {
    if (!sortConfig.direction) return universities

    return [...universities].sort((a, b) => {
      const aValue = a[sortConfig.column]
      const bValue = b[sortConfig.column]

      // Handle numeric sorting for rank
      if (sortConfig.column === 'rank') {
        const aNum = typeof aValue === 'number' ? aValue : parseInt(String(aValue)) || 0
        const bNum = typeof bValue === 'number' ? bValue : parseInt(String(bValue)) || 0
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
      }

      // Handle acceptance rate sorting
      if (sortConfig.column === 'acceptanceRate') {
        const aAcceptanceRate = aValue as ParsedUniversity['acceptanceRate']
        const bAcceptanceRate = bValue as ParsedUniversity['acceptanceRate']
        const aRate = aAcceptanceRate?.value || 999
        const bRate = bAcceptanceRate?.value || 999
        return sortConfig.direction === 'asc' ? aRate - bRate : bRate - aRate
      }

      // Handle ranking sorting
      if (sortConfig.column === 'ranking') {
        const aRanking = aValue as ParsedUniversity['ranking']
        const bRanking = bValue as ParsedUniversity['ranking']
        const aRank = aRanking?.value || 999
        const bRank = bRanking?.value || 999
        return sortConfig.direction === 'asc' ? aRank - bRank : bRank - aRank
      }

      // Handle object-based columns
      let aStr = '', bStr = ''
      if (typeof aValue === 'object' && aValue !== null) {
        if ('text' in aValue) aStr = String(aValue.text || '').toLowerCase()
        else if ('date' in aValue) aStr = String(aValue.date || '').toLowerCase()
        else if ('contact' in aValue) aStr = String(aValue.contact || '').toLowerCase()
        else aStr = String(aValue).toLowerCase()
      } else {
        aStr = String(aValue || '').toLowerCase()
      }

      if (typeof bValue === 'object' && bValue !== null) {
        if ('text' in bValue) bStr = String(bValue.text || '').toLowerCase()
        else if ('date' in bValue) bStr = String(bValue.date || '').toLowerCase()
        else if ('contact' in bValue) bStr = String(bValue.contact || '').toLowerCase()
        else bStr = String(bValue).toLowerCase()
      } else {
        bStr = String(bValue || '').toLowerCase()
      }
      
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [universities, sortConfig])

  // Pagination
  const totalPages = Math.ceil(sortedUniversities.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedUniversities = sortedUniversities.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Handle sorting
  const handleSort = useCallback((column: SortableColumn) => {
    setSortConfig(prevConfig => ({
      column,
      direction: prevConfig.column === column && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  // Get visible columns based on priority and screen size
  const displayColumns = useMemo(() => {
    const allColumns = Object.entries(COLUMN_CONFIG) as [keyof ParsedUniversity, typeof COLUMN_CONFIG[keyof ParsedUniversity]][]
    
    if (isCompactView) {
      // Show only high priority columns in compact view
      return allColumns
        .filter(([key, config]) => config.priority <= 2)
        .filter(([key]) => visibleColumns.has(key))
    }
    
    return allColumns.filter(([key]) => visibleColumns.has(key))
  }, [visibleColumns, isCompactView])

  // Toggle column visibility
  const toggleColumn = useCallback((column: keyof ParsedUniversity) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(column)) {
        newSet.delete(column)
      } else {
        newSet.add(column)
      }
      return newSet
    })
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!focusedCell) return

    const { row, col } = focusedCell
    const maxRow = paginatedUniversities.length - 1
    const maxCol = Object.keys(COLUMN_CONFIG).length - 1

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        if (row > 0) setFocusedCell({ row: row - 1, col })
        break
      case 'ArrowDown':
        e.preventDefault()
        if (row < maxRow) setFocusedCell({ row: row + 1, col })
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (col > 0) setFocusedCell({ row, col: col - 1 })
        break
      case 'ArrowRight':
        e.preventDefault()
        if (col < maxCol) setFocusedCell({ row, col: col + 1 })
        break
      case 'Home':
        e.preventDefault()
        setFocusedCell({ row: 0, col: 0 })
        break
      case 'End':
        e.preventDefault()
        setFocusedCell({ row: maxRow, col: maxCol })
        break
    }
  }, [focusedCell, paginatedUniversities.length])

  const getSortIcon = (column: SortableColumn) => {
    if (sortConfig.column !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Table Controls */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📊 University Data</h3>
            <p className="text-sm text-gray-600 mt-1">
              {sortedUniversities.length} universities • Page {currentPage} of {totalPages}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Compact View Toggle */}
            <button
              onClick={() => setIsCompactView(!isCompactView)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors duration-150 flex items-center space-x-2 ${
                isCompactView 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isCompactView ? 'Show all columns' : 'Show essential columns only'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>{isCompactView ? 'Full' : 'Compact'}</span>
            </button>
            
            {/* Column Visibility Dropdown */}
            <div className="relative">
              <button
                className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-150 flex items-center space-x-2"
                onClick={() => {
                  // Simple toggle for now - could be enhanced with a proper dropdown
                  const hiddenColumns = Object.keys(COLUMN_CONFIG).filter(key => !visibleColumns.has(key as keyof ParsedUniversity))
                  if (hiddenColumns.length > 0) {
                    setVisibleColumns(new Set(Object.keys(COLUMN_CONFIG) as (keyof ParsedUniversity)[]))
                  } else {
                    setVisibleColumns(new Set(['rank', 'universityName', 'cityCountry', 'appDeadline', 'acceptanceRate'] as (keyof ParsedUniversity)[]))
                  }
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Columns ({visibleColumns.size})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="w-full overflow-x-auto max-h-[700px]">
        <table 
          ref={tableRef}
          className="w-full min-w-full table-auto divide-y divide-gray-200"
          role="table"
          aria-label="Universities data table"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          style={{ width: '100%', minWidth: 'max-content' }}
        >
          <thead className="sticky-header bg-gradient-to-r from-gray-50 to-gray-100">
            <tr role="row">
              {displayColumns.map(([key, config], colIndex) => (
                <th
                  key={key}
                  className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150 ${config.width} ${config.minWidth}`}
                  onClick={() => handleSort(key as SortableColumn)}
                  role="columnheader"
                  aria-sort={
                    sortConfig.column === key 
                      ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                  tabIndex={-1}
                >
                  <div className="flex items-center space-x-2">
                    <span>{config.displayName}</span>
                    {getSortIcon(key as SortableColumn)}
                    {config.priority > 2 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">
                        {config.priority}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedUniversities.map((university, rowIndex) => (
              <tr 
                key={`${university.universityName}-${university.rank}`}
                className={`group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
                role="row"
              >
                {displayColumns.map(([key, config], colIndex) => {
                  const value = university[key as keyof ParsedUniversity]
                  const isFocused = focusedCell?.row === rowIndex && focusedCell?.col === colIndex
                  
                  return (
                    <td
                      key={key}
                      className={`px-6 py-4 ${config.width} ${config.minWidth} ${
                        isFocused ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : ''
                      } transition-all duration-150`}
                      role="gridcell"
                      tabIndex={isFocused ? 0 : -1}
                      onClick={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                    >
                      <FormattedCell
                        column={key}
                        value={value}
                        searchTerm={searchTerm}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
            
            {/* Empty state */}
            {paginatedUniversities.length === 0 && (
              <tr>
                <td colSpan={displayColumns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-500 space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a6 6 0 00-10.712-3.714M14 40H4v-4a6 6 0 016-6 6 6 0 016 6v4zm10-12a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">No universities found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, sortedUniversities.length)}</span> of{' '}
                <span className="font-medium">{sortedUniversities.length}</span> results
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (currentPage <= 4) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = currentPage - 3 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      aria-current={currentPage === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}