import ProviderCardItem from "@/components/Items/User/ProviderCardItem";
import { ICurrentProviderData, IProviderCard } from "@/components/types/User";
import { auth, firestore } from "@/firebase/clientApp";
import {
  Button,
  Flex,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { providerModalStateAtom } from "../../../atoms/providerModalAtom";
import { AiOutlineClose } from "react-icons/ai";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import moment from "moment";

export default function ChangeProviderModal() {
  const [activeProviders, setActiveProviders] = useState<IProviderCard[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("BlockSocial");

  const [providerModalState, setProvideModalState] = useRecoilState(
    providerModalStateAtom
  );

  const [chooseProviderLoading, setChooseProviderLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const [gettingCurrentProviderData, setGetingCurrentProviderData] =
    useState(true);

  const [gettingAvaliableProviders, setGettingAvaliableProviders] =
    useState(false);

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const [currentProviderData, setCurrentProviderData] =
    useState<ICurrentProviderData>({
      apiEndpoint: "",
      currency: "",
      deal: -1,
      endTime: -1,
      name: "",
      startTime: -1,
      image: "",
    });

  useEffect(() => {
    const openStatus =
      providerModalState.open && providerModalState.view === "changeProvider";
    if (openStatus) handleGetCurrentProviderData();
    setIsOpen(openStatus);
  }, [providerModalState]);

  const handleGetActiveProviders = async () => {
    setGettingAvaliableProviders(true);

    let providersDocs;
    try {
      providersDocs = (await getDocs(collection(firestore, "providers"))).docs;
    } catch (error) {
      console.error("Error while getting providers docs.", error);
      return setGettingAvaliableProviders(false);
    }

    let tempActiveProviders: IProviderCard[] = [];

    for (const proivderDoc of providersDocs) {
      const providerObject: IProviderCard = {
        name: proivderDoc.data().name,
        currency: proivderDoc.data().currency,
        deal: proivderDoc.data().deal,
        description: proivderDoc.data().description,
        image: proivderDoc.data().image,
      };

      tempActiveProviders.push(providerObject);
    }

    setActiveProviders(tempActiveProviders);
    setGettingAvaliableProviders(false);
  };

  const handleChooseProvider = async () => {
    setChooseProviderLoading(true);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);
      return setChooseProviderLoading(false);
    }

    let response: Response;
    try {
      response = await fetch("/api/chooseProvider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          providerName: selectedProvider,
        }),
      });
    } catch (error) {
      console.error("Error while 'fetching' to 'chooseProvider' API");
      return setChooseProviderLoading(false);
    }

    if (!response.ok) {
      console.error("Error from 'chooseProvider' API:", await response.json());
      return setChooseProviderLoading(false);
    }

    setChooseProviderLoading(false);
    return setProvideModalState((prev) => ({ ...prev, open: false }));
  };

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

      setCurrentProviderData({
        apiEndpoint: currentProviderDocSnapshot.data().apiEndpoint,
        currency: currentProviderDocSnapshot.data().currency,
        deal: currentProviderDocSnapshot.data().deal,
        endTime: currentProviderDocSnapshot.data().endTime,
        name: currentProviderDocSnapshot.data().name,
        startTime: currentProviderDocSnapshot.data().startTime,
        image: providerImageUrl,
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
          height="50px"
          bg="black"
          justify="space-between"
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
              <Flex gap="1">
                <Image
                  src={currentProviderData.image}
                  width="100px"
                  height="100px"
                  borderRadius="5"
                />
                <Flex direction="column" justify="center">
                  <Flex gap="1">
                    <Text color="white" fontSize="10pt">
                      Name:
                    </Text>
                    <Text color="white" fontSize="10pt">
                      {currentProviderData.name}
                    </Text>
                  </Flex>
                  <Flex gap="1">
                    <Text color="white" fontSize="10pt">
                      Price:
                    </Text>
                    <Text color="white" fontSize="10pt">
                      {currentProviderData.deal}
                    </Text>
                    <Text color="white" fontSize="10pt">
                      {currentProviderData.currency}
                    </Text>
                  </Flex>
                  <Flex gap="1">
                    <Text color="white" fontSize="10pt">
                      From:
                    </Text>
                    <Text color="white" fontSize="10pt">
                      {moment(
                        new Date(currentProviderData.startTime)
                      ).fromNow()}
                    </Text>
                  </Flex>
                  <Flex gap="1">
                    <Text color="white" fontSize="10pt">
                      Until:
                    </Text>
                    <Text color="white" fontSize="10pt">
                      {moment(new Date(currentProviderData.endTime)).fromNow()}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
