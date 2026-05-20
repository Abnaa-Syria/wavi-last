"use client";
import React from "react";
import { motion } from "framer-motion";

const Background = () => {
  // Generate random positions for floating shapes
  const shapes = Array.from({ length: 15 });

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Base Layer - Deep Indigo/Navy */}
      <div className="absolute inset-0 bg-[#0B0C10]" />
      
      {/* Grid Overlay Layer - Restored and subtle */}
      <div 
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Glowing Focal Blobs - Blurple & Gold */}
      <div className="absolute top-[10%] left-[5%] w-[50%] h-[50%] rounded-full bg-discord-blurple/10 blur-[150px] animate-pulse" />
      <div className="absolute bottom-[10%] right-[5%] w-[50%] h-[50%] rounded-full bg-primary-gold/5 blur-[150px] [animation-delay:3s] animate-pulse" />
      
      {/* Decorative Floating Shapes */}
      {shapes.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.1 + 0.05,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            x: [
              `${Math.random() * 100}%`, 
              `${Math.random() * 100}%`, 
              `${Math.random() * 100}%`
            ],
            y: [
              `${Math.random() * 100}%`, 
              `${Math.random() * 100}%`, 
              `${Math.random() * 100}%`
            ]
          }}
          transition={{ 
            duration: Math.random() * 30 + 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className={`absolute rounded-full blur-[1px] bg-white`}
          style={{
            width: Math.random() * 3 + 1 + "px",
            height: Math.random() * 3 + 1 + "px",
          }}
        />
      ))}
    </div>
  );
};

export default Background;
