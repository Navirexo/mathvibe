export const copyDetailedResultLabel = "Copy Detailed Result";

export function isCurrentCopyPayload(
  requestedText: string,
  requestedKey: string,
  currentText: string | null,
  currentKey: string,
) {
  return currentText === requestedText && currentKey === requestedKey;
}

type ReportField = {
  label: string;
  value: string;
};

type ReportStep = {
  title: string;
  body: string;
};

export function formatDetailedReport({
  title,
  fields,
  notes = [],
  steps = [],
}: {
  title: string;
  fields: ReportField[];
  notes?: Array<string | null | undefined>;
  steps?: ReportStep[];
}) {
  const lines = [title, ""];

  for (const field of fields) {
    lines.push(`${field.label}: ${field.value}`);
  }

  const includedNotes = notes.filter((note): note is string => Boolean(note));

  if (includedNotes.length > 0) {
    lines.push("");
    lines.push(...includedNotes);
  }

  if (steps.length > 0) {
    lines.push("", "Step-by-step:", "");
    steps.forEach((step, index) => {
      lines.push(`${step.title}. ${step.body}`);

      if (index < steps.length - 1) {
        lines.push("");
      }
    });
  }

  return lines.join("\n");
}
