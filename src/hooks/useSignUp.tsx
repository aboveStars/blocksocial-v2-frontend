import { InitialSignUpForm } from "@/components/types/User";

export default function useSignUp() {
  /**
   * @param initSignUpForm
   * @param captchaToken
   * @returns true if operation is successfull, otherwise false.
   */
  const initialSignUp = async (
    initSignUpForm: InitialSignUpForm,
    captchaToken: string
  ) => {
    let response: Response;
    try {
      response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...initSignUpForm,
          captchaToken: captchaToken,
        }),
      });
    } catch (error) {
      console.error("Error while fetching to 'signUp' API", error);
      return false;
    }

    if (!response.ok) {
      const { error } = await response.json();
      console.error("Error while signup from 'signup' API", error);
      return false;
    }

    return true;
  };

  const verifySignUp = async () => {};

  const setProviderOnSignUp = async () => {};

  return { initialSignUp, verifySignUp, setProviderOnSignUp };
}
