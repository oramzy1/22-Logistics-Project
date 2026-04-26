export function exportCSV(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
) {
  const esc = (v: string | number | null | undefined) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: `${filename}_${new Date().toISOString().slice(0, 10)}.csv`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPDF(
  filename: string,
  title: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,Arial,sans-serif;padding:32px;color:#111}
    h1{font-size:20px;font-weight:600;margin-bottom:4px}
    p.sub{font-size:12px;color:#6b7280;margin-bottom:20px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    thead{background:#f3f4f6}
    th,td{padding:9px 12px;border:1px solid #e5e7eb;text-align:left}
    th{font-weight:600}
    tr:nth-child(even) td{background:#f9fafb}
    @media print{@page{margin:1cm}}
  </style></head><body>
  <h1>${title}</h1>
  <p class="sub">Generated ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? "—"}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></body></html>`;

  const win = window.open("", "_blank", "width=1100,height=750");
  if (!win) { alert("Allow popups to export PDF."); return; }
  win.document.write(html);
  win.document.close();
  win.addEventListener("load", () => setTimeout(() => win.print(), 300));
}