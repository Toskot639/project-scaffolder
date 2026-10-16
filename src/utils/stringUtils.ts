/**
 * Converts any string to PascalCase.
 * e.g. "my-button", "my button", "myButton" → "MyButton"
 */
export function toPascalCase(input: string): string {
  return input
    .trim()
    .replace(/[-_\s]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^(.)/, (_, char: string) => char.toUpperCase());
}

/**
 * Validates that a component name is non-empty and contains only
 * letters, digits, hyphens, and underscores.
 */
export function validateComponentName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return "Component name cannot be empty.";
  }
  if (!/^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(name.trim())) {
    return "Component name must start with a letter and contain only letters, numbers, hyphens, or underscores.";
  }
  return null; // null = valid
}

/**
 * Validates a project/folder name.
 */
export function validateFolderName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return "Name cannot be empty.";
  }
  if (/[<>:"/\\|?*]/.test(name)) {
    return "Name contains invalid characters.";
  }
  return null;
}
