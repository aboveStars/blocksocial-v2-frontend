import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postCreateModalStateAtom } from "@/components/atoms/postCreateModalAtom";
import PostCreateModal from "@/components/Modals/Post/PostCreateModal";
import { Flex, Icon } from "@chakra-ui/react";
import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function PostCreateButton() {
  const setPostCreateModalState = useSetRecoilState(postCreateModalStateAtom);
  const currentUserState = useRecoilValue(currentUserStateAtom);
  return (
    <>
      <PostCreateModal />
      <Flex id="button">
        {currentUserState.isThereCurrentUser && (
          <Icon
            as={AiOutlinePlus}
            color="white"
            fontSize="2xl"
            cursor="pointer"
            onClick={() => {
              setPostCreateModalState({ isOpen: true });
              console.log("Post Create Fired");
            }}
          />
        )}
      </Flex>
    </>
  );
}
