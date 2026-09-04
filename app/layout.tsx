import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AppProvider } from "@/lib/AppContext";
import { AuthProvider } from "@/lib/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LelisaCV Builder - AI Career Assistant",
  description:
    "Create professional CVs, cover letters, and application letters with AI-powered assistance for students and fresh graduates.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Merriweather:wght@300;400;700;900&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;900&family=Roboto:wght@400;500;700;900&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Puter.js Multi-AI Provider Bridge */}
        <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />
        <AuthProvider>
          <AppProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
