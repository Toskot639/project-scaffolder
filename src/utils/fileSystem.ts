import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

/**
 * Creates a directory recursively. Does nothing if it already exists.
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

/**
 * Writes a file, creating parent directories as needed.
 * Throws if the file already exists (unless force=true).
 */
export async function writeFile(
  filePath: string,
  content: string,
  force = false
): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDir(dir);

  if (!force && fs.existsSync(filePath)) {
    throw new FileExistsError(filePath);
  }

  await fs.promises.writeFile(filePath, content, "utf8");
}

/**
 * Checks whether a path already exists.
 */
export function pathExists(p: string): boolean {
  return fs.existsSync(p);
}

/**
 * Returns the URI for the right-clicked folder, or the workspace root as fallback.
 */
export function resolveTargetFolder(
  contextUri: vscode.Uri | undefined
): string | undefined {
  if (contextUri) {
    const stat = fs.statSync(contextUri.fsPath);
    return stat.isDirectory() ? contextUri.fsPath : path.dirname(contextUri.fsPath);
  }

  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    return folders[0].uri.fsPath;
  }

  return undefined;
}

/**
 * Custom error for pre-existing files/folders.
 */
export class FileExistsError extends Error {
  constructor(public readonly filePath: string) {
    super(`Path already exists: ${filePath}`);
    this.name = "FileExistsError";
  }
}
