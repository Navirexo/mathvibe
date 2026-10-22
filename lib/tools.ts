export const categories = [
  {
    id: "calculators",
    name: "Calculators",
    summary: "Everyday and scientific calculations, ready when you are.",
  },
  {
    id: "converters",
    name: "Fraction & Decimal Converters",
    summary: "Move between fractions, decimals, and percents.",
  },
  {
    id: "solvers",
    name: "Scientific Solvers",
    summary: "Work through equations with the steps kept visible.",
  },
  {
    id: "guides",
    name: "Educational Guides",
    summary: "Short explanations for the ideas behind the tools.",
  },
] as const;

export type CategoryName = (typeof categories)[number]["name"];

export type Tool = {
  id: string;
  name: string;
  category: CategoryName;
  summary: string;
  popular?: boolean;
  href?: string;
};

export const tools: Tool[] = [
  {
    id: "scientific-calculator",
    name: "Scientific Calculator",
    category: "Calculators",
    summary: "Trig, powers, roots, and scientific notation.",
    popular: true,
  },
  {
    id: "fraction-to-percent",
    name: "Fraction-to-Percent Converter",
    category: "Fraction & Decimal Converters",
    summary: "Turn a fraction into a percent, with the steps shown.",
    popular: true,
    href: "/calculators/fraction-converter",
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    category: "Calculators",
    summary: "Convert length, mass, and volume without the busywork.",
    popular: true,
  },
];

export function filterCatalog(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return {
      categories: [...categories],
      tools: tools.filter((tool) => tool.popular),
    };
  }

  const matchedCategories = categories.filter((category) =>
    `${category.name} ${category.summary}`.toLowerCase().includes(normalized),
  );
  const matchedTools = tools.filter((tool) =>
    `${tool.name} ${tool.category} ${tool.summary}`
      .toLowerCase()
      .includes(normalized),
  );

  return {
    categories: matchedCategories,
    tools: matchedTools,
  };
}
