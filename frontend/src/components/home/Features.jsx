"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Headset } from 'lucide-react';

const features = [
  {
    icon: <Truck size={40} className="text-primary-gold" />,
    title: "Instant Delivery",
    description: "Receive your digital keys and account details immediately after payment."
  },
  {
    icon: <ShieldCheck size={40} className="text-primary-gold" />,
    title: "Secure Payment",
    description: "We use high-level encryption to ensure your transactions are always safe."
  },
  {
    icon: <Headset size={40} className="text-primary-gold" />,
    title: "24/7 Support",
    description: "Our dedicated support team is always available to help you with any issues."
  }
];

const Features = () => {
  return (
    <section className="py-24 px-6 bg-black/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="mb-8 p-6 rounded-full bg-white/5 border border-white/10 group-hover:bg-primary-gold/10 group-hover:border-primary-gold/30 transition-all duration-500 transform group-hover:rotate-12">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-white/40 leading-relaxed max-w-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
