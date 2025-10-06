'use client'

import { useRef } from 'react'
import { BorderBeam } from '@/components/ui/border-beam'
import { AnimatedBeam } from '@/components/ui/animated-beam'
import { Marquee } from '@/components/ui/marquee'
import { ShineBorder } from '@/components/ui/shine-border'
import { DotPattern } from '@/components/ui/dot-pattern'
import { Meteors } from '@/components/ui/meteors'
import { Ripple } from '@/components/ui/ripple'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { cn } from '@/lib/utils'

// Sample data for marquee
const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "James",
    username: "@james",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/james",
  },
]

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string
  name: string
  username: string
  body: string
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  )
}

export default function DemoPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)
  const div4Ref = useRef<HTMLDivElement>(null)
  const div5Ref = useRef<HTMLDivElement>(null)
  const div6Ref = useRef<HTMLDivElement>(null)
  const div7Ref = useRef<HTMLDivElement>(null)

  const firstRow = reviews.slice(0, reviews.length / 2)
  const secondRow = reviews.slice(reviews.length / 2)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Magic UI Components Demo</h1>
          <TypingAnimation
            className="text-xl text-muted-foreground"
          >
            Explore the full collection of animated components
          </TypingAnimation>
        </div>

        <div className="space-y-16">
          {/* Border Beam Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Border Beam</h2>
            <div className="relative flex h-[200px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
              <span className="text-lg font-semibold">Animated Border Effect</span>
              <BorderBeam size={250} duration={12} delay={9} />
            </div>
          </section>

          {/* Shine Border Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Shine Border</h2>
            <div className="flex justify-center">
              <ShineBorder
                className="relative flex h-[200px] w-full max-w-lg flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl"
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
              >
                <span className="text-lg font-semibold">Glossy Shine Effect</span>
              </ShineBorder>
            </div>
          </section>

          {/* Animated Beam Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Animated Beam</h2>
            <div className="relative flex h-[400px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl p-10" ref={containerRef}>
              <div className="flex size-full flex-col max-w-lg max-h-[200px] items-stretch justify-between gap-10">
                <div className="flex flex-row items-center justify-between">
                  <div ref={div1Ref} className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 p-2">
                    <span>1</span>
                  </div>
                  <div ref={div5Ref} className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 p-2">
                    <span>5</span>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <div ref={div2Ref} className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 p-2">
                    <span>2</span>
                  </div>
                  <div ref={div4Ref} className="flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 p-2">
                    <span>4</span>
                  </div>
                  <div ref={div6Ref} className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 p-2">
                    <span>6</span>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <div ref={div3Ref} className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 p-2">
                    <span>3</span>
                  </div>
                  <div ref={div7Ref} className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 p-2">
                    <span>7</span>
                  </div>
                </div>
              </div>

              <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div4Ref} />
              <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div4Ref} />
              <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div4Ref} />
              <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div5Ref} />
              <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} />
              <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div7Ref} />
            </div>
          </section>

          {/* Marquee Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Marquee</h2>
            <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
              <Marquee pauseOnHover className="[--duration:20s]">
                {firstRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee reverse pauseOnHover className="[--duration:20s]">
                {secondRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
            </div>
          </section>

          {/* Dot Pattern Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Dot Pattern</h2>
            <div className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
              <p className="z-10 whitespace-pre-wrap text-center text-3xl font-medium tracking-tighter text-black dark:text-white">
                Dot Pattern Background
              </p>
              <DotPattern
                className={cn(
                  "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
                )}
              />
            </div>
          </section>

          {/* Meteors Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Meteors</h2>
            <div className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
              <Meteors number={20} />
              <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-3xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
                Meteor Shower Effect
              </span>
            </div>
          </section>

          {/* Ripple Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Ripple</h2>
            <div className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
              <p className="z-10 whitespace-pre-wrap text-center text-3xl font-medium tracking-tighter text-black dark:text-white">
                Ripple Animation
              </p>
              <Ripple />
            </div>
          </section>

          {/* Typing Animation Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Typing Animation</h2>
            <div className="relative flex h-[200px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
              <TypingAnimation
                className="text-2xl font-bold text-black dark:text-white"
              >
                This text appears with a typing effect!
              </TypingAnimation>
            </div>
          </section>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            More components available at{' '}
            <a href="https://magicui.design" target="_blank" rel="noopener noreferrer" className="underline">
              magicui.design
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}