import "./globals.css";
import React, { ReactNode } from "react";
import { Roboto } from "next/font/google";
import "react-datepicker/dist/react-datepicker.css";
import { Viewport } from "next";
import { StoreProvider } from "./StoreProvider";



const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

type Props = {
  children: ReactNode;
};

export default async function RootLayout({ children }: Props) {
  
  return (
    <html lang="en" className={roboto.className} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>

      <StoreProvider>
        <body>
          <main>{children}</main>
        </body>
      </StoreProvider>
    </html>
  );
}
