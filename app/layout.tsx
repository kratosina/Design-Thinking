import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LARAS — Platform Manajemen Waktu Mahasiswa",
  description:
    "Memadukan antara keseimbangan Belajar, Mental, Tenaga, dan Bersenang Senang. Platform manajemen waktu yang membantu mahasiswa mengatur jadwal, menentukan prioritas, dan mengelola beban kegiatan melalui Desk planner, Coin Energy, dan Commitment Ticket.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} bg-black text-white dark`}
    >
      <body className="min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
