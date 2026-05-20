"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Monitor, Gamepad2, Users, CreditCard } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    id: 'iptv',
    title: 'Watch Packages',
    description: 'Premium IPTV with 4K support and 10k+ channels.',
    icon: <Monitor size={32} className="text-secondary-blue" />,
    image: '/3d-cinema.png',
    color: 'from-blue-500/20 to-cyan-500/20',
    href: '/category/iptv'
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    description: 'YouTube Premium, Netflix, Spotify & more.',
    icon: <CreditCard size={32} className="text-primary-gold" />,
    image: '/black-credit-card-with-percent-icon-icon-3d-illustration.png',
    color: 'from-gold-500/20 to-amber-500/20',
    href: '/category/subscriptions'
  },
  {
    id: 'gaming',
    title: 'Gaming Coins',
    description: 'EA FC 26, PUBG UC, Free Fire Diamonds.',
    icon: <Gamepad2 size={32} className="text-secondary-purple" />,
    image: '/3d-illustration-children-s-toy-gaming-controller.png',
    color: 'from-purple-500/20 to-pink-500/20',
    href: '/category/gaming'
  },
  {
    id: 'social',
    title: 'Social Services',
    description: 'Followers, Likes & Views for all platforms.',
    icon: <Users size={32} className="text-green-500" />,
    image: '/3d-rendered-chat-bubble-icon-purple-circle.png',
    color: 'from-green-500/20 to-emerald-500/20',
    href: '/category/social'
  }
];

const CategoryGrid = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black mb-4">Browse <span className="text-gold">Categories</span></h2>
          <p className="text-white/50 max-w-md">Find exactly what you need from our wide range of premium digital products.</p>
        </div>
        <Link href="/store" className="text-primary-gold font-bold hover:underline">View all products →</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={cat.href} className="group block h-full">
              <div className="glass h-full p-8 rounded-[2.5rem] transition-all duration-500 group-hover:bg-white/10 group-hover:-translate-y-2 relative overflow-hidden flex flex-col">
                {/* Accent Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Floating 3D Image */}
                  <div className="relative h-48 w-full mb-6">
                    <motion.div
                      animate={{ y: [-5, 10, -5] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                      className="relative w-full h-full"
                    >
                      <Image 
                        src={cat.image}
                        alt={cat.title}
                        fill
                        className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                      />
                    </motion.div>
                  </div>

                  <div className="mt-auto">
                    <div className="mb-4 p-3 w-fit rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-500">
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                    <p className="text-white/40 text-xs leading-relaxed">{cat.description}</p>
                  </div>
                </div>

                {/* Floating Glow */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:bg-primary-gold/20 transition-all duration-500" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
