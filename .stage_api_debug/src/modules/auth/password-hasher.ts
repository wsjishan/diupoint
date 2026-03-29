type BcryptLike = {
  hash: (data: string, saltOrRounds: number) => Promise<string>;
  compare: (data: string, encrypted: string) => Promise<boolean>;
};

function loadHasher(): BcryptLike {
  try {
    // Prefer native bcrypt in production/runtime where bindings are available.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('bcrypt') as BcryptLike;
  } catch {
    // Fallback keeps local development and CI usable when native bindings fail.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('bcryptjs') as BcryptLike;
  }
}

const hasher = loadHasher();

export function hashPassword(password: string): Promise<string> {
  return hasher.hash(password, 12);
}

export function comparePassword(
  plainPassword: string,
  storedHash: string
): Promise<boolean> {
  return hasher.compare(plainPassword, storedHash);
}
