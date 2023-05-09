import { theme } from "@/components/chakra/theme";
import Layout from "@/components/Layout/Layout";
import { ChakraProvider } from "@chakra-ui/react";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import { RecoilRoot } from "recoil";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Analytics />
      <RecoilRoot>
        <ChakraProvider theme={theme}>
          <Layout>
            <NextNProgress color="#1479EA" height={4} />
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </RecoilRoot>
    </>
  );
}
