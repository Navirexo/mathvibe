"use client";

import { AmbientGlow } from "@/components/home/AmbientGlow";
import { ToolPreview } from "@/components/home/ToolPreview";
import { ToolSearch } from "@/components/home/ToolSearch";
import { gradientActionClass, secondaryActionClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { filterCatalog } from "@/lib/tools";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

export function HomeExplorer() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => filterCatalog(query), [query]);
  const searching = query.trim().length > 0;
  const resultCount = results.categories.length + results.tools.length;

  return (
    <>
      <section aria-labelledby="search-heading" className="scroll-mt-24">
        <h2 id="search-heading" className="text-xl font-semibold text-ink">
          Find a tool
        </h2>
        <div className="mt-4">
          <ToolSearch
            value={query}
            onChange={setQuery}
            resultCount={resultCount}
            inputRef={inputRef}
          />
        </div>
      </section>

      <section
        id="categories"
        aria-labelledby="categories-heading"
        className="relative scroll-mt-24 overflow-x-clip"
      >
        <AmbientGlow className="-inset-x-8 -top-8 h-64" />
        <h2 id="categories-heading" className="relative text-xl font-semibold text-ink">
          Categories
        </h2>
        {results.categories.length > 0 ? (
          <ul className="relative mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {results.categories.map((category) => (
              <li key={category.id}>
                <Card className="flex h-full flex-col">
                  <h3 className="text-lg font-semibold text-ink">
                    {category.name}
                  </h3>
                  <p className="mt-2 flex-1 text-base text-slate-200">
                    {category.summary}
                  </p>
                  <Link
                    href={category.href}
                    className={cn("mt-5 w-full", secondaryActionClass)}
                  >
                    {category.cta}
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="relative mt-4 text-base text-slate-200">No categories match this search.</p>
        )}
      </section>

      <section
        id="popular"
        aria-labelledby="popular-heading"
        className="relative scroll-mt-24 overflow-x-clip"
      >
        <AmbientGlow className="-inset-x-8 -top-6 h-72" />
        <h2 id="popular-heading" className="relative text-xl font-semibold text-ink">
          {searching ? "Matching tools" : "Popular Tools"}
        </h2>
        {results.tools.length > 0 ? (
          <ul className="relative mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {results.tools.map((tool) => (
              <li key={tool.id}>
                <Card className="flex h-full flex-col overflow-hidden">
                  <ToolPreview id={tool.id} />
                  <p className="text-sm font-medium text-[#00D1F7]">{tool.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-ink">
                    {tool.name}
                  </h3>
                  <p className="mt-2 flex-1 text-base text-slate-200">{tool.summary}</p>
                  <Link
                    href={tool.href}
                    className={cn("mt-5 w-full", gradientActionClass)}
                  >
                    {tool.cta}
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="relative mt-4 text-base text-slate-200">No tools match this search.</p>
        )}
      </section>
    </>
  );
}
