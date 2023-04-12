import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { auth } from "@/firebase/clientApp";
import { FirestoreError } from "firebase/firestore";
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

    const idToken = await auth.currentUser?.getIdToken();

    if (!idToken) {
      throw new Error("Id Token couldn't be get");
    }

    try {
      const response = await fetch("/api/profilePhotoChange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          image: selectedProfilePhoto,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setProfilePhotoError(error as string);
        throw new Error(error);
      }

      const { newProfilePhotoURL } = await response.json();

      setCurrentUserState((prev) => ({
        ...prev,
        profilePhoto: newProfilePhotoURL,
      }));

      setProfilePhotoUploadLoading(false);
    } catch (error) {
      console.error("Error while uplaoding profile photo", error);
      setProfilePhotoUploadLoading(false);
    }
  };

  const profilePhotoDelete = async () => {
    setProfilePhotoError("");
    setProfilePhotoDeleteLoading(true);

    try {
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Id Token couldn't be get");
      }

      const response = await fetch("/api/profilePhotoChange", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      // State Updates
      setProfilePhotoDeleteLoading(false);
      setCurrentUserState((prev) => ({
        ...prev,
        profilePhoto: "",
      }));
    } catch (error) {
      console.error("Error while deleting profile photo delete", error);
      setProfilePhotoError(error as string);
      setProfilePhotoDeleteLoading(false);
    }
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
    profilePhotoError,
  };
}
