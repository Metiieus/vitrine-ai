'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ExemploDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Obter usuário logado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // 2️⃣ Obter perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setError('Erro ao carregar perfil');
          return;
        }

        setProfile(profileData);

        // 3️⃣ Obter negócios do usuário
        const { data: businessesData, error: businessesError } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (businessesError) {
          setError('Erro ao carregar negócios');
          return;
        }

        setBusinesses(businessesData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 bg-red-50 border-red-200">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>Voltar ao início</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#04342C]">
              Bem-vindo, {profile?.name || 'Usuário'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Email: {user?.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Plano do usuário */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-[#E1F5EE] to-[#9FE1CB] border-[#1D9E75]">
          <h2 className="text-lg font-bold text-[#04342C] mb-2">Seu plano:</h2>
          <p className="text-2xl font-bold text-[#1D9E75] capitalize">
            {profile?.plan === 'free' ? 'Gratuito' : 
             profile?.plan === 'essential' ? 'Essencial' :
             profile?.plan === 'pro' ? 'Profissional' :
             'Agência'}
          </p>
          <Button className="mt-4 bg-[#1D9E75] hover:bg-[#0F6E56]">
            Mudar plano
          </Button>
        </Card>

        {/* Negócios */}
        <div>
          <h2 className="text-2xl font-bold text-[#04342C] mb-4">
            Seus negócios ({businesses.length})
          </h2>

          {businesses.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                Você ainda não conectou nenhum negócio.
              </p>
              <Button className="bg-[#1D9E75] hover:bg-[#0F6E56]">
                Conectar primeiro negócio
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {businesses.map((business) => (
                <Card key={business.id} className="p-6 hover:shadow-lg transition">
                  <h3 className="text-xl font-bold text-[#04342C] mb-2">
                    {business.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{business.category}</p>
                  
                  {business.audit_score !== null && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Score de auditoria:</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#1D9E75] h-2 rounded-full"
                          style={{ width: `${business.audit_score}%` }}
                        />
                      </div>
                      <p className="text-center font-bold text-[#1D9E75] mt-1">
                        {business.audit_score}/100
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push(`/auditoria/${business.id}`)}
                    >
                      Auditar
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ===== TEMPLATE PARA REUTILIZAR =====
 * 
 * Copie este padrão para outras páginas:
 * 
 * 1. Importar createBrowserClient do Supabase
 * 2. No useEffect, chamar:
 *    - supabase.auth.getUser() → validar autenticação
 *    - supabase.from('tabela').select().eq('user_id', user.id)
 * 3. Renderizar dados
 * 
 * Dicas:
 * - Usar admin client (createAdminClient) APENAS em server-side (API routes)
 * - Validate user.id matches para segurança extra (RLS já faz isso)
 * - Usar { ascending: false } para ordenar por criação mais recente
 * - Sempre handle errors com try-catch
 */
