import useSWR from "swr";

import type { Data } from "../pages/api/portfolio/get";

// api route GET /api/hello

export const usePortfolios = () => {
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  };
  const { data, error } = useSWR<any, Error>("/api/portfolio/get", fetcher);

  return {
    data,
    error,
  };
};
