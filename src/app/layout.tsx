import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";
import { AuthSessionProvider } from "@/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VidyaLok - AI Powered Smart Library Management",
  description: "AI-Powered Smart Library Ecosystem Management and Engagement Platform for APSIT",
  keywords: ["library", "management", "AI", "smart", "books", "students", "APSIT"],
  authors: [{ name: "VidyaLok Team" }],
  creator: "VidyaLok",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthSessionProvider>
          <div className="relative flex min-h-screen flex-col">
            {children}
            <ChatbotWidget />
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
