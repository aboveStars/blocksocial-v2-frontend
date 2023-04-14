import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Keep Warm Fired!");

  console.log(req);
  fetch("/api/follow");
  fetch("/api/postComments");
  fetch("/api/postCommentsDelete");
  fetch("/api/postDelete");
  fetch("/api/postLike");
  fetch("api/postUplaod");
  fetch("/api/profilePhotoChange");
  fetch("/api/refreshNFT");
  fetch("/api/signup");
  fetch("api/update");
}
