import { InitialSignUpForm } from "@/components/types/User";
import useLogin from "./useLogin";

export default function useSignUp() {
  const { logSignedOutUserIn } = useLogin();

  const initiateSignUp = async (
    signUpForm: InitialSignUpForm,
    captchaToken: string
  ) => {
    const handleSignUpResult = await handleSignUp(signUpForm, captchaToken);

    if (!handleSignUpResult) return false;

    const operationResult = await logSignedOutUserIn(
      signUpForm.email,
      signUpForm.password
    );

    if (!operationResult) return false;
    return true;
  };

  const handleSignUp = async (
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

  return {
    initiateSignUp,
  };
}
