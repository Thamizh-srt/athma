const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

/**
 * Maps Laravel 422 validation errors onto react-hook-form fields.
 * Returns a general message string for any other kind of error.
 */
export function handleApiError(error, setError) {
  const res = error?.response;

  if (res?.status === 422 && res.data?.errors) {
    Object.entries(res.data.errors).forEach(([field, messages]) => {
      const name = field === "password_confirmation" ? "confirmPassword" : toCamel(field);
      setError(name, { type: "server", message: messages[0] });
    });
    return null;
  }

  if (!res) return "Cannot reach the server. Check your connection and try again.";
  return res.data?.message || "Something went wrong. Please try again.";
}
