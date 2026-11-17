export default function Alert({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-danger">
      {children}
    </div>
  );
}
