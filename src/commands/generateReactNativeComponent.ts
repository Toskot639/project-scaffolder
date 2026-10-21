import * as path from "path";
import * as vscode from "vscode";
import {
  generateIndexFile,
  generateReactNativeComponentFile,
  generateReactNativeScreenFile,
  generateReactNativeStylesFile,
  generateReactNativeTestFile,
  generateReactNativeTypesFile,
} from "../templates/componentTemplates";
import {
  FileExistsError,
  ensureDir,
  pathExists,
  resolveTargetFolder,
  writeFile,
} from "../utils/fileSystem";
import { toPascalCase, validateComponentName } from "../utils/stringUtils";

interface ReactNativeComponentOptions {
  separateStyles: boolean;
  includeTest: boolean;
  separateTypes: boolean;
  createSubfolder: boolean;
}

/** Prompts user for React Native component options via QuickPick checkboxes */
async function promptReactNativeComponentOptions(): Promise<
  ReactNativeComponentOptions | undefined
> {
  const items: vscode.QuickPickItem[] = [
    {
      label: "$(paintcan) Separate StyleSheet File (.styles.ts)",
      description: "Creates a dedicated StyleSheet file alongside the component",
      picked: true,
    },
    {
      label: "$(beaker) Include Test File (@testing-library/react-native)",
      description: "Generates a .test.tsx with React Native Testing Library tests",
      picked: true,
    },
    {
      label: "$(symbol-variable) Separate Types File (.types.ts)",
      description: "Creates a dedicated props & types file",
      picked: false,
    },
    {
      label: "$(folder) Create Subfolder",
      description: "Wrap files inside a folder named after the component",
      picked: true,
    },
  ];

  const picked = await vscode.window.showQuickPick(items, {
    canPickMany: true,
    placeHolder: "Select React Native component options (Space to toggle, Enter to confirm)",
    title: "📱 React Native Component Options",
  });

  if (picked === undefined) {
    return undefined; // Cancelled
  }

  return {
    separateStyles: picked.some((i) => i.label.includes("StyleSheet")),
    includeTest: picked.some((i) => i.label.includes("Test")),
    separateTypes: picked.some((i) => i.label.includes("Types")),
    createSubfolder: picked.some((i) => i.label.includes("Subfolder")),
  };
}

/**
 * Handler: "Generate React Native Component" (interactive with options)
 * Command: projectScaffolder.generateReactNativeComponent
 */
export async function generateReactNativeComponentHandler(
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
    prompt: "Enter the React Native component name",
    placeHolder: "e.g. Card, UserAvatar, CustomButton",
    title: "📱 Generate React Native Component",
    validateInput: (val) => validateComponentName(val) ?? undefined,
  });

  if (rawName === undefined) {
    return; // Cancelled
  }

  const componentName = toPascalCase(rawName);

  const options = await promptReactNativeComponentOptions();
  if (options === undefined) {
    return; // Cancelled
  }

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

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Generating React Native component "${componentName}"...`,
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
            content: generateReactNativeComponentFile(
              componentName,
              options.separateStyles,
              options.separateTypes
            ),
          },
          {
            file: path.join(baseDir, "index.ts"),
            content: generateIndexFile(componentName),
          },
        ];

        if (options.separateStyles) {
          filesToCreate.push({
            file: path.join(baseDir, `${componentName}.styles.ts`),
            content: generateReactNativeStylesFile(componentName),
          });
        }

        if (options.separateTypes) {
          filesToCreate.push({
            file: path.join(baseDir, `${componentName}.types.ts`),
            content: generateReactNativeTypesFile(componentName),
          });
        }

        if (options.includeTest) {
          filesToCreate.push({
            file: path.join(baseDir, `${componentName}.test.tsx`),
            content: generateReactNativeTestFile(componentName),
          });
        }

        const total = filesToCreate.length;
        for (let i = 0; i < total; i++) {
          const { file, content } = filesToCreate[i];
          await writeFile(file, content, true);
          progress.report({
            message: `Creating ${path.basename(file)}...`,
            increment: (1 / total) * 100,
          });
        }

        const mainDoc = await vscode.workspace.openTextDocument(
          filesToCreate[0].file
        );
        await vscode.window.showTextDocument(mainDoc);

        vscode.window.showInformationMessage(
          `✅ React Native component "${componentName}" created with ${total} file(s)!`
        );
      } catch (err) {
        if (err instanceof FileExistsError) {
          vscode.window.showErrorMessage(
            `File already exists: ${path.basename(err.filePath)}`
          );
        } else {
          vscode.window.showErrorMessage(
            `Failed to generate React Native component: ${(err as Error).message}`
          );
        }
      }
    }
  );
}

/**
 * Handler: "Create React Native Component" (streamlined 1-step)
 * Command: projectScaffolder.createReactNativeComponent
 * Creates: ComponentName/ComponentName.tsx, ComponentName.styles.ts, index.ts, ComponentName.test.tsx
 */
export async function createReactNativeComponentHandler(
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
    prompt: "Enter the React Native component name",
    placeHolder: "e.g. Card, Header, CustomButton",
    title: "📱 Create React Native Component",
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
        content: generateReactNativeComponentFile(componentName, true, false),
      },
      {
        file: path.join(componentDir, `${componentName}.styles.ts`),
        content: generateReactNativeStylesFile(componentName),
      },
      {
        file: path.join(componentDir, "index.ts"),
        content: generateIndexFile(componentName),
      },
      {
        file: path.join(componentDir, `${componentName}.test.tsx`),
        content: generateReactNativeTestFile(componentName),
      },
    ];

    for (const { file, content } of files) {
      await writeFile(file, content);
    }

    const mainDoc = await vscode.workspace.openTextDocument(files[0].file);
    await vscode.window.showTextDocument(mainDoc);

    vscode.window.showInformationMessage(
      `✅ React Native component "${componentName}" created successfully!`
    );
  } catch (err) {
    vscode.window.showErrorMessage(
      `Failed to create React Native component: ${(err as Error).message}`
    );
  }
}

/**
 * Handler: "Create React Native Screen" (streamlined screen boilerplate)
 * Command: projectScaffolder.createReactNativeScreen
 * Creates: ScreenName/ScreenName.tsx, ScreenName.styles.ts, index.ts
 */
export async function createReactNativeScreenHandler(
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
    prompt: "Enter the React Native screen name",
    placeHolder: "e.g. HomeScreen, ProfileScreen, SettingsScreen",
    title: "📱 Create React Native Screen",
    validateInput: (val) => validateComponentName(val) ?? undefined,
  });

  if (rawName === undefined) {
    return;
  }

  const screenName = toPascalCase(rawName);
  const screenDir = path.join(targetDir, screenName);

  if (pathExists(screenDir)) {
    vscode.window.showErrorMessage(
      `Screen folder "${screenName}" already exists at this location.`
    );
    return;
  }

  try {
    await ensureDir(screenDir);

    const files = [
      {
        file: path.join(screenDir, `${screenName}.tsx`),
        content: generateReactNativeScreenFile(screenName, true),
      },
      {
        file: path.join(screenDir, `${screenName}.styles.ts`),
        content: generateReactNativeStylesFile(screenName),
      },
      {
        file: path.join(screenDir, "index.ts"),
        content: generateIndexFile(screenName),
      },
    ];

    for (const { file, content } of files) {
      await writeFile(file, content);
    }

    const mainDoc = await vscode.workspace.openTextDocument(files[0].file);
    await vscode.window.showTextDocument(mainDoc);

    vscode.window.showInformationMessage(
      `✅ React Native screen "${screenName}" created successfully!`
    );
  } catch (err) {
    vscode.window.showErrorMessage(
      `Failed to create React Native screen: ${(err as Error).message}`
    );
  }
}
