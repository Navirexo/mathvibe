"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useState } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({
  items,
  idPrefix = "faq",
}: {
  items: FaqItem[];
  idPrefix?: string;
}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${idPrefix}-panel-${index}`;
        const buttonId = `${idPrefix}-button-${index}`;

        return (
          <Card key={item.question}>
            <h3 className="text-base font-semibold text-ink">
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                {item.question}
                <Chevron open={open} />
              </button>
            </h3>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                inert={open ? undefined : true}
                className="overflow-hidden"
              >
                <p className="pt-3 text-sm text-muted sm:text-base">{item.answer}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(
        "size-5 shrink-0 text-[#00D1F7] transition-transform duration-300 motion-reduce:transition-none",
        open && "rotate-180",
      )}
      fill="none"
    >
      <path
        d="M6 9.5 12 15.5 18 9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
