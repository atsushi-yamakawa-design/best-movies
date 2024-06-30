import type { AppProps } from "next/app";
import "../styles/reset.css";
import "../styles/global.scss";
import "../styles/variables.scss";
import Head from "next/head";
import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XFXB6NPH3Z"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-XFXB6NPH3Z');
            `
          }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
