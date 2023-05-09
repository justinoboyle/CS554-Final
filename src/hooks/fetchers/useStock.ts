// api/tools/security[id] check if security exists

import { StockEODData } from "@prisma/client";
import { useState, useEffect } from "react";

import { InternalResponse } from "@/helpers/errors";

export function useStock() {
  const [ status, setStatus ] = useState<{
    loading: boolean;
    data?: InternalResponse<StockEODData>;
    error?: Error;
  }>({loading: true});

  function fetchData(ticker: string) {
    fetch(`/api/stock/${ticker}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // console.log("Stock", data);
        if (data.failed) {
          setStatus({loading: false, error: data.error})
        } else {
          setStatus({data, loading: false})
        }
      });
  }

  return { ...status, fn: fetchData};
}