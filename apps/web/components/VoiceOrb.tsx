'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * VoiceOrb is memoized with `React.memo` to prevent unnecessary re-renders
 * and Framer Motion animation keyframe recalculations when parent `Dashboard`
 * re-renders on keystrokes (e.g. while typing chat messages or inputting tokens).
 */
export const VoiceOrb = memo(function VoiceOrb({ listening }: { listening: boolean }) {
  return (
    <motion.div animate={{ scale: listening ? [1, 1.08, 1] : 1 }} transition={{ repeat: Infinity, duration: 1.8 }} className="relative mx-auto h-44 w-44 rounded-full bg-cyan-400/10 shadow-neon">
      <div className="absolute inset-5 rounded-full border border-cyan-300/50" />
      <div className="absolute inset-12 rounded-full bg-cyan-300/30 blur-md" />
      <div className="absolute inset-0 grid place-items-center text-3xl font-bold text-cyan-200 neon-text">J</div>
    </motion.div>
  );
});
