import { providerModalStateAtom } from "@/components/atoms/providerModalAtom";
import useWithdraw from "@/hooks/providerHooks/useWithdraw";
import {
  Button,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import React, { useRef, useState } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BiError } from "react-icons/bi";
import { useSetRecoilState } from "recoil";

export default function WithdrawArea() {
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const withdrawTransferAddressInputRef = useRef<HTMLInputElement>(null);

  const [isWithdrawAddressRight, setIsWithdrawAddressRight] = useState(false);

  const [loading, setLoading] = useState(false);

  const { withdraw } = useWithdraw();

  const handleWithdrawAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const susAddress = event.target.value;
    if (susAddress.length === 0) {
      // prevent bad ui
      setIsWithdrawAddressRight(true);
      setWithdrawAddress(susAddress);
      return;
    }
    const validationStatus = ethers.isAddress(susAddress);
    setIsWithdrawAddressRight(validationStatus);
    if (validationStatus) {
      if (withdrawTransferAddressInputRef.current) {
        withdrawTransferAddressInputRef.current.blur();
      }
    }
    if (validationStatus && !susAddress.startsWith("0x")) {
      setWithdrawAddress(`0x${susAddress}`);
      return;
    }
    setWithdrawAddress(susAddress);
  };

  const setProviderModalState = useSetRecoilState(providerModalStateAtom);

  const handleWithdrawButton = async () => {
    const withdrawAddressValidationStatus = ethers.isAddress(withdrawAddress);
    if (!withdrawAddressValidationStatus) {
      return setIsWithdrawAddressRight(false);
    }
    if (!setIsWithdrawAddressRight) return;

    setLoading(true);

    const operationResult = await withdraw(withdrawAddress);

    if (operationResult) {
      setProviderModalState({ open: true, view: "chooseProvider" });
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleWithdrawButton();
      }}
      style={{
        marginTop: "1",
      }}
    >
      <InputGroup>
        <FormControl variant="floating">
          <Input
            ref={withdrawTransferAddressInputRef}
            required
            name="nftTransferAddress"
            placeholder=" "
            mb={2}
            pr={"9"}
            onChange={handleWithdrawAddressChange}
            value={withdrawAddress}
            _hover={{
              border: "1px solid",
              borderColor: "blue.500",
            }}
            textColor="white"
            fontSize="10pt"
            bg="black"
            spellCheck={false}
            isRequired
            disabled={loading}
          />
          <FormLabel
            bg="rgba(0,0,0)"
            textColor="gray.500"
            fontSize="10pt"
            my={2.5}
          >
            ERC-20 Polygon Account Address
          </FormLabel>
        </FormControl>
        <InputRightElement hidden={withdrawAddress.length === 0}>
          {!isWithdrawAddressRight ? (
            <Icon as={BiError} fontSize="20px" color="red" />
          ) : (
            <Icon as={AiOutlineCheckCircle} fontSize="20px" color="green" />
          )}
        </InputRightElement>
      </InputGroup>
      <Button
        width="100%"
        variant="outline"
        type="submit"
        colorScheme="blue"
        size="sm"
        isDisabled={!isWithdrawAddressRight}
        isLoading={loading}
      >
        Withdraw
      </Button>
    </form>
  );
}
