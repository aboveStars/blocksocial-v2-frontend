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

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
    </Head>
  );
}
