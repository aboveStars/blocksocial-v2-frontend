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
  const title: string = pageProps.title ? pageProps.title : "BlockSocial";
  const description: string = pageProps.description
    ? pageProps.description
    : "Create NFT's from your posts!";
  const type: string = pageProps.type ? pageProps.type : "website";
  const url: string = pageProps.url
    ? pageProps.url
    : "https://blocksocial.vercel.app";
  const image: string = pageProps.image
    ? pageProps.image
    : "https://blocksocial.vercel.app/bsicon.ico";

  const router = useRouter();

  return (
    <>
      <Head>
        <title>
          {router.asPath === "/"
            ? "BlockSocial"
            : `${router.asPath.split("/")[1]} - BlockSocial`}
        </title>
        <link rel="icon" href="/bsicon.ico" />

        <meta property="og:title" content={title} key="title" />
        <meta property="og:description" content={description} key="desc" />
        <meta property="og:type" content={type} key="type" />
        <meta property="og:url" content={url} key="url" />
        <meta property="og:image" content={image} key="image" />
      </Head>
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
