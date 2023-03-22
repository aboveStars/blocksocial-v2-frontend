import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";
import Layout from "@/components/Layout/Layout";
import { theme } from "@/components/chakra/theme";
import { RecoilRoot } from "recoil";
import NextNProgress from "nextjs-progressbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <RecoilRoot>
        <ChakraProvider theme={theme}>
          <Head>
            <title>BlockSocial</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Layout>
            <NextNProgress color="#1479EA" height={4} />
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </RecoilRoot>
    </>
  );
}
