import React from "react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./css/globals.css";
import {ThemeModeScript, ThemeProvider } from "flowbite-react";
import customTheme from "@/utils/theme/custom-theme";
import { CustomizerContextProvider } from "@/app/context/CustomizerContext";
import AuthProvider from "@/app/context/AuthProvider";
import "../utils/i18n";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "@/app/components/shadcn-ui/Default-Ui/toaster"
const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Softmerce — SaaS Business Operating System",
  description: "AI-Powered, Multi-Tenant SaaS Business Operating System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning >
      <head>
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <ThemeModeScript />
      </head>
      <body className={`${manrope.className}`}>
        <AuthProvider>
          <ThemeProvider theme={customTheme}>
            <NextTopLoader color="var(--color-primary)" />
            <CustomizerContextProvider>{children}</CustomizerContextProvider>
          </ThemeProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
