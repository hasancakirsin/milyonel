import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MilyonEl - Birlikte Al, Daha Ucuza Al',
  description: 'Toplu alışveriş kampanyaları ile ürünleri çok daha uygun fiyata satın alın',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
