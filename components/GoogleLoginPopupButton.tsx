"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@heroui/react";

interface Props {
  onLogin: (credential: string) => void;
}

export default function GoogleLoginPopupButton({ onLogin }: Props) {
  const login = useGoogleLogin({
    flow: "implicit", // popup-style
    onSuccess: async (tokenResponse) => {
      // tokenResponse has: access_token, expires_in, etc.
      // Get ID token via userinfo endpoint
      const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      }).then(res => res.json());

      if (userInfo && userInfo.email) {
        // Optionally send to backend for verification
        onLogin(userInfo); // You can also pass tokenResponse if needed
      }
    },
    onError: () => {
      console.error("Google Login Failed");
    },
  });

  return (
    <Button
      className="w-full flex items-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100"
      onPress={() => login()}
    >
      <FcGoogle className="text-xl" />
      Continue with Google
    </Button>
  );
}
