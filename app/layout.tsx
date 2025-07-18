import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Malla Curricular Interactiva",
  description: "Gestiona tu progreso académico universitario",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MallaApp",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "msapplication-TileColor": "#3b82f6",
    "msapplication-TileImage": "/icon-512.png",
    "msapplication-square70x70logo": "/icon-192.png",
    "msapplication-square150x150logo": "/icon-192.png",
    "msapplication-wide310x150logo": "/icon-512.png",
    "msapplication-square310x310logo": "/icon-512.png",
    "msapplication-starturl": "/",
    "application-name": "MallaApp",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" dir="ltr">
      <head>
        {/* iOS Meta Tags */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MallaApp" />

        {/* Windows Meta Tags */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/icon-512.png" />
        <meta name="msapplication-square70x70logo" content="/icon-192.png" />
        <meta name="msapplication-square150x150logo" content="/icon-192.png" />
        <meta name="msapplication-wide310x150logo" content="/icon-512.png" />
        <meta name="msapplication-square310x310logo" content="/icon-512.png" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="application-name" content="MallaApp" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* General PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png" />
        <link rel="shortcut icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
