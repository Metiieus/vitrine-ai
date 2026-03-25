'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutButtonProps {
  plan: 'essential' | 'pro' | 'agency';
  planName: string;
  price: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function CheckoutButton({
  plan,
  planName,
  price,
  disabled = false,
  className = '',
  variant = 'default',
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheckout() {
    try {
      setIsLoading(true);

      // 1. Chamar API para criar preferência
      const response = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        toast.error(error.error || 'Erro ao iniciar checkout');
        setIsLoading(false);
        return;
      }

      const { init_point } = (await response.json()) as { init_point: string };

      // 2. Redirecionar para Mercado Pago (não usar router.push para não ter delay)
      if (init_point) {
        // Usar window.location para redirecionamento instantâneo
        window.location.href = init_point;
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast.error('Erro ao processar pagamento');
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      variant={variant}
      size="lg"
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        `Assinar ${planName} - R$${price}/mês`
      )}
    </Button>
  );
}
