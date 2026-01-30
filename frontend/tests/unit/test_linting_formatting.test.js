/**
 * Test that TypeScript linting and formatting tools are properly configured
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Frontend Linting and Formatting Tools Test', () => {
  test('ESLint is configured and accessible', () => {
    // Check if ESLint config exists
    const flatConfigPath = path.join(__dirname, '../../../frontend/eslint.config.mjs');
    const legacyConfigPath = path.join(__dirname, '../../../frontend/.eslintrc.json');
    const hasConfig = fs.existsSync(flatConfigPath) || fs.existsSync(legacyConfigPath);
    expect(hasConfig).toBe(true);

    // Try to run ESLint version command to ensure it's installed
    try {
      const result = execSync('cd ../../../frontend && npx eslint --version', { encoding: 'utf-8' });
      expect(result).toBeTruthy();
      console.log(`ESLint is available: ${result.trim()}`);
    } catch (error) {
      // If npx command fails, check if it's installed locally
      const packageJsonPath = path.join(__dirname, '../../../frontend/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.devDependencies).toHaveProperty('eslint');
    }
  });

  test('Prettier is configured and accessible', () => {
    // Check if Prettier config exists
    const prettierConfigPath = path.join(__dirname, '../../../frontend/.prettierrc');
    expect(fs.existsSync(prettierConfigPath)).toBe(true);

    // Try to run Prettier version command to ensure it's installed
    try {
      const result = execSync('cd ../../../frontend && npx prettier --version', { encoding: 'utf-8' });
      expect(result).toBeTruthy();
      console.log(`Prettier is available: ${result.trim()}`);
    } catch (error) {
      // If npx command fails, check if it's installed locally
      const packageJsonPath = path.join(__dirname, '../../../frontend/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.devDependencies).toHaveProperty('prettier');
    }
  });

  test('TypeScript is configured', () => {
    // Check if TypeScript is in devDependencies
    const packageJsonPath = path.join(__dirname, '../../../frontend/package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    expect(packageJson.devDependencies).toHaveProperty('typescript');

    // Check if tsconfig.json exists
    const tsConfigPath = path.join(__dirname, '../../../frontend/tsconfig.json');
    expect(fs.existsSync(tsConfigPath)).toBe(true);
  });

  test('ESLint configuration extends Next.js recommendations', () => {
    // Check for flat config file
    const flatConfigPath = path.join(__dirname, '../../../frontend/eslint.config.mjs');
    if (fs.existsSync(flatConfigPath)) {
        const configContent = fs.readFileSync(flatConfigPath, 'utf8');
        // Check if it imports/uses next configs
        // Note: exact string might vary depending on import style, but these are standard
        const hasNextVitals = configContent.includes('eslint-config-next/core-web-vitals') || configContent.includes('next/core-web-vitals');
        const hasNextTs = configContent.includes('eslint-config-next/typescript') || configContent.includes('next/typescript');

        expect(hasNextVitals || hasNextTs).toBe(true);
    } else {
        // Fallback for legacy config
        const eslintrcPath = path.join(__dirname, '../../../frontend/.eslintrc.json');
        if (fs.existsSync(eslintrcPath)) {
            const eslintrc = JSON.parse(fs.readFileSync(eslintrcPath, 'utf8'));
            expect(eslintrc.extends).toContain('next/core-web-vitals');
        } else {
            // Neither exists - fail
            expect(true).toBe(false);
        }
    }
  });

  test('Prettier configuration exists with proper settings', () => {
    const prettierConfigPath = path.join(__dirname, '../../../frontend/.prettierrc');
    const prettierConfig = JSON.parse(fs.readFileSync(prettierConfigPath, 'utf8'));

    // Check for common Prettier settings
    expect(prettierConfig).toHaveProperty('semi');
    expect(prettierConfig).toHaveProperty('trailingComma');
    expect(prettierConfig).toHaveProperty('singleQuote');
    expect(prettierConfig).toHaveProperty('printWidth');
    expect(prettierConfig).toHaveProperty('tabWidth');
  });

  test('Prettier plugin for Tailwind CSS is configured', () => {
    // Check if the prettier plugin for tailwind exists in package.json
    const packageJsonPath = path.join(__dirname, '../../../frontend/package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    expect(packageJson.devDependencies).toHaveProperty('prettier-plugin-tailwindcss');
  });
});