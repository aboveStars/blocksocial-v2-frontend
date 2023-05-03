import { notificationStateAtom } from "@/components/atoms/notificationModalAtom";
import { Flex, Icon, Spinner } from "@chakra-ui/react";

import { IoMdNotificationsOutline } from "react-icons/io";

import { useRecoilState, useRecoilValue } from "recoil";

import { GoPrimitiveDot } from "react-icons/go";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";

export default function NotificationButton() {
  const [notificationState, setNotificationState] = useRecoilState(
    notificationStateAtom
  );

  const currentUserState = useRecoilValue(currentUserStateAtom);

  return (
    <Flex
      id="notification-button"
      position="relative"
      cursor={notificationState.loading ? "unset" : "pointer"}
      onClick={() => {
        if (notificationState.loading) return;
        setNotificationState((prev) => ({
          ...prev,
          notificationPanelOpen: true,
        }));
      }}
      hidden={!currentUserState.isThereCurrentUser}
    >
      <Icon as={IoMdNotificationsOutline} color="white" fontSize="2xl" />
      {notificationState.loading ? (
        <Flex position="absolute" right="0" top="0">
          <Spinner color="gray.500" width="5px" height="5px" />
        </Flex>
      ) : (
        !notificationState.allNotificationsRead && (
          <Icon
            as={GoPrimitiveDot}
            color="red"
            position="absolute"
            width="14px"
            height="14px"
            right="0"
            top="0"
          />
        )
      )}
    </Flex>
  );
}
