import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cron = req.headers.cron as string;
  if (cron !== process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.error("Warm-Up Request from unknown source.");
    return res
      .status(401)
      .json({ error: "Warm-Up requested by unknown source" });
  }

  const warmUps = [
    fetch("https:/blocksocial.vercel.app/api/follow", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/fullnameUpdate", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/postComment", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/postCommentDelete", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/postDelete", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/postLike", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/postUplaod", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/profilePhotoChange", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/refreshNFT", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/seenNotification", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/signup", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/transferNFT", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/uploadNFT", {
      headers: {
        cron: cron,
      },
    }),

    fetch("https:/blocksocial.vercel.app/***TO-WARM-UP-USER***", {
      headers: {
        cron: cron,
      },
    }),
  ];

  try {
    await Promise.all(warmUps);
  } catch (error) {
    console.error("Error while warming-up", error);
    return res.status(503).json({ error: "Warm-Up errored." });
  }
  return res.status(200).json({ message: "Warmed-Up" });
}
