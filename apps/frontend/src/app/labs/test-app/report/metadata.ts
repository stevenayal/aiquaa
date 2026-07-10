import type { BugReport, ImageEvidence } from './types';

type PersistedImageEvidence = Omit<ImageEvidence, 'base64Data'> & {
  storageBucket?: string;
  storagePath?: string;
  signedUrl?: string;
  uploadError?: string;
};

export type PersistedBugReport = Omit<BugReport, 'images'> & {
  images: PersistedImageEvidence[];
};

export function stripBase64FromImage(
  image: ImageEvidence | PersistedImageEvidence
): PersistedImageEvidence {
  const metadata = { ...image } as PersistedImageEvidence & {
    base64Data?: string;
  };
  delete metadata.base64Data;
  return metadata;
}

export function stripBase64FromBugs(
  bugs: Array<BugReport | PersistedBugReport>
): PersistedBugReport[] {
  return bugs.map((bug) => ({
    ...bug,
    images: (bug.images ?? []).map(stripBase64FromImage),
  }));
}
