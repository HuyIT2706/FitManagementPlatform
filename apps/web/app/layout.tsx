import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "../assets/css/globals.css";
import { ToastContainer } from "../utils/toast";
import { ThemeProvider } from "../context/ThemeContext";
import PushNotificationSync from "../components/common/PushNotificationSync";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#090d0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NutriCore",
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="vi"
      className={`dark ${plusJakartaSans.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('nutricore-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-background text-on-surface font-sans">
        <ThemeProvider>
          {children}
          <PushNotificationSync />
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
