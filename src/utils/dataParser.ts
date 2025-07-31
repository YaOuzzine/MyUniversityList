// Raw data interface from JSON
interface RawUniversityData {
  generatedOn: string
  rankingNote: string
  universities: RawUniversity[]
}

interface RawUniversity {
  rank: number
  universityName: string
  cityCountry: string
  ranking: {
    system: string
    value: number
  }
  programs: string[]
  programStart: string
  appDeadline: string
  acceptanceRate: {
    value: number
    estimated: boolean
  }
  acceptanceCriteria: string
  scholarships: Array<{
    name: string
    amount: string
    url?: string
  }>
  contact: string
  url: string
  imageUrl?: string
  citations?: string[]
}

// Parsed university interface for the app
export interface ParsedUniversity {
  rank: number
  universityName: string
  cityCountry: string
  ranking: {
    system: string
    value: number
    display: string
  }
  programs: string[]
  programStart: string
  appDeadline: {
    date: string
    formatted: string
  }
  acceptanceRate: {
    value: number
    estimated: boolean
    display: string
  }
  acceptanceCriteria: string
  scholarships: Array<{
    name: string
    amount: string
    url?: string
  }>
  contact: {
    email: string
    isEmail: boolean
  }
  url: string
  imageUrl?: string
  citations: string[]
}

// App metadata
export interface AppMetadata {
  generatedOn: string
  rankingNote: string
}

// URL regex pattern to extract links
const URL_REGEX = /https?:\/\/[^\s]+/g

// Email regex pattern
const EMAIL_REGEX = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g

// Phone regex pattern (various formats)
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g

/**
 * Extract URLs from text and return cleaned text with separate links array
 */
function extractLinks(text: string): { text: string; links: string[] } {
  if (!text) return { text: '', links: [] }
  
  const links = Array.from(text.match(URL_REGEX) || [])
  const cleanText = text.replace(URL_REGEX, '').trim()
  
  return { text: cleanText, links: links.map(link => decodeURIComponent(link)) }
}

/**
 * Extract contact information (emails and phones) from text
 */
function extractContacts(text: string): { contact: string; emails: string[]; phones: string[] } {
  if (!text) return { contact: '', emails: [], phones: [] }
  
  const emails = Array.from(text.match(EMAIL_REGEX) || [])
  const phones = Array.from(text.match(PHONE_REGEX) || [])
  
  let cleanText = text.replace(EMAIL_REGEX, '').replace(PHONE_REGEX, '').trim()
  
  return { contact: cleanText, emails, phones }
}

/**
 * Parse acceptance rate and extract percentage
 */
function parseAcceptanceRate(text: string): { rate: string; notes: string; links: string[] } {
  if (!text) return { rate: 'N/A', notes: '', links: [] }
  
  const { text: cleanText, links } = extractLinks(text)
  
  // Extract percentage
  const percentMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*%/)
  const rate = percentMatch ? `${percentMatch[1]}%` : 'N/A'
  
  // Remove percentage from notes
  const notes = cleanText.replace(/\d+(?:\.\d+)?\s*%\s*(?:\(approx\.\))?/g, '').trim()
  
  return { rate, notes, links }
}

/**
 * Parse application deadline and extract date information
 */
function parseDeadline(text: string): { date: string; notes: string; links: string[] } {
  if (!text) return { date: '', notes: '', links: [] }
  
  const { text: cleanText, links } = extractLinks(text)
  
  // Try to extract date in various formats
  const datePatterns = [
    /(\d{4}-\d{2}-\d{2})/,  // YYYY-MM-DD
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i,  // Mon YYYY
    /(\w+\s+\d{1,2},?\s+\d{4})/  // Month DD, YYYY
  ]
  
  let date = ''
  let notes = cleanText
  
  for (const pattern of datePatterns) {
    const match = cleanText.match(pattern)
    if (match) {
      date = match[1]
      notes = cleanText.replace(pattern, '').trim()
      break
    }
  }
  
  return { date, notes, links }
}

/**
 * Clean and decode malformed text
 */
function cleanText(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/%3A/g, ':')
    .replace(/%20/g, ' ')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/‑/g, '-')
    .trim()
}

/**
 * Format date string for display
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } catch {
    return dateStr
  }
}

/**
 * Check if a string is an email address
 */
function isEmail(str: string): boolean {
  return EMAIL_REGEX.test(str)
}

/**
 * Main function to parse university data from new JSON structure
 */
export function parseUniversityData(rawData: RawUniversityData): { universities: ParsedUniversity[], metadata: AppMetadata } {
  const metadata: AppMetadata = {
    generatedOn: rawData.generatedOn,
    rankingNote: rawData.rankingNote
  }

  const universities: ParsedUniversity[] = rawData.universities.map(university => {
    return {
      rank: university.rank,
      universityName: university.universityName,
      cityCountry: university.cityCountry,
      ranking: {
        system: university.ranking.system,
        value: university.ranking.value,
        display: `${university.ranking.system} #${university.ranking.value}`
      },
      programs: university.programs,
      programStart: university.programStart,
      appDeadline: {
        date: university.appDeadline,
        formatted: formatDate(university.appDeadline)
      },
      acceptanceRate: {
        value: university.acceptanceRate.value,
        estimated: university.acceptanceRate.estimated,
        display: `${university.acceptanceRate.value}%${university.acceptanceRate.estimated ? ' (est.)' : ''}`
      },
      acceptanceCriteria: university.acceptanceCriteria,
      scholarships: university.scholarships,
      contact: {
        email: university.contact,
        isEmail: isEmail(university.contact)
      },
      url: university.url,
      imageUrl: university.imageUrl,
      citations: university.citations || []
    }
  }).filter(uni => uni.universityName && uni.rank > 0)

  return { universities, metadata }
}

/**
 * Extract unique countries for filtering
 */
export function extractCountries(universities: ParsedUniversity[]): string[] {
  const countries = new Set<string>()
  
  universities.forEach(uni => {
    const cityCountry = uni.cityCountry
    if (cityCountry) {
      const parts = cityCountry.split(',')
      if (parts.length > 1) {
        const country = parts[parts.length - 1].trim()
        if (country) countries.add(country)
      }
    }
  })
  
  return Array.from(countries).sort()
}

/**
 * Extract acceptance rates for analytics
 */
export function extractAcceptanceRates(universities: ParsedUniversity[]): number[] {
  return universities
    .map(uni => uni.acceptanceRate.value)
    .filter(rate => typeof rate === 'number' && !isNaN(rate))
}

/**
 * Extract ranking data for visualization
 */
export function extractRankingData(universities: ParsedUniversity[]): { rank: number; name: string; country: string }[] {
  return universities.map(uni => ({
    rank: uni.rank,
    name: uni.universityName,
    country: uni.cityCountry.split(',').pop()?.trim() || 'Unknown'
  }))
}