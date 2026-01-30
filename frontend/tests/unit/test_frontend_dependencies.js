/**
 * Test that frontend dependencies are properly configured
 */
const fs = require('fs');
const path = require('path');

describe('Frontend Dependencies Test', () => {
  test('package.json exists and has required dependencies', () => {
    const packageJsonPath = path.join(__dirname, '../../../frontend/package.json');
    expect(fs.existsSync(packageJsonPath)).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    expect(packageJson).toHaveProperty('dependencies');
    expect(packageJson.dependencies).toHaveProperty('next');
    expect(packageJson.dependencies).toHaveProperty('react');
    expect(packageJson.dependencies).toHaveProperty('react-dom');
    expect(packageJson.devDependencies).toHaveProperty('@types/react');
    expect(packageJson.devDependencies).toHaveProperty('@types/react-dom');
    expect(packageJson.devDependencies).toHaveProperty('typescript');
    expect(packageJson.dependencies).toHaveProperty('@better-auth/react');
    expect(packageJson.dependencies).toHaveProperty('@better-auth/jwt');
  });

  test('next.config.ts exists', () => {
    const configPath = path.join(__dirname, '../../../frontend/next.config.ts');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  test('tsconfig.json exists', () => {
    const configPath = path.join(__dirname, '../../../frontend/tsconfig.json');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  test('Tailwind CSS is configured', () => {
    const postcssConfigPath = path.join(__dirname, '../../../frontend/postcss.config.mjs');
    expect(fs.existsSync(postcssConfigPath)).toBe(true);

    const postcssConfig = fs.readFileSync(postcssConfigPath, 'utf8');
    expect(postcssConfig).toContain('tailwindcss');
  });

  test('ESLint is configured', () => {
    const eslintConfigPath = path.join(__dirname, '../../../frontend/eslint.config.mjs');
    expect(fs.existsSync(eslintConfigPath)).toBe(true);
  });

  test('Prettier is configured', () => {
    const prettierConfigPath = path.join(__dirname, '../../../frontend/.prettierrc');
    expect(fs.existsSync(prettierConfigPath)).toBe(true);
  });
});

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  // Mock jest functions for direct execution
  const tests = [];
  const mockTest = (name, fn) => tests.push({ name, fn });
  const mockExpect = (actual) => ({
    toBe: (expected) => actual === expected,
    toHaveProperty: (prop) => actual.hasOwnProperty(prop)
  });

  console.log('Running frontend dependency tests...');

  // Run the tests
  try {
    test('package.json exists and has required dependencies', () => {
      const packageJsonPath = path.join(__dirname, '../../../frontend/package.json');
      const exists = fs.existsSync(packageJsonPath);
      console.log(`✓ package.json exists: ${exists}`);
      expect(exists).toBe(true);

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const hasDeps = packageJson.dependencies && packageJson.devDependencies;
      console.log(`✓ package.json has dependencies: ${hasDeps}`);
      expect(hasDeps).toBe(true);
    });

    test('next.config.ts exists', () => {
      const configPath = path.join(__dirname, '../../../frontend/next.config.ts');
      const exists = fs.existsSync(configPath);
      console.log(`✓ next.config.ts exists: ${exists}`);
      expect(exists).toBe(true);
    });

    test('tsconfig.json exists', () => {
      const configPath = path.join(__dirname, '../../../frontend/tsconfig.json');
      const exists = fs.existsSync(configPath);
      console.log(`✓ tsconfig.json exists: ${exists}`);
      expect(exists).toBe(true);
    });

    test('Tailwind CSS is configured', () => {
      const postcssConfigPath = path.join(__dirname, '../../../frontend/postcss.config.mjs');
      const exists = fs.existsSync(postcssConfigPath);
      console.log(`✓ postcss.config.mjs exists: ${exists}`);
      expect(exists).toBe(true);

      const postcssConfig = fs.readFileSync(postcssConfigPath, 'utf8');
      const hasTailwind = postcssConfig.includes('tailwindcss');
      console.log(`✓ Tailwind CSS configured: ${hasTailwind}`);
      expect(hasTailwind).toBe(true);
    });

    console.log('All frontend dependency tests passed!');
  } catch (error) {
    console.error('Frontend dependency test failed:', error.message);
    process.exit(1);
  }
}