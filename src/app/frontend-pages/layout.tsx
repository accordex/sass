"use client";
import { ThemeProvider } from "flowbite-react";
import customTheme from "@/utils/theme/custom-theme";
import AnnouncementBar from "../components/front-pages/layout/AnnouncementBar";
import FrontHeader from "../components/front-pages/layout/Header";
import { Footer } from "../components/front-pages/layout/Footer";
 
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="frontend-page bg-white dark:bg-dark">
       <ThemeProvider theme={customTheme}>
        {/* Header */}
        <AnnouncementBar />
        <FrontHeader />
        {/* Content */}
        <section>{children}</section>
        {/* Footer */}
        <Footer />
      </ThemeProvider>
    </div>
  );
}
