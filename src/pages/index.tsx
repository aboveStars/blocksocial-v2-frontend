import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import MainPageLayout from "@/components/Layout/MainPageLayout";
import { PostData } from "@/components/types/Post";
import { firestore } from "@/firebase/clientApp";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import safeJsonStringify from "safe-json-stringify";

export default function Home() {
  const currentUserState = useRecoilValue(currentUserStateAtom);
  const [postsDatasInServer, setPostDatasInServer] = useState<PostData[]>([]);

  useEffect(() => {
    if (!currentUserState.username) {
      console.log("Please Log-In to see somethings");
      return;
    }
    handleMainPage();
  }, [currentUserState.username]);

  const handleMainPage = async () => {
    // get current user followings
    const currentUserFollowings: string[] = currentUserState.followings;
    console.log("Followings: ", currentUserFollowings);

    // get followings's posts
    let postsDatas: PostData[] = [];

    for (const username of currentUserFollowings) {
      const followedUserColRef = collection(
        firestore,
        `users/${username}/posts`
      );
      const followedUserPostsDatasSnapshot = await getDocs(followedUserColRef);

      const followedUserPostsDatas: PostData[] = [];

      for (const doc of followedUserPostsDatasSnapshot.docs) {
        const postDataObject: PostData = {
          senderUsername: doc.data().senderUsername,
          description: doc.data().description,
          image: doc.data().image || null,
          likeCount: doc.data().likeCount,
          whoLiked: doc.data().whoLiked,
          creationTime: doc.data().creationTime,
          id: doc.data().id,
        };
        const serializablePostData: PostData = JSON.parse(
          safeJsonStringify(postDataObject)
        );
        console.log("One of posts of ", username, serializablePostData);
        followedUserPostsDatas.push(serializablePostData);
      }
      postsDatas.push(...followedUserPostsDatas);
    }

    console.log("Final Post Datas: ", postsDatas);

    // pass the data to the props

    setPostDatasInServer(postsDatas);
  };

  return (
    postsDatasInServer && <MainPageLayout postsDatas={postsDatasInServer} />
  );
}
