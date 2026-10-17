import { AuditEntry } from '../types';

/**
 * Standard SHA-256 digest calculation compatible with Node.js and browser Web Crypto.
 */
export async function sha256(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple bitwise hash if subtle is unavailable in sandbox
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Compute the cryptographic hash for an audit entry based on its contents and prevHash.
 */
export async function computeEntryHash(
  index: number,
  ts: string,
  actor: string,
  action: string,
  target: string,
  result: string,
  plainText: string,
  prevHash: string
): Promise<string> {
  const payload = `${index}|${ts}|${actor}|${action}|${target}|${result}|${plainText}|${prevHash}`;
  return sha256(payload);
}

/**
 * Verify integrity of the entire audit chain.
 * Returns valid status and the index of any tampered block.
 */
export async function verifyAuditChain(chain: AuditEntry[]): Promise<{
  valid: boolean;
  tamperedIndex?: number;
  expectedHash?: string;
  actualHash?: string;
  count: number;
}> {
  if (chain.length === 0) {
    return { valid: true, count: 0 };
  }

  let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
    
    // Check prevHash link
    if (entry.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        tamperedIndex: i,
        expectedHash: expectedPrevHash,
        actualHash: entry.prevHash,
        count: chain.length,
      };
    }

    // Check entry's own computed hash
    const computed = await computeEntryHash(
      entry.index,
      entry.ts,
      entry.actor,
      entry.action,
      entry.target,
      entry.result,
      entry.plainText,
      entry.prevHash
    );

    if (computed !== entry.hash || entry.tampered) {
      return {
        valid: false,
        tamperedIndex: i,
        expectedHash: computed,
        actualHash: entry.hash,
        count: chain.length,
      };
    }

    expectedPrevHash = entry.hash;
  }

  return { valid: true, count: chain.length };
}
