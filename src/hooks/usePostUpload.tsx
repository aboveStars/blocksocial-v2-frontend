import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postsAtViewAtom } from "@/components/atoms/postsAtViewAtom";
import { PostCreateForm, PostItemData } from "@/components/types/Post";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

const usePostCreate = () => {
  const [willBeCroppedPostPhoto, setWillBeCroppedPostPhoto] = useState("");
  const [postUploadLoading, setPostUploadUpdating] = useState(false);
  const currentUserstate = useRecoilValue(currentUserStateAtom);

  const router = useRouter();

  const [postsAtView, setPostsAtView] = useRecoilState(postsAtViewAtom);

  const onSelectWillBeCroppedPhoto = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) {
      return console.error("No Files provided to onSelectWillBeCroppedPhoto");
    }

    const file = event.target.files[0];

    if (!file.type.startsWith("image/")) {
      console.log("Only Images");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (readerEvent) => {
      setWillBeCroppedPostPhoto(readerEvent.target?.result as string);
    };
  };

  /**
   *
   * @param postCreateForm
   * @returns
   */
  const sendPost = async (postCreateForm: PostCreateForm) => {
    // This is my third control but, I don't trust states really :/
    if (!postCreateForm.description && !postCreateForm.image) {
      return console.log("You Can not create empty post, aborting");
    }
    setPostUploadUpdating(true);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      return console.error(
        "Error while post deleting. Couln't be got idToken",
        error
      );
    }

    const description = postCreateForm.description;
    const image = postCreateForm.image;

    let response: Response;
    try {
      response = await fetch("/api/postUpload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ description, image }),
      });
    } catch (error) {
      return console.error("Error while fetching to 'postUpload' API", error);
    }

    if (!response.ok) {
      return console.error(
        "Error while postUpload from 'postUpload' API",
        await response.json()
      );
    }

    const newPostDocId = (await response.json()).newPostDocId;

    if (router.asPath === `/users/${currentUserstate.username}`) {
      console.log("Hmm. We posted in our user page.");
      const newPostData: PostItemData = {
        senderUsername: currentUserstate.username,
        description: description,
        image: image,
        likeCount: 0,
        commentCount: 0,
        nftStatus: {
          minted: false,
          mintTime: -1,
          metadataLink: "",
          title: "",
          description: "",
          tokenId: -1,
          contractAddress: "",
          openseaUrl: "",
          transferred: false,
          transferredAddress: "",
        },
        currentUserLikedThisPost: false,
        postDocId: newPostDocId,
        creationTime: Date.now(),
      };
      setPostsAtView((prev) => [newPostData, ...prev]);
    } else if (router.asPath === "/") {
      console.log("Hmmmmmm. We posted in home page.");
      const newPostData: PostItemData = {
        senderUsername: currentUserstate.username,
        description: description,
        image: image,
        likeCount: 0,
        commentCount: 0,
        nftStatus: {
          minted: false,
          mintTime: -1,
          metadataLink: "",
          title: "",
          description: "",
          tokenId: -1,
          contractAddress: "",
          openseaUrl: "",
          transferred: false,
          transferredAddress: "",
        },
        currentUserLikedThisPost: false,
        postDocId: newPostDocId,
        creationTime: Date.now(),
      };
      setPostsAtView((prev) => [newPostData, ...prev]);
    }
    setPostUploadUpdating(false);
  };

  return {
    willBeCroppedPostPhoto,
    setWillBeCroppedPostPhoto,
    onSelectWillBeCroppedPhoto,
    sendPost,
    postUploadLoading,
  };
};

export default usePostCreate;
