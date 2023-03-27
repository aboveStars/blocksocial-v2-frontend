import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import MainPageLayout from "@/components/Layout/MainPageLayout";
import { PostItemData } from "@/components/types/Post";
import { firestore } from "@/firebase/clientApp";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import safeJsonStringify from "safe-json-stringify";

export default function Home() {
  const currentUserState = useRecoilValue(currentUserStateAtom);
  const [postsDatasInServer, setPostDatasInServer] = useState<PostItemData[]>(
    []
  );

  useEffect(() => {
    if (!currentUserState.username) {
      console.log("Please Log-In to see somethings");
      setPostDatasInServer([]);
      return;
    }
    handleMainPage();
  }, [currentUserState.username]);

  /**
   * Shuffles posts.
   * @param postsDatasArray
   * @returns shuffled posts
   */
  const shufflePosts = (postsDatasArray: PostItemData[]) => {
    const shuffledPostsArray = [...postsDatasArray];
    shuffledPostsArray.sort(() => Math.random() - 0.5);
    shuffledPostsArray.sort(
      (postA, postB) => postB.creationTime.seconds - postA.creationTime.seconds
    );
    return shuffledPostsArray;
  };

  const handleMainPage = async () => {
    // get current user followings
    const currentUserFollowings: string[] = currentUserState.followings;

    // get followings's posts
    let postsDatas: PostItemData[] = [];

    for (const username of currentUserFollowings) {
      const followedUserPostDatasCollection = collection(
        firestore,
        `users/${username}/posts`
      );
      const followedUserPostDatasQuery = query(
        followedUserPostDatasCollection,
        orderBy("creationTime", "desc")
      );
      const followedUserPostsDatasSnapshot = await getDocs(
        followedUserPostDatasQuery
      );

      const followedUserPostsDatas: PostItemData[] = [];

      for (const doc of followedUserPostsDatasSnapshot.docs) {
        const postDataObject: PostItemData = {
          senderUsername: doc.data().senderUsername,
          description: doc.data().description,
          image: doc.data().image,
          likeCount: doc.data().likeCount,
          whoLiked: doc.data().whoLiked,
          commentCount : doc.data().commentCount,
          commentsCollectionPath: `users/${doc.data().senderUsername}/posts/${
            doc.id
          }/comments`,
          creationTime: doc.data().creationTime,
          id: doc.data().id,
        };
        const serializablePostData: PostItemData = JSON.parse(
          safeJsonStringify(postDataObject)
        );
        followedUserPostsDatas.push(serializablePostData);
      }
      postsDatas.push(...followedUserPostsDatas);
    }

    // shuffle posts
    const finalPostDatas = shufflePosts(postsDatas);

    // Update state varible
    setPostDatasInServer(finalPostDatas);
  };

  return (
    postsDatasInServer && <MainPageLayout postItemsDatas={postsDatasInServer} />
  );
}
