// api/tools/security[id] check if security exists

export async function fetchStock(ticker: string, date?: Date) {
  const response = await fetch('/api/stock', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ticker,
      date,
    })
  });
  const data = await response.json();
  return data;
}