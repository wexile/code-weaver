import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'Code Weaver',
  description: 'An intelligent code editor',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const faviconSvg = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="256pt" height="256pt" viewBox="0 0 256 256" preserveAspectRatio="xMidYMid meet"><g transform="translate(0,256) scale(0.1,-0.1)" fill="hsl(240 3.7% 15.9%)" stroke="none"><path d="M0 1280 l0 -1280 1280 0 1280 0 0 1280 0 1280 -1280 0 -1280 0 0 -1280z m924 329 c31 -11 77 -40 103 -64 l48 -44 -65 -59 -65 -60 -32 29 c-82 71 -200 56 -267 -34 -16 -22 -21 -43 -21 -96 0 -59 4 -72 28 -104 37 -49 80 -70 142 -70 56 0 86 12 128 51 l28 26 61 -62 62 -61 -28 -30 c-15 -16 -56 -44 -90 -63 -58 -31 -67 -33 -161 -33 -84 0 -107 4 -147 24 -75 37 -134 95 -170 169 -30 61 -33 75 -33 157 0 78 4 98 28 147 35 71 119 150 190 177 72 28 188 28 261 0z m344 -1 c6 -7 34 -96 63 -196 29 -101 56 -178 59 -171 3 8 32 95 65 194 l60 180 83 3 c91 3 106 -3 117 -46 3 -15 29 -98 57 -186 45 -143 51 -156 62 -135 10 22 19 24 90 27 44 2 83 -1 87 -5 5 -5 -15 -80 -44 -168 l-52 -160 -84 0 c-64 0 -86 4 -92 15 -5 8 -36 102 -70 209 -38 120 -64 189 -69 180 -4 -8 -33 -97 -65 -199 -32 -102 -63 -191 -68 -197 -6 -9 -37 -13 -88 -13 -64 0 -80 3 -87 18 -5 9 -53 156 -106 325 -77 244 -95 312 -85 323 15 18 152 20 167 2z m841 -2 c10 -12 3 -45 -34 -160 l-46 -146 -84 0 c-46 0 -86 4 -89 8 -6 10 72 282 86 300 15 18 152 16 167 -2z"/><path d="M934 1515 c-4 -9 -2 -21 4 -27 15 -15 44 -1 40 19 -4 23 -36 29 -44 8z"/></g></svg>`;
  const faviconDataUri = `data:image/svg+xml;base64,${btoa(faviconSvg)}`;

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href={faviconDataUri} type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code&display=swap" rel="stylesheet"></link>
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
