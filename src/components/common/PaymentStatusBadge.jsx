export default function PaymentStatusBadge({ status }) {
  return (
    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
      {status}
    </span>
  );
}