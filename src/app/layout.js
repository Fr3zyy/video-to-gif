import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Video to GIF Dönüştürücü',
  description: 'Videolarınızı kolayca GIF formatına dönüştürün.',
  openGraph: {
    title: 'Video to GIF Dönüştürücü',
    description: 'Videolarınızı kolayca GIF formatına dönüştürün.',
    url: 'https://yourdomain.com',
    siteName: 'Video to GIF Dönüştürücü',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
