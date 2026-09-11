import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LE28NoticeModal from "@/components/LE28NoticeModal";

export const metadata: Metadata = {
  title: "VASP TRACE — Forensics Workstation v2.4",
  description:
    "Multi-hop blockchain transaction tracing, unhosted address identification, VASP candidate exchange ranking, and ISO/IEC 27037 digital evidence reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface-container-lowest text-on-surface font-display antialiased selection:bg-primary-container selection:text-on-primary-container">
        <Sidebar />
        <Header />
        <main className="pl-64 pt-14 min-h-screen bg-surface-container-lowest">
          {children}
        </main>
        <LE28NoticeModal />
      </body>
    </html>
  );
}
