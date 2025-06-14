"use client";

import Script from "next/script";
import { createClient } from "@/utils/supabase/client";
import { CredentialResponse } from "google-one-tap";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const OneTapComponent = () => {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  // generate nonce to use for google id token sign-in
  const generateNonce = async (): Promise<string[]> => {
    const nonce = btoa(
      String.fromCharCode(...Array.from(crypto.getRandomValues(new Uint8Array(32))))
    );
    const encoder = new TextEncoder();
    const encodedNonce = encoder.encode(nonce);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return [nonce, hashedNonce];
  };

  useEffect(() => {
    const initializeGoogleOneTap = () => {
      console.log("Initializing Google One Tap");
      window.addEventListener("load", async () => {
        const [nonce, hashedNonce] = await generateNonce();
        console.log("Nonce: ", nonce, hashedNonce);

        // check if there's already an existing session before initializing the one-tap UI
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session", error);
        }
        if (data.session) {
          console.log("Session data: ", data.session);
          if (pathname !== "/") {
            router.push("/dashboard");
          }
          return;
        }

        console.log("Initializing Google One Tap with nonce");
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: async (response: CredentialResponse) => {
            try {
              // send id token returned in response.credential to supabase
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: response.credential,
                nonce,
              });

              if (error) throw error;
              console.log("Session data: ", data);
              console.log("Successfully logged in with Google One Tap");

              // redirect to protected page
              router.push("/dashboard");
            } catch (error) {
              console.error("Error logging in with Google One Tap", error);
            }
          },
          nonce: hashedNonce,
          // with chrome's removal of third-party cookies, we need to use FedCM instead (https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
          use_fedcm_for_prompt: true,
        });

        console.log("Prompting Google One Tap");
        window.google.accounts.id.prompt(); // Display the One Tap UI

        window.google.accounts.id.prompt((notification) => {
          console.log("Notification: ", notification);
          if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
          }
          if (notification.isSkippedMoment()) {
            console.log("One Tap skipped:", notification.getSkippedReason());
          }
          if (notification.isDismissedMoment()) {
            console.log("One Tap dismissed:", notification.getDismissedReason());
          }
        });
      });
    };
    initializeGoogleOneTap();
    return () => window.removeEventListener("load", initializeGoogleOneTap);
  }, [router, supabase.auth, pathname]);

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" />
      <div id="oneTap" className="fixed top-0 right-0 z-[100]" />
    </>
  );
};

export default OneTapComponent;
