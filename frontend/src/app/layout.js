import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'وافي ستور | عالم الترفيه الرقمي بين يديك',
  description: 'المتجر الأول في الخليج لاشتراكات المشاهدة، شحن الألعاب، وخدمات السوشيال ميديا. تسليم فوري ودفع آمن.',
  openGraph: {
    title: 'وافي ستور | عالم الترفيه الرقمي بين يديك',
    description: 'المتجر الأول في الخليج لاشتراكات المشاهدة، شحن الألعاب، وخدمات السوشيال ميديا. تسليم فوري ودفع آمن.',
    siteName: 'Wavi Store',
    locale: 'ar_SA',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-noto bg-background text-white">
        <Toaster position="bottom-left" />
        {children}
      </body>
    </html>
  );
}
