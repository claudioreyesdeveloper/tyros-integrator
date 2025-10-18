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
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-zinc-300 to-zinc-100 shadow-lg border border-zinc-400">
          <div
            className="absolute top-1 left-1/2 w-1 h-5 bg-zinc-800 rounded-full"
            style={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              transformOrigin: "center 2rem",
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
