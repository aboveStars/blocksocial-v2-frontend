import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import MainPageLayout from "@/components/Layout/MainPageLayout";
import { PostItemData } from "@/components/types/Post";
import { firestore } from "@/firebase/clientApp";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import safeJsonStringify from "safe-json-stringify";

export default function Home() {
  const currentUserState = useRecoilValue(currentUserStateAtom);
  const [postsDatasInServer, setPostDatasInServer] = useState<PostItemData[]>(
    []
  );

  /**
   * To make people index colorful, getting famous usernames from database
   */
  const getCelebrities = async () => {
    const cDocRef = doc(firestore, `popular/celebrities`);
    const cDoc = await getDoc(cDocRef);

    if (cDoc.exists()) return cDoc.data().people;
    else return "";
  };

  useEffect(() => {
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
    const celebrities = await getCelebrities();

    if (currentUserFollowings.length === 0 && celebrities.length === 0) {
      console.log("Poor index");
      return;
    }

    const mainIndexSource = Array.from(
      new Set(currentUserFollowings.concat(celebrities))
    );

    // Filter to celebrities don't see themselves
    const mainIndexSourceFiltered = mainIndexSource.filter(
      (u) => u !== currentUserState.username
    );

    // get followings's posts
    let postsDatas: PostItemData[] = [];

    for (const username of mainIndexSourceFiltered) {
      const mainIndexSourcePostDatasCollection = collection(
        firestore,
        `users/${username}/posts`
      );
      const mainIndexSourcePostDatasQuery = query(
        mainIndexSourcePostDatasCollection,
        orderBy("creationTime", "desc")
      );
      const mainIndexSourcePostsDatasSnapshot = await getDocs(
        mainIndexSourcePostDatasQuery
      );

      const mainIndexSourcePostsDatas: PostItemData[] = [];

      for (const doc of mainIndexSourcePostsDatasSnapshot.docs) {
        const postDataObject: PostItemData = {
          senderUsername: doc.data().senderUsername,
          description: doc.data().description,
          image: doc.data().image,
          likeCount: doc.data().likeCount,
          whoLiked: doc.data().whoLiked,
          likeDocPath: `users/${doc.data().senderUsername}/posts/${doc.id}`,
          commentCount: doc.data().commentCount,
          commentsCollectionPath: `users/${doc.data().senderUsername}/posts/${
            doc.id
          }/comments`,
          creationTime: doc.data().creationTime,
          id: doc.data().id,
        };
        const serializablePostData: PostItemData = JSON.parse(
          safeJsonStringify(postDataObject)
        );
        mainIndexSourcePostsDatas.push(serializablePostData);
      }
      postsDatas.push(...mainIndexSourcePostsDatas);
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
