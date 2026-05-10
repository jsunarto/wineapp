import LearningCoachCard from "./LearningCoachCard";
import SaveStatusMessage from "./SaveStatusMessage";
import { sheetColumns } from "../lib/wineSheet";

export default function SheetReadyRow({ copied, icons, isSaving, learningCoach, onCopyRow, onReset, onSaveWine, row, saveStatus }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Sheet-ready row</h2>
      <p className="mt-1 text-sm text-slate-600">This mirrors your current Google Sheet columns.</p>
      <div className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <tbody>
            {sheetColumns.map((column) => (
              <tr key={column} className="border-b border-slate-100 last:border-none">
                <th className="w-40 bg-slate-50 px-3 py-2 align-top text-xs font-semibold text-slate-600">{column}</th>
                <td className="px-3 py-2 align-top text-slate-800">{row[column]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onCopyRow} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
          {icons.clipboard} {copied ? "Copied" : "Copy TSV row"}
        </button>
        <button onClick={onSaveWine} disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
          {icons.save} {isSaving ? "Saving..." : "Save to Sheet"}
        </button>
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50">
          {icons.reset} Reset
        </button>
      </div>
      <SaveStatusMessage status={saveStatus} />
      <LearningCoachCard coach={learningCoach} />
    </div>
  );
}
