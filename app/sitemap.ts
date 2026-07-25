import type { MetadataRoute } from 'next';
import { siteMetadata, getCaseStudySlugs, getCaseStudy, getWorksIndex } from '@/data';

export const dynamic = 'force-static';

function worksRevisedDate(): Date | undefined {
  const raw = getWorksIndex().topBar.lastRevised;
  const match = raw.match(/(\d{4}).*?(\d{1,2})/);
  if (!match) return undefined;
  const [, year, month] = match;
  return new Date(Number(year), Number(month) - 1, 1);
}

function caseStudyDate(slug: string): Date | undefined {
  const entry = getCaseStudy(slug)?.ledger?.entries.find((e) => e.label === 'Year');
  const year = entry?.primary ? Number(entry.primary) : NaN;
  return Number.isFinite(year) ? new Date(year, 0, 1) : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteMetadata.siteUrl;
  const worksRevised = worksRevisedDate();
  return [
    { url: base, ...(worksRevised ? { lastModified: worksRevised } : {}) },
    { url: `${base}/work2`, ...(worksRevised ? { lastModified: worksRevised } : {}) },
    ...getCaseStudySlugs().map((slug) => {
      const lastModified = caseStudyDate(slug);
      return {
        url: `${base}/work/${slug}`,
        ...(lastModified ? { lastModified } : {}),
      };
    }),
  ];
}
