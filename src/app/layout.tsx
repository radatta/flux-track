import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NavBar from "@/components/NavBar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FluxTrack - Mood & Energy Journal",
  description: "Track your mood and energy levels with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Suppress the warning about webgpu being already registered
  if (process.env.NODE_ENV === "development") {
    const originalWarn = console.warn;
    console.warn = function (...args) {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("already registered") ||
          args[0].includes("for backend") ||
          args[0].includes("already been set."))
      ) {
        // Suppress this warning
        return;
      }
      originalWarn.apply(console, args);
    };
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NavBar />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
