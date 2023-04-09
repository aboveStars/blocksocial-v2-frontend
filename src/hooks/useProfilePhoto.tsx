import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { FirestoreError } from "firebase/firestore";
import { StorageError } from "firebase/storage";
import React, { useState } from "react";
import { useRecoilState } from "recoil";

export default function useProfilePhoto() {
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState("");
  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);

  const [profilePhotoUploadLoading, setProfilePhotoUploadLoading] =
    useState(false);
  // Both deleteing and uplaoding
  const [profilePhotoError, setProfilePhotoError] = useState("");

  const [willBeCroppedProfilePhoto, setWillBeCroppedProfilePhoto] =
    useState("");

  const [profilePhotoDeleteLoading, setProfilePhotoDeleteLoading] =
    useState(false);

  const onSelectWillBeCroppedProfilePhoto = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      setWillBeCroppedProfilePhoto(readerEvent.target?.result as string);
    };
  };

  /**
   * Profile Photo Uploading to Database
   */
  const profilePhotoUpload = async () => {
    setProfilePhotoError("");
    setProfilePhotoUploadLoading(true);

    const response = await fetch("/api/profilePhotoChange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: currentUserState.username,
        image: selectedProfilePhoto,
      }),
    });

    if (!response.ok) {
      // Firebase Errors
      if (response.status === 500) {
        const { firebaseError } = await response.json();
        console.error(
          "Firebase Error while uploading profile photo: ",
          firebaseError
        );

        setProfilePhotoError(
          (firebaseError as FirestoreError | StorageError).message
        );
      } else {
        const { error } = await response.json();
        setProfilePhotoError(error as string);
        console.error(
          "Not-Firebase Error while uploading profile photo: ",
          error
        );
      }

      setProfilePhotoUploadLoading(false);
      return;
    }

    const { username, newProfilePhotoURL } = await response.json();

    console.log(
      `Uploading profile photo for ${username} and its new pp link: ${newProfilePhotoURL}`
    );

    setCurrentUserState((prev) => ({
      ...prev,
      profilePhoto: newProfilePhotoURL,
    }));

    setProfilePhotoUploadLoading(false);
  };

  const profilePhotoDelete = async () => {
    setProfilePhotoError("");
    setProfilePhotoDeleteLoading(true);

    const response = await fetch("/api/profilePhotoChange", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: currentUserState.username }),
    });

    if (!response.ok) {
      if (response.status === 500) {
        const { firebaseError } = await response.json();
        console.error((firebaseError as FirestoreError).message);
        setProfilePhotoError((firebaseError as FirestoreError).message);
      } else {
        const { error } = await response.json();
        console.error("Non-Firebase Error: ", error);
        setProfilePhotoError(error as string);
      }

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
    profilePhotoDelete,
    profilePhotoDeleteLoading,
    onSelectWillBeCroppedProfilePhoto,
    willBeCroppedProfilePhoto,
    setWillBeCroppedProfilePhoto,
    profilePhotoError
  };
}
