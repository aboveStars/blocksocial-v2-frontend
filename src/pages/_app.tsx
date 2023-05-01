import { theme } from "@/components/chakra/theme";
import Layout from "@/components/Layout/Layout";
import { ChakraProvider } from "@chakra-ui/react";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import NextNProgress from "nextjs-progressbar";
import { RecoilRoot } from "recoil";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <>
      <Analytics />
      <RecoilRoot>
        <ChakraProvider theme={theme}>
          <Head>
            <title>
              {router.asPath === "/"
                ? "BlockSocial"
                : `${router.asPath.split("/")[1]} - BlockSocial`}
            </title>
            <link rel="icon" href="/bsicon.ico" />
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
