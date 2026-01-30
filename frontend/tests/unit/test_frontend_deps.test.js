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
    expect(packageJson.dependencies).toHaveProperty('next');
    expect(packageJson.dependencies).toHaveProperty('react');
    expect(packageJson.dependencies).toHaveProperty('react-dom');
    expect(packageJson.dependencies).toHaveProperty('axios');
    expect(packageJson.dependencies).toHaveProperty('better-auth');
  });

  test('next.config.js exists', () => {
    const configPath = path.join(__dirname, '../../../frontend/next.config.js');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  test('tsconfig.json exists', () => {
    const configPath = path.join(__dirname, '../../../frontend/tsconfig.json');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  test('Tailwind CSS is configured', () => {
    const postcssConfigPath = path.join(__dirname, '../../../frontend/postcss.config.js');
    expect(fs.existsSync(postcssConfigPath)).toBe(true);

    const postcssConfig = fs.readFileSync(postcssConfigPath, 'utf8');
    expect(postcssConfig).toContain('tailwindcss');
  });

  test('ESLint is configured', () => {
    const flatConfigPath = path.join(__dirname, '../../../frontend/eslint.config.mjs');
    const legacyConfigPath = path.join(__dirname, '../../../frontend/.eslintrc.json');
    const hasConfig = fs.existsSync(flatConfigPath) || fs.existsSync(legacyConfigPath);
    expect(hasConfig).toBe(true);
  });

  test('Prettier is configured', () => {
    const prettierConfigPath = path.join(__dirname, '../../../frontend/.prettierrc');
    expect(fs.existsSync(prettierConfigPath)).toBe(true);
  });
});