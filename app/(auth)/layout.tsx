import React, { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Geist } from 'next/font/google';
import { Metadata } from 'next';
import "../globals.css";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "SailorAI",
  description: "A high-fidelity AI chatbot powered by Gemini",
};

const AuthLayout = ({children}: {children: ReactNode}) => {
  return (
        <html lang="en" className={cn("font-sans", geist.variable)}>
          <body className="antialiased">
            {children}
          </body>
        </html>
  )
}

export default AuthLayout