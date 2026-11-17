export default function PageState({ loading, error }) {
  if (loading) return <div className="px-4 py-12 text-center text-stone-500">Loading…</div>;
  if (error) {
    return (
      <div className="px-4 py-12 text-center text-danger">
        {error.response?.data?.message || "Couldn’t load this page. Please try again."}
      </div>
    );
  }
  return null;
}
