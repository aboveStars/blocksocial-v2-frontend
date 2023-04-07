import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore, storage } from "@/firebase/clientApp";
import { doc, FirestoreError, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  StorageError,
  uploadString,
} from "firebase/storage";
import React, { useState } from "react";
import { useRecoilState } from "recoil";

export default function useProfilePhoto() {
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState("");
  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);

  const [profilePhotoUploadLoading, setProfilePhotoUploadLoading] =
    useState(false);
  const [profilePhotoUploadError, setProfilePhotoUploadError] = useState(false);

  const [willBeCroppedProfilePhoto, setWillBeCroppedProfilePhoto] =
    useState("");

  const [profilePhotoDeleteLoading, setProfilePhotoDeleteLoading] =
    useState(false);

  const onSelectWillBeCroppedProfilePhoto = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("OnSelectToBeCropped Triggered!");
    if (!event.target.files) {
      console.log(
        "No Files Provided to onSelectWillBeCropped \n aborting....."
      );
      return;
    }

    const file = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (readerEvent) => {
      console.log("onLoad fired, now we update state");
      setWillBeCroppedProfilePhoto(readerEvent.target?.result as string);
    };
  };

  /**
   * Profile Photo Uploading to Database
   */
  const profilePhotoUpload = async () => {
    let errorHappened: boolean = false;
    setProfilePhotoUploadError(false);

    setProfilePhotoUploadLoading(true);

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

  const profilePhotoDelete = async () => {
    setProfilePhotoDeleteLoading(true);

    const response = await fetch("/api/profilePhotoChange", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: currentUserState.username }),
    });

    if (!response.ok) {
      const { firebaseError } = await response.json();
      console.error((firebaseError as FirestoreError).message);
      setProfilePhotoDeleteLoading(false);
      return;
    }

    const { username: profilePhotoDeletedUsername } = await response.json();
    console.log(`Profile photo of ${profilePhotoDeletedUsername} is deleted!`);

    // State Updates
    setProfilePhotoDeleteLoading(false);
    setCurrentUserState((prev) => ({
      ...prev,
      profilePhoto: "",
    }));
  };

  /**
   * Post Photo Upload
   * @returns Downloadable Post Photo Image URL
   */

  return {
    selectedProfilePhoto,
    setSelectedProfilePhoto,
    profilePhotoUpload,
    profilePhotoUploadLoading,
    profilePhotoUploadError,
    profilePhotoDelete,
    profilePhotoDeleteLoading,
    onSelectWillBeCroppedProfilePhoto,
    willBeCroppedProfilePhoto,
    setWillBeCroppedProfilePhoto,
  };
}
