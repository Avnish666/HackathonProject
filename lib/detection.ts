import { Content } from '@/models/Content';
import { IngestMatch, IIngestMatch } from '@/models/IngestMatch';
import { generatePHash, getSimilarityPercentage, calculateHammingDistance } from '@/lib/hashUtils';

export interface ProcessImageOptions {
  buffer: Buffer;
  source_type: string;
  source_url?: string;
  suspectedFilePath?: string;
}

export interface ProcessImageResult {
  match: any; // Populated match document
  isLeak: boolean;
  status: 'LEAK' | 'SUSPICIOUS' | 'SAFE';
  suspectHash: string;
  distance: number | null;
  similarity: number;
}

export async function processImageBuffer({
  buffer,
  source_type,
  source_url,
  suspectedFilePath
}: ProcessImageOptions): Promise<ProcessImageResult> {
  const suspectHash = await generatePHash(buffer);

  // Optimize comparison: fetch all entries for accurate match
  const latestOriginals = await Content.find({});

  let bestMatch = null;
  let highestSimilarity = 0;
  let bestDistance: number | null = null;

  for (const original of latestOriginals) {
    const similarity = getSimilarityPercentage(suspectHash, original.hash);

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = original;
    }
  }

  // Save the match record
  const newMatch = await IngestMatch.create({
    suspectedFilePath,
    source_type,
    source_url,
    matchedContentId: bestMatch ? bestMatch._id : null,
    similarity: highestSimilarity,
  });

  if (bestMatch) {
    bestDistance = calculateHammingDistance(suspectHash, bestMatch.hash);
  }

  const populatedMatch = await IngestMatch.findById(newMatch._id).populate('matchedContentId');

  let status: 'LEAK' | 'SUSPICIOUS' | 'SAFE' = 'SAFE';
  if (highestSimilarity >= 85) {
    status = 'LEAK';
  } else if (highestSimilarity >= 60) {
    status = 'SUSPICIOUS';
  }

  return {
    match: populatedMatch,
    isLeak: highestSimilarity >= 85,
    status,
    suspectHash,
    distance: bestDistance,
    similarity: highestSimilarity
  };
}
