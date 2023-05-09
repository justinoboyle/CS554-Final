import type { ExternalResponse } from "../helpers/errors";
import type { TopLevelData } from "../pages/api/pages/top-level";

import type { PortfolioJoined } from "../helpers/portfolioHelper";

import { toast } from "react-toastify";

import useSWR from "swr";

export type Helpers = {
  createPortfolio: (title: string) => Promise<void>;
  deletePortfolio: (portfolioId: string) => Promise<void>;
  addPositionToPortfolio: (
    portfolioId: string,
    ticker: string,
    shares: number,
    dayPurchased: string
  ) => Promise<any>;
};

export type HomeHook = {
  data?: TopLevelData;
  isLoading: boolean;
  error?: String;
  mutate: () => any;
  helpers: Helpers;
};

export default function useHomePage(): HomeHook {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());

  const {
    data: homeData,
    error,
    mutate,
  } = useSWR<ExternalResponse<TopLevelData>>("/api/pages/top-level", fetcher);
  const isLoading = !homeData && !error;

  const deletePortfolio = async (portfolioId: string) => {
    const newData = {
      ...homeData,
      data: {
        ...homeData?.data,
        portfolios:
          homeData?.data?.portfolios?.filter((p) => p.id !== portfolioId) || [],
      } as TopLevelData,
    } as ExternalResponse<TopLevelData>;

    const response = await fetch("/api/portfolio/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        portfolioId,
        userId: homeData?.data?.user?.id,
      }),
    });
    const data: ExternalResponse<boolean> = await response.json();

    if (data.error) {
      toast.error("Couldn't delete portfolio: " + data.error);
      mutate(newData);
      return;
    }

    mutate(newData);
    toast.success("Deleted portfolio");
  };

  const createPortfolio = async (title: string) => {
    const response = await fetch("/api/portfolio/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        userId: homeData?.data?.user?.id,
      }),
    });
    const data: ExternalResponse<PortfolioJoined> =
      await response.json();

    if (data.error) {
      toast.error("Couldn't create portfolio: " + data.error);
      mutate();
      return;
    }

    mutate();
    toast.success("Created portfolio: " + data.data?.title);
  };

  const addPositionToPortfolio = async (
    portfolioId: string,
    ticker: string,
    shares: number,
    dayPurchased: string
  ) => {
    const response = await fetch("/api/portfolio/add-position", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        portfolioId,
        ticker,
        shares,
        dayPurchased,
      }),
    });
    const data: ExternalResponse<PortfolioJoined> =
      await response.json();

    if (data.error) {
      toast.error("Couldn't add position to portfolio: " + data.error);
      mutate();
      return;
    }

    mutate();
    toast.success("Added " + shares + " shares of " + ticker);
  };

  return {
    data: homeData?.data,
    isLoading,
    error: error?.error,
    mutate,
    helpers: {
      createPortfolio,
      deletePortfolio,
      addPositionToPortfolio,
    },
  };
}
