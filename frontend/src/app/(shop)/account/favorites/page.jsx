"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToFavorites() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/favorites');
  }, [router]);

  return null;
}
