#!/usr/bin/env bun

/**
 * Validates JSON payloads for the Quicks API.
 *
 * Usage:
 *   echo '{"type":"notes","data":{"text":"# Hello"}}' | bun run validate.ts create-card
 *   echo '{"cards":[{"id":"Notes","data":{"text":"..."}}]}' | bun run validate.ts update-cards
 *   echo '{"text":"# Hello"}' | bun run validate.ts create-note
 *   echo '{"text":"# Updated"}' | bun run validate.ts update-note
 *   echo '{"parentPath":"project","slug":"new","name":"New Page"}' | bun run validate.ts create-page
 *   bun run validate.ts < payload.json              # auto-detect type
 */

type ValidationError = { field: string; message: string };

function validateCreateCard(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof data !== "object" || data === null) {
    return [{ field: "(root)", message: "Expected an object" }];
  }
  const obj = data as Record<string, unknown>;

  if (!obj.type || typeof obj.type !== "string") {
    errors.push({ field: "type", message: "Required string field" });
  }

  if (obj.name !== undefined && typeof obj.name !== "string") {
    errors.push({ field: "name", message: "Must be a string if provided" });
  }

  if (obj.data !== undefined) {
    if (typeof obj.data !== "object" || obj.data === null) {
      errors.push({ field: "data", message: "Must be an object" });
    } else {
      for (const [key, val] of Object.entries(obj.data as Record<string, unknown>)) {
        if (typeof val !== "string") {
          errors.push({ field: `data.${key}`, message: "All values must be strings" });
        }
      }
    }
  }

  return errors;
}

function validateUpdateCards(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof data !== "object" || data === null) {
    return [{ field: "(root)", message: "Expected an object" }];
  }
  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.cards)) {
    return [{ field: "cards", message: "Required array field" }];
  }

  for (let i = 0; i < obj.cards.length; i++) {
    const card = obj.cards[i];
    if (typeof card !== "object" || card === null) {
      errors.push({ field: `cards[${i}]`, message: "Must be an object" });
      continue;
    }
    const c = card as Record<string, unknown>;

    if (!c.id || typeof c.id !== "string") {
      errors.push({ field: `cards[${i}].id`, message: "Required string field" });
    }

    if (!c.data || typeof c.data !== "object" || c.data === null) {
      errors.push({ field: `cards[${i}].data`, message: "Required object field" });
    } else {
      for (const [key, val] of Object.entries(c.data as Record<string, unknown>)) {
        if (typeof val !== "string") {
          errors.push({ field: `cards[${i}].data.${key}`, message: "All values must be strings" });
        }
      }
    }
  }

  return errors;
}

function validateCreatePage(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof data !== "object" || data === null) {
    return [{ field: "(root)", message: "Expected an object" }];
  }
  const obj = data as Record<string, unknown>;

  if (!obj.slug || typeof obj.slug !== "string") {
    errors.push({ field: "slug", message: "Required string field" });
  }
  if (!obj.name || typeof obj.name !== "string") {
    errors.push({ field: "name", message: "Required string field" });
  }
  if (obj.parentPath !== undefined && typeof obj.parentPath !== "string") {
    errors.push({ field: "parentPath", message: "Must be a string if provided" });
  }

  return errors;
}

function validateCreateNote(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof data !== "object" || data === null) {
    return [{ field: "(root)", message: "Expected an object" }];
  }
  const obj = data as Record<string, unknown>;

  if (typeof obj.text !== "string") {
    errors.push({ field: "text", message: "Required string field (markdown)" });
  }
  if (obj.name !== undefined && typeof obj.name !== "string") {
    errors.push({ field: "name", message: "Must be a string if provided" });
  }

  return errors;
}

function validateUpdateNote(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof data !== "object" || data === null) {
    return [{ field: "(root)", message: "Expected an object" }];
  }
  const obj = data as Record<string, unknown>;

  if (typeof obj.text !== "string") {
    errors.push({ field: "text", message: "Required string field (markdown)" });
  }

  return errors;
}

function detectType(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.cards)) return "update-cards";
  if (typeof obj.type === "string") return "create-card";
  if (typeof obj.slug === "string" && typeof obj.name === "string") return "create-page";
  if (typeof obj.text === "string" && !obj.type && !obj.slug) return "create-note";
  return null;
}

// --- main ---

const input = await Bun.stdin.text();
if (!input.trim()) {
  console.error("Error: no input. Pipe JSON via stdin.");
  console.error("Usage: echo '{...}' | bun run validate.ts [create-card|update-cards|create-page]");
  process.exit(1);
}

let parsed: unknown;
try {
  parsed = JSON.parse(input);
} catch (e: any) {
  console.error(`Invalid JSON: ${e.message}`);
  process.exit(1);
}

let type = Bun.argv[2] as string | undefined;
if (!type) {
  type = detectType(parsed) ?? undefined;
  if (!type) {
    console.error("Cannot auto-detect payload type. Specify: create-card | update-cards | create-page");
    process.exit(1);
  }
}

const validators: Record<string, (d: unknown) => ValidationError[]> = {
  "create-note": validateCreateNote,
  "update-note": validateUpdateNote,
  "create-card": validateCreateCard,
  "update-cards": validateUpdateCards,
  "create-page": validateCreatePage,
};

const validator = validators[type];
if (!validator) {
  console.error(`Unknown type: ${type}. Expected: ${Object.keys(validators).join(" | ")}`);
  process.exit(1);
}

const errors = validator(parsed);

if (errors.length === 0) {
  console.log(`✓ Valid ${type} payload`);
  // Output the validated JSON for piping
  console.log(JSON.stringify(parsed));
} else {
  console.error(`✗ Invalid ${type} payload:`);
  for (const err of errors) {
    console.error(`  ${err.field}: ${err.message}`);
  }
  process.exit(1);
}
