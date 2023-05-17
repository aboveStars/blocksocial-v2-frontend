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
    fetch("https:/blocksocial.vercel.app/api/social/follow", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/user/fullnameUpdate", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/post/comment/sendPostComment", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/post/comment/postCommentDelete", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/post/postDelete", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/post/postLike", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/post/postUplaod", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/user/profilePhotoChange", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/nft/refreshNFT", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/user/seenNotification", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/signup", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/nft/transferNFT", {
      headers: {
        cron: cron,
      },
    }),
    fetch("https:/blocksocial.vercel.app/api/nft/uploadNFT", {
      headers: {
        cron: cron,
      },
    }),

    fetch("https:/blocksocial.vercel.app/***TO-WARM-UP-USER***", {
      headers: {
        cron: cron,
      },
    }),

    fetch("https:/blocksocial.vercel.app/api/feed/main/getAnonymousMainFeed", {
      headers: {
        cron: cron,
      },
    }),
    fetch(
      "https:/blocksocial.vercel.app/api/feed/main/getPersonalizedMainFeed",
      {
        headers: {
          cron: cron,
        },
      }
    ),
    fetch("https:/blocksocial.vercel.app/api/feed/user/getAnonymousUserFeed", {
      headers: {
        cron: cron,
      },
    }),
    fetch(
      "https:/blocksocial.vercel.app/api/feed/user/getPersonalizedUserFeed",
      {
        headers: {
          cron: cron,
        },
      }
    ),
  ];

  try {
    await Promise.all(warmUps);
  } catch (error) {
    console.error("Error while warming-up", error);
    return res.status(503).json({ error: "Warm-Up errored." });
  }
  return res.status(200).json({ message: "Warmed-Up" });
}
