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
    sm: "w-8 h-8 md:w-16 md:h-16 lg:w-8 lg:h-8", // 32px desktop, 64px iPad
    md: "w-10 h-10 md:w-20 md:h-20 lg:w-10 lg:h-10", // 40px desktop, 80px iPad
    lg: "w-[50px] h-[50px] md:w-[100px] md:h-[100px] lg:w-[50px] lg:h-[50px]", // 50px desktop, 100px iPad
  }

  const indicatorSizes = {
    sm: "w-0.5 h-2 md:w-1.5 md:h-5 lg:w-0.5 lg:h-2",
    md: "w-0.5 h-2.5 md:w-2 md:h-6 lg:w-0.5 lg:h-2.5",
    lg: "w-1 h-3 md:w-2.5 md:h-8 lg:w-1 lg:h-3",
  }

  const borderClasses = "border-2 md:border-[5px] lg:border-2"

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
    <div className="flex flex-col items-center gap-2 md:gap-4 lg:gap-2">
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`${sizeClasses[size]} relative cursor-pointer select-none touch-none`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isDragging ? "none" : "transform 0.1s ease-out",
        }}
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-b from-secondary to-secondary/60 ${borderClasses} border-primary/60 shadow-lg hover:border-primary/80 transition-colors`}
        >
          <div className="absolute inset-2 md:inset-4 lg:inset-2 rounded-full bg-gradient-to-b from-background/40 to-background/20" />
          <div
            className={`absolute top-1 md:top-2 lg:top-1 left-1/2 -translate-x-1/2 ${indicatorSizes[size]} bg-primary rounded-full shadow-md`}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 md:w-3 md:h-3 lg:w-1.5 lg:h-1.5 bg-primary/50 rounded-full" />
        </div>
      </div>

      {displayValue && (
        <div className="text-sm md:text-2xl lg:text-sm font-mono font-bold text-primary min-w-[3ch] text-center">
          {displayValue}
        </div>
      )}

      {label && <div className="premium-label text-xs md:text-lg lg:text-xs">{label}</div>}
    </div>
  )
}
