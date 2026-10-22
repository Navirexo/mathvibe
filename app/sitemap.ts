import type { MetadataRoute } from "next";
import { staticConversionParams } from "@/lib/pseo";
import { siteUrl } from "@/lib/site";

const staticPaths = [
  "/",
  "/scientific-calculator",
  "/unit-converter",
  "/scientific-solvers",
  "/calculators/fraction-converter",
  "/guides",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...staticPaths,
    ...staticConversionParams().map((entry) => `/convert/${entry.slug}`),
  ];

  return paths.map((path) => ({
    url: path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`,
  }));
}
