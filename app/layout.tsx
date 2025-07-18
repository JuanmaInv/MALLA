import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Malla Curricular Interactiva",
  description: "Gestiona tu progreso académico universitario",
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#3b82f6",
    "msapplication-TileImage": "https://via.placeholder.com/512x512/3b82f6/ffffff?text=MA",
    "msapplication-square70x70logo": "https://via.placeholder.com/192x192/3b82f6/ffffff?text=MA",
    "msapplication-square150x150logo": "https://via.placeholder.com/192x192/3b82f6/ffffff?text=MA",
    "msapplication-wide310x150logo": "https://via.placeholder.com/512x512/3b82f6/ffffff?text=MA",
    "msapplication-square310x310logo": "https://via.placeholder.com/512x512/3b82f6/ffffff?text=MA",
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Windows Meta Tags */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="https://via.placeholder.com/512x512/3b82f6/ffffff?text=MA" />
        <meta
          name="msapplication-square70x70logo"
          content="https://via.placeholder.com/192x192/3b82f6/ffffff?text=MA"
        />
        <meta
          name="msapplication-square150x150logo"
          content="https://via.placeholder.com/192x192/3b82f6/ffffff?text=MA"
        />
        <meta
          name="msapplication-wide310x150logo"
          content="https://via.placeholder.com/512x512/3b82f6/ffffff?text=MA"
        />
        <meta
          name="msapplication-square310x310logo"
          content="https://via.placeholder.com/512x512/3b82f6/ffffff?text=MA"
        />
        <meta name="msapplication-starturl" content="/" />
        <meta name="application-name" content="MallaApp" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Favicon */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://via.placeholder.com/192x192/3b82f6/ffffff?text=MA"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="https://via.placeholder.com/192x192/3b82f6/ffffff?text=MA"
        />
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
