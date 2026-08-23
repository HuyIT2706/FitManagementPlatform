/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "../assets/css/globals.css";
import { ToastContainer } from "../utils/toast";

export const metadata: Metadata = {
  title: "NutriCore",
  description: "NutriCore - Nền tảng Quản lý Dinh dưỡng & Thể hình",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="bg-background text-on-surface">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
};

export default RootLayout;
