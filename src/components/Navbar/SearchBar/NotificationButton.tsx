import { notificationModalStateAtom } from "@/components/atoms/notificationModalAtom";
import { Flex, Icon } from "@chakra-ui/react";
import React from "react";

import { IoMdNotificationsOutline } from "react-icons/io";
import { useSetRecoilState } from "recoil";

export default function NotificationButton() {
  const setNotificationModalState = useSetRecoilState(
    notificationModalStateAtom
  );

  return (
    <Flex id="notification-button">
      <Icon
        as={IoMdNotificationsOutline}
        color="white"
        fontSize="2xl"
        cursor="pointer"
        onClick={() => {
          setNotificationModalState(true);
        }}
      />
    </Flex>
  );
}
