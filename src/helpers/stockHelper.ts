import { toast } from "react-toastify";

export function convertVolumeToShorthand(volume: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact'}).format(volume);
}

export function formatToDollar(cost: number) {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(cost);
}

export function calculateCostOfShares(amountString: string, closePrice: number) {
  if (amountString === '') return "$0.00";
  let amount = parseFloat(amountString);
  return formatToDollar(amount * closePrice);
}

export function handlePurchaseShares(amountString: string, volume: number) {
  let amount = parseFloat(amountString);
  if (amount > volume) {
    toast.error("Not enough shares available!");
    return;
  }
  
}