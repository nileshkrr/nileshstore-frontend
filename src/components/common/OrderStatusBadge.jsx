export default function OrderStatusBadge({ status }) {
  return (
    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
      {status}
    </span>
  );
}