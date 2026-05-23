"use client";
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/966550240110"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] group"
    >
      {/* Outer Pulse Rings */}
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-10 [animation-delay:1s]" />
      
      {/* Main Button */}
      <div className="relative flex items-center gap-3 bg-green-500 text-white p-4 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)]">
        <MessageCircle size={28} fill="white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold text-sm">
          Chat with Support
        </span>
      </div>
    </motion.a>
  );
};

export default WhatsAppButton;
