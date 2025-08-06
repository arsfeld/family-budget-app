'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/aceternity-utils'

interface AnimatedTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export const AnimatedTooltip = ({
  children,
  content,
  className,
  side = 'top',
  delay = 0,
}: AnimatedTooltipProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const springConfig = { stiffness: 100, damping: 5 }
  const x = useMotionValue(0)
  
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  )
  
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  )

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const halfWidth = event.currentTarget.offsetWidth / 2
    x.set(event.nativeEvent.offsetX - halfWidth)
  }

  const tooltipPositions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 rotate-180',
    left: 'left-full top-1/2 -translate-y-1/2 -rotate-90',
    right: 'right-full top-1/2 -translate-y-1/2 rotate-90',
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: side === 'top' ? 10 : side === 'bottom' ? -10 : 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                delay: delay / 1000,
                type: 'spring',
                stiffness: 260,
                damping: 10,
              }
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            style={{
              translateX: side === 'top' || side === 'bottom' ? translateX : undefined,
              rotate: side === 'top' || side === 'bottom' ? rotate : undefined,
            }}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg shadow-xl',
              tooltipPositions[side],
              className
            )}
          >
            {content}
            <div
              className={cn(
                'absolute w-0 h-0 border-4 border-transparent border-t-gray-900 dark:border-t-white',
                arrowPositions[side]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Group tooltip for multiple items
export const AnimatedTooltipGroup = ({
  items,
}: {
  items: {
    id: number
    name: string
    content: React.ReactNode
    image?: string
  }[]
}) => {
  return (
    <div className="flex items-center gap-2">
      {items.map((item, idx) => (
        <AnimatedTooltip
          key={item.id}
          content={
            <div className="flex items-center gap-2">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{item.name}</p>
                {item.content}
              </div>
            </div>
          }
          delay={idx * 100}
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium">
                {item.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </AnimatedTooltip>
      ))}
    </div>
  )
}

// Help tooltip for form fields
export const HelpTooltip = ({
  text,
  className,
}: {
  text: string
  className?: string
}) => {
  return (
    <AnimatedTooltip
      content={<div className="max-w-xs">{text}</div>}
      className={className}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="text-xs">?</span>
      </button>
    </AnimatedTooltip>
  )
}

// Icon tooltip
export const IconTooltip = ({
  icon,
  text,
  className,
}: {
  icon: React.ReactNode
  text: string
  className?: string
}) => {
  return (
    <AnimatedTooltip content={text} className={className}>
      <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
        {icon}
      </div>
    </AnimatedTooltip>
  )
}