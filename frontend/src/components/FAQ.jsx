'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHomeFaqs } from '@/services/storefront.service.js';

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        className="w-full py-6 flex items-center justify-between text-right gap-4 group focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-lg sm:text-xl font-black group-hover:text-gold transition-colors duration-200 ${isOpen ? 'text-gold' : 'text-white'}`}>
          {question}
        </span>
        <div className={`p-1.5 rounded-lg bg-white/5 group-hover:bg-gold/10 group-hover:text-gold transition-all duration-300 ${isOpen ? 'rotate-180 text-gold' : 'text-text/30'}`}>
          <ChevronDown size={20} />
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-base sm:text-lg text-text/50 font-medium leading-relaxed pr-2">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const [groupedCategories, setGroupedCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const data = await getHomeFaqs();
        setGroupedCategories(data);
        if (data.length > 0) {
          // Set the first active category as selected by default
          setActiveCategoryId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFaqs();
  }, []);

  const activeCategory = groupedCategories.find(cat => cat.id === activeCategoryId);

  return (
    <section className="py-32 px-6 relative bg-background overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gold/10 border border-gold/20 rounded-2xl mb-4">
            <HelpCircle className="text-gold" size={24} />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">
            الأسئلة الشائعة
          </h2>
          <p className="text-text/50 text-base sm:text-xl font-semibold max-w-xl mx-auto">
            كل ما يدور في ذهنك حول خدمات متجر وافي وإجاباتها الفنية الشاملة
          </p>
        </div>

        {loading ? (
          /* Premium Pulse Accordion Loading Skeletons */
          <div className="space-y-6">
            <div className="flex gap-3 justify-center mb-10 overflow-x-auto pb-2">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-12 w-32 bg-white/5 rounded-full animate-pulse" />
              ))}
            </div>
            <div className="glass-card p-8 space-y-6">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="border-b border-white/5 pb-6 last:border-0">
                  <div className="h-8 bg-white/5 rounded-full w-3/4 animate-pulse mb-3" />
                  <div className="h-6 bg-white/5 rounded-full w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : groupedCategories.length === 0 ? (
          /* Fallback static layout if no FAQ Categories are set in database */
          <div className="glass-card px-8">
            <AccordionItem
              question="كم يستغرق وقت تسليم المنتج؟"
              answer="معظم منتجاتنا يتم تسليمها فورياً وتلقائياً بعد الدفع مباشرة عبر رسائل الجوال والبريد الإلكتروني وحسابكم الشخصي."
            />
            <AccordionItem
              question="هل معلوماتي وكلمات المرور آمنة؟"
              answer="بكل تأكيد. نحن نستخدم أنظمة تشفير متطورة ولا نطلب أي معلومات حساسة غير ضرورية لإتمام عملية الشحن أو التفعيل."
            />
            <AccordionItem
              question="كيف أقوم بتفعيل الاشتراك بعد الشراء؟"
              answer="ستصلك رسالة نصية أو بريد إلكتروني يحتوي على كود التفعيل مع رابط شرح مفصل لكل خطوة لتسهيل العملية عليك."
            />
          </div>
        ) : (
          <div>
            {/* Category Navigation Tabs (Pills Layout) */}
            {groupedCategories.length > 1 && (
              <div className="flex flex-wrap gap-3 justify-center mb-10 overflow-x-auto pb-2 scrollbar-hide">
                {groupedCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`px-6 py-3 rounded-full text-sm font-black transition-all duration-300 ${
                      activeCategoryId === category.id
                        ? 'bg-gold text-black gold-glow shadow-lg'
                        : 'bg-card/60 border border-white/5 text-text-muted hover:border-gold/30 hover:text-white'
                    }`}
                  >
                    {category.nameAr}
                  </button>
                ))}
              </div>
            )}

            {/* Questions List for active category */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-card px-8 py-4 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl bg-card/60"
            >
              {activeCategory && activeCategory.faqs && activeCategory.faqs.length > 0 ? (
                activeCategory.faqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    question={faq.questionAr}
                    answer={faq.answerAr}
                  />
                ))
              ) : (
                <div className="py-12 text-center text-text/40 font-bold">
                  لا توجد أسئلة مضافة في هذا القسم حالياً.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
