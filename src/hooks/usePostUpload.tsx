import { postCreateModalStateAtom } from "@/components/atoms/postCreateModalAtom";
import { PostCreateForm } from "@/components/types/Post";
import { auth } from "@/firebase/clientApp";
import { useState } from "react";
import { useSetRecoilState } from "recoil";

const usePostCreate = () => {
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
   * Sends Post to Database
   */
  const sendPost = async (postCreateForm: PostCreateForm) => {
    // This is my third control but, I don't trust states really :/
    if (!!!postCreateForm.description && !!!postCreateForm.image) {
      console.log("You Can not create empty post, aborting");
      return;
    }
    setPostUploadUpdating(true);

    try {
      const description = postCreateForm.description;
      const image = postCreateForm.image;

      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Id Token couldn't be get");
      }

      const response = await fetch("/api/postUpload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ description, image }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      setPostCreateModalState({ isOpen: false });
      setPostUploadUpdating(false);
    } catch (error) {
      setPostUploadUpdating(false);
      console.error("Error while uploading post", error);
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
