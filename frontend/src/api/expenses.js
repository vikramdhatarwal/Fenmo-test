const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://fenmo-test.onrender.com");

// Generic response handler
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || "Request failed";
    throw new Error(message);
  }

  if (!data?.success) {
    throw new Error("API returned failure");
  }

  return data.data;
};

// GET expenses
export const getExpenses = async (category) => {
  const url = new URL(`${API_BASE_URL}/expenses`);

  if (category) {
    url.searchParams.set("category", category);
  }

  const response = await fetch(url.toString());
  const result = await handleResponse(response);

  return Array.isArray(result) ? result : [];
};

// POST create expense
export const createExpense = async (payload, idempotencyKey) => {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};