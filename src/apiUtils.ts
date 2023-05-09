import { auth } from "./firebase/adminApp";

/**
 * To get displayname of user from its auth object.
 * This function both checks if user is real and gets displayname.
 * @param authorization
 * @returns Dispaly name if succees, otherwise an empty string
 */
export default async function getDisplayName(authorization: string) {
  let decodedToken;
  try {
    const idToken = authorization.split("Bearer ")[1];
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error(
      "Error while getting display name of requester. (We were verifying token)",
      error
    );
    return "";
  }

  try {
    const uid = decodedToken.uid;
    const displayName = (await auth.getUser(uid)).displayName;
    return displayName as string;
  } catch (error) {
    console.error(
      "Error while getting displayname. (We were getting display name)",
      error
    );
    return "";
  }
}
