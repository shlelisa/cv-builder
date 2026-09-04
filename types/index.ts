export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface Education {
  id: string;
  university: string;
  degree: string;
  department: string;
  major?: string;
  minor?: string;
  startYear: number;
  graduationYear: number;
  cgpa?: number;
  majorGpa?: number;
  exitExamScore?: number;
  academicAchievements?: string[];
  relevantCourses?: string[];
  academicAwards?: string[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  responsibilities: string[];
  achievements: string[];
  technologiesUsed: string[];
}

export interface Internship {
  id: string;
  organization: string;
  position: string;
  duration: string;
  startDate: string;
  endDate?: string;
  responsibilities: string[];
  achievements: string[];
  skillsGained: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  features: string[];
  resultsImpact?: string;
  githubUrl?: string;
  demoUrl?: string;
}

export interface Skills {
  technicalSkills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  networking: string[];
  cloud: string[];
  officeTools: string[];
  softSkills: string[];
  languages: Language[];
}

export interface Language {
  name: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  date: string;
  credentialUrl?: string;
}

export interface Training {
  id: string;
  name: string;
  institution: string;
  duration: string;
  skillsLearned: string[];
}

export interface Volunteering {
  id: string;
  organization: string;
  position: string;
  responsibilities: string[];
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  category: 'award' | 'competition' | 'scholarship' | 'leadership' | 'academic' | 'professional';
  description: string;
  date: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  organization: string;
  email: string;
  phone: string;
}

export interface UserProfile {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  internships: Internship[];
  projects: Project[];
  skills: Skills;
  certifications: Certification[];
  training: Training[];
  volunteering: Volunteering[];
  achievements: Achievement[];
  references: Reference[];
}

export interface JobDescription {
  position: string;
  company: string;
  requirements: string[];
  responsibilities?: string[];
  qualifications?: string[];
  keywords?: string[];
}

export interface JobAnalysis {
  requiredEducation: string[];
  requiredTechnicalSkills: string[];
  preferredTechnicalSkills: string[];
  requiredExperience: string[];
  softSkills: string[];
  keywords: string[];
}

export interface JobMatchAnalysisDetail {
  category: 'domain' | 'experience' | 'education' | 'skills' | 'culture';
  title: string;
  status: 'match' | 'partial' | 'mismatch';
  candidateValue: string;
  requiredValue: string;
  commentary: string;
}

export interface JobMatchResult {
  matchScore: number;
  atsScore?: number;
  verdictTitle?: string;
  verdictSummary?: string;
  domainMatchStatus?: 'match' | 'partial' | 'mismatch';
  jobDomain?: string;
  candidateDomain?: string;
  domainExplanation?: string;
  matchedQualifications: string[];
  matchedTechnicalSkills: string[];
  matchedExperience: string[];
  matchedEducation: string[];
  missingRequirements: string[];
  transferableSkills?: string[];
  comparisonDetails?: JobMatchAnalysisDetail[];
  recommendations: string[];
  recruiterAdvice?: string[];
  atsOptimizationTips?: string[];
}

export type DocumentType = 'cv' | 'application-letter' | 'cover-letter';

export type LanguageCode = 'en' | 'om' | 'am';

export interface GeneratedDocument {
  type: DocumentType;
  content: string;
  language: LanguageCode;
  generatedAt: Date;
}

export type TemplateFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'textarea'
  | 'select'
  | 'date';

export interface TemplateField {
  id: string;
  label: string;
  type: TemplateFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  section: string;
}

export interface TemplateSection {
  id: string;
  name: string;
  description: string;
  repeatable: boolean;
  maxEntries?: number;
}

export interface TemplateGeometry {
  orientation?: 'portrait' | 'landscape';
  headerHeight?: number;
  sidebarWidth?: number;
  mainWidth?: number;
  gap?: number;
  verticalGap?: number;
  contentBounds?: { top?: number; right?: number; bottom?: number; left?: number };
}

export interface TemplateTypographyToken {
  family?: string;
  weight?: number | string;
  size?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'capitalize';
  lineHeight?: number;
}

export interface TemplateTypography {
  name?: TemplateTypographyToken;
  jobTitle?: TemplateTypographyToken;
  sectionHeading?: TemplateTypographyToken;
  body?: TemplateTypographyToken;
  sidebarHeading?: TemplateTypographyToken;
  sidebarText?: TemplateTypographyToken;
}

export interface TemplateTheme {
  headerBackground?: string;
  sidebarBackground?: string;
  mainBackground?: string;
  headingColor?: string;
  textColor?: string;
  borderColor?: string;
  iconColor?: string;
  sidebarHeadingColor?: string;
}

export interface TemplateComponentStyle {
  headingVariant?: 'underline' | 'dotted' | 'border' | 'filled' | 'icon' | 'plain';
  bulletStyle?: 'dot' | 'square' | 'dash' | 'arrow' | 'line';
  timeline?: boolean;
  icons?: boolean;
  headerBackground?: boolean;
}

export interface TemplatePhotoCrop {
  /** Normalized bounding box of the photo region within the template image (0..1 fractions, relative to the full image). */
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface TemplateLayout {
  type: 'single-column' | 'two-column' | 'sidebar-left' | 'sidebar-right';
  headerPlacement?: 'top-full-width' | 'main-column' | 'sidebar-top' | 'inline';
  orderedSections: string[];
  sidebarSections?: string[];
  photo?: {
    included: boolean;
    position: 'top-center' | 'top-left' | 'top-right' | 'sidebar';
    shape: 'circle' | 'square' | 'rounded';
    size: 'small' | 'medium' | 'large';
    crop?: TemplatePhotoCrop;
  };
  page?: TemplatePageSpec;
  columns?: TemplateColumnSpec[];
  placements?: TemplateSectionPlacement[];
  geometry?: TemplateGeometry;
  hideInlineHeader?: boolean;
}

export interface TemplatePageSpec {
  widthMm?: number;
  heightMm?: number;
  margins?: { top: number; right: number; bottom: number; left: number };
}

export type TemplateColumnId = 'main' | 'sidebar' | 'main-left' | 'main-right';

export interface TemplateColumnSpec {
  id: TemplateColumnId;
  width?: number;
  background?: string;
  padding?: number;
}

export interface TemplateSectionPlacement {
  sectionId: string;
  column: TemplateColumnId;
  order: number;
}

export interface TemplateStyle {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: 'centered' | 'left-aligned' | 'right-aligned' | 'banner-full';
  sectionDivider: 'line' | 'space' | 'border';
  nameSize?: number;
  headingSize?: number;
  bodySize?: number;
  lineHeight?: number;
  bulletStyle?: 'dot' | 'square' | 'dash' | 'arrow' | 'line';
  headingVariant?: 'underline' | 'border' | 'filled' | 'plain';
  theme?: TemplateTheme;
  typography?: TemplateTypography;
  componentStyle?: TemplateComponentStyle;
}

export interface TemplateAnalysis {
  templateName: string;
  description: string;
  layout: TemplateLayout;
  style: TemplateStyle;
  sections: TemplateSection[];
  fields: TemplateField[];
  confidence: number;
  /** Default content extracted from the template image (fieldId -> value) for singleton (non-repeatable) fields. */
  content?: Record<string, string>;
  /** Default entries extracted from the template image (sectionId -> entries of { fieldId -> value }) for repeatable sections. */
  contentEntries?: Record<string, Array<Record<string, string>>>;
}
