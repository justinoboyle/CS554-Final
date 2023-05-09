// api/tools/security[id] check if security exists

export async function fetchStock(ticker: string) {
  const response = await fetch(`/api/stock/${ticker}`);
  const data = await response.json();
  return data;
}