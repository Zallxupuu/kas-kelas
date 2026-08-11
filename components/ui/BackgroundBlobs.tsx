"use client";

import { motion } from "framer-motion";

export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"
      />
      
      <motion.div
        animate={{
          y: [0, 40, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-600/15 rounded-full blur-[100px]"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]"
      />
    </div>
  );
}
