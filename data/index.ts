

import type {
  SiteMetadata,
  Content,
  Navigation,
  DesignTokens,
  AnimationConfig,
  Features,
  CaseStudy,
  CaseStudies,
  TransitionsConfig,
  Project,
  GithubContributions,
} from './types';

import siteMetadataJson from './site-metadata.json';
import contentJson from './content.json';
import navigationJson from './navigation.json';
import designTokensJson from './design-tokens.json';
import animationConfigJson from './animation-config.json';
import featuresJson from './features.json';
import caseStudiesJson from './case-studies.json';
import transitionsJson from './transitions.json';
import githubContributionsJson from './github-contributions.json';
import leetcodeStatsJson from './leetcode-stats.json';

export const siteMetadata: SiteMetadata = siteMetadataJson as SiteMetadata;
export const content: Content = contentJson;
export const navigation: Navigation = navigationJson;
export const designTokens: DesignTokens = designTokensJson;
export const animationConfig: AnimationConfig = animationConfigJson;
export const features: Features = featuresJson;
export const caseStudies: CaseStudies = caseStudiesJson;
export const transitionsConfig: TransitionsConfig = transitionsJson as TransitionsConfig;

export const githubContributions: GithubContributions =
  githubContributionsJson as GithubContributions;
export const leetcodeStats = leetcodeStatsJson;

if (process.env.NODE_ENV !== 'production') {
  Object.entries(caseStudies).forEach(([slug, cs]) => {
    if (cs.nextCase && !caseStudies[cs.nextCase.slug]) {
      console.warn(
        `[case-studies] "${slug}".nextCase.slug "${cs.nextCase.slug}" has no entry — NextCase will render the non-link branch.`
      );
    }
  });
}

export type {
  SiteMetadata,
  Content,
  Navigation,
  DesignTokens,
  AnimationConfig,
  Features,
  
  NavLink,
  SocialLink,
  HeroContent,
  SkillsContent,
  WelcomeScreenContent,
  PhilosophyContent,
  WorkflowContent,
  WorkflowStop,
  AboutContent,
  ServicesContent,
  ServiceFace,
  ArchiveContent,
  ColorTokens,
  TypographyTokens,
  DurationConfig,
  EasingConfig,
  CustomCursorConfig,
  InteractiveBackgroundConfig,
  
  CaseStudy,
  CaseStudies,
  CaseStudyHeroContent,
  LedgerContent,
  LedgerEntry,
  ContextContent,
  VisionContent,
  PullContent,
  PullLine,
  PullAttribution,
  ProductContent,
  DashboardContent,
  ToggleContent,
  ToggleScreen,
  ArchitectureContent,
  ArchitectureLayer,
  ArchitectureFact,
  OutcomesContent,
  OutcomeMetric,
  ColophonContent,
  ColophonCredit,
  ColophonAction,
  NextCaseContent,
  TransitionsConfig,
  Project,
  
  WorksIndexContent,
  WorksIndexProject,
  
  GithubContributions,
  ContributionCell,
} from './types';

export const getHeroLetters = () => ({
  firstName: content.hero.firstName.split(''),
  lastName: content.hero.lastName.split(''),
});

export const getAccentColors = () => designTokens.colors.accentPalette;

export const getServicesFaces = () => content.services.faces;

export const getCaseStudy = (slug: string): CaseStudy | undefined => caseStudies[slug];

export const getCaseStudySlugs = (): string[] => Object.keys(caseStudies);

const getProject = (id: string): Project | undefined =>
  content.projects.items.find((p) => p.id === id);

export const getProjectThemeColor = (slug: string): string =>
  getProject(slug)?.themeColor ?? designTokens.colors.accentPalette[0];

export const getWorksIndex = () => content.worksIndex;
