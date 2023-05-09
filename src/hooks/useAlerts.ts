import useSWR from "swr";
import type { ExternalResponse } from "../helpers/errors";
import type { AlertWithTrigger } from "../helpers/alertHelper";

export type AlertHook = {
  data?: AlertWithTrigger[];
  error?: String;
};

export const useAlerts = (): AlertHook => {
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  };
  const { data, error } = useSWR<ExternalResponse<AlertWithTrigger[]>>(
    "/api/alerts/get",
    fetcher
  );

  return {
    data: data?.data,
    error: error?.error,
  };
};
