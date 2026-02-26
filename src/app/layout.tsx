import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0e1a",
};

export const metadata: Metadata = {
  title: "Monthly Expense Intelligence",
  description: "Track expenses, analyze spending patterns, and generate infographic dashboards with Google Sheets integration.",
  keywords: ["expense tracker", "budget", "finance", "dashboard"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Expense Intel",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.variable}>
        {children}
      </body>
    </html>
  );
}
