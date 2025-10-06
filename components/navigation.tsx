'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Briefcase, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'For Job Seekers', href: '/trainees' },
  { name: 'For Companies', href: '/companies' },
  { name: 'How It Works', href: '/#how-it-works' },
  { name: 'FAQ', href: '/#faq' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [showWaitlistModal, setShowWaitlistModal] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)

      // Track active section for anchor links and homepage sections
      const sections = ['how-it-works', 'faq', 'job-seekers', 'companies']
      const scrollPosition = window.scrollY + window.innerHeight / 2 // Center of viewport

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const { top, bottom } = element.getBoundingClientRect()
          const absoluteTop = top + window.scrollY
          const absoluteBottom = bottom + window.scrollY

          if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
            setActiveSection(sectionId)
            return
          }
        }
      }
      setActiveSection('')
    }

    handleScroll() // Initial check
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const elementId = href.substring(2)
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const isActive = (href: string) => {
    // Home page - exact match only
    if (href === '/') return pathname === '/'

    // Anchor links (/#how-it-works, /#faq)
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2) // Remove '/#'
      // Active if we're scrolled to that section on ANY page
      return activeSection === sectionId
    }

    // For Job Seekers link - active when on /trainees page OR when job-seekers section is in view on homepage
    if (href === '/trainees') {
      return pathname === '/trainees' || (pathname === '/' && activeSection === 'job-seekers')
    }

    // For Companies link - active when on /companies page OR when companies section is in view on homepage
    if (href === '/companies') {
      return pathname === '/companies' || (pathname === '/' && activeSection === 'companies')
    }

    // Regular paths - exact match
    if (!href.includes('#')) return pathname === href

    // Paths with anchors like /trainees#signup
    return pathname === href.split('#')[0]
  }

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 md:top-6 lg:top-8 left-0 right-0 mx-auto w-auto max-w-[90vw] md:max-w-[900px] lg:max-w-[1100px] z-50"
      >
        <nav
          className="relative grid grid-cols-[auto_1fr_auto] items-center h-14 md:h-16 px-3 md:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none transition-all duration-300"
          aria-label="Main navigation"
        >
          {/* Logo - Left */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-shrink-0 relative z-10"
          >
            <Link href="/" className="text-base md:text-lg font-bold hover:opacity-80 transition-opacity">
              HireXp
            </Link>
          </motion.div>

          {/* Desktop Navigation - Centered */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden md:flex items-center justify-center gap-1 relative z-10"
          >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                >
                  {item.href.startsWith('/#') ? (
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className={`relative px-3 lg:px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group motion-safe:transition-all motion-reduce:transition-none whitespace-nowrap ${
                        isActive(item.href)
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="relative z-10">{item.name}</span>
                      {isActive(item.href) && (
                        <motion.span
                          layoutId="activeNav"
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-full -z-10"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`relative px-3 lg:px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group motion-safe:transition-all motion-reduce:transition-none whitespace-nowrap ${
                        isActive(item.href)
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="relative z-10">{item.name}</span>
                      {isActive(item.href) && (
                        <motion.span
                          layoutId="activeNav"
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-full -z-10"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>

          {/* CTA Button - Desktop - Right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="hidden md:flex justify-end flex-shrink-0 relative z-10"
          >
            <Button
              size="sm"
              onClick={() => setShowWaitlistModal(true)}
              className="relative overflow-hidden group h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm rounded-full"
            >
              <span className="relative z-10">Join Waitlist</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: 'linear',
                }}
              />
            </Button>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ml-auto relative z-10"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Menu Content - Glass Modal */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/20 z-50 md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/20">
                  <Link
                    href="/"
                    className="text-xl font-bold hover:opacity-80 transition-opacity"
                    onClick={() => setIsOpen(false)}
                  >
                    HireXp
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Close menu"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Mobile Navigation Items */}
                <div className="flex-1 px-4 py-8">
                  <div className="space-y-4">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                      >
                        {item.href.startsWith('/#') ? (
                          <button
                            onClick={() => {
                              handleNavClick(item.href)
                              setIsOpen(false)
                            }}
                            className={`block w-full text-left text-lg font-medium px-4 py-3 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                              isActive(item.href)
                                ? 'text-gray-900 dark:text-white bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 dark:hover:bg-black/10'
                            }`}
                          >
                            {item.name}
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`block text-lg font-medium px-4 py-3 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                              isActive(item.href)
                                ? 'text-gray-900 dark:text-white bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 dark:hover:bg-black/10'
                            }`}
                          >
                            {item.name}
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="mt-8"
                  >
                    <Button
                      size="lg"
                      onClick={() => {
                        setIsOpen(false)
                        setShowWaitlistModal(true)
                      }}
                      className="w-full rounded-xl"
                    >
                      Join Waitlist
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Waitlist Modal */}
      <Dialog open={showWaitlistModal} onOpenChange={setShowWaitlistModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Join the Waitlist</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Choose your path to get started with HireXp
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <Link href="/trainees#signup" onClick={() => setShowWaitlistModal(false)}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">I'm a Job Seeker</h3>
                    <p className="text-sm text-muted-foreground">
                      Get free AI-powered training and connect with hiring companies
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/companies#signup" onClick={() => setShowWaitlistModal(false)}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">I'm Hiring Talent</h3>
                    <p className="text-sm text-muted-foreground">
                      Access pre-trained, job-ready candidates and reduce hiring costs
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
