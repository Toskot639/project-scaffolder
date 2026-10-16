# Project Scaffolder

> ⚡ Generate project boilerplate and React components with a single right-click.

A powerful VS Code extension that automates the creation of project folder structures and React components directly from the Explorer context menu — no CLI, no copy-pasting.

---

## Features

### 📁 Generate Folder Structure
Right-click any folder → **Generate Folder Structure**

Choose from four project templates:
| Template | Includes |
|---|---|
| ⚛️ React App | `src/components`, `src/hooks`, `src/context`, `src/utils`, `src/services`, `src/types`, seed files |
| ▲ Next.js App | `app/`, `components/`, `lib/`, `hooks/`, `utils/`, `types/`, `layout.tsx`, `page.tsx` |
| 🚀 Node/Express API | `src/controllers`, `src/routes`, `src/middleware`, `src/models`, `src/services`, with middleware boilerplate |
| 💚 Vue 3 App | `src/components`, `src/composables`, `src/stores`, `src/views`, `src/router` |

After selecting a template, optionally enter a **subfolder name** to scope the generated structure.

---

### 🧩 Generate Component
Right-click any folder → **Generate Component**

1. Enter a component name (auto-converted to PascalCase)
2. Choose options:
   - ✅ Include Test file (React Testing Library)
   - 📖 Include Storybook story
   - 📁 Create subfolder (default: yes)

**Output:**
```
Button/
  Button.tsx          ← Functional component with TypeScript props
  Button.module.css   ← CSS Module with container class
  index.ts            ← Barrel export
  Button.test.tsx     ← RTL test suite (optional)
  Button.stories.tsx  ← Storybook story (optional)
```

---

### ⚛️ Create React Component (Streamlined)
Right-click any folder → **Create React Component**

Fast path — no options dialog. Creates:
```
ComponentName/
  ComponentName.tsx
  index.ts
  ComponentName.test.tsx
```

---

## Usage

1. Open a project in VS Code
2. Right-click any folder in the **Explorer** sidebar
3. Select one of:
   - `Generate Folder Structure`
   - `Generate Component`
   - `Create React Component`
4. Follow the prompts

---

## Local Development & Testing

### Prerequisites
- Node.js 18+
- VS Code 1.85+

### Running the Extension (F5 Debug)

```bash
# 1. Clone and install
git clone https://github.com/toskot/project-scaffolder
cd project-scaffolder
npm install

# 2. Compile TypeScript
npm run compile

# 3. Open in VS Code
code .
```

Then press **F5** — this opens an **Extension Development Host** window with the extension loaded.

In the new window:
- Open any folder (`File → Open Folder`)
- Right-click a folder in the Explorer
- You'll see all three commands under the context menu

### Watch Mode (live recompile)

```bash
npm run watch
```

Press **F5** to launch, make changes to `.ts` files, and press **Ctrl+Shift+F5** to reload the Extension Host.

---

## Publishing to VS Code Marketplace

### Step 1: Create a Publisher Account
1. Go to [marketplace.visualstudio.com](https://marketplace.visualstudio.com/manage)
2. Sign in with your Microsoft account
3. Create a new **publisher** (e.g., `your-publisher-id`)

### Step 2: Create a Personal Access Token (PAT)
1. Go to [dev.azure.com](https://dev.azure.com)
2. Click your avatar → **Personal Access Tokens**
3. Create a new token with scope: **Marketplace → Manage**
4. Copy the token

### Step 3: Update `package.json`
```json
{
  "publisher": "your-publisher-id"
}
```

### Step 4: Login with vsce
```bash
npx vsce login toskot
# Paste your PAT when prompted
```

### Step 5: Package & Publish
```bash
# Create .vsix package (for local install / preview)
npm run package

# Publish directly to the Marketplace
npm run publish

# Or publish with a version bump
npx vsce publish minor
```

### Step 6: Install from .vsix locally (optional preview)
```bash
# In VS Code
# Extensions panel → ⋯ menu → "Install from VSIX..."
# Select: project-scaffolder-1.0.0.vsix
```

---

## File Structure

```
project-scaffolder/
├── src/
│   ├── extension.ts                  ← Entry point, registers commands
│   ├── commands/
│   │   ├── generateFolderStructure.ts ← "Generate Folder Structure" handler
│   │   └── generateComponent.ts       ← "Generate Component" handler
│   ├── templates/
│   │   ├── folderStructures.ts        ← Project type definitions + seed files
│   │   └── componentTemplates.ts      ← TSX / CSS / test / story generators
│   └── utils/
│       ├── fileSystem.ts              ← Safe fs operations + collision handling
│       └── stringUtils.ts             ← PascalCase conversion + validation
├── images/
│   └── icon.png
├── .vscode/
│   ├── launch.json                   ← F5 debug config
│   └── tasks.json                    ← TypeScript watch task
├── package.json                      ← Extension manifest + contributes
├── tsconfig.json
└── CHANGELOG.md
```

---

## Requirements

No runtime dependencies — uses only Node.js built-in `fs` and the VS Code API.

---

## License

MIT
