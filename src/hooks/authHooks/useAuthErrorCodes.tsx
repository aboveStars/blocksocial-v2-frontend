import { AuthError } from "firebase/auth";

const useAuthErrorCodes = () => {
  const getFriendlyAuthError = (error: AuthError) => {
    const errorCode = error.code;
    let response: string;

    switch (errorCode) {
      case "auth/claims-too-large":
        response =
          "The claims payload provided to setCustomUserClaims() exceeds the maximum allowed size of 1000 bytes.";

        return response;

      case "auth/email-already-exists":
        response = "The provided email is already in use.";

        return response;

      case "auth/id-token-expired":
        response = "The provided Firebase ID token is expired.";

        return response;

      case "auth/id-token-revoked":
        response = "The Firebase ID token has been revoked.";

        return response;

      case "auth/insufficient-permission":
        response =
          "The credential used to initialize the Admin SDK has insufficient permission to access the requested Authentication resource. Refer to Set up a Firebase project for documentation on how to generate a credential with appropriate permissions and use it to authenticate the Admin SDKs.";

        return response;

      case "auth/internal-error":
        response =
          "The Authentication server encountered an unexpected error while trying to process the request. The error message should contain the response from the Authentication server containing additional information. If the error persists, please report the problem to our Bug Report support channel.";

        return response;

      case "auth/invalid-argument":
        response =
          "An invalid argument was provided to an Authentication method. The error message should contain additional information.";

        return response;

      case "auth/invalid-claims":
        response =
          "The custom claim attributes provided to setCustomUserClaims() are invalid.";

        return response;

      case "auth/invalid-continue-uri":
        response = "The continue URL must be a valid URL string.";

        return response;

      case "auth/invalid-creation-time":
        response = "The creation time must be a valid UTC date string.";

        return response;

      case "auth/invalid-credential":
        response =
          "The credential used to authenticate the Admin SDKs cannot be used to perform the desired action. Certain Authentication methods such as createCustomToken() and verifyIdToken() require the SDK to be initialized with a certificate credential as opposed to a refresh token or Application Default credential. See Initialize the SDK for documentation on how to authenticate the Admin SDKs with a certificate credential.";

        return response;

      case "auth/invalid-disabled-field":
        response =
          "The provided value for the disabled user property is invalid. It must be a boolean.";

        return response;

      case "auth/invalid-display-name":
        response =
          "The provided value for the displayName user property is invalid. It must be a non-empty string.";

        return response;
      case "auth/invalid-dynamic-link-domain":
        response =
          "The provided dynamic link domain is not configured or authorized for the current project.";

        return response;

      case "auth/invalid-email":
        response =
          "The provided value for the email user property is invalid. It must be a string email address.";

        return response;

      case "auth/invalid-email-verified":
        response =
          "The provided value for the emailVerified user property is invalid. It must be a boolean.";

        return response;

      case "auth/invalid-hash-algorithm":
        response =
          "The hash algorithm must match one of the strings in the list of supported algorithms.";

        return response;

      case "auth/invalid-hash-block-size":
        response = "The hash block size must be a valid number.";

        return response;
      case "auth/invalid-hash-derived-key-length":
        response = "The hash derived key length must be a valid number.";

        return response;
      case "auth/invalid-hash-key":
        response = "The hash key must a valid byte buffer.";

        return response;

      case "auth/invalid-hash-memory-cost":
        response = "The hash memory cost must be a valid number.";

        return response;
      case "auth/invalid-hash-parallelization":
        response = "The hash parallelization must be a valid number.";

        return response;
      case "auth/invalid-hash-rounds":
        response = "The hash rounds must be a valid number.";

        return response;
      case "auth/invalid-hash-salt-separator":
        response =
          "The hashing algorithm salt separator field must be a valid byte buffer.";

        return response;
      case "auth/invalid-id-token":
        response = "The provided ID token is not a valid Firebase ID token.";

        return response;
      case "auth/invalid-last-sign-in-time":
        response = "The last sign-in time must be a valid UTC date string.";

        return response;
      case "auth/invalid-page-token":
        response =
          "The provided next page token in listUsers() is invalid. It must be a valid non-empty string.";

        return response;

      case "auth/wrong-password":
        response = "Wrong Password";

        return response;

      case "auth/invalid-password":
        response =
          "The provided value for the password user property is invalid. It must be a string with at least six characters.";

        return response;
      case "auth/invalid-password-hash":
        response = "The password hash must be a valid byte buffer.";

        return response;
      case "auth/invalid-password-salt":
        response = "The password salt must be a valid byte buffer";

        return response;

      case "auth/invalid-phone-number":
        response =
          "The provided value for the phoneNumber is invalid. It must be a non-empty E.164 standard compliant identifier string.";

        return response;

      case "auth/invalid-photo-url":
        response =
          "The provided value for the photoURL user property is invalid. It must be a string URL.";

        return response;

      case "auth/invalid-provider-data":
        response =
          "The providerData must be a valid array of UserInfo objects.";

        return response;

      case "auth/invalid-provider-id":
        response =
          "The providerId must be a valid supported provider identifier string.";

        return response;

      case "auth/invalid-oauth-responsetype":
        response = "Only exactly one OAuth responseType should be set to true.";

        return response;

      case "auth/invalid-session-cookie-duration":
        response =
          "The session cookie duration must be a valid number in milliseconds between 5 minutes and 2 weeks.";

        return response;

      case "auth/invalid-uid":
        response =
          "The provided uid must be a non-empty string with at most 128 characters.";

        return response;

      case "auth/invalid-user-import":
        response = "The user record to import is invalid.";

        return response;

      case "auth/maximum-user-count-exceeded":
        response =
          "The maximum allowed number of users to import has been exceeded.";

        return response;

      case "auth/missing-android-pkg-name":
        response =
          "An Android Package Name must be provided if the Android App is required to be installed.";

        return response;

      case "auth/missing-continue-uri":
        response = "A valid continue URL must be provided in the request.";

        return response;
      case "auth/missing-hash-algorithm":
        response =
          "Importing users with password hashes requires that the hashing algorithm and its parameters be provided.";

        return response;

      case "auth/missing-ios-bundle-id":
        response = "The request is missing a Bundle ID.";

        return response;

      case "auth/missing-uid":
        response = "A uid identifier is required for the current operation.";

        return response;

      case "auth/missing-oauth-client-secret":
        response =
          "The OAuth configuration client secret is required to enable OIDC code flow.";

        return response;

      case "auth/operation-not-allowed":
        response =
          "The provided sign-in provider is disabled for your Firebase project. Enable it from the Sign-in Method section of the Firebase console.";

        return response;

      case "auth/phone-number-already-exists":
        response =
          "The provided phoneNumber is already in use by an existing user. Each user must have a unique phoneNumber.";

        return response;

      case "auth/project-not-found":
        response =
          "No Firebase project was found for the credential used to initialize the Admin SDKs. Refer to Set up a Firebase project for documentation on how to generate a credential for your project and use it to authenticate the Admin SDKs.";

        return response;

      case "auth/reserved-claims":
        response =
          "One or more custom user claims provided to setCustomUserClaims() are reserved. For example, OIDC specific claims such as (sub, iat, iss, exp, aud, auth_time, etc) should not be used as keys for custom claims.";

        return response;

      case "auth/session-cookie-expired":
        response = "The provided Firebase session cookie is expired.";

        return response;

      case "auth/session-cookie-revoked":
        response = "The Firebase session cookie has been revoked.";

        return response;

      case "auth/uid-already-exists":
        response =
          "The provided uid is already in use by an existing user. Each user must have a unique uid.";

        return response;

      case "auth/unauthorized-continue-uri":
        response =
          "The domain of the continue URL is not whitelisted. Whitelist the domain in the Firebase Console.";
        return response;

      case "auth/user-not-found":
        response = "User not found.";
        return response;

      default:
        response = "Unknown Error Occured :/";
        console.log("UnknownErrorCode: ", errorCode);
    }
  };

  return {
    getFriendlyAuthError,
  };
};

export default useAuthErrorCodes;
