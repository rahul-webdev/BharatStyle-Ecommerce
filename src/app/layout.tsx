import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import HolyLoader from "holy-loader";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";
import dbConnect from "@/lib/dbConnect";
import SiteSettings from "@/models/SiteSettings";
import { siteConfig } from "@/lib/config";

export async function generateMetadata(): Promise<Metadata> {
  try {
    await dbConnect();
    const settings = await SiteSettings.findOne({});
    return {
      title: settings?.siteName || siteConfig.name || "StoreName",
      description: settings?.siteDescription || siteConfig.description || "Ecommerce website",
    };
  } catch (error) {
    return {
      title: siteConfig.name || "StoreName",
      description: siteConfig.description || "Ecommerce website",
    };
  }
}

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={satoshi.className}>
        <HolyLoader color="#868686" />
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
