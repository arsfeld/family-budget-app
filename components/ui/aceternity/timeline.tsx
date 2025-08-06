'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { cn } from '@/lib/aceternity-utils'

interface TimelineItem {
  id: string
  title: string
  content: React.ReactNode
  date?: string
  icon?: React.ReactNode
  color?: string
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export const Timeline = ({ items, className }: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const heightProgress = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 100]),
    {
      stiffness: 100,
      damping: 30,
    }
  )

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Progress line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800">
        <motion.div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-indigo-500 to-purple-500"
          style={{ height: useTransform(heightProgress, (v) => `${v}%`) }}
        />
      </div>

      {/* Timeline items */}
      <div className="space-y-12">
        {items.map((item, index) => (
          <TimelineItemComponent key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  )
}

const TimelineItemComponent = ({
  item,
  index,
}: {
  item: TimelineItem
  index: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex items-start gap-6"
    >
      {/* Icon/Dot */}
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            item.color || 'bg-gradient-to-br from-indigo-500 to-purple-500'
          )}
        >
          {item.icon || (
            <div className="w-3 h-3 rounded-full bg-white" />
          )}
        </motion.div>
        {isInView && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: item.color || 'linear-gradient(135deg, #667eea, #764ba2)',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.title}
            </h3>
            {item.date && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.date}
              </span>
            )}
          </div>
          <div className="text-gray-600 dark:text-gray-300">{item.content}</div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Expense timeline specific component
export const ExpenseTimeline = ({
  expenses,
  className,
}: {
  expenses: {
    id: string
    name: string
    amount: number
    date: string
    category?: string
    isIncome?: boolean
  }[]
  className?: string
}) => {
  const items: TimelineItem[] = expenses.map((expense) => ({
    id: expense.id,
    title: expense.name,
    content: (
      <div className="space-y-2">
        <p className={cn(
          'text-2xl font-bold',
          expense.isIncome ? 'text-green-600' : 'text-amber-600'
        )}>
          {expense.isIncome ? '+' : '-'}${expense.amount.toLocaleString()}
        </p>
        {expense.category && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Category: {expense.category}
          </p>
        )}
      </div>
    ),
    date: expense.date,
    color: expense.isIncome
      ? 'bg-gradient-to-br from-green-400 to-green-600'
      : 'bg-gradient-to-br from-amber-400 to-amber-600',
    icon: (
      <span className="text-white text-xl">
        {expense.isIncome ? '↑' : '↓'}
      </span>
    ),
  }))

  return <Timeline items={items} className={className} />
}

// Sticky timeline with scroll progress
export const StickyTimeline = ({
  items,
  className,
}: {
  items: TimelineItem[]
  className?: string
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const { top } = containerRef.current.getBoundingClientRect()
      const containerHeight = containerRef.current.offsetHeight
      const windowHeight = window.innerHeight
      const scrollProgress = Math.abs(top) / (containerHeight - windowHeight)
      const newIndex = Math.min(
        Math.floor(scrollProgress * items.length),
        items.length - 1
      )
      setActiveIndex(Math.max(0, newIndex))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [items.length])

  return (
    <div ref={containerRef} className={cn('relative min-h-screen', className)}>
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Sticky content */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0.3, scale: 0.95 }}
                animate={{
                  opacity: index === activeIndex ? 1 : 0.3,
                  scale: index === activeIndex ? 1 : 0.95,
                }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                {item.date && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {item.date}
                  </p>
                )}
                <div>{item.content}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scrollable timeline */}
        <div className="space-y-24 py-12">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="h-96 flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-6xl font-bold text-gray-200 dark:text-gray-800"
              >
                {index + 1}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}