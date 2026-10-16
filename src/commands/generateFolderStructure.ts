import * as path from "path";
import * as vscode from "vscode";
import {
  PROJECT_TEMPLATES,
  TEMPLATE_LABELS,
} from "../templates/folderStructures";
import {
  ensureDir,
  pathExists,
  resolveTargetFolder,
  writeFile,
} from "../utils/fileSystem";

/**
 * Handler: "Generate Folder Structure"
 *
 * Flow:
 *  1. Resolve right-clicked folder (or workspace root)
 *  2. Show QuickPick: project type selection
 *  3. Show InputBox: optional subfolder name
 *  4. Generate folders + seed files with a progress notification
 */
export async function generateFolderStructureHandler(
  contextUri: vscode.Uri | undefined
): Promise<void> {
  // ── Step 1: Resolve target directory ──────────────────────────────────────
  const targetDir = resolveTargetFolder(contextUri);
  if (!targetDir) {
    vscode.window.showErrorMessage(
      "Project Scaffolder: Please open a workspace folder first."
    );
    return;
  }

  // ── Step 2: Pick project type ──────────────────────────────────────────────
  const quickPickItems: vscode.QuickPickItem[] = TEMPLATE_LABELS.map((t) => ({
    label: t.label,
    description: t.description,
    detail: `$(folder) Generates the standard folder structure for a ${t.description}`,
  }));

  const picked = await vscode.window.showQuickPick(quickPickItems, {
    placeHolder: "Select the project type to scaffold",
    title: "📁 Generate Folder Structure",
    matchOnDescription: true,
  });

  if (!picked) {
    return; // Cancelled
  }

  const templateKey = TEMPLATE_LABELS.find((t) => t.label === picked.label)?.value;
  if (!templateKey || !PROJECT_TEMPLATES[templateKey]) {
    vscode.window.showErrorMessage("Project Scaffolder: Unknown template selected.");
    return;
  }

  const template = PROJECT_TEMPLATES[templateKey];

  // ── Step 3: Optional subfolder name ───────────────────────────────────────
  const subfolderName = await vscode.window.showInputBox({
    prompt: 'Enter a project folder name (leave empty to scaffold in the selected folder)',
    placeHolder: "e.g. my-app (leave blank to use current folder)",
    title: `📁 ${template.label} — Folder Name`,
  });

  if (subfolderName === undefined) {
    return; // Cancelled (Escape pressed)
  }

  const baseDir = subfolderName.trim()
    ? path.join(targetDir, subfolderName.trim())
    : targetDir;

  // ── Step 4: Collision check ────────────────────────────────────────────────
  if (subfolderName.trim() && pathExists(baseDir)) {
    const choice = await vscode.window.showWarningMessage(
      `Folder "${subfolderName}" already exists. Continue scaffolding inside it?`,
      { modal: true },
      "Continue",
      "Cancel"
    );
    if (choice !== "Continue") {
      return;
    }
  }

  // ── Step 5: Scaffold with progress ────────────────────────────────────────
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Scaffolding ${template.label}...`,
      cancellable: false,
    },
    async (progress) => {
      try {
        await ensureDir(baseDir);

        // Create folders
        const totalFolders = template.folders.length;
        for (let i = 0; i < totalFolders; i++) {
          const folderPath = path.join(baseDir, template.folders[i]);
          await ensureDir(folderPath);
          progress.report({
            message: `Creating folder ${template.folders[i]}`,
            increment: (0.5 / totalFolders) * 100,
          });
        }

        // Create files
        const totalFiles = template.files.length;
        for (let i = 0; i < totalFiles; i++) {
          const { path: relativePath, content } = template.files[i];
          const filePath = path.join(baseDir, relativePath);
          await writeFile(filePath, content, false).catch(() => {
            // Skip files that already exist (non-destructive)
          });
          progress.report({
            message: `Writing ${path.basename(relativePath)}`,
            increment: (0.5 / totalFiles) * 100,
          });
        }

        // Show summary
        const summary = [
          `✅ **${template.label}** scaffolded successfully!`,
          `📁 ${template.folders.length} folders created`,
          `📄 ${template.files.length} seed files created`,
        ].join("\n");

        const openAction = "Open Folder in Explorer";
        const result = await vscode.window.showInformationMessage(
          `✅ ${template.label} structure created! (${template.folders.length} folders, ${template.files.length} files)`,
          openAction
        );

        if (result === openAction) {
          await vscode.commands.executeCommand(
            "revealFileInOS",
            vscode.Uri.file(baseDir)
          );
        }

        // Reveal in Explorer
        await vscode.commands.executeCommand(
          "workbench.files.action.refreshFilesExplorer"
        );

        // Optional: show a summary output panel
        const outputChannel = vscode.window.createOutputChannel(
          "Project Scaffolder"
        );
        outputChannel.appendLine(summary);
        outputChannel.appendLine(`\nLocation: ${baseDir}`);
        outputChannel.appendLine("\nFolders created:");
        template.folders.forEach((f) => outputChannel.appendLine(`  ✓ ${f}`));
        outputChannel.appendLine("\nFiles created:");
        template.files.forEach((f) => outputChannel.appendLine(`  ✓ ${f.path}`));
        outputChannel.show(true);
      } catch (err) {
        vscode.window.showErrorMessage(
          `Project Scaffolder: Failed to generate structure — ${(err as Error).message}`
        );
      }
    }
  );
}
