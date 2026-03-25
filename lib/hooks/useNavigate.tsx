'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Hook para gerenciar estados de navegação
 * Útil para mostrar indicadores enquanto a página está carregando
 */
export function useNavigate() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = (href: string) => {
    setIsNavigating(true);
    // Usar setTimeout para melhorar performance
    setTimeout(() => {
      router.push(href);
      // Remover state de loading após transição
      setTimeout(() => setIsNavigating(false), 1000);
    }, 0);
  };

  return { navigate, isNavigating };
}

/**
 * Loading bar global para indicar navegação
 */
export function NavigationLoadingBar(): React.ReactNode {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Mostrar quando começa navegação
    const handleStart = () => {
      setIsVisible(true);
      setProgress(10);
    };

    const handleStop = () => {
      setProgress(100);
      setTimeout(() => setIsVisible(false), 500);
    };

    // Simular progresso enquanto carrega
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p < 90) return p + Math.random() * 30;
        return p;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[#1D9E75] to-[#0F6E56] z-50 transition-all duration-300" style={{ width: `${progress}%` }} />
  );
}
