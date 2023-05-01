import useSWR from "swr";

import type { Data } from "../pages/api/hello";

// api route GET /api/hello

export const useHelloRoute = () => {
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data: Data = await res.json();
    return data;
  };
  const { data, error } = useSWR<Data, Error>("/api/hello", fetcher);

  return {
    data,
    error,
  };
};
