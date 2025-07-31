'use client'

import { useMemo } from 'react'
import type { ParsedUniversity } from '@/utils/dataParser'
import { extractAcceptanceRates, extractCountries, extractRankingData } from '@/utils/dataParser'

interface DataVisualizationProps {
  universities: ParsedUniversity[]
}

// Simple chart components using CSS and SVG
function BarChart({ data, title, maxValue }: { 
  data: { label: string; value: number; color?: string }[]; 
  title: string;
  maxValue?: number;
}) {
  const max = maxValue || Math.max(...data.map(d => d.value))
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 text-sm text-gray-600 truncate mr-3">
              {item.label}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  item.color || 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-700">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, color = 'blue' }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-700'
  }
  
  return (
    <div className={`p-6 rounded-xl border shadow-lg ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs opacity-70 mt-1">{subtitle}</p>
        </div>
        <div className="text-2xl opacity-60">
          {icon}
        </div>
      </div>
    </div>
  )
}

function AcceptanceRateDistribution({ rates }: { rates: number[] }) {
  const buckets = useMemo(() => {
    const ranges = [
      { min: 0, max: 5, label: '0-5%' },
      { min: 5, max: 10, label: '5-10%' },
      { min: 10, max: 20, label: '10-20%' },
      { min: 20, max: 30, label: '20-30%' },
      { min: 30, max: 50, label: '30-50%' },
      { min: 50, max: 100, label: '50%+' }
    ]
    
    return ranges.map(range => ({
      label: range.label,
      value: rates.filter(rate => rate >= range.min && rate < range.max).length,
      color: 'bg-gradient-to-r from-emerald-400 to-emerald-600'
    }))
  }, [rates])
  
  return <BarChart data={buckets} title="Acceptance Rate Distribution" />
}

function CountryDistribution({ universities }: { universities: ParsedUniversity[] }) {
  const countryData = useMemo(() => {
    const countries = extractCountries(universities)
    const countryCounts = countries.map(country => ({
      label: country,
      value: universities.filter(uni => uni.cityCountry.includes(country)).length,
      color: 'bg-gradient-to-r from-indigo-400 to-indigo-600'
    })).sort((a, b) => b.value - a.value).slice(0, 8) // Top 8 countries
    
    return countryCounts
  }, [universities])
  
  return <BarChart data={countryData} title="Universities by Country" />
}

function TopRankedUniversities({ universities }: { universities: ParsedUniversity[] }) {
  const topUniversities = useMemo(() => {
    return universities
      .slice(0, 10)
      .map(uni => ({
        label: uni.universityName.length > 20 
          ? uni.universityName.substring(0, 20) + '...'
          : uni.universityName,
        value: uni.rank,
        color: 'bg-gradient-to-r from-amber-400 to-amber-600'
      }))
  }, [universities])
  
  return <BarChart data={topUniversities} title="Top 10 Universities" maxValue={10} />
}

export default function DataVisualization({ universities }: DataVisualizationProps) {
  const stats = useMemo(() => {
    const acceptanceRates = extractAcceptanceRates(universities)
    const countries = extractCountries(universities)
    
    const avgAcceptanceRate = acceptanceRates.length > 0 
      ? (acceptanceRates.reduce((sum, rate) => sum + rate, 0) / acceptanceRates.length).toFixed(1)
      : 'N/A'
    
    const universitiesWithFunding = universities.filter(
      uni => uni.scholarships && uni.scholarships.length > 0
    ).length
    
    const universitiesWithContacts = universities.filter(
      uni => uni.contact && uni.contact.email.length > 0
    ).length
    
    return {
      total: universities.length,
      countries: countries.length,
      avgAcceptanceRate,
      withFunding: universitiesWithFunding,
      withContacts: universitiesWithContacts,
      acceptanceRates
    }
  }, [universities])
  
  if (universities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">No data available for visualization</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Universities"
          value={stats.total}
          subtitle="In our database"
          color="blue"
          icon={<span>🏛️</span>}
        />
        <StatCard
          title="Countries"
          value={stats.countries}
          subtitle="Represented globally"
          color="green"
          icon={<span>🌍</span>}
        />
        <StatCard
          title="Avg Acceptance Rate"
          value={`${stats.avgAcceptanceRate}%`}
          subtitle="For CS programs"
          color="purple"
          icon={<span>📊</span>}
        />
        <StatCard
          title="With Funding Info"
          value={stats.withFunding}
          subtitle="Universities offer aid"
          color="orange"
          icon={<span>💰</span>}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CountryDistribution universities={universities} />
        <AcceptanceRateDistribution rates={stats.acceptanceRates} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <TopRankedUniversities universities={universities} />
      </div>
      
      {/* Additional Insights */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Completeness</h4>
            <ul className="space-y-1">
              <li>• {stats.withContacts} universities have contact information</li>
              <li>• {stats.withFunding} universities provide funding details</li>
              <li>• {stats.acceptanceRates.length} universities report acceptance rates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Geographic Distribution</h4>
            <ul className="space-y-1">
              <li>• Universities span {stats.countries} countries</li>
              <li>• Includes top-ranked institutions globally</li>
              <li>• Comprehensive CS program coverage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}