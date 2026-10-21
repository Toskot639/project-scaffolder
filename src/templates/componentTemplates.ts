// ─── React Component Templates ─────────────────────────────────────────────

/**
 * Generates the content for a .tsx React functional component file.
 */
export function generateComponentFile(componentName: string): string {
  return `import React from 'react';
import styles from './${componentName}.module.css';

interface ${componentName}Props {
  children?: React.ReactNode;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  children,
  className,
}) => {
  return (
    <div className={\`\${styles.container}\${className ? \` \${className}\` : ''}\`}>
      {children}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generates the content for a CSS Module file.
 */
export function generateCssModuleFile(componentName: string): string {
  return `.container {
  /* ${componentName} styles */
  display: flex;
  flex-direction: column;
}
`;
}

/**
 * Generates the content for a barrel index.ts file.
 */
export function generateIndexFile(componentName: string): string {
  return `export { default } from './${componentName}';
export type { } from './${componentName}';
`;
}

/**
 * Generates a React Testing Library test file.
 */
export function generateTestFile(componentName: string): string {
  return `import React from 'react';
import { render, screen } from '@testing-library/react';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
  });

  it('renders children correctly', () => {
    render(<${componentName}>Test Content</${componentName}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <${componentName} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
`;
}

/**
 * Generates a Storybook story file for the component.
 */
export function generateStoryFile(componentName: string): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import ${componentName} from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '${componentName} content',
  },
};
`;
}

// ─── React Native Component Templates ─────────────────────────────────────────

/**
 * Generates the content for a React Native .tsx component file.
 */
export function generateReactNativeComponentFile(
  componentName: string,
  hasSeparateStyles = false,
  hasSeparateTypes = false
): string {
  const typesImport = hasSeparateTypes
    ? `import type { ${componentName}Props } from './${componentName}.types';\n`
    : "";

  const inlineTypes = hasSeparateTypes
    ? ""
    : `export interface ${componentName}Props {
  children?: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
`;

  const stylesImport = hasSeparateStyles
    ? `import { styles } from './${componentName}.styles';\n`
    : "";

  const inlineStyles = hasSeparateStyles
    ? ""
    : `\nconst styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
`;

  const reactNativeImports = ["View", "Text"];
  if (!hasSeparateStyles) {
    reactNativeImports.push("StyleSheet");
  }
  if (!hasSeparateTypes) {
    reactNativeImports.push("StyleProp", "ViewStyle");
  }

  return `import React from 'react';
import { ${reactNativeImports.join(", ")} } from 'react-native';
${typesImport}${stylesImport}
${inlineTypes}
export const ${componentName}: React.FC<${componentName}Props> = ({
  children,
  title,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
};

export default ${componentName};
${inlineStyles}`;
}

/**
 * Generates a separate StyleSheet file for React Native.
 */
export function generateReactNativeStylesFile(componentName: string): string {
  return `import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
`;
}

/**
 * Generates a separate TypeScript types file for React Native component.
 */
export function generateReactNativeTypesFile(componentName: string): string {
  return `import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface ${componentName}Props {
  children?: ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
`;
}

/**
 * Generates a React Native Testing Library test file.
 */
export function generateReactNativeTestFile(componentName: string): string {
  return `import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  it('renders correctly with default props', () => {
    render(<${componentName} title="${componentName}" />);
    expect(screen.getByText('${componentName}')).toBeTruthy();
  });

  it('renders children correctly', () => {
    render(
      <${componentName}>
        {/* Child test content */}
      </${componentName}>
    );
  });
});
`;
}

/**
 * Generates a React Native Screen component file.
 */
export function generateReactNativeScreenFile(
  screenName: string,
  hasSeparateStyles = false
): string {
  const stylesImport = hasSeparateStyles
    ? `import { styles } from './${screenName}.styles';\n`
    : "";

  const inlineStyles = hasSeparateStyles
    ? ""
    : `\nconst styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1c1c1e',
  },
});
`;

  return `import React from 'react';
import { ${hasSeparateStyles ? "" : "StyleSheet, "}Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
${stylesImport}
export interface ${screenName}Props {
  navigation?: any;
  route?: any;
}

export const ${screenName}: React.FC<${screenName}Props> = ({
  navigation,
  route,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>${screenName}</Text>
      </View>
    </SafeAreaView>
  );
};

export default ${screenName};
${inlineStyles}`;
}
