import { notificationStateAtom } from "@/components/atoms/notificationModalAtom";
import { INotificationServerData } from "@/components/types/User";
import { firestore } from "@/firebase/clientApp";
import { Flex, Icon, Image, SkeletonCircle, Text } from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BsDot } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { GoPrimitiveDot } from "react-icons/go";
import { useSetRecoilState } from "recoil";

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

  const router = useRouter();

  const setNotificationState = useSetRecoilState(notificationStateAtom);

  const [
    gettingNotificationSenderInformation,
    setGettingNotificationSenderInformation,
  ] = useState(true);

  useEffect(() => {
    handleNotificationItemData();
  }, []);

  const handleNotificationItemData = async () => {
    setGettingNotificationSenderInformation(true);
    const notificationSenderDoc = await getDoc(
      doc(firestore, `users/${sender}`)
    );

    let message: string = "";

    if (cause === "like") message = `❤️ your post`;
    if (cause === "comment") message = `✍️ to your post`;
    if (cause === "follow") message = `started to 🫡 you`;

    const tempNotificationItemObject: NotificationItemData = {
      senderUsername: sender,
      senderFullName: notificationSenderDoc.data()?.fullname,
      senderProfilePhoto: notificationSenderDoc.data()?.profilePhoto,
      notificationTime: notificationTime,
      message: message,
    };

    setNotificationItemData(tempNotificationItemObject);
    setGettingNotificationSenderInformation(false);
  };

  return (
    <Flex id="general-not-item" gap="2" align="center" position="relative">
      <Flex
        cursor="pointer"
        onClick={() => {
          setNotificationState((prev) => ({
            ...prev,
            notificationPanelOpen: false,
          }));
          router.push(`/${sender}`);
        }}
      >
        <Image
          src={notificationItemData.senderProfilePhoto}
          rounded="full"
          maxWidth="35px"
          maxHeight="35px"
          fallback={
            notificationItemData.senderProfilePhoto ||
            gettingNotificationSenderInformation ? (
              <SkeletonCircle
                width="35px"
                height="35px"
                startColor="gray.100"
                endColor="gray.800"
              />
            ) : (
              <Icon as={CgProfile} color="white" height="35px" width="35px" />
            )
          }
        />
      </Flex>

      <Flex
        id="message"
        align="center"
        gap="1"
        wrap="wrap"
        cursor="pointer"
        onClick={() => {
          setNotificationState((prev) => ({
            ...prev,
            notificationPanelOpen: false,
          }));
          router.push(`/${sender}`);
        }}
        pr="3"
      >
        <Text fontSize="12pt" color="white" as="b">
          {sender}
        </Text>
        <Text fontSize="10pt" color="gray.100">
          {notificationItemData.message}
        </Text>
        <Flex align="center">
          <Icon as={BsDot} color="white" width="10px" height="10px" />
        </Flex>

        <Flex id="date" color="gray.300" fontSize="8pt" align="center">
          {formatDistanceToNow(notificationItemData.notificationTime)}
        </Flex>
      </Flex>

      {!seen && (
        <Icon
          as={GoPrimitiveDot}
          color="red"
          fontSize="11pt"
          position="absolute"
          right="0"
        />
      )}
    </Flex>
  );
}
