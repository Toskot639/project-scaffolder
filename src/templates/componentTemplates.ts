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
