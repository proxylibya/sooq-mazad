// أنواع التحقق والتوثيق
// Verification and Authentication Types

export enum VerificationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum VerificationLevel {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export interface UserVerificationStatus {
  id: string;
  userId: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  identityVerified: boolean;
  addressVerified: boolean;
  bankAccountVerified: boolean;
  isVerified: boolean;
  verificationLevel: VerificationLevel;
  level: VerificationLevel;
  completedAt?: Date;
  expiresAt?: Date;
  documents: VerificationDocument[];
  checks: VerificationCheck[];
  verifiedDocuments: string[];
  verificationHistory: VerificationHistoryItem[];
}

export interface VerificationHistoryItem {
  id: string;
  userId?: string;
  status: VerificationStatus;
  documentType: string;
  frontImage?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  extractedData?: any;
  aiAnalysis?: any;
}

export interface VerificationDocument {
  id: string;
  type: DocumentType;
  status: VerificationStatus;
  uploadedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

export interface VerificationCheck {
  id: string;
  type: CheckType;
  status: VerificationStatus;
  performedAt: Date;
  result?: any;
  metadata?: Record<string, any>;
}

export enum DocumentType {
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  UTILITY_BILL = 'UTILITY_BILL',
  BANK_STATEMENT = 'BANK_STATEMENT',
  SELFIE = 'SELFIE',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
}

export enum CheckType {
  PHONE_SMS = 'PHONE_SMS',
  EMAIL_LINK = 'EMAIL_LINK',
  IDENTITY_DOCUMENT = 'IDENTITY_DOCUMENT',
  FACE_MATCH = 'FACE_MATCH',
  ADDRESS_VERIFICATION = 'ADDRESS_VERIFICATION',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CREDIT_CHECK = 'CREDIT_CHECK',
}

export interface VerificationRequirement {
  type: CheckType | DocumentType;
  required: boolean;
  level: VerificationLevel;
  description: string;
  estimatedTime: string;
}

export interface VerificationProgress {
  currentLevel: VerificationLevel;
  nextLevel?: VerificationLevel;
  completedRequirements: string[];
  pendingRequirements: string[];
  rejectedRequirements: string[];
  overallProgress: number;
  levelProgress: number;
}

export interface AIAnalysisResult {
  success: boolean;
  confidence: number;
  extractedData: ExtractedDocumentData;
  verificationChecks: {
    documentType: boolean;
    quality: boolean;
    authenticity: boolean;
    completeness: boolean;
  };
  issues: string[];
  recommendations: string[];
}

export interface ExtractedDocumentData {
  documentType: DocumentType;
  personalInfo: {
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    idNumber?: string;
    address?: string;
  };
  documentInfo: {
    issueDate?: string;
    expiryDate?: string;
    issuingAuthority?: string;
    documentNumber?: string;
  };
  biometricData?: {
    faceDetected: boolean;
    faceQuality: number;
    fingerprints?: boolean;
  };
}
