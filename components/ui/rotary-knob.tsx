"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"

interface RotaryKnobProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  label?: string
  displayValue?: string
  size?: "sm" | "md" | "lg"
}

export function RotaryKnob({ value, min = 0, max = 127, onChange, label, displayValue, size = "md" }: RotaryKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startValue, setStartValue] = useState(0)

  const percentage = (value - min) / (max - min)
  const rotation = -135 + percentage * 270

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  }

  const indicatorSizes = {
    sm: "w-0.5 h-4",
    md: "w-1 h-5",
    lg: "w-1 h-6",
  }

  const indicatorOrigins = {
    sm: "center 1.5rem",
    md: "center 2rem",
    lg: "center 2.5rem",
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setStartY(e.clientY)
    setStartValue(value)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setStartValue(value)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const deltaY = startY - e.clientY
      const sensitivity = 0.5
      const valueChange = deltaY * sensitivity
      const newValue = Math.max(min, Math.min(max, startValue + valueChange))

      onChange(Math.round(newValue))
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return

      const deltaY = startY - e.touches[0].clientY
      const sensitivity = 0.5
      const valueChange = deltaY * sensitivity
      const newValue = Math.max(min, Math.min(max, startValue + valueChange))

      onChange(Math.round(newValue))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove)
      document.addEventListener("touchend", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleMouseUp)
    }
  }, [isDragging, startY, startValue, min, max, onChange])

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`${sizeClasses[size]} relative cursor-pointer select-none touch-none`}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-300 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.2)] border-2 border-zinc-400/50">
          <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]" />
          <div className="absolute inset-[10px] rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.6)]" />
          <div
            className={`absolute top-1 left-1/2 ${indicatorSizes[size]} bg-zinc-800 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]`}
            style={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              transformOrigin: indicatorOrigins[size],
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
          />
        </div>
      </div>

      {displayValue && (
        <div className="text-xs font-mono font-bold text-white min-w-[3ch] text-center">{displayValue}</div>
      )}

      {label && <div className="text-[#FFA500] font-bold text-xs uppercase tracking-wider">{label}</div>}
    </div>
  )
}
