import { CommentDataWithCommentDocPath } from "@/components/types/Post";

export default function useSortByUsername() {
  const sortCommentsByUsername = (
    commentDatasWithCommentDocPathArray: CommentDataWithCommentDocPath[],
    currentUserUsername: string
  ) => {
    return commentDatasWithCommentDocPathArray.sort((a, b) => {
      if (
        a.commentSenderUsername === currentUserUsername &&
        b.commentSenderUsername !== currentUserUsername
      )
        return -1;
      else if (
        a.commentSenderUsername !== currentUserUsername &&
        b.commentSenderUsername === currentUserUsername
      )
        return 1;
      else return 0;
    });
  };
  const sortLikesByUsername = (
    whoLiked: string[],
    currentUserUsername: string
  ) => {
    return whoLiked.sort((a, b) => {
      if (a === currentUserUsername && b !== currentUserUsername) return -1;
      else if (a !== currentUserUsername && b === currentUserUsername) return 1;
      else return 0;
    });
  };
  const sortFollowersByUsername = (
    followings: string[],
    currentUserUsername: string
  ) => {
    return followings.sort((a, b) => {
      if (a === currentUserUsername && b !== currentUserUsername) return -1;
      else if (a !== currentUserUsername && b === currentUserUsername) return 1;
      else return 0;
    });
  };

  const sortFollowingsByUsername = (
    followers: string[],
    currentUserUsername: string
  ) => {
    return followers.sort((a, b) => {
      if (a === currentUserUsername && b !== currentUserUsername) return -1;
      else if (a !== currentUserUsername && b === currentUserUsername) return 1;
      else return 0;
    });
  };

  return {
    sortCommentsByUsername,
    sortLikesByUsername,
    sortFollowersByUsername,
    sortFollowingsByUsername,
  };
}
