import { ICurrentProviderData } from "@/components/types/User";
import { firestore } from "@/firebase/clientApp";
import {
  AspectRatio,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { format } from "date-fns";
import { AiOutlineClose } from "react-icons/ai";
import { BsCalendar4, BsCalendarCheckFill } from "react-icons/bs";
import { providerModalStateAtom } from "../../../atoms/providerModalAtom";

export default function CurrentProviderModal() {
  const [providerModalState, setProvideModalState] = useRecoilState(
    providerModalStateAtom
  );

  const [isOpen, setIsOpen] = useState(false);

  const [gettingCurrentProviderData, setGetingCurrentProviderData] =
    useState(true);

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const [currentProviderData, setCurrentProviderData] =
    useState<ICurrentProviderData>({
      currency: "",
      deal: -1,
      endTime: -1,
      name: "",
      startTime: -1,
      image: "",
      progress: -1,
    });

  useEffect(() => {
    const openStatus =
      providerModalState.open && providerModalState.view === "currentProvider";
    if (openStatus) handleGetCurrentProviderData();
    setIsOpen(openStatus);
  }, [providerModalState]);

  const handleGetCurrentProviderData = async () => {
    setGetingCurrentProviderData(true);
    try {
      const currentProviderDocSnapshot = await getDoc(
        doc(
          firestore,
          `users/${currentUserState.username}/provider/currentProvider`
        )
      );
      if (!currentProviderDocSnapshot.exists()) {
        setGetingCurrentProviderData(false);
        throw new Error(
          `There is no provider with assosicated with this user.`
        );
      }

      let providerImageUrl = "";
      try {
        const providerDocSnapshot = await getDoc(
          doc(firestore, `providers/${currentProviderDocSnapshot.data().name}`)
        );

        if (!providerDocSnapshot.exists()) {
          throw new Error(
            `There is no documnet for provider of: ${
              currentProviderDocSnapshot.data().name
            }`
          );
        }

        providerImageUrl = providerDocSnapshot.data().image;
      } catch (error) {
        return console.error(
          "Error while getting image of current provider",
          error
        );
      }

      const progressValue: number =
        (1 -
          (currentProviderDocSnapshot.data().endTime - Date.now()) /
            1000 /
            60 /
            60 /
            24 /
            30) *
        100;

      setCurrentProviderData({
        currency: currentProviderDocSnapshot.data().currency,
        deal: currentProviderDocSnapshot.data().deal,
        endTime: currentProviderDocSnapshot.data().endTime,
        name: currentProviderDocSnapshot.data().name,
        startTime: currentProviderDocSnapshot.data().startTime,
        image: providerImageUrl,
        progress: progressValue,
      });
    } catch (error) {
      setGetingCurrentProviderData(false);
      return console.error("Error while getting current user doc.", error);
    }

    setGetingCurrentProviderData(false);
  };

  return (
    <Modal
      id="dataOwnershipModal"
      size={{
        base: "full",
        sm: "full",
        md: "md",
        lg: "md",
      }}
      isOpen={isOpen}
      onClose={() => {
        setProvideModalState((prev) => ({ ...prev, open: false }));
      }}
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
            Data Ownership
          </Flex>
          <Icon
            as={AiOutlineClose}
            color="white"
            fontSize="15pt"
            cursor="pointer"
            onClick={() =>
              setProvideModalState((prev) => ({ ...prev, open: false }))
            }
          />
        </Flex>

        <ModalBody>
          <Flex hidden={!gettingCurrentProviderData}>
            <Spinner size="sm" color="white" />
          </Flex>

          <Flex hidden={gettingCurrentProviderData} gap="5" direction="column">
            <Flex id="Current-Provider-Area" direction="column" gap="2">
              <Text textColor="white" fontSize="13pt" fontWeight="700" gap={2}>
                Current Provider
              </Text>
              <Flex position="relative">
                <Flex direction="column" justify="center" width="50%" gap="2">
                  <Flex direction="column">
                    <Text color="gray.500" fontSize="10pt" fontWeight="600">
                      Name
                    </Text>
                    <Text color="white" fontSize="12pt" fontWeight="600">
                      {currentProviderData.name}
                    </Text>
                  </Flex>

                  <Flex direction="column">
                    <Text color="gray.500" fontSize="10pt" fontWeight="600">
                      Deal
                    </Text>
                    <Flex
                      gap="1"
                      color="white"
                      fontSize="12pt"
                      fontWeight="600"
                    >
                      <Text>{currentProviderData.deal}</Text>
                      <Text>{currentProviderData.currency}</Text>
                    </Flex>
                  </Flex>

                  <Flex direction="column">
                    <Text color="gray.500" fontSize="10pt" fontWeight="600">
                      Duration
                    </Text>
                    <Flex align="center" gap="5" pl="0.5">
                      <Flex direction="column" gap="1">
                        <Flex align="center" gap="1">
                          <Icon as={BsCalendar4} color="white" />
                          <Text fontSize="12pt" fontWeight="600" color="white">
                            {format(
                              new Date(currentProviderData.startTime),
                              "dd MMM yyyy"
                            )}
                          </Text>
                        </Flex>
                        <Flex align="center" gap="1">
                          <Icon as={BsCalendarCheckFill} color="white" />
                          <Text fontSize="12pt" fontWeight="600" color="white">
                            {format(
                              new Date(currentProviderData.endTime),
                              "dd MMM yyyy"
                            )}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>

                  <Flex direction="column" gap="1">
                    <Text color="gray.500" fontSize="10pt" fontWeight="600">
                      Progress
                    </Text>
                    <Flex>
                      <CircularProgress
                        value={currentProviderData.progress}
                        color={
                          currentProviderData.progress <= 25
                            ? "red"
                            : currentProviderData.progress <= 50
                            ? "yellow"
                            : currentProviderData.progress <= 75
                            ? "blue"
                            : "green"
                        }
                        size="59px"
                      >
                        <CircularProgressLabel color="white" fontWeight="600">
                          {
                            currentProviderData.progress
                              .toString()
                              .split(".")[0]
                          }
                          %
                        </CircularProgressLabel>
                      </CircularProgress>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex position="absolute" right="0" width="35%">
                  <AspectRatio ratio={1} width="100%">
                    <Image src={currentProviderData.image} borderRadius="5" />
                  </AspectRatio>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
