import ProviderCardItem from "@/components/Items/User/ProviderCardItem";
import { IProviderCard } from "@/components/types/User";
import { auth, firestore } from "@/firebase/clientApp";
import {
  Button,
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
import React, { SetStateAction, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

type Props = {
  dataOwnerShipModalShowValue: boolean;
  dataOwnerShipModalShowValueSetter: React.Dispatch<SetStateAction<boolean>>;
};

export default function DataOwnershipModal({
  dataOwnerShipModalShowValue,
  dataOwnerShipModalShowValueSetter,
}: Props) {
  const [gettingCurrentDataLoading, setGettingCurrentDataLoading] =
    useState(true);

  const [activeProviders, setActiveProviders] = useState<IProviderCard[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");

  useEffect(() => {
    if (dataOwnerShipModalShowValue) handleGetActiveProviders();
  }, [dataOwnerShipModalShowValue]);

  const handleGetCurrentData = async () => {
    return setGettingCurrentDataLoading(false);

    setGettingCurrentDataLoading(true);
    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);
      setGettingCurrentDataLoading(false);
      return false;
    }
    let respone;
    try {
      respone = await fetch("/api/encryptData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      setGettingCurrentDataLoading(false);
      return console.error("Error while fetching to encryptData API", error);
    }

    if (!respone.ok) {
      setGettingCurrentDataLoading(false);
      return console.error(
        "Error while selling data from api",
        await respone.json()
      );
    }

    const result = await respone.json();
    console.log(result);

    setGettingCurrentDataLoading(false);
  };

  const handleGetActiveProviders = async () => {
    setGettingCurrentDataLoading(true);

    let providersDocs;
    try {
      providersDocs = (await getDocs(collection(firestore, "providers"))).docs;
    } catch (error) {
      console.error("Error while getting providers docs.", error);
      return setGettingCurrentDataLoading(false);
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
    setGettingCurrentDataLoading(false);
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
      isOpen={dataOwnerShipModalShowValue}
      onClose={() => dataOwnerShipModalShowValueSetter(false)}
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
            onClick={() => {
              dataOwnerShipModalShowValueSetter(false);
            }}
          />
        </Flex>

        <ModalBody>
          <Flex hidden={!gettingCurrentDataLoading}>
            <Spinner size="sm" color="white" />
          </Flex>

          <Flex
            hidden={gettingCurrentDataLoading}
            gap="5"
            direction="column"
            align="center"
          >
            <Flex id="provider-selection" direction="column" gap="2">
              <Text textColor="white" fontSize="13pt" fontWeight="700" gap={2}>
                Choose Provider
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
                    key={i}
                  />
                ))}
              </Stack>
            </Flex>

            {selectedProvider ? (
              <Button variant="outline" colorScheme="blue" rounded="full">
                Continue with {selectedProvider}
              </Button>
            ) : (
              <Text color="white" fontWeight="700" fontSize="10pt">
                Please choose a provider to proceed.
              </Text>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
