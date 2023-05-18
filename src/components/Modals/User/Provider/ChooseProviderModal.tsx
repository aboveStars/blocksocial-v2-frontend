import ProviderCardItem from "@/components/Items/User/ProviderCardItem";
import { IProviderCard } from "@/components/types/User";
import { auth, firestore } from "@/firebase/clientApp";
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
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { providerModalStateAtom } from "../../../atoms/providerModalAtom";

export default function ChooseProviderModal() {
  const [gettingAvaliableProviders, setGettingAvaliableProviders] =
    useState(true);

  const [activeProviders, setActiveProviders] = useState<IProviderCard[]>([]);
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

          <Flex
            hidden={gettingAvaliableProviders}
            gap="5"
            direction="column"
            align="center"
          >
            <Flex id="provider-selection" direction="column" gap="2">
              <Text textColor="white" fontSize="13pt" fontWeight="700" gap={2}>
                Choose your provider
              </Text>
              <Stack>
                {activeProviders.map((ap, i) => (
                  <ProviderCardItem
                    description={ap.description}
                    image={ap.image}
                    name={ap.name}
                    offer={`${ap.deal} ${ap.currency}`}
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
            >
              Continue with {selectedProvider}
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
