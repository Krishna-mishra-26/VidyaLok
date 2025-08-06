import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
