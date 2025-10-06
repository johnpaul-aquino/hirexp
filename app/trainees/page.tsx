'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  name: string
  email: string
  phone: string
  englishLevel: string
}

const TraineePage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>()

  const onSubmit = (data: FormData) => {
    console.log(data)

    // Create mailto link with form data
    const subject = encodeURIComponent('New Trainee Waitlist Registration - HireXp')
    const body = encodeURIComponent(`New trainee waitlist registration:

Full Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
English Level: ${data.englishLevel}

Submitted: ${new Date().toLocaleString()}`)

    window.location.href = `mailto:client@jpservices.dev?subject=${subject}&body=${body}`

    setIsSubmitted(true)

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const steps = [
    { title: 'Enroll for Free', description: 'Sign up and join our waiting list for early access' },
    { title: 'Complete Training', description: 'Learn with our AI-powered modules at your own pace' },
    { title: 'Get Hired', description: 'Connect with our partner companies actively seeking trained talent' }
  ]


  const faqs = [
    {
      question: 'Is the training really free?',
      answer: 'Yes! Our platform is completely free for trainees. We partner with companies who value pre-trained talent.'
    },
    {
      question: 'How long does the training take?',
      answer: 'The training is self-paced, typically taking 4-8 weeks depending on your schedule and learning speed.'
    },
    {
      question: 'Do I need previous experience?',
      answer: 'No previous experience required! Our platform adapts to your current English level.'
    },
    {
      question: 'What happens after I complete training?',
      answer: 'You\'ll receive a certificate and be matched with partner companies looking for trained call center agents.'
    },
    {
      question: 'When will the platform launch?',
      answer: 'We\'re currently in development. Join the waiting list for early access and exclusive updates!'
    }
  ]

  return (
    <main className="relative min-h-screen bg-background">
      {/* Vertical Border Lines */}
      <div className="fixed left-0 top-0 h-full w-px bg-border hidden lg:block" />
      <div className="fixed right-0 top-0 h-full w-px bg-border hidden lg:block" />

      {/* Hero Section */}
      <section className="relative border-b overflow-hidden">
        <LightRays count={8} color="rgba(16, 185, 129, 0.15)" blur={40} speed={12} />
        <div className="container mx-auto px-4 py-24 md:py-32 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-8 text-sm">
              🚀 <span className="font-medium">Join the Waiting List</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <AuroraText colors={["#3B82F6", "#10B981", "#8B5CF6", "#3B82F6"]}>
                Get Trained, Get Hired
              </AuroraText>
            </h1>

            <div className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              <TypingAnimation
                className="text-xl md:text-2xl text-muted-foreground"
                duration={50}
                startOnView={false}
                delay={500}
              >
                Free English training for your call center career. Master communication skills with AI-powered modules and connect with hiring companies.
              </TypingAnimation>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8 h-12" onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}>
                Join Waiting List
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview with Safari */}
      <section className="border-b bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-24 max-w-6xl">
          <BlurFade delay={0.2}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                See What Your Dashboard Looks Like
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get a preview of the interactive dashboard you'll use to track your progress, complete modules, and earn your certificate
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="w-full max-w-6xl mx-auto">
              <Safari
                imageSrc="/trainee-dashboard.png"
                url="dashboard.hirexp.com/trainee"
                className="w-full"
                style={{ transform: 'scale(0.95)' }}
              />
            </div>
          </BlurFade>

          <BlurFade delay={0.6}>
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-6">
                Ready to start your journey? Join our waiting list today!
              </p>
              <Button size="lg" onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}>
                Join Waiting List
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your journey from beginner to employed in 3 simple steps
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold mb-1">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-sm text-muted-foreground">People on Waiting List</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">5</div>
              <div className="text-sm text-muted-foreground">Training Modules</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">20+</div>
              <div className="text-sm text-muted-foreground">Partner Companies</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="relative border">
                <BorderBeam size={200} duration={8} colorFrom="#3B82F6" colorTo="#8B5CF6" />
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl mb-2">Join the Waiting List</CardTitle>
                  <CardDescription className="text-base">
                    Be the first to know when we launch. Get exclusive early access and special perks!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          {...register('name', { required: 'Name is required' })}
                          placeholder="Juan Dela Cruz"
                          className="mt-2"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
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
                          placeholder="juan@example.com"
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
                          placeholder="+63 912 345 6789"
                          className="mt-2"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="englishLevel">Current English Level *</Label>
                        <Select onValueChange={(value) => setValue('englishLevel', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select your level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="elementary">Elementary</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.englishLevel && (
                          <p className="text-red-500 text-sm mt-1">{errors.englishLevel.message}</p>
                        )}
                      </div>

                      <Button type="submit" className="w-full" size="lg">
                        Join Waiting List
                      </Button>

                      <p className="text-sm text-muted-foreground text-center">
                        We'll never share your information. You can unsubscribe at any time.
                      </p>
                    </form>
                  ) : (
                    <motion.div
                      className="text-center py-8"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
                      <p className="text-muted-foreground mb-4">
                        Thank you for joining. We'll send you updates about our launch and exclusive early access.
                      </p>
                      <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                        Submit Another
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
              Everything you need to know
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
              Ready to Start Your Career?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join our waitlist today and get free AI-powered training to launch your call center career.
            </p>
            <Link href="#signup">
              <Button size="lg" className="text-base px-8 h-12">
                Join the Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
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
                Empowering careers through AI-powered English training
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <div><a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</a></div>
                <div><a href="/companies" className="text-muted-foreground hover:text-foreground transition-colors">For Companies</a></div>
                <div><a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><a href="mailto:support@hirexp.com" className="hover:text-foreground transition-colors">support@hirexp.com</a></div>
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

export default TraineePage
