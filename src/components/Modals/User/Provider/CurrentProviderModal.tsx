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
import {
  DocumentData,
  DocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import ProviderUserStarRateItem from "@/components/Items/Provider/ProviderUserStarRateItem";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { format } from "date-fns";
import { AiOutlineClose } from "react-icons/ai";
import { BsCalendar4, BsCalendarCheckFill } from "react-icons/bs";
import { providerModalStateAtom } from "../../../atoms/providerModalAtom";
import ProviderScoreStarItem from "@/components/Items/Provider/ProviderScoreStarItem";

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
      clientCount: 0,
      description: "",
      earning: 0,
      endTime: 0,
      name: "",
      score: 0,
      currentUserScore: 0,
      startTime: 0,
      progress: 0,
      image: "",
    });

  useEffect(() => {
    const openStatus =
      providerModalState.open && providerModalState.view === "currentProvider";
    if (openStatus) handleGetCurrentProviderData();
    setIsOpen(openStatus);
  }, [providerModalState]);

  const handleGetCurrentProviderData = async () => {
    /**
     * This area has two steps.
     * First one get our "special" status like "name", "earning", "startTime" and "endTime" from BS-Database.
     * Second one get general provider status like "score", "description", "clientCount"
     * We should use parallel fetching.
     */

    setGetingCurrentProviderData(true);

    const specialOperationResult =
      await getSpecializedInformtaionAboutCurrentProvider();

    if (!specialOperationResult) {
      console.error(
        "Error while creating current provider data. (Special Information Fetching is failed."
      );
      setGetingCurrentProviderData(false);
      return false;
    }

    const generalInformationResult =
      await getGeneralInformationAboutCurrentProvider(
        specialOperationResult.name
      );

    if (!generalInformationResult) {
      console.error(
        "Error while creating current provider data. (General Information Fetching is failed.)"
      );
      setGetingCurrentProviderData(false);
      return false;
    }

    const progressValue: number =
      (1 -
        (specialOperationResult.endTime - Date.now()) /
          1000 /
          60 /
          60 /
          24 /
          30) *
      100;

    const tempCurrentUserProviderData: ICurrentProviderData = {
      ...specialOperationResult,
      ...generalInformationResult,
      progress: progressValue,
    };

    setCurrentProviderData(tempCurrentUserProviderData);

    setGetingCurrentProviderData(false);
  };

  const getSpecializedInformtaionAboutCurrentProvider = async () => {
    let currentProviderDocSnapshot: DocumentSnapshot<DocumentData>;
    try {
      currentProviderDocSnapshot = await getDoc(
        doc(
          firestore,
          `users/${currentUserState.username}/provider/currentProvider`
        )
      );
    } catch (error) {
      console.error(
        "Error while geting current provider data. (We were getting specialized infos.",
        error
      );
      return false;
    }

    if (!currentProviderDocSnapshot.exists) {
      console.error(
        "Error while getting current provider data. (Doc doesn't exist)"
      );
      return false;
    }

    const specializedInformation = {
      name: currentProviderDocSnapshot.data()?.name,
      startTime: currentProviderDocSnapshot.data()?.startTime,
      endTime: currentProviderDocSnapshot.data()?.endTime,
      earning: currentProviderDocSnapshot.data()?.earning,
      currentUserScore: currentProviderDocSnapshot.data()?.userScore,
    };

    return specializedInformation;
  };

  const getGeneralInformationAboutCurrentProvider = async (
    currentProviderName: string
  ) => {
    let response: Response;
    try {
      response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_TO_PROVIDER_PANEL_FOR_NORMAL_BLOCKSOCIAL}/client/provideProviderInformation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: process.env
              .NEXT_PUBLIC_API_KEY_BETWEEN_SERVICES as string,
          },
          body: JSON.stringify({
            providerName: currentProviderName,
          }),
        }
      );
    } catch (error) {
      console.error(
        "Error while 'fetching' to 'provideProviderInformation' API"
      );
      return false;
    }

    if (!response.ok) {
      console.error(
        "Error from 'provideProviderInformation' API:",
        await response.text()
      );
      return false;
    }

    const { providerInformation } = await response.json();

    const generalInformation = {
      score: providerInformation.score,
      clientCount: providerInformation.clientCount,
      description: providerInformation.description,
      image: providerInformation.image,
    };

    return generalInformation;
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
                      Description
                    </Text>
                    <Text color="white" fontSize="12pt" fontWeight="600">
                      {currentProviderData.description}
                    </Text>
                  </Flex>
                  <Flex direction="column">
                    <Text color="gray.500" fontSize="10pt" fontWeight="600">
                      Client Count
                    </Text>
                    <Text color="white" fontSize="12pt" fontWeight="600">
                      {currentProviderData.clientCount}
                    </Text>
                  </Flex>

                  <Flex direction="column" gap="1">
                    <Text color="gray.500" fontSize="10pt" fontWeight="600">
                      Score
                    </Text>
                    <Text color="white" fontSize="12pt" fontWeight="600">
                      <ProviderScoreStarItem
                        value={
                          currentProviderData.score as 0 | 1 | 2 | 3 | 4 | 5
                        }
                      />
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text color="gray.500" fontSize="10pt" fontWeight="600">
                      Your Score
                    </Text>
                    <ProviderUserStarRateItem
                      value={
                        currentProviderData.currentUserScore as
                          | 0
                          | 1
                          | 2
                          | 3
                          | 4
                          | 5
                      }
                      key={currentProviderData.currentUserScore}
                    />
                  </Flex>

                  <Flex direction="column">
                    <Text color="gray.500" fontSize="10pt" fontWeight="600">
                      Earning
                    </Text>
                    <Flex
                      gap="1"
                      color="white"
                      fontSize="12pt"
                      fontWeight="600"
                    >
                      <Text>$</Text>
                      <Text>{currentProviderData.earning}</Text>
                    </Flex>
                  </Flex>

                  <Flex direction="column">
                    <Text color="gray.500" fontSize="10pt" fontWeight="600">
                      Duration
                    </Text>
                    <Flex align="center" gap="3" pl="0.5">
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
