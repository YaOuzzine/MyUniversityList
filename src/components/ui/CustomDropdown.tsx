'use client'

import { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
  count?: number
  icon?: string
}

interface CustomDropdownProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  icon?: React.ReactNode
  searchable?: boolean
  disabled?: boolean
  className?: string
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  icon,
  searchable = false,
  disabled = false,
  className = ''
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  // Get selected option
  const selectedOption = options.find(option => option.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
        setFocusedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value)
        }
        break
      case 'Tab':
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
        break
    }
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
    setFocusedIndex(-1)
  }

  const toggleDropdown = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    if (!isOpen) {
      setFocusedIndex(0)
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full pl-4 pr-12 py-3 text-left bg-white rounded-xl border-2 shadow-sm transition-all duration-200 ease-in-out
          ${disabled 
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
            : isOpen
              ? 'border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100'
              : 'border-gray-200 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${label}-label` : undefined}
      >
        <div className="flex items-center space-x-3">
          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 text-gray-400">
              {icon}
            </div>
          )}
          
          {/* Selected Value or Placeholder */}
          <span className={`block truncate ${
            selectedOption ? 'text-gray-900 font-medium' : 'text-gray-500'
          }`}>
            {selectedOption?.label || placeholder}
          </span>
          
          {/* Count Badge */}
          {selectedOption?.count !== undefined && (
            <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {selectedOption.count}
            </span>
          )}
        </div>

        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-2xl max-h-80 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <svg className="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No options found</p>
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150
                    ${index === focusedIndex ? 'bg-blue-50' : ''}
                    ${option.value === value ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'}
                  `}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {option.icon && (
                        <span className="text-lg">{option.icon}</span>
                      )}
                      <span className="block truncate">{option.label}</span>
                    </div>
                    
                    {/* Count Badge */}
                    {option.count !== undefined && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full ml-2">
                        {option.count}
                      </span>
                    )}
                    
                    {/* Selected Indicator */}
                    {option.value === value && (
                      <svg className="w-5 h-5 text-blue-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}