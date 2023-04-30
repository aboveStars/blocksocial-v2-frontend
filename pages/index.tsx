import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>BlockSocial</title>
        <link rel="icon" href="/bsicon.ico" />
      </Head>
      <div className="maintenance-message">
        <p className="maintenance-message-text">We are in maintenance.</p>
      </div>
    </>
  );
}
