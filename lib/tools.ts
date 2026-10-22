export const categories = [
  {
    id: "calculators",
    name: "Calculators",
    summary: "Everyday and scientific calculations, ready when you are.",
    href: "/scientific-calculator",
    cta: "Open calculator",
  },
  {
    id: "converters",
    name: "Fraction & Decimal Converters",
    summary: "Move between fractions, decimals, and percents.",
    href: "/calculators/fraction-converter",
    cta: "Open converter",
  },
  {
    id: "solvers",
    name: "Scientific Solvers",
    summary: "Work through equations with the steps kept visible.",
    href: "/scientific-solvers",
    cta: "Open solver",
  },
  {
    id: "guides",
    name: "Educational Guides",
    summary: "Short explanations for the ideas behind the tools.",
    href: "/guides",
    cta: "Open guide",
  },
] as const;

export type CategoryName = (typeof categories)[number]["name"];

export type Tool = {
  id: string;
  name: string;
  category: CategoryName;
  summary: string;
  href: string;
  cta: string;
  popular?: boolean;
};

export const tools: Tool[] = [
  {
    id: "scientific-calculator",
    name: "Scientific Calculator",
    category: "Calculators",
    summary: "Trig, powers, roots, and scientific notation.",
    href: "/scientific-calculator",
    cta: "Open calculator",
    popular: true,
  },
  {
    id: "fraction-to-percent",
    name: "Fraction-to-Percent Converter",
    category: "Fraction & Decimal Converters",
    summary: "Turn a fraction into a percent, with the steps shown.",
    href: "/calculators/fraction-converter",
    cta: "Open converter",
    popular: true,
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    category: "Calculators",
    summary: "Convert length, mass, and volume without the busywork.",
    href: "/unit-converter",
    cta: "Open converter",
    popular: true,
  },
  {
    id: "equation-solver",
    name: "Equation Solver",
    category: "Scientific Solvers",
    summary: "Solve linear and quadratic equations with the algebra shown.",
    href: "/scientific-solvers",
    cta: "Open solver",
  },
  {
    id: "educational-guides",
    name: "Educational Guides",
    category: "Educational Guides",
    summary: "Practice scientific notation, percents, and powers of ten.",
    href: "/guides",
    cta: "Open guide",
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
