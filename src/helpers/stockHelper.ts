import { PrismaClient } from '@prisma/client';

import { toast } from "react-toastify";
import { BadRequestError } from './errors';

export function convertVolumeToShorthand(volume: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact'}).format(volume);
}

export function formatToDollar(cost: number) {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(cost);
}

export function calculateCostOfShares(amount: number, closePrice: number) {
  if (isNaN(amount)) return "$0.00";
  return formatToDollar(amount * closePrice);
}

export function checkValidAmount(amount: number, volume: number) {
  if (amount > volume) {
    toast.error("Not enough shares available");
    throw new Error("Not enough shares available");
  }
}

export async function createStockPosition(ticker: string, amount: number, portfolioId: string) {
  let response = await fetch('/api/stock/position/create', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( {
      ticker,
      amount,
      portfolioId
    })
  });
  let data = await response.json();
  return data;
}