import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Keep Warm Fired!");

  console.log(req);
  fetch("https:/blocksocial.vercel.app/api/follow");
  fetch("https:/blocksocial.vercel.app/api/postComments");
  fetch("https:/blocksocial.vercel.app/api/postCommentsDelete");
  fetch("https:/blocksocial.vercel.app/api/postDelete");
  fetch("https:/blocksocial.vercel.app/api/postLike");
  fetch("https:/blocksocial.vercel.app/api/postUplaod");
  fetch("https:/blocksocial.vercel.app/api/profilePhotoChange");
  fetch("https:/blocksocial.vercel.app/api/refreshNFT");
  fetch("https:/blocksocial.vercel.app/api/signup");
  fetch("https:/blocksocial.vercel.app/api/update");

  return res.status(200).json({
    status: "Server Warmed",
  });
}
