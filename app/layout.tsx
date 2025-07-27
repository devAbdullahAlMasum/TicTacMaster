import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeSystemProvider } from "@/hooks/use-theme-system"
import { Toaster } from "@/components/ui/toaster"
import { SettingsProvider } from "@/hooks/use-settings"
import { GlobalSoundProvider } from "@/components/global-sound-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TicTacMaster",
  description: "The ultimate Tic Tac Toe experience",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeSystemProvider defaultTheme="light">
            <SettingsProvider>
              <GlobalSoundProvider>{children}</GlobalSoundProvider>
              <Toaster />
            </SettingsProvider>
          </ThemeSystemProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
