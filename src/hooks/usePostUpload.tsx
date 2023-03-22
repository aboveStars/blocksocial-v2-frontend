import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postCreateModalStateAtom } from "@/components/atoms/postCreateModalAtom";
import { PostCreateForm, PostData } from "@/components/types/Post";
import { firestore, storage } from "@/firebase/clientApp";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

const usePostCreate = () => {
  const currentUserUsername = useRecoilValue(currentUserStateAtom).username;
  const [selectedPostPhoto, setSelectedPostPhoto] = useState("");
  const [postUploadLoading, setPostUploadUpdating] = useState(false);
  const setPostCreateModalState = useSetRecoilState(postCreateModalStateAtom);

  const onSelectPostPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      console.log("No Files provided to onSelectPostPhoto");
      return;
    }

    const file = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (readerEvent) => {
      setSelectedPostPhoto(readerEvent.target?.result as string);
    };
  };

  /**
   * Sends Post to Database
   */
  const sendPost = async (postCreateForm: PostCreateForm) => {
    setPostUploadUpdating(true);
    const username = currentUserUsername;
    const postName = Date.now();

    const postDocRef = doc(firestore, `users/${username}/posts/${postName}`);

    const postData: PostData = {
      title: postCreateForm.title,
      description: postCreateForm.description,
      image: "",
    };

    const batch = writeBatch(firestore);
    batch.set(postDocRef, postData);

    // upload photo...
    const postPhotoRef = ref(
      storage,
      `users/${username}/postsPhotos/${postName}`
    );
    await uploadString(postPhotoRef, postCreateForm.image, "data_url");
    const photoURL = await getDownloadURL(postPhotoRef);

    // update doc....
    batch.update(postDocRef, {
      image: photoURL,
    });

    // commit changes
    await batch.commit();

    console.log("Post Successfully Created");

    // State Updates
    setPostCreateModalState({ isOpen: false });
    setPostUploadUpdating(false);
  };

  return {
    selectedPostPhoto,
    setSelectedPostPhoto,
    onSelectPostPhoto,
    sendPost,
    postUploadLoading,
  };
};

export default usePostCreate;
