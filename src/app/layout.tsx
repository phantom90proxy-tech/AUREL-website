import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Store } from "@/components/store";
import { PageTransition } from "@/components/motion";
import { CircleCursor } from "@/components/circle-cursor";
import "./globals.css";
const serif = localFont({
  src: "../../public/fonts/CormorantGaramond-Medium.ttf",
  variable: "--font-serif",
  display: "swap",
});
const sans = localFont({
  src: "../../public/fonts/Inter_18pt-SemiBold.ttf",
  weight: "600",
  variable: "--font-sans",
  display: "swap",
});
export const metadata: Metadata = {
  title: { default: "AUREL — Time, made personal.", template: "%s | AUREL" },
  description:
    "Considered timepieces. Distinctive collections. Discover the world of AUREL — your time, your story.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Store>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </Store>
        <CircleCursor />
      </body>
    </html>
  );
}
