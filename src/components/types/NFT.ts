export type NFTMetadata = {
  description: string;
  external_url?: string;
  image?: string;
  name: string;
  attributes: (
    | {
        display_type: "date";
        trait_type: "Post Creation" | "NFT Creation";
        value: number;
      }
    | {
        trait_type: "Likes" | "Comments";
        value: number;
      }
    | {
        trait_type: "SENDER";
        value: string;
      }
  )[];
};
