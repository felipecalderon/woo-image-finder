'use client'
import React from 'react'
import { AuroraBackground } from './ui/aurora-background'
import { motion } from 'framer-motion'

type BackgroundProps = {
    children: React.ReactNode
}
export default function Background({ children }: BackgroundProps) {
    return (
        <AuroraBackground>
            <motion.div
                initial={{ opacity: 0.0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: 'easeInOut',
                }}
                className="relative min-h-screen pt-10"
            >
                {children}
            </motion.div>
        </AuroraBackground>
    )
}
