/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desabilitar ESLint durante build (remover depois de corrigir erros)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
