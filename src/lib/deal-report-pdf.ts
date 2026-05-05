"use client";

import { jsPDF } from "jspdf";
import type { DealReportPayload } from "@/types/deal-report-payload";

const PAGE_W = 612;
const PAGE_H = 792;
const M = 42;
const INNER = PAGE_W - M * 2;
const FOOTER_Y = PAGE_H - 28;

function hr(doc: jsPDF, y: number): number {
  doc.setDrawColor(38, 38, 38);
  doc.setLineWidth(0.4);
  doc.line(M, y, PAGE_W - M, y);
  return y + 10;
}

function sectionHeading(doc: jsPDF, title: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(72, 72, 72);
  doc.text(title.toUpperCase(), M, y);
  doc.setTextColor(17, 17, 17);
  return y + 12;
}

function bodyLines(
  doc: jsPDF,
  text: string,
  y: number,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
  maxLines: number,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(28, 28, 28);
  const lines = doc.splitTextToSize(text.trim(), maxWidth) as string[];
  const cap = Math.min(lines.length, maxLines);
  for (let i = 0; i < cap; i++) {
    let line = lines[i]!;
    if (i === cap - 1 && lines.length > maxLines) {
      line = `${line.replace(/\s+$/, "")}…`;
    }
    doc.text(line, M, y);
    y += lineHeight;
  }
  return y;
}

function bulletBlock(
  doc: jsPDF,
  items: string[],
  y: number,
  opts: { fontSize: number; lineHeight: number; perItemMaxLines: number; maxItems: number },
): number {
  const { fontSize, lineHeight, perItemMaxLines, maxItems } = opts;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(28, 28, 28);
  const slice = items.slice(0, maxItems);
  for (const raw of slice) {
    const t = raw.trim();
    if (!t) continue;
    const wrapped = doc.splitTextToSize(`• ${t}`, INNER - 8) as string[];
    const cap = Math.min(wrapped.length, perItemMaxLines);
    for (let i = 0; i < cap; i++) {
      doc.text(wrapped[i]!, M + 4, y);
      y += lineHeight;
    }
    if (wrapped.length > perItemMaxLines) {
      y += 1;
    }
  }
  if (items.length > maxItems) {
    doc.setTextColor(90, 90, 90);
    doc.text(`• +${items.length - maxItems} more on screen…`, M + 4, y);
    y += lineHeight;
    doc.setTextColor(28, 28, 28);
  }
  return y + 2;
}

function kvRows(
  doc: jsPDF,
  rows: readonly [string, string][],
  y: number,
  labelW: number,
  rowH: number,
): number {
  doc.setFontSize(8.2);
  const valueX = M + labelW;
  const valueW = PAGE_W - M - valueX;
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(88, 88, 88);
    doc.text(label, M, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 17, 17);
    const vLines = doc.splitTextToSize(value, valueW) as string[];
    doc.text(vLines, valueX, y, { baseline: "top" });
    y += Math.max(rowH, vLines.length * rowH * 0.92);
  }
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 17, 17);
  return y + 2;
}

function flagsRow(doc: jsPDF, flags: string[], y: number): number {
  if (!flags.length) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text("None surfaced by the opportunity engine for this parcel.", M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 17, 17);
    return y + 14;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(55, 55, 55);
  let x = M;
  const rowGap = 16;
  const maxX = PAGE_W - M;
  for (let i = 0; i < flags.length; i++) {
    const f = flags[i]!.trim();
    if (!f) continue;
    const tag = ` ${f} `;
    const w = doc.getTextWidth(tag) + 10;
    if (x + w > maxX && x > M) {
      x = M;
      y += rowGap;
    }
    doc.setDrawColor(55, 55, 55);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y - 9, w, 12, 1.5, 1.5, "S");
    doc.text(tag, x + 5, y);
    x += w + 6;
  }
  doc.setTextColor(17, 17, 17);
  return y + rowGap + 2;
}

/** Client-only: builds a one-page Letter PDF and triggers download. */
export function downloadDealReportPdf(
  payload: DealReportPayload,
  filename: string,
): void {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
    compress: true,
  });

  let y = M;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(12, 12, 12);
  doc.text("AERVARA", M, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(payload.address, M, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(66, 66, 66);
  doc.text(payload.cityState, M, y);
  y += 12;
  doc.setFontSize(8.2);
  doc.text(`Zoning: ${payload.zoningDistrict}`, M, y);
  y += 11;
  doc.setTextColor(110, 110, 110);
  doc.text(`Generated ${payload.generatedDateLabel}`, M, y);
  doc.setTextColor(17, 17, 17);
  y += 16;
  y = hr(doc, y);

  y = sectionHeading(doc, "Opportunity snapshot", y);
  y = kvRows(
    doc,
    [
      ["Opportunity value", payload.opportunityValue],
      ["Underbuilt score", payload.underbuiltScore],
      [
        "Complexity score",
        `${payload.complexityScore} — ${payload.complexityLabel}`,
      ],
      [
        "Speed-to-value score",
        `${payload.speedToValueScore} — ${payload.speedToValueLabel}`,
      ],
      ["Suggested next step", payload.suggestedNextStep],
    ],
    y,
    168,
    13,
  );
  y = hr(doc, y);

  y = sectionHeading(doc, "Parcel & FAR", y);
  y = kvRows(
    doc,
    [
      ["Lot size (sq ft)", payload.lotSqft],
      ["Built floor area (sq ft)", payload.builtSqft],
      ["Max FAR", payload.maxFar],
      ["Current built FAR", payload.currentBuiltFar],
      ["Remaining FAR", payload.remainingFar],
      ["Unused buildable area (sq ft)", payload.unusedBuildable],
    ],
    y,
    200,
    13,
  );
  y = hr(doc, y);

  y = sectionHeading(doc, "Development analysis", y);
  y = kvRows(
    doc,
    [
      ["Est. value per buildable sq ft", payload.estValuePerBuildableSqft],
      ["Construction cost per sq ft", payload.constructionPerSqft],
      ["Soft cost (%)", payload.softCostPct],
      ["Total project value", payload.totalProjectValue],
      ["Total cost", payload.totalCost],
      ["Estimated profit", payload.estimatedProfit],
      ["Profit margin (if available)", payload.profitMargin],
    ],
    y,
    212,
    13,
  );
  y = hr(doc, y);

  y = sectionHeading(doc, "Deal memo", y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(55, 55, 55);
  doc.text("Executive summary", M, y);
  y += 11;
  y = bodyLines(doc, payload.executiveSummary, y, INNER, 8, 10.2, 4);

  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(55, 55, 55);
  doc.text("Why it matters", M, y);
  y += 11;
  y = bulletBlock(doc, payload.whyItMatters, y, {
    fontSize: 7.8,
    lineHeight: 9.6,
    perItemMaxLines: 2,
    maxItems: 3,
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(55, 55, 55);
  doc.text("Key risks", M, y);
  y += 11;
  y = bulletBlock(doc, payload.keyRisks, y, {
    fontSize: 7.8,
    lineHeight: 9.6,
    perItemMaxLines: 2,
    maxItems: 3,
  });

  y = hr(doc, y);
  y = sectionHeading(doc, "Key flags", y);
  y = flagsRow(doc, payload.keyFlags, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "Aervara deal report — indicative screening only. Not investment, legal, or tax advice.",
    M,
    FOOTER_Y,
    { maxWidth: INNER },
  );

  doc.save(filename);
}
