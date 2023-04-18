import { Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import Posts from "../Post/Posts";
import { PostItemData } from "../types/Post";
import { UserInServer } from "../types/User";
import Header from "../user/Header";

type Props = {
  userInformation: UserInServer;
  postItemsDatas: PostItemData[];
};

export default function UserPageLayout({
  userInformation,
  postItemsDatas,
}: Props) {
  const [innerHeight, setInnerHeight] = useState("");

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
  }, []);
  return (
    <>
      <Flex width="100%">
        <Flex
          grow={1}
          display={{
            base: "none",
            sm: "none",
            md: "flex",
            lg: "flex",
          }}
        />

        <Flex
          direction="column"
          width={{
            base: "100%",
            sm: "100%",
            md: "550px",
            lg: "550px",
          }}
          minHeight={innerHeight}
        >
          <Flex justify="center" align="center" width="100%">
            <Header userInformation={userInformation} />
          </Flex>
          <Flex justify="center" width="100%">
            <Posts postsItemDatas={postItemsDatas} />
          </Flex>
        </Flex>
        <Flex
          grow={1}
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


