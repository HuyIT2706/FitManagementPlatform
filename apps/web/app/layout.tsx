import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FitManagementPlatform",
  description: "FitManagementPlatform Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
