export interface SimplifiedPoint {
  order: number;
  text: string;
  analogy: string | null;
  source_quote: string;
  is_valid_quote?: boolean;
}

export interface GlossaryTerm {
  term: string;
  meaning: string;
  source_quote: string | null;
}

export interface VisualStep {
  order: number;
  icon: string;
  text: string;
}

export interface Flashcard {
  word: string;
  meaning: string;
  steps: VisualStep[];
  sign_description: string;
  example_sentence: string;
  source_quote: string;
  is_valid_quote?: boolean;
}

export interface TeacherVerification {
  verifiedBy: string;
  verifiedAt: string;
  notes?: string;
  isVerified: boolean;
  /** True bila guru menyunting poin/analogi sebelum memverifikasi. */
  edited?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourcePointText: string;
  sourceQuote?: string;
  isValidQuote?: boolean;
}

export interface ScanResult {
  id: string;
  owner_id?: string;
  owner_name?: string;
  owner_role?: UserRole;
  source_scan_id?: string;
  title: string;
  ocr_text: string;
  points: SimplifiedPoint[];
  glossary: GlossaryTerm[];
  flashcards?: Flashcard[];
  readable: boolean;
  created_at: string;
  image_preview?: string;
  stars_earned?: number;
  lesson_completed?: boolean;
  teacher_verification?: TeacherVerification;
  quiz_score?: number;
  quiz_total?: number;
  quiz_best_score?: number;
  quiz_attempts?: number;
  quiz_completed?: boolean;
}

export interface ExplanationResult {
  text: string;
  source_quote: string;
  is_valid_quote?: boolean;
}

export type UserRole = 'siswa' | 'guru';

export type LearningMode = 'read' | 'visual' | 'sound';
export type FontSizePreference = 'normal' | 'large' | 'extra';
export type FontPreference = 'lexend' | 'dyslexic';

export interface AccessibilitySettings {
  mode: LearningMode;
  fontSize: FontSizePreference;
  fontPreference: FontPreference;
  lineSpacing: 'normal' | 'wide';
  calmMode: boolean;
  highContrast: boolean;
  soundEnabled: boolean;
}

export type SymbolResponseType = 'confused' | 'repeat' | 'easier' | 'example' | 'rest';

export type StepProgress = 'photo' | 'read' | 'source' | 'star';
