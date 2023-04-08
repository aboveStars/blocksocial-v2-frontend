import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postCreateModalStateAtom } from "@/components/atoms/postCreateModalAtom";
import { PostCreateForm } from "@/components/types/Post";
import { FirestoreError } from "firebase/firestore";
import { StorageError } from "firebase/storage";
import { useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

const usePostCreate = () => {
  const currentUserUsername = useRecoilValue(currentUserStateAtom).username;
  const [willBeCroppedPostPhoto, setWillBeCroppedPostPhoto] = useState("");
  const [postUploadLoading, setPostUploadUpdating] = useState(false);
  const setPostCreateModalState = useSetRecoilState(postCreateModalStateAtom);

  const onSelectWillBeCroppedPhoto = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) {
      console.log("No Files provided to onSelectWillBeCroppedPhoto");
      return;
    }

    const file = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (readerEvent) => {
      setWillBeCroppedPostPhoto(readerEvent.target?.result as string);
    };
  };

  /**
   * Sends Post to Database
   */
  const sendPost = async (postCreateForm: PostCreateForm) => {
    // This is my third control but, I don't trust states really :/
    if (!!!postCreateForm.description && !!!postCreateForm.image) {
      console.log("You Can not create empty post, aborting");
      return;
    }
    setPostUploadUpdating(true);

    const username = currentUserUsername;
    const description = postCreateForm.description;
    const image = postCreateForm.image;

    const response = await fetch("/api/postUpload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, description, image }),
    });

    if (!response.ok) {
      // 500 for firebase errrors
      if (response.status === 500) {
        const { firebaseError } = await response.json();
        console.error("Firebase Error while uploading post", firebaseError);
      } else {
        const { error } = await response.json();
        console.error("Non-Firebase Error: ", error);
      }

      setPostUploadUpdating(false);
    } else {
      const { username: postCreatedUser } = await response.json();
      console.log("Post Successfully Created for ", postCreatedUser);

      // State Updates
      setPostCreateModalState({ isOpen: false });
      setPostUploadUpdating(false);
    }
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
