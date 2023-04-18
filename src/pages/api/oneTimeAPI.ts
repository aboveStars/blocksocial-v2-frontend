import { NextApiRequest, NextApiResponse } from "next";
import { fieldValue, firestore } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // get all users
  let usersSnapshot;
  try {
    usersSnapshot = await firestore.collection("users").get();
  } catch (error) {
    console.error(
      "Error while 'oneTimeUpdate. (We were getting 'users' collection",
      error
    );
    return res.status(503).json({ error: "Firebase Error" });
  }
  try {
    for (const userDoc of usersSnapshot.docs) {
      console.log(`${userDoc.id} in process... `);
      const followersArray = userDoc.data().followers;
      if (followersArray) {
        for (const follower of followersArray) {
          await firestore.doc(`users/${userDoc.id}/followers/${follower}`).set({
            followTime: Date.now(),
          });
        }
      } else {
        console.log("User has no followers yet.");
      }

      console.log("Follower transfer is done. Now we delete the field.");
      await userDoc.ref.update({
        followers: fieldValue.delete(),
      });

      const followingsArray = userDoc.data().followings;
      if (followingsArray) {
        for (const following of followingsArray) {
          await firestore
            .doc(`users/${userDoc.id}/followings/${following}`)
            .set({
              followTime: Date.now(),
            });
        }
      } else {
        console.log("User has no followings yet.");
      }

      console.log("Following transfer is done. Now we delete the field.");
      await userDoc.ref.update({
        followings: fieldValue.delete(),
      });
    }
  } catch (error) {
    console.error(
      "Error while oneTimeUpdate. (We were transferrring data.)",
      error
    );
    return res.status(503).json({ error: "firebaseError" });
  }

  return res.status(200).json("Operation Successfull");
}
