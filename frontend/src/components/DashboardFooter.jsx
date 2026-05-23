"use client";
import React from 'react';

const QEEMA_SITE = 'https://www.qeematech.net/';

export default function DashboardFooter() {
  return (
    <footer
      className="w-full py-4 text-text/40 border-t border-white/5 bg-[#0a0a0a]/30 backdrop-blur-sm"
      role="contentinfo"
      dir="rtl"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        {/* Right: Copyright */}
        <p className="order-2 text-center text-xs font-bold text-text/30 sm:order-1">
          جميع الحقوق محفوظة © {new Date().getFullYear()} · متجر وافي الرقمي
        </p>

        {/* Center: Brand pill */}
        <a
          href={QEEMA_SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="order-1 flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 shadow-sm transition-all hover:border-gold/30 hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] focus:outline-none focus:ring-1 focus:ring-gold sm:order-2 group"
          aria-label="Qeema Tech - قيمة تك"
        >
          <img
            src="/qeema%20letters.svg"
            alt="Qeema Tech"
            className="h-5 w-auto object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          />
          <span className="text-xs font-black tracking-tight text-gray-300 group-hover:text-gold transition-colors duration-300">
            قيمة تك
          </span>
        </a>

        {/* Left: Tagline */}
        <p className="order-3 hidden text-right text-xs font-bold text-text/30 sm:block">
          تطوير <span className="text-gray-300 hover:text-gold transition-colors duration-300">قيمة تك</span>
        </p>
      </div>
    </footer>
  );
}
