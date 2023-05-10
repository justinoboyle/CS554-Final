import useSWR from "swr";
import type { ExternalResponse } from "../helpers/errors";

import type { Trigger } from "@prisma/client";

export type TriggerHook = {
  data?: Trigger[];
  error?: String;
};

export const useTriggers = (): TriggerHook => {
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  };
  const { data, error } = useSWR<ExternalResponse<Trigger[]>>(
    "/api/triggers/get",
    fetcher
  );

  return {
    data: data?.data,
    error: error?.error,
  };
};
