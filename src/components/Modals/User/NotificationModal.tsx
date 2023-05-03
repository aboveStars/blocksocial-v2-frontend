import { notificationModalStateAtom } from "@/components/atoms/notificationModalAtom";
import NotificationItem from "@/components/Items/User/NotificationItem";
import { INotificationServerData } from "@/components/types/User";
import { firestore } from "@/firebase/clientApp";
import {
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useRecoilState } from "recoil";

type Props = {};

export default function NotificationModal({}: Props) {
  const [notificationModalState, setNotificationModalState] = useRecoilState(
    notificationModalStateAtom
  );

  const [notificationData, setNotificationData] = useState<
    INotificationServerData[]
  >([]);

  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    if (!notificationModalState) return;
    handleNotificationData();
  }, [notificationModalState]);

  const handleNotificationData = async () => {
    setNotificationsLoading(true);
    const notificationDocs = (
      await getDocs(collection(firestore, `users/yunuskorkmaz/notifications`))
    ).docs;
    let tempNotifications: INotificationServerData[] = [];
    for (const notificationDoc of notificationDocs) {
      const newNotificationObject: INotificationServerData = {
        notificationTime: notificationDoc.data().notificationTime,
        seen: notificationDoc.data().seen,
        sender: notificationDoc.data().sender,
        cause: notificationDoc.data().cause,
      };
      tempNotifications.push(newNotificationObject);
    }

    setNotificationData(tempNotifications);

    console.log(tempNotifications);

    setNotificationsLoading(false);
  };

  return (
    <Modal
      size={{
        base: "full",
        sm: "full",
        md: "md",
        lg: "md",
      }}
      isOpen={notificationModalState}
      onClose={() => setNotificationModalState(false)}
      autoFocus={false}
    >
      <ModalOverlay backdropFilter="auto" backdropBlur="8px" />
      <ModalContent
        bg="black"
        minHeight={{
          md: "500px",
          lg: "500px",
        }}
      >
        <Flex
          position="sticky"
          top="0"
          px={6}
          align="center"
          justify="space-between"
          height="50px"
          bg="black"
        >
          <Flex textColor="white" fontSize="17pt" fontWeight="700" gap={2}>
            Notifications
          </Flex>

          <Icon
            as={AiOutlineClose}
            color="white"
            fontSize="15pt"
            cursor="pointer"
            onClick={() => {
              setNotificationModalState(false);
            }}
          />
        </Flex>
        <ModalBody>
          {notificationsLoading ? (
            <Flex>
              <Spinner size="sm" color="white" />
            </Flex>
          ) : (
            <Stack gap={2}>
              {notificationData.map((n, i) => (
                <NotificationItem
                  cause={n.cause}
                  notificationTime={n.notificationTime}
                  seen={n.seen}
                  sender={n.sender}
                  key={i}
                />
              ))}
            </Stack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
