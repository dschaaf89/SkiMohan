import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import { ModalProvider } from '@/providers/modal-provider'
import { ToastProvider } from '@/providers/toast-providers'

import './globals.css'
import Footer from '@/components/footer'




const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mohan Ski School Admin Dashboard',
  description: 'Created by Daniel Schaaf for Mohan Ski School',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
 
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider/>
        <ModalProvider />
        {children}
        </body>
        {/* <Footer/> */}
    </html>
    </ClerkProvider>
  )
}
