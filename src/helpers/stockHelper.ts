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
  if (isNaN(amount)) throw new Error("Please enter an amount");
  if (amount > volume) throw new Error("Not enough shares available");
}