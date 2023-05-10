import useSWR from "swr";
import type { ExternalResponse } from "../helpers/errors";
import { doesSecurityExist } from "../hooks/fetchers/useSecurity";
import type { Trigger } from "@prisma/client";

import { toast } from "react-toastify";

export type TriggerHook = {
  data?: Trigger[];
  error?: String;
  mutate: () => any;
  deleteTrigger: (id: string) => Promise<void>;
  createTrigger: (symbol: string, price: number, type: string) => Promise<void>;
};

export const useTriggers = (): TriggerHook => {
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  };
  const { data, error, mutate } = useSWR<ExternalResponse<Trigger[]>>(
    "/api/triggers/get",
    fetcher
  );

  const deleteTrigger = async (id: string) => {
    const newData = {
      ...data,
      data: data?.data?.filter((t) => t.id !== id) || [],
    } as ExternalResponse<Trigger[]>;

    const response = await fetch("/api/triggers/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
      }),
    });

    const resData: ExternalResponse<boolean> = await response.json();

    if (resData.error) {
      toast.error("Couldn't delete trigger: " + resData.error);
      mutate();
      return;
    }

    mutate(newData);
    toast.success("Deleted trigger");
  };

  const createTrigger = async (
    ticker: string,
    price: number,
    alertType: string
  ) => {
    try {
      const stockExists = await doesSecurityExist(ticker);
      if (!stockExists) {
        toast.error("Couldn't create trigger: that ticker doesn't exist");
        return;
      }

      const response = await fetch("/api/triggers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker, price, alertType }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      toast.success("Created trigger");
    } catch (error) {
      toast.error("Couldn't create trigger: " + error);
    }
    mutate();
  };

  return {
    data: data?.data,
    error: error?.error,
    mutate,
    deleteTrigger,
    createTrigger,
  };
};
