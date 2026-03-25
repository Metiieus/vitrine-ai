/**
 * Otimizações de Performance para Vitrine.ai
 * Aplica cache, lazy loading, e otimizações de navegação
 */

// Desabilitar animações desnecessárias em conexões lentas
if (typeof window !== 'undefined') {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--motion-safe', '0s');
  }
}

/**
 * Pré-carregar rotas críticas
 */
export function prefetchRoutes() {
  if (typeof window === 'undefined') return;

  const routes = [
    '/dashboard',
    '/precos',
    '/auditoria',
    '/reviews',
    '/posts',
  ];

  routes.forEach((route) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
}

/**
 * Cache em memória para queries do Supabase
 * Evita re-fetches desnecessários
 */
export class QueryCache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: unknown) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Invalidar se expirou
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const queryCache = new QueryCache();

/**
 * Debounce para evitar múltiplas requisições
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: unknown[]) => void {
  let timeout: NodeJS.Timeout;

  return function (...args: unknown[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Throttle para operações frequentes
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: unknown[]) => void {
  let lastCall = 0;

  return function (...args: unknown[]) {
    const now = Date.now();
    if (now - lastCall >= ms) {
      fn(...args);
      lastCall = now;
    }
  };
}

/**
 * Otimizar scroll events
 */
export function useThrottledScroll(callback: () => void, delay = 250) {
  if (typeof window === 'undefined') return;

  window.addEventListener('scroll', throttle(callback, delay), {
    passive: true,
  });
}
