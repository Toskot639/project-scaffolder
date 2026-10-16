import * as vscode from "vscode";
import {
  createReactComponentHandler,
  generateComponentHandler,
} from "./commands/generateComponent";
import { generateFolderStructureHandler } from "./commands/generateFolderStructure";

/**
 * Called when VS Code activates the extension.
 * Registers all commands contributed in package.json.
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log("✅ Project Scaffolder extension is now active!");

  // ── Command 1: Generate Folder Structure ──────────────────────────────────
  const generateFolderStructureCmd = vscode.commands.registerCommand(
    "projectScaffolder.generateFolderStructure",
    async (contextUri: vscode.Uri | undefined) => {
      await generateFolderStructureHandler(contextUri);
    }
  );
  // ── Command 2: Generate Component (full options) ──────────────────────────
  const generateComponentCmd = vscode.commands.registerCommand(
    "projectScaffolder.generateComponent",
    async (contextUri: vscode.Uri | undefined) => {
      await generateComponentHandler(contextUri);
    }
  );

  // ── Command 3: Create React Component (streamlined) ───────────────────────
  const createReactComponentCmd = vscode.commands.registerCommand(
    "projectScaffolder.createReactComponent",
    async (contextUri: vscode.Uri | undefined) => {
      await createReactComponentHandler(contextUri);
    }
  );

  // Register all disposables
  context.subscriptions.push(
    generateFolderStructureCmd,
    generateComponentCmd,
    createReactComponentCmd
  );
}

/**
 * Called when the extension is deactivated.
 * VS Code auto-disposes all subscriptions; nothing extra needed here.
 */
export function deactivate(): void {
  console.log("Project Scaffolder extension deactivated.");
}
