// api/tools/security[id] check if security exists

import { ExternalResponse } from "@/helpers/errors";
import { SecurityResponse } from "@/pages/api/tools/security/[id]";
import { useState, useEffect } from "react";

export const doesSecurityExist = async (
  ticker: string
): Promise<boolean | undefined> => {
  const response = await fetch(`/api/tools/security/${ticker}`);

  const data: ExternalResponse<SecurityResponse> = await response.json();

  if (data.failed) {
    throw new Error(data.error);
  }

  return data.data?.doesSecurityExist;
};

export function useSecurity() {
  const [status, setStatus] = useState<{
    loading: boolean;
    doesSecurityExist?: boolean;
    error?: Error;
  }>({ loading: true });

  function fetchData(ticker: string) {
    fetch(`/api/tools/security/${ticker}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // console.log("Security", data);
        if (data.failed) {
          setStatus({ loading: false, error: data.error });
        } else {
          setStatus({
            doesSecurityExist: data.data.doesSecurityExist,
            loading: false,
          });
        }
      });
  }

  return { ...status, fn: fetchData };
}
