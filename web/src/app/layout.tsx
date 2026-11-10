import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Poppins } from "next/font/google";
import { InstallApp } from "@/components/InstallApp";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sukoonam",
  description: "Find and book spas near you",
  applicationName: "Sukoonam",
  // On iPhones, "Add to Home Screen" opens full-screen with this name.
  appleWebApp: { capable: true, title: "Sukoonam", statusBarStyle: "default" },
};

// The colour of the phone's top bar while Sukoonam is open.
export const viewport: Viewport = {
  themeColor: "#dc1f32",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <InstallApp />
      </body>
    </html>
  );
}
