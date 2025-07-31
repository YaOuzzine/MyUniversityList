'use client'

interface FilterChip {
  id: string
  label: string
  value: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  removable?: boolean
}

interface FilterChipsProps {
  chips: FilterChip[]
  onRemove?: (id: string) => void
  onClearAll?: () => void
  className?: string
}

export default function FilterChips({ 
  chips, 
  onRemove, 
  onClearAll, 
  className = '' 
}: FilterChipsProps) {
  if (!chips.length) return null

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-600">Active filters:</span>
      
      {chips.map((chip) => (
        <div
          key={chip.id}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
            colorClasses[chip.color || 'blue']
          }`}
        >
          <span className="mr-1">{chip.label}:</span>
          <span className="font-semibold">{chip.value}</span>
          
          {chip.removable && onRemove && (
            <button
              onClick={() => onRemove(chip.id)}
              className="ml-2 hover:bg-black/10 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${chip.label} filter`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      
      {chips.length > 1 && onClearAll && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-200 transition-colors duration-200"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear all
        </button>
      )}
    </div>
  )
}