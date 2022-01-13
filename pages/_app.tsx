import { usePanelbear } from "@panelbear/panelbear-nextjs";
import "../styles/reset.css";
import "../styles/theme.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  // Load Panelbear only once during the app lifecycle
  usePanelbear("Ah30xQJSiNU", {
    debug: process.env.NODE_ENV !== "production",
  });

  return <Component {...pageProps} />;
}

export default MyApp;
