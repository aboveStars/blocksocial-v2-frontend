import { theme } from "@/components/chakra/theme";
import Layout from "@/components/Layout/Layout";
import { IPagePreviewData } from "@/components/types/User";
import { ChakraProvider } from "@chakra-ui/react";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import NextNProgress from "nextjs-progressbar";
import { RecoilRoot } from "recoil";

export default function App({ Component, pageProps }: AppProps) {
  // Last settings for links preview...
  const fetchedPagePreviewData: IPagePreviewData = pageProps.pagePreviewData;
  const title: string = fetchedPagePreviewData.title
    ? fetchedPagePreviewData.title
    : "BlockSocial";
  const description: string = fetchedPagePreviewData.description
    ? fetchedPagePreviewData.description
    : "Create NFT's from your posts and much more!";
  const type: string = fetchedPagePreviewData.type
    ? fetchedPagePreviewData.type
    : "website";
  const url: string = fetchedPagePreviewData.url
    ? fetchedPagePreviewData.url
    : "https://blocksocial.vercel.app";
  const image: string = fetchedPagePreviewData.image
    ? fetchedPagePreviewData.image
    : "https://blocksocial.vercel.app/bsicon.jpg";

  const router = useRouter();

  return (
    <>
      <Head>
        <title>
          {router.asPath === "/"
            ? "BlockSocial"
            : `${router.asPath.split("/")[1]} - BlockSocial`}
        </title>
        <link rel="icon" href="/bsicon.jpg" />

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
