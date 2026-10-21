import * as vscode from "vscode";
import {
  createReactComponentHandler,
  generateComponentHandler,
} from "./commands/generateComponent";
import { generateFolderStructureHandler } from "./commands/generateFolderStructure";
import {
  createReactNativeComponentHandler,
  createReactNativeScreenHandler,
  generateReactNativeComponentHandler,
} from "./commands/generateReactNativeComponent";

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

  // ── Command 2: Generate React Component (full options) ────────────────────
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

  // ── Command 4: Generate React Native Component (with options) ─────────────
  const generateReactNativeComponentCmd = vscode.commands.registerCommand(
    "projectScaffolder.generateReactNativeComponent",
    async (contextUri: vscode.Uri | undefined) => {
      await generateReactNativeComponentHandler(contextUri);
    }
  );

  // ── Command 5: Create React Native Component (streamlined) ────────────────
  const createReactNativeComponentCmd = vscode.commands.registerCommand(
    "projectScaffolder.createReactNativeComponent",
    async (contextUri: vscode.Uri | undefined) => {
      await createReactNativeComponentHandler(contextUri);
    }
  );

  // ── Command 6: Create React Native Screen ─────────────────────────────────
  const createReactNativeScreenCmd = vscode.commands.registerCommand(
    "projectScaffolder.createReactNativeScreen",
    async (contextUri: vscode.Uri | undefined) => {
      await createReactNativeScreenHandler(contextUri);
    }
  );

  // Register all disposables
  context.subscriptions.push(
    generateFolderStructureCmd,
    generateComponentCmd,
    createReactComponentCmd,
    generateReactNativeComponentCmd,
    createReactNativeComponentCmd,
    createReactNativeScreenCmd
  );
}

/**
 * Called when the extension is deactivated.
 * VS Code auto-disposes all subscriptions; nothing extra needed here.
 */
export function deactivate(): void {
  console.log("Project Scaffolder extension deactivated.");
}
