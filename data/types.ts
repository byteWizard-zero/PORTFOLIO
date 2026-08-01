

export interface OpenGraphData {
  title: string;
  description: string;
  type: "website" | "article" | "profile";
  locale: string;
  siteName: string;
}

export interface TwitterData {
  card: string;
  creator: string;
}

export interface PersonData {
  name: string;
  jobTitle: string;
  sameAs: string[];
}

export interface SiteMetadata {
  title: string;
  description: string;
  author: string;
  siteUrl: string;
  themeColor: string;
  keywords: string[];
  openGraph: OpenGraphData;
  twitter: TwitterData;
  person: PersonData;
}

export interface HeroContent {
  firstName: string;
  lastName: string;
  title: string;
  tagline: string[];
  taglineHidden: string[];
}

export interface SkillsContent {
  marqueeItems: string[];
  separator: string;
}

export interface WelcomeScreenContent {
  greetings: string[];
  initials: {
    first: string;
    last: string;
  };
  greetingDuration: number;
  totalGreetingTime: number;
}

export interface UIContent {
  buttons: {
    menu: string;
    close: string;
    back: string;
  };
}

export interface PhilosophyContent {
  label: string;
  statement: string;
  highlights: string[];
}

export interface WorkflowStop {
  
  name: string;
  
  title: string;
  
  copy: string;
  
  emphasis?: string;
  
  accent: string;
}

export interface WorkflowContent {
  
  label: string;
  
  stops: WorkflowStop[];
}

export interface ExperienceEntry {
  role: string;
  org: string;
  
  kind: string;
  
  period: string;
  summary: string;
  
  points?: string[];
  tags?: string[];
  
  placeholder?: boolean;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  year: string;
  placeholder?: boolean;
}

export interface EducationEntry {
  credential: string;
  institution: string;
  period: string;
  detail?: string;
  
  points?: string[];
  placeholder?: boolean;
}

export interface CredentialTitle {
  
  label: string;
  
  ref: string;
}

export interface CredentialEntry {
  
  period: string;
  
  credential: string;
  
  institution: string;
  
  kind: string;
  
  status?: string;
  
  titles?: CredentialTitle[];
  
  points?: string[];
}

export interface AboutContent {
  
  label: string;
  
  verbs: string[];
  
  lede: string;
  
  meta: string[];
  
  bio: string[];
  
  _cvNote?: string;
  
  experience: ExperienceEntry[];
  
  credentials: CredentialEntry[];
  
  certifications: CertificationEntry[];
  
  education: EducationEntry[];
}

export interface ServiceFace {
  word: string;
  rail: string;
  label: string;
  
  copy: string;
  tools: string[];
}

export interface ServicesContent {
  label: string;
  headline: { lead: string; accent: string };
  
  intro: string;
  faces: ServiceFace[];
}

export interface ArchiveContent {
  label: string;
  statement: string;
  highlights: string[];
  metaLeft: string;
  metaRight: string;
  cta: string;
  ctaHref: string;
}

export interface Project {
  id: string;
  title: string;
  image: string;
  year: string;
  category: string;
  badge: string;
  themeColor: string;
  badgeColor?: string;
  badgeTextColor?: string;
  badgeShadowColor?: string;
  
  featured?: boolean;
}

export interface ProjectsContent {
  label: string;
  items: Project[];
}

export interface WorksIndexProject {
  
  id: string;
  
  title: string;
  
  discipline: string;
  year: number;
  
  accent: string;
  
  marqueeDurationSec: number;
}

export interface WorksIndexContent {
  topBar: { mark: string; breadcrumb: string; lastRevised: string };
  intro: { eyebrow: string; headline: string; lede: string };
  legend: { number: string; project: string; meta: string };
  end: { left: string; right: string };
  projects: WorksIndexProject[];
}

export interface ContactContent {
  row1: {
    greeting: string;
    recipient: string;
    afterName: string;
    between: string;
    nameLabel: string;
    countryLabel: string;
  };
  row2: { lead: string; options: string[] };
  row3: {
    lead: string;
    emailLabel: string;
    phoneLabel: string;
    options: string[];
    defaultSelected: string;
  };
  row4: { lead: string; label: string };
  submit: string;
  fallback: { label: string; email: string };
}

export interface Content {
  hero: HeroContent;
  skills: SkillsContent;
  welcomeScreen: WelcomeScreenContent;
  ui: UIContent;
  philosophy: PhilosophyContent;
  workflow: WorkflowContent;
  about: AboutContent;
  services: ServicesContent;
  projects: ProjectsContent;
  archive: ArchiveContent;
  worksIndex: WorksIndexContent;
  contact: ContactContent;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  description: string;
}

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  platform: string;
}

export interface Navigation {
  mainLinks: NavLink[];
  socialLinks: SocialLink[];
  location: string;
}

export interface ColorTokens {
  background: string;
  ogBackground?: string;
  text: {
    primary: string;
    dark: string;
  };
  accent: {
    teal: string;
    gold: string;
    red: string;
    orange: string;
    green: string;
    black: string;
  };
  ui: {
    gridLine: string;
  };
  accentPalette: string[];
}

export interface TypographyTokens {
  families: {
    primary: string;
    navbar: string;
  };
  sizes: {
    hero: string;
    nav: string;
    tagline: string;
    menu: string;
    works: string;
    skills: string;
  };
  weights: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface SpacingTokens {
  navTop: string;
  navSide: string;
}

export interface LayoutTokens {
  maxWidth: string;
  minHeight: string;
}

export interface BorderRadiusTokens {
  portrait: string;
  small: string;
  medium: string;
  large: string;
}

export interface ZIndexTokens {
  base: number;
  above: number;
  nav: number;
  modal: number;
  cursor: number;
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  layout: LayoutTokens;
  borderRadius: BorderRadiusTokens;
  zIndex: ZIndexTokens;
}

export interface DurationConfig {
  fast: number;
  normal: number;
  slow: number;
  slower: number;
  slowest: number;
}

export interface EasingConfig {
  gsap: {
    outExpo: string;
    outQuart: string;
    inOutQuart: string;
    outBack: string;
    inOutBack: string;
    outCubic: string;
    outQuad: string;
    inQuad: string;
  };
  css: {
    outExpo: string;
    outQuart: string;
    inOutQuart: string;
  };
}

export interface StaggerConfig {
  fast: number;
  normal: number;
  slow: number;
  letters: number;
  words: number;
}

export interface DelayConfig {
  short: number;
  medium: number;
  long: number;
}

export interface CaseStudyScrollTriggerConfig {
  early: string;
  mid: string;
  late: string;
}

export interface CaseStudyBlockFadeConfig {
  yShort: number;
  yMedium: number;
  yTall: number;
  durationShort: number;
  durationMedium: number;
  durationLong: number;
  ease: string;
}

export interface CaseStudyAnimationConfig {
  scrollTrigger: CaseStudyScrollTriggerConfig;
  blockFade: CaseStudyBlockFadeConfig;
}

export interface AnimationConfig {
  durations: DurationConfig;
  easing: EasingConfig;
  stagger: StaggerConfig;
  delays: DelayConfig;
  caseStudy: CaseStudyAnimationConfig;
}

export interface CursorTrailConfig {
  count: number;
  sizes: number[];
  lerpFactors: number[];
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

export interface CursorBurstConfig {
  enabled: boolean;
  scale: number;
  duration: number;
}

export interface CustomCursorConfig {
  enabled: boolean;
  hideOnTouch: boolean;
  trail: CursorTrailConfig;
  burst: CursorBurstConfig;
}

export interface BackgroundGridConfig {
  spacing: number;
  plusSignSize: number;
  strokeWidth: number;
}

export interface BackgroundPhysicsConfig {
  mouseRadius: number;
  repulsionStrength: number;
  returnStrength: number;
  friction: number;
  maxVelocity: number;
}

export interface InteractiveBackgroundConfig {
  enabled: boolean;
  grid: BackgroundGridConfig;
  physics: BackgroundPhysicsConfig;
}

export interface WelcomeScreenConfig {
  enabled: boolean;
  skipOnReturn: boolean;
  storageKey: string;
}

export interface SmoothScrollConfig {
  enabled: boolean;
  lerp: number;
  duration: number;
  smoothWheel: boolean;
}

export interface MenuConfig {
  enabled: boolean;
  animateOnHover: boolean;
  showDescriptions: boolean;
}

export interface AccentColorConfig {
  enabled: boolean;
  defaultColorIndex: number;
  cssVariableName: string;
}

export interface BackToTopConfig {
  enabled: boolean;
  scrollThreshold: number;
  scrollDuration: number;
}

export interface Features {
  customCursor: CustomCursorConfig;
  interactiveBackground: InteractiveBackgroundConfig;
  welcomeScreen: WelcomeScreenConfig;
  smoothScroll: SmoothScrollConfig;
  menu: MenuConfig;
  accentColorRotation: AccentColorConfig;
  backToTop: BackToTopConfig;
}

export interface CaseStudyHeroContent {
  title: string;
  lede: string;
  image: string;
  alt: string;
  pills?: string[];
  badge?: string;
  year?: string;
  backHref?: string;
}

export interface LedgerEntry {
  label: string;
  primary: string;
  secondary: string;
}

export interface LedgerContent {
  entries: LedgerEntry[];
}

export interface ContextContent {
  label: string;
  facts: string[];
  body: string[];
}

export interface VisionContent {
  label: string;
  titleLine1: string;
  titleLine2: string;
  titleAccent: string;
  body: string[];
  
  titleUnderlineWord?: string;
}

export interface PullLine {
  text: string;
  accent?: boolean;
}

export interface PullAttribution {
  name: string;
  role: string;
  location?: string;
}

export interface PullContent {
  attribution: PullAttribution;
  act2: PullLine[];
  act3: PullLine[];
}

export interface ProductContent {
  label: string;
  titleLine1: string;
  titleLine2: string;
  titleAccent: string;
  body: string[];
}

export interface DashboardContent {
  badge?: string;
  figcaption?: string;
  image: string;
  alt: string;
}

export interface ToggleScreen {
  num: string;
  name: string;
  image: string;
  color: string;
  description: string;
  meta: string;
  hasGalleryCaption?: boolean;
}

export interface ToggleContent {
  label: string;
  titleLine1: string;
  titleAccent: string;
  screens: ToggleScreen[];
}

export interface OutcomeMetric {
  value: string;
  unit?: string;
  title: string;
  caption: string;
}

export interface OutcomesContent {
  label: string;
  titleLine1: string;
  titleLine2: string;
  titleAccent: string;
  metrics: OutcomeMetric[];
}

export interface ArchitectureLayer {
  
  name: string;
  
  tech: string[];
  
  detail: string;
}

export interface ArchitectureFact {
  value: string;
  unit?: string;
  title: string;
  caption: string;
}

export interface ArchitectureContent {
  label: string;
  titleLine1: string;
  titleAccent: string;
  
  intro: string;
  layers: ArchitectureLayer[];
  facts: ArchitectureFact[];
}

export interface ColophonCredit {
  role: string;
  primary: string;
  secondary: string;
}

export interface ColophonAction {
  label: string;
  href?: string;
}

export interface ColophonContent {
  leftLabel: string;
  titleLine1: string;
  titleAccent: string;
  credits: ColophonCredit[];
  rightLabel: string;
  bio: string[];
  actions: ColophonAction[];
}

export interface NextCaseContent {
  slug: string;
  counter: string;
}

export interface CaseStudy {
  hero?: CaseStudyHeroContent;
  ledger?: LedgerContent;
  context?: ContextContent;
  vision?: VisionContent;
  pull?: PullContent;
  product?: ProductContent;
  dashboard?: DashboardContent;
  toggle?: ToggleContent;
  architecture?: ArchitectureContent;
  outcomes?: OutcomesContent;
  colophon?: ColophonContent;
  nextCase?: NextCaseContent;
}

export type CaseStudies = Record<string, CaseStudy>;

export interface TransitionsConfig {
  
  defaultEffect: string;
  
  reducedMotionFallback: 'crossfade' | 'none';
  
  reducedMotionDuration: number;
  
  effects?: Record<string, Record<string, unknown>>;
}

export interface ContributionCell {
  
  date: string;
  
  count: number;
  
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubContributions {
  username: string;
  
  total: number;
  
  generatedAt: string;
  
  weeks: Array<Array<ContributionCell | null>>;
}
