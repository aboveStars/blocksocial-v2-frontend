import ProviderCardItem from "@/components/Items/User/ProviderCardItem";
import { auth } from "@/firebase/clientApp";
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { IProviderShowcaseItem } from "@/components/types/User";
import { providerModalStateAtom } from "../../../atoms/providerModalAtom";

export default function ChooseProviderModal() {
  const [gettingAvaliableProviders, setGettingAvaliableProviders] =
    useState(true);

  const [activeProviders, setActiveProviders] = useState<
    IProviderShowcaseItem[]
  >([]);
  const [selectedProvider, setSelectedProvider] = useState("BlockSocial");

  const [providerModalState, setProvideModalState] = useRecoilState(
    providerModalStateAtom
  );

  const [chooseProviderLoading, setChooseProviderLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openStatus =
      providerModalState.open && providerModalState.view === "chooseProvider";

    if (openStatus) handleGetActiveProviders();
    setIsOpen(openStatus);
  }, [providerModalState]);

  const handleGetActiveProviders = async () => {
    setGettingAvaliableProviders(true);

    let response: Response;
    try {
      response = await fetch(
        "http://192.168.1.5:3000/api/client/provideShowcase",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: process.env
              .NEXT_PUBLIC_API_KEY_BETWEEN_SERVICES as string,
          },
        }
      );
    } catch (error) {
      console.error("Error while 'fetching' to 'provideShowcase' API");
      return false;
    }

    if (!response.ok) {
      console.error("Error from 'provideShowcase' API:", await response.json());
      return false;
    }

    const { providersShowcaseDatas } = await response.json();

    let tempProviderShowcaseDatas: IProviderShowcaseItem[] = [];

    for (const providerShowcaseItemData of providersShowcaseDatas) {
      tempProviderShowcaseDatas.push(providerShowcaseItemData);
    }

    setActiveProviders(tempProviderShowcaseDatas);
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
      response = await fetch("/api/provider/chooseProvider", {
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
      onClose={() => {}}
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
            Welcome to BlockSocial
          </Flex>
        </Flex>

        <ModalBody>
          <Flex hidden={!gettingAvaliableProviders}>
            <Spinner size="sm" color="white" />
          </Flex>

          <Flex hidden={gettingAvaliableProviders} gap="5" direction="column">
            <Flex id="provider-selection" direction="column" gap="2">
              <Text textColor="white" fontSize="13pt" fontWeight="700" gap={2}>
                Choose your provider
              </Text>
              <Stack gap="1">
                {activeProviders.map((ap, i) => (
                  <ProviderCardItem
                    description={ap.description}
                    image={ap.image}
                    name={ap.name}
                    minPrice={ap.minPrice}
                    maxPrice={ap.maxPrice}
                    clientCount={ap.clientCount}
                    score={ap.score}
                    selectedProviderValue={selectedProvider}
                    setSelectedProviderValue={setSelectedProvider}
                    chooseIsDone={chooseProviderLoading}
                    key={i}
                  />
                ))}
              </Stack>
            </Flex>

            <Button
              variant="outline"
              colorScheme="blue"
              rounded="full"
              onClick={handleChooseProvider}
              isLoading={chooseProviderLoading}
              mb="5"
              size="sm"
            >
              Continue with {selectedProvider}
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
