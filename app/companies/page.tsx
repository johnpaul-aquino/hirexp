'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AuroraText } from '@/components/ui/aurora-text'
import { BorderBeam } from '@/components/ui/border-beam'
import { LightRays } from '@/components/ui/light-rays'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { Safari } from '@/components/ui/safari'
import { BlurFade } from '@/components/ui/blur-fade'
import confetti from 'canvas-confetti'
import {
  CheckCircle,
  ChevronDown,
  ArrowRight
} from 'lucide-react'

type FormData = {
  companyName: string
  contactPerson: string
  email: string
  phone: string
  hiringNeeds: string
}

const CompaniesPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = (data: FormData) => {
    console.log(data)

    // Create mailto link with form data
    const subject = encodeURIComponent('New Company Partner Registration - HireXp')
    const body = encodeURIComponent(`New company partner registration:

Company Name: ${data.companyName}
Contact Person: ${data.contactPerson}
Email: ${data.email}
Phone: ${data.phone}
Hiring Needs: ${data.hiringNeeds || 'Not specified'}

Submitted: ${new Date().toLocaleString()}`)

    window.location.href = `mailto:client@jpservices.dev?subject=${subject}&body=${body}`

    setIsSubmitted(true)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const faqs = [
    {
      question: 'How are candidates trained?',
      answer: 'Candidates complete our comprehensive 5-module AI-powered training program covering English proficiency, customer service, typing, and real-world simulations.'
    },
    {
      question: 'Can we see candidate performance data?',
      answer: 'Yes! You\'ll have access to detailed profiles including test scores, typing speed, communication ratings, and AI-evaluated performance metrics.'
    },
    {
      question: 'What roles are candidates trained for?',
      answer: 'Our training focuses on call center agents, customer service representatives, technical support, and similar communication-focused roles.'
    },
    {
      question: 'Is there a fee to partner with you?',
      answer: 'Pricing details will be shared with early partners. Join the waiting list to receive exclusive early-bird rates.'
    },
    {
      question: 'When will the platform launch?',
      answer: 'We\'re currently in development. Partner companies on the waiting list will get first access to our talent pool.'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Vertical Border Lines */}
      <div className="fixed left-0 top-0 h-full w-px bg-border hidden lg:block" />
      <div className="fixed right-0 top-0 h-full w-px bg-border hidden lg:block" />

      {/* Hero Section */}
      <section className="relative border-b overflow-hidden">
        <LightRays count={8} color="rgba(249, 115, 22, 0.15)" blur={40} speed={12} />
        <div className="container mx-auto px-4 py-24 md:py-32 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-8 text-sm">
              🚀 <span className="font-medium">Coming Soon - Become an Early Partner</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <AuroraText colors={["#F97316", "#DC2626", "#EC4899", "#F97316"]}>
                Access Pre-Trained, Job-Ready Talent
              </AuroraText>
            </h1>

            <div className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              <TypingAnimation
                className="text-xl md:text-2xl text-muted-foreground"
                duration={50}
                startOnView={false}
                delay={500}
              >
                Reduce hiring costs and onboard skilled call center agents faster with our AI-certified candidates.
              </TypingAnimation>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8 h-12" onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}>
                Become a Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-24 max-w-6xl">
          <BlurFade delay={0.2}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                See What Your Dashboard Looks Like
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get a preview of the interactive dashboard where you can browse candidates, review their performance metrics, and manage your hiring pipeline.
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="w-full max-w-6xl mx-auto">
              <Safari
                imageSrc="/company-dashboard.png"
                url="dashboard.hirexp.com/company"
                className="w-full"
                style={{ transform: 'scale(0.95)' }}
              />
            </div>
          </BlurFade>

          <BlurFade delay={0.6}>
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-6">
                Ready to access pre-trained talent? Become a partner today!
              </p>
              <Button size="lg" onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}>
                Become a Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From partnership to hiring in 3 simple steps
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {[
              { title: 'Partner With Us', description: 'Join our waiting list and get priority access when we launch' },
              { title: 'Review Candidates', description: 'Browse trained candidates with detailed profiles and performance data' },
              { title: 'Hire With Confidence', description: 'Select the best talent and start onboarding immediately' }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" className="border-b">
        <div className="container mx-auto px-4 py-24 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative p-8 border rounded-lg">
              <BorderBeam size={200} duration={8} colorFrom="#F97316" colorTo="#DC2626" />
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Become an Early Partner</h2>
                <p className="text-muted-foreground">
                  Join the waiting list and get priority access to our talent pool when we launch
                </p>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      {...register('companyName', { required: 'Company name is required' })}
                      placeholder="Acme Corporation"
                      className="mt-2"
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      {...register('contactPerson', { required: 'Contact person is required' })}
                      placeholder="John Smith"
                      className="mt-2"
                    />
                    {errors.contactPerson && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactPerson.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      placeholder="john@acme.com"
                      className="mt-2"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register('phone', { required: 'Phone number is required' })}
                      placeholder="+1 (234) 567-8900"
                      className="mt-2"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="hiringNeeds">Hiring Needs (Optional)</Label>
                    <Textarea
                      id="hiringNeeds"
                      {...register('hiringNeeds')}
                      placeholder="Tell us about your hiring needs: number of positions, roles, timeline, etc."
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Become a Partner
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    We&apos;ll contact you with exclusive partnership details and early access information.
                  </p>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Thank you for your interest!</h3>
                  <p className="text-muted-foreground mb-6">
                    We&apos;ve received your partnership request. Our team will reach out shortly with more details.
                  </p>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                    Submit Another
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-b">
        <div className="container mx-auto px-4 py-24 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Common questions from potential partners</p>
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

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">HireXp</h3>
              <p className="text-sm text-muted-foreground">
                Connecting companies with pre-trained, job-ready talent
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><a href="mailto:partners@hirexp.com" className="hover:text-foreground transition-colors">partners@hirexp.com</a></div>
                <div><a href="tel:+1234567890" className="hover:text-foreground transition-colors">+1 (234) 567-8900</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <div><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link></div>
                <div><Link href="/trainees" className="text-muted-foreground hover:text-foreground transition-colors">For Job Seekers</Link></div>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 HireXp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CompaniesPage
