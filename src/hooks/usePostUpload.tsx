import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postCreateModalStateAtom } from "@/components/atoms/postCreateModalAtom";
import { PostCreateForm, PostData } from "@/components/types/Post";
import { firestore, storage } from "@/firebase/clientApp";
import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useState } from "react";
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
    // This is my third control but, I don't trust states really :/
    if (!!!postCreateForm.description && !!!postCreateForm.image) {
      console.log("You Can not create empty post, aborting");
      return;
    }
    setPostUploadUpdating(true);
    const username = currentUserUsername;
    const postName = Date.now();

    // Add a new document with a generated id
    const newPostRef = doc(collection(firestore, `users/${username}/posts`));

    const postData: PostData = {
      senderUsername: currentUserUsername,
      description: postCreateForm.description,
      image: "",
      likeCount: 0,
      whoLiked: [],
      creationTime: serverTimestamp() as Timestamp,
      id: postName.toString(), // this is not good
    };

    const batch = writeBatch(firestore);
    batch.set(newPostRef, postData);

    // upload photo...if there is
    if (postCreateForm.image) {
      const postPhotoRef = ref(
        storage,
        `users/${username}/postsPhotos/${postName}`
      );
      await uploadString(postPhotoRef, postCreateForm.image, "data_url");
      const photoURL = await getDownloadURL(postPhotoRef);

      // update doc....
      batch.update(newPostRef, {
        image: photoURL,
      });
    }

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
