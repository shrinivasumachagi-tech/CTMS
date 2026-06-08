import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================================
// HELPERS
// ============================================================

const THEME = [59, 66, 82] as const;

function escapeCSV(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

function resolveName(
  obj: { full_name?: string } | null | undefined
): string {
  return obj?.full_name || "";
}

// ============================================================
// TICKET PDF EXPORT
// ============================================================

export function exportTicketsPDF(tickets: any[], filename = "tickets") {
  const doc = new jsPDF("landscape");

  doc.setFontSize(18);
  doc.text("CTMS - Ticket Report", 14, 22);

  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Total Records: ${tickets.length}`, 14, 36);

  const body = tickets.map((t) => [
    t.ticket_number,
    (t.title || "").substring(0, 40),
    t.category || "",
    t.sub_category || "",
    t.priority,
    t.status,
    t.department?.name || "",
    t.creator?.full_name || "",
    t.assignee?.full_name || "",
    formatDate(t.created_at),
    formatDate(t.updated_at),
  ]);

  autoTable(doc, {
    startY: 42,
    head: [
      [
        "Ticket #",
        "Title",
        "Category",
        "Sub-Category",
        "Priority",
        "Status",
        "Department",
        "Created By",
        "Assigned To",
        "Created",
        "Updated",
      ],
    ],
    body,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [...THEME] },
    alternateRowStyles: { fillColor: [244, 246, 248] },
  });

  doc.save(`${filename}.pdf`);
}

// ============================================================
// TICKET CSV EXPORT
// ============================================================

export function exportTicketsCSV(tickets: any[], filename = "tickets") {
  const headers = [
    "Ticket #",
    "Title",
    "Category",
    "Sub-Category",
    "Priority",
    "Status",
    "Department",
    "Created By",
    "Assigned To",
    "Created Date",
    "Updated Date",
  ];

  const rows = tickets.map((t) => [
    t.ticket_number,
    t.title || "",
    t.category || "",
    t.sub_category || "",
    t.priority,
    t.status,
    t.department?.name || "",
    t.creator?.full_name || "",
    t.assignee?.full_name || "",
    formatDate(t.created_at),
    formatDate(t.updated_at),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => escapeCSV(String(cell))).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
}

// ============================================================
// TICKET EXCEL EXPORT
// ============================================================

export function exportTicketsExcel(tickets: any[], filename = "tickets") {
  const worksheetData = tickets.map((t) => ({
    "Ticket #": t.ticket_number,
    Title: t.title || "",
    Category: t.category || "",
    "Sub-Category": t.sub_category || "",
    Priority: t.priority,
    Status: t.status,
    Department: t.department?.name || "",
    "Created By": t.creator?.full_name || "",
    "Assigned To": t.assignee?.full_name || "",
    "Created Date": formatDate(t.created_at),
    "Updated Date": formatDate(t.updated_at),
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

  const maxWidths: Record<string, number> = {};
  worksheetData.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      const len = String(value).length;
      maxWidths[key] = Math.max(maxWidths[key] || key.length, len);
    });
  });
  worksheet["!cols"] = Object.values(maxWidths).map((w) => ({ wch: w + 2 }));

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}

// ============================================================
// AUDIT LOG CSV EXPORT
// ============================================================

export function exportAuditLogsCSV(logs: any[], filename = "audit-logs") {
  const headers = ["Timestamp", "User", "Action", "Module", "Details", "IP Address"];

  const rows = logs.map((l) => [
    formatDateTime(l.created_at),
    resolveName(l.users),
    l.action,
    l.module,
    l.details || "",
    l.ip_address || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => escapeCSV(String(cell))).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
}

// ============================================================
// AUDIT LOG EXCEL EXPORT
// ============================================================

export function exportAuditLogsExcel(logs: any[], filename = "audit-logs") {
  const worksheetData = logs.map((l) => ({
    Timestamp: formatDateTime(l.created_at),
    User: resolveName(l.users),
    Action: l.action,
    Module: l.module,
    Details: l.details || "",
    "IP Address": l.ip_address || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}

// ============================================================
// BACKWARD-COMPATIBLE ALIASES
// Used by existing page components that import these names
// ============================================================

export { exportTicketsPDF as exportToPDF };
export { exportTicketsCSV as exportToCSV };
export { exportTicketsExcel as exportToExcel };
export { exportAuditLogsCSV as exportAuditLogsToCSV };
export { exportAuditLogsExcel as exportAuditLogsToExcel };
