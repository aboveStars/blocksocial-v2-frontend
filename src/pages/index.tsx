import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postsStatusAtom } from "@/components/atoms/postsStatusAtom";
import MainPageLayout from "@/components/Layout/MainPageLayout";
import { PostItemData, PostServerData } from "@/components/types/Post";
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
import { useRecoilValue, useSetRecoilState } from "recoil";
import safeJsonStringify from "safe-json-stringify";

export default function Home() {
  const currentUserState = useRecoilValue(currentUserStateAtom);
  const [postsDatasInServer, setPostDatasInServer] = useState<PostItemData[]>(
    []
  );

  const setPostStatus = useSetRecoilState(postsStatusAtom);

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
    if (currentUserState.loading) return;
    handleMainPage();
  }, [
    currentUserState.username,
    currentUserState.loading,
    currentUserState.isThereCurrentUser,
  ]);

  const shufflePosts = (postsDatasArray: PostItemData[]) => {
    let currentIndex = postsDatasArray.length,
      randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [postsDatasArray[currentIndex], postsDatasArray[randomIndex]] = [
        postsDatasArray[randomIndex],
        postsDatasArray[currentIndex],
      ];
    }

    return postsDatasArray;
  };

  /**
   * Shuffles posts.
   * @param postsDatasArray
   * @returns shuffled posts
   */
  const organizePosts = (postsDatasArray: PostItemData[]) => {
    const initialPostsDatasArray = [...postsDatasArray];

    // shuffle with Fisher-Yates method
    const shuffledPostsDatasArray = shufflePosts(initialPostsDatasArray);

    return shuffledPostsDatasArray;
  };

  const handleMainPage = async () => {
    setPostStatus({
      loading: true,
    });

    // get current user followings

    // this is empty array by default, so no need to check isThereCurrentUser
    const currentUserFollowings: string[] = ["yunuskorkmaz"];
    const celebrities = await getCelebrities();

    if (currentUserFollowings.length === 0 && celebrities.length === 0) {
      console.log("Poor index");
      return;
    }

    const mainIndexSource = Array.from(
      new Set(currentUserFollowings.concat(celebrities))
    );

    // Filter to celebrities don't see themselves
    let finalIndexSource = mainIndexSource;
    if (currentUserState.isThereCurrentUser) {
      const mainIndexSourceAddedCurrentUser = mainIndexSource.concat(
        currentUserState.username
      );
      finalIndexSource = Array.from(new Set(mainIndexSourceAddedCurrentUser));
    }

    let postsDatas: PostItemData[] = [];

    for (const username of finalIndexSource) {
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

          postDocId: doc.id,

          commentCount: doc.data().commentCount,

          nftUrl: doc.data().nftUrl,
          creationTime: doc.data().creationTime,
        };
        const serializablePostData: PostItemData = JSON.parse(
          safeJsonStringify(postDataObject)
        );
        mainIndexSourcePostsDatas.push(serializablePostData);
      }
      postsDatas.push(...mainIndexSourcePostsDatas);
    }

    // shuffle posts
    const finalPostDatas = organizePosts(postsDatas);

    // Update state varible
    setPostDatasInServer(finalPostDatas);

    setPostStatus({
      loading: false,
    });
  };

  return (
    postsDatasInServer && <MainPageLayout postItemsDatas={postsDatasInServer} />
  );
}
