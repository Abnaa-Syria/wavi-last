import React from 'react';
import Hero from '@/components/Hero';
import Categories from '@/components/home/Categories';
import ProductGrid from '@/components/home/ProductGrid';
import WhyWavi from '@/components/WhyWavi';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTABanner from '@/components/CTABanner';

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <ProductGrid />
      <WhyWavi />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTABanner />
    </>
  );
}
