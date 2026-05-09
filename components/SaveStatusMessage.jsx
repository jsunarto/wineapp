export default function SaveStatusMessage({ status, compact = false }) {
  const currentStatus = status || {
    type: "idle",
    message: "Ready to save your tasting note when the row looks right.",
  };

  const classNames = {
    idle: "border-slate-200 bg-slate-50 text-slate-600",
    saving: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${compact ? "mt-2 p-2 text-xs" : "mt-3 p-3 text-sm"} rounded-xl border ${classNames[currentStatus.type] || classNames.idle}`}
    >
      <div className="font-medium">
        {currentStatus.type === "idle" && "Idle"}
        {currentStatus.type === "saving" && "Saving"}
        {currentStatus.type === "success" && "Saved successfully"}
        {currentStatus.type === "error" && "Save failed"}
      </div>
      <p className="mt-1">{currentStatus.message}</p>
    </div>
  );
}
