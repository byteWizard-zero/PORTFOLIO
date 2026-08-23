import type { Metadata, Viewport } from "next";
import { Doppio_One } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BackToTop } from "@/components/ui/BackToTop";
import { MobileBlockOverlay } from "@/components/ui/MobileBlockOverlay/MobileBlockOverlay";
import { AccentColorProvider } from "@/lib/AccentColorContext";
import { LenisProvider } from "@/lib/LenisProvider";
import { ViewportFrame } from "@/components/ui/ViewportFrame";
import { Navbar } from "@/components/layout/Navbar";
import {
  TransitionProvider,
  TransitionStage,
  PageReadyNotifier,
} from "@/components/transitions";
import { siteMetadata } from "@/data";

import { ClientInteractiveBackground } from "@/components/ui/ClientInteractiveBackground";

const doppioOne = Doppio_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-navbar",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: siteMetadata.title,
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: siteMetadata.author }],
  alternates: { canonical: "/" },
  openGraph: {
    title: siteMetadata.openGraph.title,
    description: siteMetadata.openGraph.description,
    type: siteMetadata.openGraph.type,
    locale: siteMetadata.openGraph.locale,
    siteName: siteMetadata.openGraph.siteName,
  },
  twitter: {
    card: "summary_large_image",
    creator: siteMetadata.twitter.creator,
  },
  verification: {
    google: "is3luZHcfrQGitGlHhobsUHecT6KGQqqlKphDNLZ9_s",
  },
};

export const viewport: Viewport = {
  themeColor: siteMetadata.themeColor,
};

const BOOTSTRAP_SCRIPT = `
(function(){try{if(localStorage.getItem("portfolio_theme")==="dark"){document.documentElement.setAttribute("data-theme","dark")}}catch(e){}})();
if("scrollRestoration"in history){history.scrollRestoration="manual"}
window.scrollTo(0,0);
window.__freshLoad=true;
(function(){
  var isDark=document.documentElement.getAttribute("data-theme")==="dark";
  var bg=isDark?"#171717":"#FFFFFF";
  var overlay=document.createElement("div");
  overlay.id="welcome-gate";
  overlay.setAttribute("aria-hidden","true");
  overlay.style.cssText="position:fixed;inset:0;z-index:9998;background-color:"+bg+";pointer-events:none;transition:opacity 0.3s ease;";
  document.body.appendChild(overlay);
  if(window.location.pathname!=="/"){
    document.addEventListener("DOMContentLoaded",function(){
      var g=document.getElementById("welcome-gate");
      if(g){g.style.opacity="0";setTimeout(function(){g.remove()},350)}
    });
  }
})();
window.addEventListener("pageshow",function(e){
  if(e.persisted){window.location.reload()}
});
document.addEventListener("dragstart", function(e) {
  if (e.target && e.target.tagName === "IMG") {
    e.preventDefault();
  }
}, { passive: false });
`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteMetadata.person.name,
  jobTitle: siteMetadata.person.jobTitle,
  url: siteMetadata.siteUrl,
  description: siteMetadata.description,
  sameAs: siteMetadata.person.sameAs,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={doppioOne.variable} suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:shadow-lg focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <script
          dangerouslySetInnerHTML={{
            __html: BOOTSTRAP_SCRIPT,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <LenisProvider>
          <AccentColorProvider>
            <TransitionProvider>
              <ClientInteractiveBackground />
              <Navbar />
              <CustomCursor />
              <BackToTop />
              <ThemeToggle />
              <ViewportFrame />
              <MobileBlockOverlay />
              <PageReadyNotifier>
                <main id="main-content">
                  {children}
                </main>
              </PageReadyNotifier>
              <TransitionStage />
            </TransitionProvider>
          </AccentColorProvider>
        </LenisProvider>
      </body>
    </html>
  );
}

