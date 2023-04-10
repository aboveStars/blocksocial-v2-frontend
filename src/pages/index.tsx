import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
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
    if (currentUserState.loading) return;
    handleMainPage();
  }, [
    currentUserState.username,
    currentUserState.loading,
    currentUserState.isThereCurrentUser,
  ]);

  /**
   * Shuffles posts.
   * @param postsDatasArray
   * @returns shuffled posts
   */
  const organizePosts = (postsDatasArray: PostItemData[]) => {
    const initialPostsDatasArray = [...postsDatasArray];

    // shuffle with Fisher-Yates method
    const shuffledPostsDatasArray = shufflePosts(initialPostsDatasArray);

    // creation time sorting, but just for same sender.
    shuffledPostsDatasArray.sort((postA, postB) => {
      if (postA.senderUsername === postB.senderUsername) {
        if (postA.creationTime - postB.creationTime < 0) {
          return 1;
        } else if (postA.creationTime - postB.creationTime > 0) {
          return -1;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });
    return shuffledPostsDatasArray;
  };

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
  };

  return (
    postsDatasInServer && <MainPageLayout postItemsDatas={postsDatasInServer} />
  );
}
