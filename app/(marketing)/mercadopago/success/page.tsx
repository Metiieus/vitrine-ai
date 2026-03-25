'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function MercadoPagoSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(
        error === 'payment_failed'
          ? 'Pagamento não autorizado. Tente novamente.'
          : 'Erro ao processar pagamento.'
      );
      return;
    }

    if (status === 'approved' || paymentId) {
      setStatus('success');
      setMessage('Pagamento recebido com sucesso!');

      // Redirecionar para dashboard após 3 segundos
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

      return () => clearTimeout(timer);
    } else if (status === 'pending') {
      setStatus('loading');
      setMessage('Pagamento pendente. Acompanharemos o status...');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E1F5EE] to-[#9FE1CB] p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-[#1D9E75] animate-spin" />
              <h1 className="text-2xl font-bold text-[#04342C] mb-2">
                Processando Pagamento
              </h1>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-[#1D9E75]" />
              <h1 className="text-2xl font-bold text-[#04342C] mb-2">
                Pagamento Aprovado!
              </h1>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#E24B4A]" />
              <h1 className="text-2xl font-bold text-[#04342C] mb-2">
                Erro no Pagamento
              </h1>
            </>
          )}

          <p className="text-gray-600 mb-6">{message}</p>

          {status === 'success' && (
            <p className="text-sm text-gray-500 mb-6">
              Você será redirecionado para o dashboard em poucos segundos...
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Voltar ao Início
            </Button>
            {(status === 'error' || status === 'loading') && (
              <Button
                onClick={() => router.push('/precos')}
                className="flex-1 bg-[#1D9E75] hover:bg-[#0F6E56]"
              >
                Tentar Novamente
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Wrapper com Suspense para evitar erros de pré-renderização
export default function MercadoPagoSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E1F5EE] to-[#9FE1CB]">
        <div className="animate-spin">
          <Loader2 className="w-8 h-8 text-[#1D9E75]" />
        </div>
      </div>
    }>
      <MercadoPagoSuccessContent />
    </Suspense>
  );
}
