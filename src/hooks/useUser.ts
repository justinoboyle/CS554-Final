import { useEffect } from "react";
import Router from "next/router";
import useSWR from "swr";
import { UserSession } from "../helpers/userHelper";

type UserHook = {
  user?: UserSession["user"];
  isLoggedIn?: UserSession["isLoggedIn"];
  isLoading: boolean;
};

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
} = {}): UserHook {

  const fetcher = (url: string) => fetch(url).then((r) => r.json());

  const { data: userContainer } = useSWR<UserSession>("/api/user", fetcher);
  const finishedLoading = userContainer?.isLoggedIn !== undefined;

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !userContainer) return;

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !userContainer?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && userContainer?.isLoggedIn)
    ) {
      Router.push(redirectTo);
    }
  }, [userContainer, redirectIfFound, redirectTo]);

  return {
    user: userContainer?.user,
    isLoggedIn: userContainer?.isLoggedIn,
    isLoading: !finishedLoading,
  };
}
