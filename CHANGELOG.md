# Changelog

All notable changes to **Project Scaffolder** will be documented here.

## [1.0.0] – 2026-10-16

### Added
- **Generate Folder Structure** context menu command
  - Supports React App, Next.js App, Node/Express API, Vue 3 App
  - Scaffolds folders and seed files with content
  - Optional subfolder name prompt
  - Output channel summary after scaffolding
- **Generate Component** context menu command
  - PascalCase sanitization of input
  - Optional test file (React Testing Library)
  - Optional Storybook story file
  - Option to create subfolder or inline files
- **Create React Component** context menu command (streamlined)
  - Creates `ComponentName.tsx`, `index.ts`, `ComponentName.test.tsx`
- **React Native Scaffolding Support**
  - Added **📱 React Native App (Expo / TypeScript)** project template with navigation, screens, theme, and hooks
  - Added **Generate React Native Component** context menu command (with optional StyleSheet, Testing Library, and Types files)
  - Added **Create React Native Component** streamlined context menu command
  - Added **Create React Native Screen** context menu command (with SafeAreaView and navigation props)
- Proper error handling (collision detection, empty workspace guard)
- Progress notifications during file creation
