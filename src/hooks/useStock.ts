import { PrismaClient } from '@prisma/client';
import useSWR from "swr";

export const useStock = (ticker: string | string[] | undefined) => {
  const fetcher = async ([url, ticker]: [string, string]) => {
    const res = await fetch(`${url}/${ticker}`);
    const data = await res.json();
    return data;
  };

  const { data: securityData, error: securityError } = useSWR<any, Error>(['/api/tools/security', ticker], fetcher);
  const { data: stockData, error: stockError } = useSWR<any, Error>(['/api/stock', ticker], fetcher);
  if (!securityData || securityError || securityData.doesSecurityExist === false) return { data: securityData, error: securityError};

  return {
    data: stockData,
    error: stockError,
  };
};
