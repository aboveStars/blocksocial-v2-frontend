import { Flex } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Posts from "../Post/Posts";
import { PostItemData } from "../types/Post";

type Props = {
  postItemsDatas: PostItemData[];
};

export default function MainPageLayout({ postItemsDatas }: Props) {
  const [innerHeight, setInnerHeight] = useState("");

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
  }, []);
  return (
    <>
      <Flex width="100%">
        <Flex
          flexGrow={1}
          display={{
            base: "none",
            sm: "none",
            md: "flex",
            lg: "flex",
          }}
        />

        <Flex
          width={{
            base: "100%",
            sm: "100%",
            md: "550px",
            lg: "550px",
          }}
          minHeight={innerHeight}
        >
          <Posts postsItemDatas={postItemsDatas} />
        </Flex>

        <Flex
          flexGrow={1}
          display={{
            base: "none",
            sm: "none",
            md: "flex",
            lg: "flex",
          }}
        />
      </Flex>
    </>
  );
}
