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

  let hash = image.hash(2);

  if (!hash) {
    throw new Error("Failed to generate image hash.");
  }

  // Ensure it's exactly 64 bits by padding leading zeros
  hash = hash.padStart(64, '0');

  console.log("✅ Hash generated");

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
  const maxLength = Math.max(hash1.length, hash2.length);
  const h1 = hash1.padStart(maxLength, '0');
  const h2 = hash2.padStart(maxLength, '0');

  let distance = 0;
  for (let i = 0; i < maxLength; i++) {
    if (h1[i] !== h2[i]) {
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
  const distance = calculateHammingDistance(hash1, hash2);
  const maxLength = Math.max(hash1.length, hash2.length);

  const similarity = (1 - distance / maxLength) * 100;
  const rounded = Math.round(similarity * 100) / 100;

  console.log(`[Hash Compare] Hash1: ${hash1}`);
  console.log(`[Hash Compare] Hash2: ${hash2}`);
  console.log(`[Hash Compare] Distance: ${distance}`);
  console.log(`[Hash Compare] Similarity: ${rounded}%`);

  return rounded;
}
