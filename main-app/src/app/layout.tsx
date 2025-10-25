import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext'
import { LoadingProvider } from '@/context/LoadingContext'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EasyHome - Imóveis em Goiânia | Casas, Apartamentos e Terrenos",
  description: "Encontre o imóvel dos seus sonhos em Goiânia. Casas, apartamentos, terrenos e imóveis comerciais com os melhores preços e localizações. Busca inteligente de imóveis.",
  keywords: ["imóveis Goiânia", "casas Goiânia", "apartamentos Goiânia", "terrenos Goiânia", "imóveis comerciais", "comprar casa", "aluguel"],
  authors: [{ name: "EasyHome" }],
  creator: "EasyHome Real Estate Platform",
  publisher: "EasyHome",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'http://localhost:4100',
    title: 'EasyHome - Imóveis em Goiânia',
    description: 'Encontre casas, apartamentos e terrenos em Goiânia com a EasyHome',
    siteName: 'EasyHome',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
