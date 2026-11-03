const base = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
export async function publicApi(path, body, signal) {
  let response;
  try {
    response = await fetch(base + path, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "X-Sleektech-Request": "1",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "We couldn’t connect. Your details haven’t been submitted. Please try again.",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data)
    throw new Error(
      data?.error ||
        "We couldn’t submit your details. Please try again shortly.",
    );
  return data;
}
