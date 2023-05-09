import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

type Props = {
  title: string;
  description: string;
  type: string;
  url: string;
  image: string;
};

export default function PageHead({
  description,
  image,
  title,
  type,
  url,
}: Props) {
  const router = useRouter();

  return (
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
  );
}
