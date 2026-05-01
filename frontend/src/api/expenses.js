const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://fenmo-test.onrender.com");

// Generic response handler
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  // If the server returned HTML (or any non-JSON) body, surface a clearer error
  // that includes the URL and status so it's easier to debug deployment issues.
  if (!contentType.includes("application/json")) {
    if (!response.ok) {
      const bodySnippet = rawBody ? rawBody.slice(0, 200) : "";
      throw new Error(
        `Request to ${response.url} failed with status ${response.status}. Non-JSON response: ${bodySnippet}`
      );
    }

    // If response is OK but not JSON, this is unexpected — surface details.
    throw new Error(
      `Invalid non-JSON response from ${response.url} (status ${response.status})`
    );
  }

  // At this point we expect JSON content-type. Try parsing and give helpful error.
  let data;
  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch (err) {
    const bodySnippet = rawBody ? rawBody.slice(0, 200) : "";
    throw new Error(
      `Invalid JSON response from ${response.url}: ${err.message}. Body starts with: ${bodySnippet}`
    );
  }

  if (!response.ok) {
    const message =
      data?.error?.message || `Request to ${response.url} failed (${response.status})`;
    throw new Error(message);
  }

  if (!data?.success) {
    throw new Error(`API returned failure from ${response.url}`);
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