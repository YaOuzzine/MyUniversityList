'use client'

import { useState } from 'react'
import type { ParsedUniversity } from '@/utils/dataParser'

// Component for rendering clickable links
function LinkRenderer({ links, className = '' }: { links: string[]; className?: string }) {
  if (!links || links.length === 0) return null
  
  return (
    <div className={`flex flex-wrap gap-2 mt-1 ${className}`}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-150"
          title={link}
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Link {index + 1}
        </a>
      ))}
    </div>
  )
}

// Component for rendering contact information
function ContactRenderer({ contact }: { contact: ParsedUniversity['contact'] }) {
  if (!contact.email) {
    return <span className="text-gray-400 italic">No contact info</span>
  }
  
  return (
    <div className="space-y-1">
      {contact.isEmail ? (
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex items-center text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors duration-150"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {contact.email}
        </a>
      ) : (
        <span className="text-sm text-gray-700">{contact.email}</span>
      )}
    </div>
  )
}

// Component for rendering acceptance rate
function AcceptanceRateRenderer({ acceptanceRate }: { 
  acceptanceRate: ParsedUniversity['acceptanceRate'] 
}) {
  const getColorClass = (rate: number) => {
    if (rate < 5) return 'bg-red-100 text-red-700 border-red-200'
    if (rate < 15) return 'bg-orange-100 text-orange-700 border-orange-200'
    if (rate < 30) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }
  
  return (
    <div className="space-y-1">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(acceptanceRate.value)}`}>
        {acceptanceRate.display}
      </span>
      {acceptanceRate.estimated && (
        <div className="text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded text-xs">Estimated</span>
        </div>
      )}
    </div>
  )
}

// Component for rendering deadline information
function DeadlineRenderer({ deadline }: { 
  deadline: ParsedUniversity['appDeadline'] 
}) {
  const isExpired = (dateStr: string) => {
    try {
      const deadlineDate = new Date(dateStr)
      return deadlineDate < new Date()
    } catch {
      return false
    }
  }
  
  const getDeadlineStatus = (dateStr: string) => {
    try {
      const deadlineDate = new Date(dateStr)
      const now = new Date()
      const diffTime = deadlineDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return { status: 'expired', text: 'Expired', color: 'bg-red-100 text-red-700 border-red-200' }
      if (diffDays < 30) return { status: 'urgent', text: `${diffDays} days left`, color: 'bg-orange-100 text-orange-700 border-orange-200' }
      if (diffDays < 90) return { status: 'soon', text: `${diffDays} days left`, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
      return { status: 'future', text: `${diffDays} days left`, color: 'bg-green-100 text-green-700 border-green-200' }
    } catch {
      return null
    }
  }
  
  const status = deadline.date ? getDeadlineStatus(deadline.date) : null
  
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-900">{deadline.formatted}</div>
      {status && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
          {status.text}
        </span>
      )}
    </div>
  )
}

// Component for rendering programs list
function ProgramsRenderer({ programs }: { programs: string[] }) {
  const [showAll, setShowAll] = useState(false)
  
  if (!programs || programs.length === 0) {
    return <span className="text-gray-400 italic">No programs listed</span>
  }
  
  const displayPrograms = showAll ? programs : programs.slice(0, 2)
  
  return (
    <div className="space-y-1">
      {displayPrograms.map((program, index) => (
        <div key={index} className="text-sm text-gray-700 bg-blue-50 px-2 py-1 rounded">
          {program}
        </div>
      ))}
      {programs.length > 2 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showAll ? 'Show less' : `Show ${programs.length - 2} more`}
        </button>
      )}
    </div>
  )
}

// Component for rendering scholarships
function ScholarshipsRenderer({ scholarships }: { scholarships: ParsedUniversity['scholarships'] }) {
  const [showAll, setShowAll] = useState(false)
  
  if (!scholarships || scholarships.length === 0) {
    return <span className="text-gray-400 italic">No scholarships listed</span>
  }
  
  const displayScholarships = showAll ? scholarships : scholarships.slice(0, 2)
  
  return (
    <div className="space-y-2">
      {displayScholarships.map((scholarship, index) => (
        <div key={index} className="bg-green-50 p-2 rounded border border-green-200">
          <div className="font-medium text-green-900 text-sm">{scholarship.name}</div>
          <div className="text-green-700 text-xs">{scholarship.amount}</div>
          {scholarship.url && (
            <a
              href={scholarship.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs underline mt-1 inline-block"
            >
              Learn more →
            </a>
          )}
        </div>
      ))}
      {scholarships.length > 2 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showAll ? 'Show less' : `Show ${scholarships.length - 2} more`}
        </button>
      )}
    </div>
  )
}

// Main component for rendering formatted cells
interface FormattedCellProps {
  column: keyof ParsedUniversity
  value: any
  searchTerm?: string
}

export default function FormattedCell({ column, value, searchTerm = '' }: FormattedCellProps) {
  const highlightText = (text: string) => {
    if (!searchTerm || !text) return text
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-medium px-1 rounded">
          {part}
        </span>
      ) : part
    )
  }
  
  // Handle different column types
  switch (column) {
    case 'rank':
      return (
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
            {value}
          </span>
        </div>
      )
    
    case 'universityName':
      return (
        <div className="font-medium text-gray-900">
          {highlightText(value)}
        </div>
      )
    
    case 'cityCountry':
      const [city, ...countryParts] = (value || '').split(',')
      const country = countryParts.join(',').trim()
      return (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{highlightText(city || '')}</div>
          {country && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
              {highlightText(country)}
            </div>
          )}
        </div>
      )
    
    case 'ranking':
      return (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{value.display}</div>
          <div className="text-xs text-gray-500 bg-purple-100 px-2 py-1 rounded-full inline-block">
            {value.system} Ranking
          </div>
        </div>
      )
    
    case 'programs':
      return <ProgramsRenderer programs={value} />
    
    case 'programStart':
      return (
        <div className="text-sm text-gray-700">
          {new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
        </div>
      )
    
    case 'appDeadline':
      return <DeadlineRenderer deadline={value} />
    
    case 'acceptanceRate':
      return <AcceptanceRateRenderer acceptanceRate={value} />
    
    case 'contact':
      return <ContactRenderer contact={value} />
    
    case 'scholarships':
      return <ScholarshipsRenderer scholarships={value} />
    
    case 'url':
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Visit Website
        </a>
      )
    
    case 'citations':
      return <LinkRenderer links={value} />
    
    default:
      return (
        <div className="text-sm text-gray-700">
          {typeof value === 'string' ? highlightText(value) : String(value || '')}
        </div>
      )
  }
}