import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { auth } from "@/firebase/clientApp";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";

export default function useProfilePhoto() {
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState("");
  const setCurrentUserState = useSetRecoilState(currentUserStateAtom);

  const [profilePhotoUploadLoading, setProfilePhotoUploadLoading] =
    useState(false);

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
   * @returns true if operation successfull, otherwise false.
   */
  const profilePhotoUpload = async () => {
    setProfilePhotoError("");
    setProfilePhotoUploadLoading(true);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error(
        "Error while profilePhotoUploading. Couln't be got idToken",
        error
      );
      setProfilePhotoUploadLoading(false);
      return false;
    }

    let response: Response;

    try {
      response = await fetch("/api/user/profilePhotoChange", {
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
      console.error("Error while fetching 'profilePhotoChange' API", error);
      setProfilePhotoUploadLoading(false);
      return false;
    }

    if (!response.ok) {
      console.error(
        "Error while profilePhotoUpload from 'profilePhotoChange' API",
        await response.json()
      );
      setProfilePhotoUploadLoading(false);
      return false;
    }

    const { newProfilePhotoURL } = await response.json();
    setCurrentUserState((prev) => ({
      ...prev,
      profilePhoto: newProfilePhotoURL,
    }));

    setProfilePhotoUploadLoading(false);

    return true;
  };

  /**
   * @returns true if operation is successfull, otherwise false.
   */
  const profilePhotoDelete = async () => {
    setProfilePhotoError("");
    setProfilePhotoDeleteLoading(true);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error(
        "Error while profilePhotoUploading. Couln't be got idToken",
        error
      );
      setProfilePhotoDeleteLoading(false);
      return false;
    }

    let response: Response;
    try {
      response = await fetch("/api/user/profilePhotoChange", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      console.error("Error while fecthing to 'profilePhotoChange' API", error);
      setProfilePhotoDeleteLoading(false);
      return false;
    }

    if (!response.ok) {
      console.error(
        "Error while deleting post from 'profilePhotoChange' API",
        await response.json()
      );
      setProfilePhotoDeleteLoading(false);
      return false;
    }

    // State Updates
    setProfilePhotoDeleteLoading(false);
    setCurrentUserState((prev) => ({
      ...prev,
      profilePhoto: "",
    }));

    return true;
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
