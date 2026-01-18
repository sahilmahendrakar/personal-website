'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="min-h-[90vh] flex flex-col justify-center py-20 md:py-32">
      <div className="max-w-3xl">
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
          className="text-md md:text-base text-muted-foreground font-semibold mb-10 max-w-2xl"
        >
          Software Engineer at AWS • Former founder & CTO • Building AI learning tools
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-4"
        >
          <Button asChild size="lg" className="text-base px-6">
            <Link href="#projects">See projects</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base px-6">
            <Link href="#contact">Contact me</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
