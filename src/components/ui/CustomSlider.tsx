'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface CustomSliderProps {
  min: number
  max: number
  value: number | [number, number]
  onChange: (value: number | [number, number]) => void
  step?: number
  label?: string
  showValue?: boolean
  showTicks?: boolean
  tickCount?: number
  range?: boolean
  disabled?: boolean
  className?: string
  formatValue?: (value: number) => string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  size?: 'sm' | 'md' | 'lg'
}

export default function CustomSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  showValue = true,
  showTicks = false,
  tickCount = 5,
  range = false,
  disabled = false,
  className = '',
  formatValue = (val) => val.toString(),
  color = 'blue',
  size = 'md'
}: CustomSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Ensure value is in correct format
  const currentValue = range 
    ? Array.isArray(value) ? value : [min, max]
    : Array.isArray(value) ? value[0] : value

  const minValue = range && Array.isArray(currentValue) ? currentValue[0] : min
  const maxValue = range && Array.isArray(currentValue) ? currentValue[1] : (currentValue as number)

  // Color configurations
  const colorClasses = {
    blue: {
      track: 'bg-blue-500',
      thumb: 'bg-white border-blue-500 shadow-blue-200',
      fill: 'bg-gradient-to-r from-blue-400 to-blue-600'
    },
    green: {
      track: 'bg-green-500',
      thumb: 'bg-white border-green-500 shadow-green-200',
      fill: 'bg-gradient-to-r from-green-400 to-green-600'
    },
    purple: {
      track: 'bg-purple-500',
      thumb: 'bg-white border-purple-500 shadow-purple-200',
      fill: 'bg-gradient-to-r from-purple-400 to-purple-600'
    },
    orange: {
      track: 'bg-orange-500',
      thumb: 'bg-white border-orange-500 shadow-orange-200',
      fill: 'bg-gradient-to-r from-orange-400 to-orange-600'
    },
    red: {
      track: 'bg-red-500',
      thumb: 'bg-white border-red-500 shadow-red-200',
      fill: 'bg-gradient-to-r from-red-400 to-red-600'
    }
  }

  // Size configurations
  const sizeClasses = {
    sm: {
      track: 'h-2',
      thumb: 'w-4 h-4',
      label: 'text-sm'
    },
    md: {
      track: 'h-3',
      thumb: 'w-5 h-5',
      label: 'text-base'
    },
    lg: {
      track: 'h-4',
      thumb: 'w-6 h-6',
      label: 'text-lg'
    }
  }

  // Calculate percentage position
  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

  // Calculate value from percentage
  const getValueFromPercentage = (percentage: number) => {
    const rawValue = min + (percentage / 100) * (max - min)
    return Math.round(rawValue / step) * step
  }

  // Handle mouse/touch events
  const handlePointerDown = useCallback((e: React.PointerEvent, thumb: 'min' | 'max' | 'single') => {
    if (disabled) return
    
    e.preventDefault()
    setIsDragging(range ? (thumb === 'single' ? 'max' : thumb) : 'max')
    
    const handlePointerMove = (e: PointerEvent) => {
      if (!sliderRef.current) return
      
      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const newValue = getValueFromPercentage(percentage)
      
      if (range && Array.isArray(currentValue)) {
        if (thumb === 'min') {
          const newMin = Math.min(newValue, currentValue[1])
          onChange([newMin, currentValue[1]])
        } else {
          const newMax = Math.max(newValue, currentValue[0])
          onChange([currentValue[0], newMax])
        }
      } else {
        onChange(Math.max(min, Math.min(max, newValue)))
      }
    }

    const handlePointerUp = () => {
      setIsDragging(null)
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
  }, [disabled, range, currentValue, min, max, step, onChange])

  // Handle track click
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (disabled || isDragging) return
    
    const rect = sliderRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const percentage = ((e.clientX - rect.left) / rect.width) * 100
    const newValue = getValueFromPercentage(percentage)
    
    if (range && Array.isArray(currentValue)) {
      const [minVal, maxVal] = currentValue
      const distanceToMin = Math.abs(newValue - minVal)
      const distanceToMax = Math.abs(newValue - maxVal)
      
      if (distanceToMin < distanceToMax) {
        onChange([Math.min(newValue, maxVal), maxVal])
      } else {
        onChange([minVal, Math.max(newValue, minVal)])
      }
    } else {
      onChange(Math.max(min, Math.min(max, newValue)))
    }
  }, [disabled, isDragging, range, currentValue, min, max, onChange])

  // Handle hover for preview
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled || isDragging) return
    
    const rect = sliderRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const percentage = ((e.clientX - rect.left) / rect.width) * 100
    const newValue = getValueFromPercentage(percentage)
    setHoverValue(newValue)
  }, [disabled, isDragging, min, max, step])

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null)
  }, [])

  // Generate tick marks
  const generateTicks = () => {
    if (!showTicks) return []
    
    const ticks = []
    for (let i = 0; i <= tickCount; i++) {
      const percentage = (i / tickCount) * 100
      const tickValue = min + (percentage / 100) * (max - min)
      ticks.push({
        percentage,
        value: Math.round(tickValue / step) * step
      })
    }
    return ticks
  }

  const ticks = generateTicks()

  return (
    <div className={`w-full ${className}`}>
      {/* Label and Value Display */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-4">
          {label && (
            <label className={`font-medium text-gray-700 ${sizeClasses[size].label}`}>
              {label}
            </label>
          )}
          {showValue && (
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600">
              {range && Array.isArray(currentValue) ? (
                <>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {formatValue(currentValue[0])}
                  </span>
                  <span className="text-gray-400">-</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {formatValue(currentValue[1])}
                  </span>
                </>
              ) : (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {formatValue(currentValue as number)}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Slider Container */}
      <div className="relative">
        {/* Track */}
        <div 
          ref={sliderRef}
          className={`relative bg-gray-200 rounded-full cursor-pointer transition-all duration-200 ${
            sizeClasses[size].track
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
          onClick={handleTrackClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Active Track */}
          <div 
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-200 ${
              colorClasses[color].fill
            }`}
            style={{
              left: range && Array.isArray(currentValue) ? `${getPercentage(currentValue[0])}%` : '0%',
              width: range && Array.isArray(currentValue) 
                ? `${getPercentage(currentValue[1]) - getPercentage(currentValue[0])}%`
                : `${getPercentage(currentValue as number)}%`
            }}
          />

          {/* Hover Preview */}
          {hoverValue !== null && !isDragging && (
            <div 
              className="absolute top-0 w-1 h-full bg-gray-400 opacity-50 rounded-full pointer-events-none"
              style={{ left: `${getPercentage(hoverValue)}%` }}
            />
          )}

          {/* Thumbs */}
          {range && Array.isArray(currentValue) ? (
            <>
              {/* Min Thumb */}
              <div
                className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 ${
                  sizeClasses[size].thumb
                } ${colorClasses[color].thumb} border-2 rounded-full cursor-grab transition-all duration-200 hover:scale-110 ${
                  isDragging === 'min' ? 'scale-110 shadow-lg cursor-grabbing' : 'hover:shadow-md'
                } ${disabled ? 'cursor-not-allowed' : ''}`}
                style={{ left: `${getPercentage(currentValue[0])}%` }}
                onPointerDown={(e) => handlePointerDown(e, 'min')}
                role="slider"
                aria-valuemin={min}
                aria-valuemax={currentValue[1]}
                aria-valuenow={currentValue[0]}
                aria-label={`Minimum ${label || 'value'}`}
                tabIndex={disabled ? -1 : 0}
              >
                {/* Thumb Value Tooltip */}
                {isDragging === 'min' && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                    {formatValue(currentValue[0])}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>

              {/* Max Thumb */}
              <div
                className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 ${
                  sizeClasses[size].thumb
                } ${colorClasses[color].thumb} border-2 rounded-full cursor-grab transition-all duration-200 hover:scale-110 ${
                  isDragging === 'max' ? 'scale-110 shadow-lg cursor-grabbing' : 'hover:shadow-md'
                } ${disabled ? 'cursor-not-allowed' : ''}`}
                style={{ left: `${getPercentage(currentValue[1])}%` }}
                onPointerDown={(e) => handlePointerDown(e, 'max')}
                role="slider"
                aria-valuemin={currentValue[0]}
                aria-valuemax={max}
                aria-valuenow={currentValue[1]}
                aria-label={`Maximum ${label || 'value'}`}
                tabIndex={disabled ? -1 : 0}
              >
                {/* Thumb Value Tooltip */}
                {isDragging === 'max' && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                    {formatValue(currentValue[1])}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Single Thumb */
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 ${
                sizeClasses[size].thumb
              } ${colorClasses[color].thumb} border-2 rounded-full cursor-grab transition-all duration-200 hover:scale-110 ${
                isDragging ? 'scale-110 shadow-lg cursor-grabbing' : 'hover:shadow-md'
              } ${disabled ? 'cursor-not-allowed' : ''}`}
              style={{ left: `${getPercentage(currentValue as number)}%` }}
              onPointerDown={(e) => handlePointerDown(e, 'single')}
              role="slider"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={currentValue as number}
              aria-label={label || 'value'}
              tabIndex={disabled ? -1 : 0}
            >
              {/* Thumb Value Tooltip */}
              {isDragging && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  {formatValue(currentValue as number)}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tick Marks */}
        {showTicks && (
          <div className="flex justify-between mt-2">
            {ticks.map((tick, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-px h-2 bg-gray-300"></div>
                <span className="text-xs text-gray-500 mt-1">
                  {formatValue(tick.value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Hover Value Preview */}
        {hoverValue !== null && !isDragging && (
          <div 
            className="absolute top-full mt-2 bg-gray-700 text-white text-xs py-1 px-2 rounded pointer-events-none transform -translate-x-1/2"
            style={{ left: `${getPercentage(hoverValue)}%` }}
          >
            {formatValue(hoverValue)}
          </div>
        )}
      </div>
    </div>
  )
}