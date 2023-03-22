import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore, storage } from "@/firebase/clientApp";
import { doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

export default function useImageUpload() {
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState<string>("");
  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);

  const [profilePhotoUploadLoading, setProfilePhotoUploadLoading] =
    useState(false);
  const [profilePhotoUploadError, setProfilePhotoUploadError] = useState(false);

  /**
   * Selecting image efficiently, produce ready data to write storage
   * @param event
   * @returns
   */
  const onSelectProfilePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      console.log("No Files Provided to onSelectFile \n aborting.....");
      return;
    }

    const file = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (readerEvent) => {
      setSelectedProfilePhoto(readerEvent.target?.result as string);
    };
  };

  /**
   * Profile Photo Uploading to Database
   */
  const profilePhotoUpload = async () => {
    let errorHappened: boolean = false;
    setProfilePhotoUploadError(false);

    setProfilePhotoUploadLoading((prev) => true);

    const username = currentUserState.username;
    const fileName = Date.now();
    // client => storage
    const imageRef = ref(
      storage,
      `users/${username}/profilePhotos/${fileName}`
    );

    try {
      await uploadString(imageRef, selectedProfilePhoto, "data_url");
    } catch (error) {
      console.log("Error while uploading pp to storage: ", error);
      errorHappened = true;
    }

    if (errorHappened) {
      setProfilePhotoUploadLoading(false);
      setProfilePhotoUploadError(true);
      return;
    }

    // Check Upload result

    // AFter here, now we adding image soruce to firestore (storage => firestore)
    let downloadableImageURL: string = "";

    try {
      downloadableImageURL = await getDownloadURL(imageRef);
    } catch (error) {
      console.log("Error while creating 'downloadURL' : ", error);
      errorHappened = true;
    }

    if (errorHappened) {
      console.log(
        "Due to an error at 'creation of downloadURL' we are taking back all stuff we did"
      );

      console.log("Deleting image from 'firebase/storage'");
      await deleteObject(imageRef);
      console.log("Deletaion successfull");

      setProfilePhotoUploadLoading(false);
      setProfilePhotoUploadError(true);
      return;
    }

    const firestoreDocRef = doc(firestore, `users/${username}`);

    try {
      await updateDoc(firestoreDocRef, {
        profilePhoto: downloadableImageURL,
      });
    } catch (error) {
      console.log(
        "Error while putting downloadable Image URL to Firestore:  ",
        error
      );
      errorHappened = true;
    }

    if (errorHappened) {
      console.log(
        "Due to error at putting URL to firestore, we are taking back all stuff we did"
      );

      console.log("Deleting image from 'firebase/storage'");
      await deleteObject(imageRef);
      console.log("Deletaion successfull");

      setProfilePhotoUploadLoading(false);
      setProfilePhotoUploadError(true);
      return;
    }

    console.log("Profile Photo Uploading Successfull");

    // State Updates
    // (until refresh, user normally will not be able to see its new image so we change it manually)
    setCurrentUserState((prev) => ({
      ...prev,
      profilePhoto: downloadableImageURL,
    }));

    setProfilePhotoUploadLoading(false);
  };

  /**
   * Post Photo Upload
   * @returns Downloadable Post Photo Image URL
   */

  return {
    onSelectProfilePhoto,
    selectedProfilePhoto,
    setSelectedProfilePhoto,
    profilePhotoUpload,
    profilePhotoUploadLoading,
    profilePhotoUploadError,
  };
}
