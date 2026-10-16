import * as path from "path";
import * as vscode from "vscode";
import {
  generateComponentFile,
  generateCssModuleFile,
  generateIndexFile,
  generateStoryFile,
  generateTestFile,
} from "../templates/componentTemplates";
import {
  FileExistsError,
  ensureDir,
  pathExists,
  resolveTargetFolder,
  writeFile,
} from "../utils/fileSystem";
import { toPascalCase, validateComponentName } from "../utils/stringUtils";

interface ComponentOptions {
  includeTest: boolean;
  includeStory: boolean;
  createSubfolder: boolean;
}

/** Prompts user for component options via QuickPick checkboxes */
async function promptComponentOptions(): Promise<ComponentOptions | undefined> {
  const items: vscode.QuickPickItem[] = [
    {
      label: "$(beaker) Include Test File",
      description: "Generates a .test.tsx with React Testing Library boilerplate",
      picked: true,
    },
    {
      label: "$(book) Include Storybook Story",
      description: "Generates a .stories.tsx file",
      picked: false,
    },
    {
      label: "$(folder) Create subfolder",
      description: "Wrap files inside a folder named after the component",
      picked: true,
    },
  ];

  const picked = await vscode.window.showQuickPick(items, {
    canPickMany: true,
    placeHolder: "Select component options (Space to toggle, Enter to confirm)",
    title: "⚙️  Component Options",
  });

  if (picked === undefined) {
    return undefined; // User cancelled
  }

  return {
    includeTest: picked.some((i) => i.label.includes("Test")),
    includeStory: picked.some((i) => i.label.includes("Storybook")),
    createSubfolder: picked.some((i) => i.label.includes("subfolder")),
  };
}

/**
 * Handler: "Generate Component"
 * Asks for component name + options, then scaffolds:
 *   ComponentName/
 *     ComponentName.tsx
 *     ComponentName.module.css
 *     index.ts
 *     ComponentName.test.tsx  (optional)
 *     ComponentName.stories.tsx (optional)
 */
export async function generateComponentHandler(
  contextUri: vscode.Uri | undefined
): Promise<void> {
  // 1. Resolve target folder
  const targetDir = resolveTargetFolder(contextUri);
  if (!targetDir) {
    vscode.window.showErrorMessage(
      "Project Scaffolder: Please open a workspace folder first."
    );
    return;
  }

  // 2. Ask for component name
  const rawName = await vscode.window.showInputBox({
    prompt: "Enter the component name",
    placeHolder: "e.g. Button, HeroSection, UserCard",
    title: "🧩 Generate Component",
    validateInput: (val) => validateComponentName(val) ?? undefined,
  });

  if (rawName === undefined) {
    return; // Cancelled
  }

  const componentName = toPascalCase(rawName);

  // 3. Ask for options
  const options = await promptComponentOptions();
  if (options === undefined) {
    return; // Cancelled
  }

  // 4. Build file list
  const baseDir = options.createSubfolder
    ? path.join(targetDir, componentName)
    : targetDir;

  if (options.createSubfolder && pathExists(baseDir)) {
    const overwrite = await vscode.window.showWarningMessage(
      `Folder "${componentName}" already exists. Overwrite files inside?`,
      { modal: true },
      "Overwrite",
      "Cancel"
    );
    if (overwrite !== "Overwrite") {
      return;
    }
  }

  // 5. Scaffold files
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Generating component "${componentName}"...`,
      cancellable: false,
    },
    async (progress) => {
      try {
        if (options.createSubfolder) {
          await ensureDir(baseDir);
        }

        const filesToCreate: Array<{ file: string; content: string }> = [
          {
            file: path.join(baseDir, `${componentName}.tsx`),
            content: generateComponentFile(componentName),
          },
          {
            file: path.join(baseDir, `${componentName}.module.css`),
            content: generateCssModuleFile(componentName),
          },
          {
            file: path.join(baseDir, "index.ts"),
            content: generateIndexFile(componentName),
          },
        ];

        if (options.includeTest) {
          filesToCreate.push({
            file: path.join(baseDir, `${componentName}.test.tsx`),
            content: generateTestFile(componentName),
          });
        }

        if (options.includeStory) {
          filesToCreate.push({
            file: path.join(baseDir, `${componentName}.stories.tsx`),
            content: generateStoryFile(componentName),
          });
        }

        const total = filesToCreate.length;
        for (let i = 0; i < total; i++) {
          const { file, content } = filesToCreate[i];
          await writeFile(file, content, true /* allow overwrite */);
          progress.report({
            message: `Creating ${path.basename(file)}...`,
            increment: (1 / total) * 100,
          });
        }

        // Open the main .tsx file in the editor
        const mainDoc = await vscode.workspace.openTextDocument(
          filesToCreate[0].file
        );
        await vscode.window.showTextDocument(mainDoc);

        vscode.window.showInformationMessage(
          `✅ Component "${componentName}" created with ${total} file(s)!`
        );
      } catch (err) {
        if (err instanceof FileExistsError) {
          vscode.window.showErrorMessage(
            `File already exists: ${path.basename(err.filePath)}`
          );
        } else {
          vscode.window.showErrorMessage(
            `Failed to generate component: ${(err as Error).message}`
          );
        }
      }
    }
  );
}

/**
 * Handler: "Create React Component" (simpler, single-command version)
 * Used by the "projectScaffolder.createReactComponent" command.
 * Creates: ComponentName.tsx, index.ts, ComponentName.test.tsx
 */
export async function createReactComponentHandler(
  contextUri: vscode.Uri | undefined
): Promise<void> {
  const targetDir = resolveTargetFolder(contextUri);
  if (!targetDir) {
    vscode.window.showErrorMessage(
      "Project Scaffolder: Please open a workspace folder first."
    );
    return;
  }

  const rawName = await vscode.window.showInputBox({
    prompt: "Enter the React component name",
    placeHolder: "e.g. Button, Header, UserProfile",
    title: "⚛️  Create React Component",
    validateInput: (val) => validateComponentName(val) ?? undefined,
  });

  if (rawName === undefined) {
    return;
  }

  const componentName = toPascalCase(rawName);
  const componentDir = path.join(targetDir, componentName);

  if (pathExists(componentDir)) {
    vscode.window.showErrorMessage(
      `Component folder "${componentName}" already exists at this location.`
    );
    return;
  }

  try {
    await ensureDir(componentDir);

    const files = [
      {
        file: path.join(componentDir, `${componentName}.tsx`),
        content: generateComponentFile(componentName),
      },
      {
        file: path.join(componentDir, "index.ts"),
        content: generateIndexFile(componentName),
      },
      {
        file: path.join(componentDir, `${componentName}.test.tsx`),
        content: generateTestFile(componentName),
      },
    ];

    for (const { file, content } of files) {
      await writeFile(file, content);
    }

    const mainDoc = await vscode.workspace.openTextDocument(files[0].file);
    await vscode.window.showTextDocument(mainDoc);

    vscode.window.showInformationMessage(
      `✅ React component "${componentName}" created successfully!`
    );
  } catch (err) {
    vscode.window.showErrorMessage(
      `Failed to create component: ${(err as Error).message}`
    );
  }
}
