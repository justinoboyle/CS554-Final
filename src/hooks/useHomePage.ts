import type { ExternalResponse } from "../helpers/errors";
import type { HomeData } from "../pages/api/pages/home";

import useSWR from "swr";

export type HomeHook = {
  data?: HomeData;
  isLoading: boolean;
  error?: String;
};

export default function useHomePage(): HomeHook {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());

  const { data: homeData, error } = useSWR<ExternalResponse<HomeData>>(
    "/api/pages/home",
    fetcher
  );
  const isLoading = !homeData && !error;

  return {
    data: homeData?.data,
    isLoading,
    error: error?.error,
  };
}
