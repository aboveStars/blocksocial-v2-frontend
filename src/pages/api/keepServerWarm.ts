import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron } = req.headers;
  if (
    !cron ||
    typeof cron === "object" ||
    cron !== process.env.NEXT_PUBLIC_CRON_HEADER_KEY
  ) {
    console.error("Warm-Up requested by unknown source");
    return res.status(400).json({
      status: "Warm-Up requested by unknown source",
    });
  }
  const warmUps = [
    fetch("https:/blocksocial.vercel.app/api/follow", {
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
    fetch("https:/blocksocial.vercel.app/api/signup", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/update", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/users/***TO-WARM-UP-USER***", {
      headers: {
        cron: cron,
      },
    }),
  ];

  try {
    await Promise.all(warmUps);
  } catch (error) {
    console.error("Warm-Up is done. We got error as normal.");
  }
  return res.status(200).json({ message: "Warmed-Up" });
}
