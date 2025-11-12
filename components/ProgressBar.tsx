export default function ProgressBar({
  percentage,
  color = "blue",
  height = "h-2",
}: {
  percentage: number
  color?: "blue" | "green" | "yellow" | "red"
  height?: string
}) {
  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-600",
    red: "bg-red-600",
  }

  return (
    <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${colorClasses[color]} ${height} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  )
}
