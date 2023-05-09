// api/tools/security[id] check if security exists

import { StockEODData } from "@prisma/client";
import { useState, useEffect } from "react";

import { InternalResponse } from "@/helpers/errors";

export async function fetchStock(ticker: string) {
  const response = await fetch(`/api/stock/${ticker}`);
  const data = await response.json();
  return data;
}