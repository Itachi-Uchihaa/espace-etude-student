export default function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'Active'
      ? 'text-green-600 bg-green-100'
      : status === 'Pending'
      ? 'text-yellow-600 bg-yellow-100'
      : status === 'Inactive'
      ? 'text-red-600 bg-red-100'
      : status === 'Cancelled'
      ? 'text-red-600 bg-red-100'
      : 'text-gray-600 bg-gray-100';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
} 