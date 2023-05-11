import { auth } from "@/firebase/clientApp";
import {
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
} from "@chakra-ui/react";
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

  useEffect(() => {
    if (dataOwnerShipModalShowValue) handleGetCurrentData();
  }, [dataOwnerShipModalShowValue]);

  const handleGetCurrentData = async () => {
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
