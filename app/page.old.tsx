"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<unknown>(null);
  const [status, setStatus] = useState("");

  async function scanLabel() {
    if (!file) {
      setStatus("Choose a wine label photo first.");
      return;
    }

    setStatus("Scanning label...");
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/scan-wine-label", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error || "Scan failed.");
      return;
    }

    setResult(data);
    setStatus("Scan complete.");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">Wine Label Scanner</h1>
        <p className="mt-2 text-slate-600">
          Upload a bottle label photo and extract wine facts.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              setResult(null);

              if (selected) {
                setPreview(URL.createObjectURL(selected));
                setStatus("Photo loaded. Ready to scan.");
              }
            }}
          />

          {preview && (
            <img
              src={preview}
              alt="Wine label preview"
              className="max-h-96 rounded-xl border object-contain"
            />
          )}

          <button
            onClick={scanLabel}
            className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white"
          >
            Scan label
          </button>

          {status && (
            <p className="rounded-xl bg-slate-100 p-3 text-sm">{status}</p>
          )}

          {result !== null && (
            <pre className="overflow-auto rounded-xl bg-slate-900 p-4 text-sm text-white">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
