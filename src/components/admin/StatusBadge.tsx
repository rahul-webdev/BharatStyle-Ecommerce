import { cn } from "@/lib/utils";

type StatusType = "pending" | "processing" | "dispatched" | "delivered" | "cancelled" | "rejected" | "active" | "inactive";

interface StatusBadgeProps {
  status: StatusType;
}

const statusStyles: Record<StatusType, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800",
  processing: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-500 dark:border-blue-800",
  dispatched: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-500 dark:border-indigo-800",
  delivered: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-500 dark:border-green-800",
  cancelled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-500 dark:border-red-800",
  rejected: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-500 dark:border-rose-800",
  active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-500 dark:border-green-800",
  inactive: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

const statusLabels: Record<StatusType, string> = {
  pending: "Pending",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
  rejected: "Rejected",
  active: "Active",
  inactive: "Inactive",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border",
      statusStyles[status]
    )}>
      {statusLabels[status]}
    </span>
  );
}
