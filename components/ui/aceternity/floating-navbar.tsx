'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { cn } from '@/lib/aceternity-utils'
import Link from 'next/link'

interface FloatingNavbarProps {
  navItems: {
    name: string
    link?: string
    icon?: React.ReactNode
    onClick?: () => void
  }[]
  className?: string
  children?: React.ReactNode
}

export const FloatingNavbar = ({
  navItems,
  className,
  children,
}: FloatingNavbarProps) => {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useMotionValueEvent(scrollY, 'change', (current) => {
    const direction = current - lastScrollY
    
    if (current < 10) {
      setVisible(true)
    } else if (direction < -10) {
      setVisible(true)
    } else if (direction > 10) {
      setVisible(false)
    }
    
    setLastScrollY(current)
  })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
        className={cn(
          'fixed top-4 inset-x-0 mx-auto z-50 w-fit',
          className
        )}
      >
        <motion.div
          className="border border-transparent dark:border-white/[0.2] rounded-2xl dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] backdrop-blur-md"
          layoutId="navbar"
        >
          <div className="flex items-center justify-between px-8 py-3 gap-8">
            <div className="flex items-center gap-6">
              {navItems.map((navItem, idx) => (
                <NavItem key={`link-${idx}`} {...navItem} />
              ))}
            </div>
            {children && (
              <div className="flex items-center gap-4">
                {children}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const NavItem = ({
  name,
  link,
  icon,
  onClick,
}: {
  name: string
  link?: string
  icon?: React.ReactNode
  onClick?: () => void
}) => {
  const [hovered, setHovered] = useState(false)

  const content = (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer"
      onClick={onClick}
    >
      <span className="relative z-10 px-4 py-2 inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors">
        {icon && <span className="text-lg">{icon}</span>}
        {name}
      </span>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30"
            layoutId="hoverBackground"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )

  if (link) {
    return (
      <Link href={link} className="no-underline">
        {content}
      </Link>
    )
  }

  return content
}

// Mobile-friendly variant
export const MobileFloatingNavbar = ({
  navItems,
  className,
  children,
}: FloatingNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <motion.div
        className={cn(
          'fixed top-4 right-4 z-50 md:hidden',
          className
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-full bg-white dark:bg-black shadow-lg border border-gray-200 dark:border-gray-800"
        >
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            animate={isOpen ? 'open' : 'closed'}
            className="stroke-gray-700 dark:stroke-gray-200"
          >
            <motion.path
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                closed: { d: 'M 2 2.5 L 18 2.5' },
                open: { d: 'M 3 16.5 L 17 2.5' },
              }}
            />
            <motion.path
              strokeWidth="2"
              strokeLinecap="round"
              d="M 2 9.423 L 18 9.423"
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 },
              }}
              transition={{ duration: 0.1 }}
            />
            <motion.path
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                closed: { d: 'M 2 16.346 L 18 16.346' },
                open: { d: 'M 3 2.5 L 17 16.346' },
              }}
            />
          </motion.svg>
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-4 z-40 bg-white dark:bg-black rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-4 min-w-[200px]"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((navItem, idx) => (
                <MobileNavItem
                  key={`mobile-link-${idx}`}
                  {...navItem}
                  onClick={() => {
                    navItem.onClick?.()
                    setIsOpen(false)
                  }}
                />
              ))}
              {children && (
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
                  {children}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const MobileNavItem = ({
  name,
  link,
  icon,
  onClick,
}: {
  name: string
  link?: string
  icon?: React.ReactNode
  onClick?: () => void
}) => {
  const content = (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <span className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
        {icon && <span className="text-lg">{icon}</span>}
        {name}
      </span>
    </motion.div>
  )

  if (link) {
    return (
      <Link href={link} className="no-underline">
        {content}
      </Link>
    )
  }

  return content
}