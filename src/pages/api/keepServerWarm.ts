import { NextApiResponse } from "next";

export default async function handler(res: NextApiResponse) {
  await fetch("https:/blocksocial.vercel.app/api/follow");
  await fetch("https:/blocksocial.vercel.app/api/postComments");
  await fetch("https:/blocksocial.vercel.app/api/postCommentsDelete");
  await fetch("https:/blocksocial.vercel.app/api/postDelete");
  await fetch("https:/blocksocial.vercel.app/api/postLike");
  await fetch("https:/blocksocial.vercel.app/api/postUplaod");
  await fetch("https:/blocksocial.vercel.app/api/profilePhotoChange");
  await fetch("https:/blocksocial.vercel.app/api/refreshNFT");
  await fetch("https:/blocksocial.vercel.app/api/signup");
  await fetch("https:/blocksocial.vercel.app/api/update");

  return res.status(200).json({
    status: "Server Warmed",
  });
}
