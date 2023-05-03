import { INotificationServerData } from "@/components/types/User";
import { firestore } from "@/firebase/clientApp";
import { Flex, Image, Text } from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

interface NotificationItemData {
  senderUsername: string;
  senderFullName: string;
  senderProfilePhoto: string;
  notificationTime: number;
  message: string;
}

export default function NotificationItem({
  cause,
  notificationTime,
  sender,
  seen,
}: INotificationServerData) {
  const [notificationItemData, setNotificationItemData] =
    useState<NotificationItemData>({
      message: "",
      notificationTime: notificationTime,
      senderFullName: "",
      senderProfilePhoto: "",
      senderUsername: sender,
    });

  useEffect(() => {
    handleNotificationItemData();
  }, []);

  const handleNotificationItemData = async () => {
    const notificationSenderDoc = await getDoc(
      doc(firestore, `users/${sender}`)
    );

    let message: string = "";

    if (cause === "like") message = `❤️ your post.`;
    if (cause === "comment") message = `commented your post.`;
    if (cause === "follow") message = `started to follow you.`;

    const tempNotificationItemObject: NotificationItemData = {
      senderUsername: sender,
      senderFullName: notificationSenderDoc.data()?.fullname,
      senderProfilePhoto: notificationSenderDoc.data()?.profilePhoto,
      notificationTime: notificationTime,
      message: message,
    };

    setNotificationItemData(tempNotificationItemObject);
  };

  return (
    <Flex id="general-not-item" gap="2" align="center">
      <Image
        src={notificationItemData.senderProfilePhoto}
        rounded="full"
        width="35px"
        height="35px"
      />

      <Flex id="message">
        <Text color="white" fontSize="12pt" as="b">
          <span>{sender}</span>
          <span> </span>
          <span>{notificationItemData.message}</span>
        </Text>
      </Flex>
    </Flex>
  );
}
