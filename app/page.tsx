'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, GraduationCap, CheckCircle, Users, Award, ChevronDown, BookOpen, MessageSquare, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShineBorder } from '@/components/ui/shine-border'
import { LightRays } from '@/components/ui/light-rays'
import { AuroraText } from '@/components/ui/aurora-text'
import { TypingAnimation } from '@/components/ui/typing-animation'

export default function Home() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const jobSeekersRef = useRef<HTMLElement>(null)
  const companiesRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2

      // Check Job Seekers section
      if (jobSeekersRef.current) {
        const { top, bottom } = jobSeekersRef.current.getBoundingClientRect()
        const absoluteTop = top + window.scrollY
        const absoluteBottom = bottom + window.scrollY

        if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
          setActiveSection('job-seekers')
          return
        }
      }

      // Check Companies section
      if (companiesRef.current) {
        const { top, bottom } = companiesRef.current.getBoundingClientRect()
        const absoluteTop = top + window.scrollY
        const absoluteBottom = bottom + window.scrollY

        if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
          setActiveSection('companies')
          return
        }
      }

      setActiveSection(null)
    }

    handleScroll() // Initial check
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: GraduationCap,
      title: "For Job Seekers",
      description: "Free AI-powered English training to launch your call center career",
      link: "/trainees"
    },
    {
      icon: Briefcase,
      title: "For Companies",
      description: "Access pre-trained, job-ready talent and reduce hiring costs by 70%",
      link: "/companies"
    },
    {
      icon: Users,
      title: "AI-Powered Learning",
      description: "Personalized training modules with real-time feedback and assessment",
      link: "/trainees"
    },
    {
      icon: Award,
      title: "Pre-Vetted Candidates",
      description: "Every candidate comes with verified skills, performance data, and certificates",
      link: "/companies"
    }
  ]

  const stats = [
    { label: "Trained Candidates", value: "500+" },
    { label: "Partner Companies", value: "20+" },
    { label: "Training Modules", value: "5" },
    { label: "Cost Reduction", value: "70%" },
  ]

  const howItWorks = [
    {
      audience: "For Job Seekers",
      steps: [
        { title: "Sign Up for Free", description: "Join our waiting list and get early access" },
        { title: "Complete AI Training", description: "Master English & call center skills at your own pace" },
        { title: "Get Hired", description: "Connect with our partner companies actively hiring" }
      ]
    },
    {
      audience: "For Companies",
      steps: [
        { title: "Become a Partner", description: "Join our network and get priority access" },
        { title: "Review Candidates", description: "Browse profiles with verified skills & performance data" },
        { title: "Hire with Confidence", description: "Onboard pre-trained talent immediately" }
      ]
    }
  ]

  const faqs = [
    {
      question: "What is HireXp?",
      answer: "HireXp is a platform that provides free AI-powered English and call center training for job seekers, then connects them with companies seeking pre-trained talent."
    },
    {
      question: "Is the training really free for job seekers?",
      answer: "Yes! Our platform is completely free for trainees. We partner with companies who value pre-trained talent and pay for access to our candidate pool."
    },
    {
      question: "How long does the training take?",
      answer: "The training is self-paced, typically taking 4-8 weeks depending on your schedule and learning speed."
    },
    {
      question: "What kind of training is provided?",
      answer: "We provide comprehensive training in English proficiency, customer service, typing skills, interview preparation, and real-world call center simulations using AI technology."
    },
    {
      question: "How do companies benefit?",
      answer: "Companies save up to 70% on training costs and reduce time-to-productivity by hiring pre-trained, AI-certified candidates who are ready to work from day one."
    },
    {
      question: "When will the platform launch?",
      answer: "We're currently in development. Join our waiting list to get priority access when we launch."
    }
  ]

  return (
    <main className="relative min-h-screen bg-background">
      {/* Vertical Border Lines */}
      <div className="fixed left-0 top-0 h-full w-px bg-border hidden lg:block" />
      <div className="fixed right-0 top-0 h-full w-px bg-border hidden lg:block" />

      {/* Hero Section */}
      <section id="top" className="relative border-b overflow-hidden">
        <LightRays count={8} color="rgba(59, 130, 246, 0.15)" blur={40} speed={12} />
        <div className="container mx-auto px-4 py-24 md:py-32 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-8 text-sm">
              🚀 <span className="font-medium">Revolutionizing Call Center Hiring</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <AuroraText colors={["#3B82F6", "#8B5CF6", "#EC4899", "#3B82F6"]}>
                Train Free, Hire Smart
              </AuroraText>
            </h1>

            <div className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              <TypingAnimation
                className="text-xl md:text-2xl text-muted-foreground"
                duration={50}
                startOnView={false}
                delay={500}
              >
                We train job seekers for free using AI-powered modules, then connect them with companies seeking pre-trained talent.
              </TypingAnimation>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/trainees">
                <Button size="lg" className="text-base px-8 h-12">
                  I'm Looking for a Job
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/companies">
                <Button size="lg" variant="outline" className="text-base px-8 h-12">
                  I'm Hiring Talent
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Job Seekers Section */}
      <section
        id="job-seekers"
        ref={jobSeekersRef}
        className={`border-b transition-colors duration-700 ${
          activeSection === 'job-seekers'
            ? 'bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20'
            : 'bg-background'
        }`}
      >
        <div className="container mx-auto px-4 py-24 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-6 text-sm bg-background/50">
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium">For Job Seekers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Launch Your Call Center Career—Free
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Get AI-powered English training and job-ready skills at no cost. Join thousands of trainees preparing for high-demand call center roles.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">100% Free Training</p>
                    <p className="text-sm text-muted-foreground">AI-powered modules with instant feedback</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Job-Ready Skills</p>
                    <p className="text-sm text-muted-foreground">English, typing, customer service & more</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Direct Hiring Connections</p>
                    <p className="text-sm text-muted-foreground">Get matched with companies actively hiring</p>
                  </div>
                </li>
              </ul>
              <Link href="/trainees">
                <Button size="lg" className="text-base px-8 h-12">
                  Start Free Training
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative p-6 bg-background border rounded-lg overflow-hidden">
                    <ShineBorder shineColor={["#3B82F6", "#8B5CF6"]} duration={10} borderWidth={2} />
                    <BookOpen className="h-8 w-8 mb-3 text-blue-600" />
                    <h4 className="font-semibold mb-2">English Training</h4>
                    <p className="text-sm text-muted-foreground">Master communication skills</p>
                  </div>
                  <div className="relative p-6 bg-background border rounded-lg overflow-hidden">
                    <ShineBorder shineColor={["#8B5CF6", "#EC4899"]} duration={12} borderWidth={2} />
                    <MessageSquare className="h-8 w-8 mb-3 text-purple-600" />
                    <h4 className="font-semibold mb-2">AI Chat Practice</h4>
                    <p className="text-sm text-muted-foreground">Real-time conversations</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative p-6 bg-background border rounded-lg overflow-hidden">
                    <ShineBorder shineColor={["#10B981", "#3B82F6"]} duration={11} borderWidth={2} />
                    <Video className="h-8 w-8 mb-3 text-green-600" />
                    <h4 className="font-semibold mb-2">Interview Prep</h4>
                    <p className="text-sm text-muted-foreground">AI-powered simulations</p>
                  </div>
                  <div className="relative p-6 bg-background border rounded-lg overflow-hidden">
                    <ShineBorder shineColor={["#F59E0B", "#EF4444"]} duration={13} borderWidth={2} />
                    <Award className="h-8 w-8 mb-3 text-orange-600" />
                    <h4 className="font-semibold mb-2">Certification</h4>
                    <p className="text-sm text-muted-foreground">Prove your skills</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section
        id="companies"
        ref={companiesRef}
        className={`border-b transition-colors duration-700 ${
          activeSection === 'companies'
            ? 'bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20'
            : 'bg-background'
        }`}
      >
        <div className="container mx-auto px-4 py-24 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-2 md:order-1 relative"
            >
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-6 bg-background border rounded-lg text-center overflow-hidden"
                >
                  <ShineBorder shineColor={["#3B82F6", "#06B6D4"]} duration={10} borderWidth={2} />
                  <div className="text-4xl font-bold text-blue-600 mb-2">70%</div>
                  <p className="text-sm text-muted-foreground">Cost Reduction</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-6 bg-background border rounded-lg text-center overflow-hidden"
                >
                  <ShineBorder shineColor={["#10B981", "#14B8A6"]} duration={12} borderWidth={2} />
                  <div className="text-4xl font-bold text-green-600 mb-2">Day 1</div>
                  <p className="text-sm text-muted-foreground">Productivity</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-6 bg-background border rounded-lg text-center overflow-hidden"
                >
                  <ShineBorder shineColor={["#8B5CF6", "#A855F7"]} duration={11} borderWidth={2} />
                  <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                  <p className="text-sm text-muted-foreground">Trained Talent</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-6 bg-background border rounded-lg text-center overflow-hidden"
                >
                  <ShineBorder shineColor={["#F59E0B", "#F97316"]} duration={13} borderWidth={2} />
                  <div className="text-4xl font-bold text-orange-600 mb-2">$5K+</div>
                  <p className="text-sm text-muted-foreground">Saved Per Hire</p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-6 text-sm bg-background/50">
                <Briefcase className="h-4 w-4" />
                <span className="font-medium">For Companies</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Hire Pre-Trained, Job-Ready Talent
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Reduce hiring costs by 70% and onboard skilled call center agents faster. Access our pool of AI-certified candidates ready to work from day one.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Pre-Vetted Candidates</p>
                    <p className="text-sm text-muted-foreground">AI-certified with verified performance data</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Zero Training Costs</p>
                    <p className="text-sm text-muted-foreground">Save thousands on onboarding and training</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Faster Time-to-Productivity</p>
                    <p className="text-sm text-muted-foreground">Candidates ready to contribute immediately</p>
                  </div>
                </li>
              </ul>
              <Link href="/companies">
                <Button size="lg" variant="default" className="text-base px-8 h-12">
                  Become a Partner
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section id="how-it-works" className="border-b">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple, effective platform connecting talent with opportunity
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {howItWorks.map((section, sectionIndex) => (
              <motion.div
                key={section.audience}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.2 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold mb-6">{section.audience}</h3>
                {section.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm">
                      {stepIndex + 1}
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join the revolution in call center hiring. Whether you're starting your career or building your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/trainees">
                <Button size="lg" className="text-base px-8 h-12">
                  I Want Training
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/companies">
                <Button size="lg" variant="outline" className="text-base px-8 h-12">
                  I Need Talent
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-b">
        <div className="container mx-auto px-4 py-24 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Common questions about HireXp
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group border rounded-lg"
              >
                <summary className="flex justify-between items-center cursor-pointer p-6 font-semibold text-lg">
                  {faq.question}
                  <ChevronDown className="flex-shrink-0 ml-2 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  {faq.answer}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Join Waitlist CTA */}
      <section className="border-b bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-24 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the Waitlist
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Be among the first to experience the future of call center hiring. Get priority access when we launch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/trainees#signup">
                <Button size="lg" className="text-base px-8 h-12 w-full sm:w-auto">
                  I'm a Job Seeker
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/companies#partner">
                <Button size="lg" variant="outline" className="text-base px-8 h-12 w-full sm:w-auto">
                  I'm a Company
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">HireXp</h3>
              <p className="text-sm text-muted-foreground">
                Empowering careers, enabling companies through AI-powered training and smart hiring.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <div><Link href="/trainees" className="text-muted-foreground hover:text-foreground transition-colors">For Job Seekers</Link></div>
                <div><Link href="/companies" className="text-muted-foreground hover:text-foreground transition-colors">For Companies</Link></div>
                <div><Link href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><a href="mailto:hello@hirexp.com" className="hover:text-foreground transition-colors">hello@hirexp.com</a></div>
                <div><a href="tel:+1234567890" className="hover:text-foreground transition-colors">+1 (234) 567-8900</a></div>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 HireXp. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
