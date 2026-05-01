const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// Generic response handler
const handleResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch (err) {
    throw new Error("Invalid JSON response from server");
  }

  if (!response.ok) {
    const message = data?.error?.message || "Request failed";
    throw new Error(message);
  }

  // Return data safely (supports multiple backend formats)
  return data?.data ?? data;
};

// GET expenses
export const getExpenses = async (category) => {
  const url = new URL(`${API_BASE_URL}/expenses`);

  if (category) {
    url.searchParams.set("category", category);
  }

  const response = await fetch(url.toString());
  const result = await handleResponse(response);

  // Ensure frontend always gets an array
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