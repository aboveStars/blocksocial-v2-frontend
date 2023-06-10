import { PostItemData } from "@/components/types/Post";
import { firestore } from "@/firebase/adminApp";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  if (
    authorization !==
    (process.env.NEXT_PUBLIC_ANONYMOUS_ENTERANCE_KEY as string)
  )
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  let postItemDatas: PostItemData[] = [];

  let celebritiesDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>;
  try {
    celebritiesDoc = await firestore.doc(`popular/celebrities`).get();
  } catch (error) {
    console.error(
      `Error while creating feed anonymous feed. (We were getting popular people)`,
      error
    );
    return res.status(503).json({ error: "Firebase Error" });
  }

  let popularPeople: string[] = [];
  if (celebritiesDoc.data()) {
    popularPeople = celebritiesDoc.data()!.people;
  }

  if (popularPeople.length !== 0) {
    for (const popularPerson of popularPeople) {
      let popularPersonPostDocsQuerySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
      try {
        popularPersonPostDocsQuerySnapshot = await firestore
          .collection(`users/${popularPerson}/posts`)
          .get();
      } catch (error) {
        console.error(
          `Error while creating anonymous feed. (We were getting posts of ${popularPerson}`,
          error
        );
        return res.status(503).json({ error: "firebase error" });
      }
      if (popularPersonPostDocsQuerySnapshot.size !== 0) {
        for (const postDoc of popularPersonPostDocsQuerySnapshot.docs) {
          const newPostItemData: PostItemData = {
            senderUsername: postDoc.data().senderUsername,

            description: postDoc.data().description,
            image: postDoc.data().image,

            likeCount: postDoc.data().likeCount,
            currentUserLikedThisPost: false,
            commentCount: postDoc.data().commentCount,

            postDocId: postDoc.id,

            nftStatus: postDoc.data().nftStatus,

            currentUserFollowThisSender: false,

            creationTime: postDoc.data().creationTime,
          };

          postItemDatas.push(newPostItemData);
        }
      }
    }
  }

  return res.status(200).json({
    postItemDatas: postItemDatas,
  });
}
