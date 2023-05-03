import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postCreateModalStateAtom } from "@/components/atoms/postCreateModalAtom";
import { Flex, Icon } from "@chakra-ui/react";
import { AiOutlinePlus } from "react-icons/ai";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function PostCreateButton() {
  const setPostCreateModalState = useSetRecoilState(postCreateModalStateAtom);
  const currentUserState = useRecoilValue(currentUserStateAtom);
  return (
    <Flex id="button">
      {currentUserState.isThereCurrentUser && (
        <Icon
          as={AiOutlinePlus}
          color="white"
          fontSize="2xl"
          cursor="pointer"
          onClick={() => {
            setPostCreateModalState({ isOpen: true });
          }}
        />
      )}
    </Flex>
  );
}
