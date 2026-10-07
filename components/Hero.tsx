'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Connections } from '@/components/Connections';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function Hero() {
  const [stealthMode, setStealthMode] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <section className="min-h-[90vh] flex flex-col justify-center py-20 md:py-32">
      <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
        {/* Text content - left side */}
        <div className="flex-1 text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-muted-foreground mb-4 text-lg"
          >
            Hi, I&apos;m
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight mb-6"
          >
            Sahil Mahendrakar
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl leading-relaxed"
          >
            Building things. Breaking stuff. Humaning around.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-md md:text-base text-muted-foreground font-semibold mb-8 max-w-2xl"
          >
            Building in{' '}
            <span
              tabIndex={0}
              onMouseEnter={() => setStealthMode(true)}
              onMouseLeave={() => setStealthMode(false)}
              onFocus={() => setStealthMode(true)}
              onBlur={() => setStealthMode(false)}
              className="cursor-pointer text-muted-foreground/70 underline decoration-dashed decoration-muted-foreground/50 underline-offset-4 outline-none transition-colors duration-300 hover:text-foreground hover:decoration-solid hover:decoration-foreground focus-visible:text-foreground focus-visible:decoration-solid focus-visible:decoration-foreground"
            >
              Stealth
            </span>{' '}
            • Prev. agentic AI at AWS, Columbia &apos;24
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 justify-center lg:justify-start"
          >
            <Button asChild size="lg" className="text-base px-6">
              <Link href="#projects">See projects</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-6">
              <Link href="#contact">Contact me</Link>
            </Button>
            <Connections />
          </motion.div>
        </div>

        {/* Profile image - right side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-shrink-0 [perspective:1200px]"
        >
          {/* Coin flip: hovering "stealth" reveals ninja mode on the back */}
          <motion.div
            animate={{ rotateY: stealthMode ? 180 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.65, 0, 0.35, 1] }}
            className="relative [transform-style:preserve-3d]"
          >
            <div className="[backface-visibility:hidden]">
              <Image
                src="/images/profile.png"
                alt="Sahil Mahendrakar"
                width={320}
                height={320}
                className="rounded-full"
                priority
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            >
              <Image
                src="/images/profile-ninja.png"
                alt=""
                width={320}
                height={320}
                className="rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
