import styles from "@/styles/Home.module.css";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>BlockSocial</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={styles.main}
        style={{
          justifyContent: "center",
        }}
      >
        <div
          className={styles.center}
          style={{
            fontSize: "50pt",
          }}
        >
          We are in maintenance.
        </div>
      </main>
    </>
  );
}
