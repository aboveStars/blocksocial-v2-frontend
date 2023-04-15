import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { auth } from "@/firebase/clientApp";
import React, { useState } from "react";
import { useRecoilState } from "recoil";

export default function useProfilePhoto() {
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState("");
  const [, setCurrentUserState] = useRecoilState(currentUserStateAtom);

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

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      return console.error(
        "Error while profilePhotoUploading. Couln't be got idToken",
        error
      );
    }

    let response: Response;

    try {
      response = await fetch("/api/profilePhotoChange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          image: selectedProfilePhoto,
        }),
      });
    } catch (error) {
      return console.error(
        "Error while fetching 'profilePhotoChange' API",
        error
      );
    }

    if (!response.ok) {
      return console.error(
        "Error while profilePhotoUpload from 'profilePhotoChange' API",
        await response.json()
      );
    }

    const { newProfilePhotoURL } = await response.json();

    setCurrentUserState((prev) => ({
      ...prev,
      profilePhoto: newProfilePhotoURL,
    }));

    setProfilePhotoUploadLoading(false);
  };

  const profilePhotoDelete = async () => {
    setProfilePhotoError("");
    setProfilePhotoDeleteLoading(true);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      return console.error(
        "Error while profilePhotoUploading. Couln't be got idToken",
        error
      );
    }

    let response: Response;
    try {
      response = await fetch("/api/profilePhotoChange", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      return console.error(
        "Error while fecthing to 'profilePhotoChange' API",
        error
      );
    }

    if (!response.ok) {
      return console.error(
        "Error while deleting post from 'profilePhotoChange' API",
        await response.json()
      );
    }

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
    profilePhotoError,
  };
}
