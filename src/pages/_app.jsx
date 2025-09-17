import "../app/globals.css";
import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/svg+xml" sizes="any" href="/icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon.svg" />
      </Head>
      <Header />
      <Component {...pageProps} />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
