import { NextApiResponse } from "next";

export default async function handler(res: NextApiResponse) {
  const warmUps = [
    fetch("https:/blocksocial.vercel.app/api/follow"),
    fetch("https:/blocksocial.vercel.app/api/postComments"),
    fetch("https:/blocksocial.vercel.app/api/postCommentsDelete"),
    fetch("https:/blocksocial.vercel.app/api/postDelete"),
    fetch("https:/blocksocial.vercel.app/api/postLike"),
    fetch("https:/blocksocial.vercel.app/api/postUplaod"),
    fetch("https:/blocksocial.vercel.app/api/profilePhotoChange"),
    fetch("https:/blocksocial.vercel.app/api/refreshNFT"),
    fetch("https:/blocksocial.vercel.app/api/signup"),
    fetch("https:/blocksocial.vercel.app/api/update"),
  ];

  try {
    await Promise.all(warmUps);
  } catch (error) {
    console.error("Warm-Up is done. We got error as normal.");
  }

  return res.status(200).json({
    status: "Server Warmed",
  });
}
