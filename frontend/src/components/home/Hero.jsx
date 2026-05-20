"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Left Side: Strict Dark Mode Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 text-center lg:text-left"
        >
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase font-ginto">
            Elevate <br />
            <span className="text-discord-blurple">Everything.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Wavi Store is your premium bridge to elite digital subscriptions, gaming coins, and social services. Experience instant delivery in the GCC.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
            {/* Primary CTA: Vibrant Blurple */}
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#4752C4", boxShadow: "0 0 40px rgba(88, 101, 242, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-discord-blurple text-white font-black text-lg flex items-center justify-center gap-3 transition-all"
            >
              Explore Store <ShoppingBag size={22} />
            </motion.button>
            
            {/* Secondary CTA: Dark Glassmorphism */}
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white font-black text-lg flex items-center justify-center gap-3 transition-all"
            >
              How it Works <ArrowRight size={22} />
            </motion.button>
          </div>
        </motion.div>

        {/* Right Side: The "Discord Scene" Composition */}
        <div className="relative h-[600px] w-full flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-[550px] aspect-square">
            
            {/* 1. Main Device (Center/Back) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, y: [-15, 15, -15] }}
              transition={{ 
                opacity: { duration: 1 },
                scale: { duration: 1 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute inset-0 z-10 flex items-center justify-center"
            >
              <div className="relative w-[100%] h-[100%]">
                <Image 
                  src="/3d-playstation-5.webp"
                  alt="Main Gaming Device"
                  fill
                  className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
                  priority
                />
              </div>
            </motion.div>

            {/* 2. Phone / Social Element (Overlapping Right) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0, y: [15, -15, 15] }}
              transition={{ 
                opacity: { duration: 1, delay: 0.3 },
                x: { duration: 1, delay: 0.3 },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
              }}
              className="absolute top-[20%] -right-10 w-[50%] aspect-square z-20"
            >
              <div className="relative w-full h-full p-4">
                <Image 
                  src="/3d-rendered-chat-bubble-icon-purple-circle.png"
                  alt="Phone Interaction"
                  fill
                  className="object-contain drop-shadow-[0_20px_40px_rgba(88,101,242,0.3)] rotate-[15deg]"
                />
              </div>
            </motion.div>

            {/* 3. Controller (Overlapping Bottom/Front) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0, x: [-10, 10, -10] }}
              transition={{ 
                opacity: { duration: 1, delay: 0.6 },
                y: { duration: 1, delay: 0.6 },
                x: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }
              }}
              className="absolute -bottom-10 left-0 w-[60%] aspect-square z-30"
            >
              <div className="relative w-full h-full">
                <Image 
                  src="/gamepad-game-controller-icon-isolated-3d-.webp"
                  alt="Gaming Controller"
                  fill
                  className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] -rotate-[10deg]"
                />
              </div>
            </motion.div>

            {/* Background Glow for Scene */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-discord-blurple/10 blur-[150px] rounded-full -z-10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent opacity-50" />
    </section>
  );
};

export default Hero;
