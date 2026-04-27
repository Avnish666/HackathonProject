import { Jimp } from 'jimp';

/**
 * Generates a perceptual hash (pHash) for an image buffer.
 *
 * @param imageBuffer - The raw binary buffer of the uploaded image.
 * @returns A promise resolving to a 64-character binary string representing the hash.
 */
export async function generatePHash(imageBuffer: Buffer): Promise<string> {
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Invalid or empty image buffer provided for hashing.');
  }

  console.log("📸 Buffer size:", imageBuffer.length);

  const image = await Jimp.read(imageBuffer);

  console.log("✅ Image loaded");

  image.resize({ w: 32, h: 32 }).greyscale();

  console.log("✅ Image processed");

  const hash = image.hash(2);

  console.log("✅ Hash:", hash);

  return hash;
}

/**
 * Calculates the Hamming distance between two hash strings by counting mismatching bits.
 *
 * @param hash1 - The first binary hash string.
 * @param hash2 - The second binary hash string.
 * @returns The total number of differing bits (characters).
 */
export function calculateHammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    throw new Error('Hashes must be of equal length to calculate Hamming distance.');
  }

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }

  return distance;
}

/**
 * Derives a human-readable similarity percentage from two hashes.
 * Formula: similarity = (1 - distance / maxLength) * 100
 *
 * @param hash1 - The first binary hash string.
 * @param hash2 - The second binary hash string.
 * @returns Similarity scalar between 0.00 and 100.00.
 */
export function getSimilarityPercentage(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    throw new Error('Cannot compute similarity for hashes of different lengths.');
  }

  const distance = calculateHammingDistance(hash1, hash2);
  const maxLength = hash1.length;

  const similarity = (1 - distance / maxLength) * 100;

  // Floor/Round to 2 decimal places to keep precision clean
  return Math.round(similarity * 100) / 100;
}
