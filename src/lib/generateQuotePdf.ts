import { jsPDF } from "jspdf";

export interface QuoteLineItem {
  label: string;
  value: string;
}

export interface QuoteData {
  brand: {
    name: string;
    tagline?: string;
    email?: string;
    phone?: string;
    primaryHex?: string;
  };
  quoteNumber: string;
  issuedAt: Date;
  clientName: string;
  clientEmail?: string;
  service: string;
  items: QuoteLineItem[];
  subtotal: number;
  total: number;
  currency?: string;
  notes?: string;
  validUntil?: Date;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(full.slice(0, 2), 16) || 255,
    parseInt(full.slice(2, 4), 16) || 107,
    parseInt(full.slice(4, 6), 16) || 53,
  ];
}

export function generateQuotePdf(data: QuoteData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const [pr, pg, pb] = hexToRgb(data.brand.primaryHex || "#ff6b35");
  const currency = data.currency || "KES";

  // Header band
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, pageWidth, 110, "F");

  // Brand name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(data.brand.name, margin, 56);

  if (data.brand.tagline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(data.brand.tagline, margin, 76);
  }

  // QUOTE label right side
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("QUOTE", pageWidth - margin, 56, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`#${data.quoteNumber}`, pageWidth - margin, 76, { align: "right" });

  // Meta block
  let y = 150;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("PREPARED FOR", margin, y);
  doc.text("QUOTE DETAILS", pageWidth / 2, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(data.clientName || "Valued Client", margin, y + 18);
  if (data.clientEmail) doc.text(data.clientEmail, margin, y + 34);

  doc.text(`Issued: ${data.issuedAt.toLocaleDateString()}`, pageWidth / 2, y + 18);
  if (data.validUntil) {
    doc.text(`Valid until: ${data.validUntil.toLocaleDateString()}`, pageWidth / 2, y + 34);
  }
  doc.text(`Service: ${data.service}`, pageWidth / 2, y + 50);

  // Divider
  y = 230;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);

  // Line items table header
  y += 30;
  doc.setFillColor(248, 246, 244);
  doc.rect(margin, y - 18, pageWidth - margin * 2, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text("DESCRIPTION", margin + 12, y);
  doc.text("AMOUNT", pageWidth - margin - 12, y, { align: "right" });

  // Items
  y += 28;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  data.items.forEach((item) => {
    doc.text(item.label, margin + 12, y);
    doc.text(item.value, pageWidth - margin - 12, y, { align: "right" });
    y += 22;
    doc.setDrawColor(240, 240, 240);
    doc.line(margin + 12, y - 8, pageWidth - margin - 12, y - 8);
  });

  // Totals box
  y += 14;
  doc.setFillColor(pr, pg, pb);
  doc.rect(pageWidth - margin - 220, y, 220, 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("TOTAL DUE", pageWidth - margin - 200, y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(
    `${currency} ${data.total.toLocaleString()}`,
    pageWidth - margin - 12,
    y + 44,
    { align: "right" }
  );

  // Notes
  if (data.notes) {
    y += 100;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("NOTES", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const split = doc.splitTextToSize(data.notes, pageWidth - margin * 2);
    doc.text(split, margin, y + 16);
  }

  // Footer
  doc.setTextColor(140, 140, 140);
  doc.setFontSize(9);
  const footerY = pageHeight - 40;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, footerY - 14, pageWidth - margin, footerY - 14);
  const contactBits: string[] = [];
  if (data.brand.email) contactBits.push(data.brand.email);
  if (data.brand.phone) contactBits.push(data.brand.phone);
  doc.text(contactBits.join("  ·  "), margin, footerY);
  doc.text(
    `Quote generated ${data.issuedAt.toLocaleString()}`,
    pageWidth - margin,
    footerY,
    { align: "right" }
  );

  return doc;
}

export function downloadQuotePdf(data: QuoteData) {
  const doc = generateQuotePdf(data);
  doc.save(`quote-${data.quoteNumber}.pdf`);
}