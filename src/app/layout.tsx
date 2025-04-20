"use client"

import React from "react"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Use Inter font instead of Geist to avoid hydration issues
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const metadata: Metadata = {
  title: "rForms | Goal-Oriented Adaptive Questionnaires",
  description: "AI-powered adaptive surveys that intelligently drill down on metrics that matter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
