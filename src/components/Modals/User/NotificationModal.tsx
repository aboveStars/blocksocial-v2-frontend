import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { notificationStateAtom } from "@/components/atoms/notificationModalAtom";
import NotificationItem from "@/components/Items/User/NotificationItem";
import { INotificationServerData } from "@/components/types/User";
import { auth, firestore } from "@/firebase/clientApp";
import {
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useRecoilState, useRecoilValue } from "recoil";

export default function NotificationModal() {
  const [notificationState, setNotificationState] = useRecoilState(
    notificationStateAtom
  );

  const [notificationData, setNotificationData] = useState<
    INotificationServerData[]
  >([]);

  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const router = useRouter();

  useEffect(() => {
    if (currentUserState.username) handleNotificationData();
  }, [
    notificationState.notificationPanelOpen,
    currentUserState.username,
    router.asPath,
  ]);

  const handleNotificationData = async () => {
    if (!currentUserState.isThereCurrentUser) {
      return;
    }

    setNotificationsLoading(true);
    setNotificationState((prev) => ({ ...prev, loading: true }));
    const notificationDocs = (
      await getDocs(
        query(
          collection(
            firestore,
            `users/${currentUserState.username}/notifications`
          ),
          orderBy("notificationTime", "desc")
        )
      )
    ).docs;
    let unSeenNotificationsDocsIds: string[] = [];
    let tempNotifications: INotificationServerData[] = [];
    for (const notificationDoc of notificationDocs) {
      const newNotificationObject: INotificationServerData = {
        notificationTime: notificationDoc.data().notificationTime,
        seen: notificationDoc.data().seen,
        sender: notificationDoc.data().sender,
        cause: notificationDoc.data().cause,
      };
      tempNotifications.push(newNotificationObject);

      if (!notificationDoc.data()?.seen)
        unSeenNotificationsDocsIds.push(notificationDoc.id);
    }

    setNotificationData(tempNotifications);

    if (unSeenNotificationsDocsIds.length > 0) {
      if (!notificationState.notificationPanelOpen) {
        console.log("There is unseen messages...");
        return setNotificationState((prev) => ({
          ...prev,
          allNotificationsRead: false,
          loading: false,
        }));
      }

      // I put making loading false here too becasue api is fucking slow so I don't want users to wait so long...
      setNotificationsLoading(false);

      setNotificationState((prev) => {
        return { ...prev, allNotificationsRead: true, loading: false };
      });

      let idToken = "";
      try {
        idToken = (await auth.currentUser?.getIdToken()) as string;
      } catch (error) {
        return console.error("Error while getting 'idToken'", error);
      }

      let response: Response;
      try {
        response = await fetch("/api/seenNotification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            unSeenNotificationsDocsIds: unSeenNotificationsDocsIds,
          }),
        });
      } catch (error) {
        return console.error("Error while 'fetching' to 'follow' API");
      }

      if (!response.ok) {
        return console.error("Error from 'follow' API:", await response.json());
      }
    } else {
      setNotificationState((prev) => ({
        ...prev,
        allNotificationsRead: true,
        loading: false,
      }));
    }

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
      isOpen={notificationState.notificationPanelOpen}
      onClose={() =>
        setNotificationState((prev) => ({
          ...prev,
          notificationPanelOpen: false,
        }))
      }
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
              setNotificationState((prev) => ({
                ...prev,
                notificationPanelOpen: false,
              }));
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
