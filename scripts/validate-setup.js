#!/usr/bin/env node
/**
 * Validation System - Comprehensive Setup Checker (JavaScript version)
 * Can be run directly without ts-node
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const results = [];
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(color, text) {
  console.log(`${color}${text}${RESET}`);
}

function checkJsonValidity(filePath, name) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes('/*') || content.includes('//')) {
      return {
        check: `JSON Validity: ${name}`,
        status: 'FAIL',
        message: `Invalid JSON - contains JavaScript comments`,
        error: `File: ${filePath}`,
      };
    }
    
    JSON.parse(content);
    return {
      check: `JSON Validity: ${name}`,
      status: 'PASS',
      message: 'Valid JSON',
    };
  } catch (error) {
    return {
      check: `JSON Validity: ${name}`,
      status: 'FAIL',
      message: `Invalid JSON format`,
      error: error.message,
    };
  }
}

function checkFileExists(filePath, name) {
  try {
    if (fs.existsSync(filePath)) {
      return {
        check: `File Exists: ${name}`,
        status: 'PASS',
        message: `Found: ${filePath}`,
      };
    } else {
      return {
        check: `File Exists: ${name}`,
        status: 'FAIL',
        message: `Not found: ${filePath}`,
      };
    }
  } catch (error) {
    return {
      check: `File Exists: ${name}`,
      status: 'FAIL',
      message: `Error checking file`,
      error: error.message,
    };
  }
}

function checkESModuleCompatibility() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);
    
    const isESModule = packageJson.type === 'module';
    const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
    const jestConfigContent = fs.readFileSync(jestConfigPath, 'utf-8');
    
    const usesExportDefault = jestConfigContent.includes('export default');
    const usesCommonJS = jestConfigContent.includes('module.exports');
    
    if (isESModule && usesCommonJS) {
      return {
        check: 'ES Module Compatibility',
        status: 'FAIL',
        message: 'package.json has "type": "module" but jest.config.js uses CommonJS',
        error: 'Jest config must use ES Module syntax (export default)',
      };
    }
    
    if (isESModule && !usesExportDefault) {
      return {
        check: 'ES Module Compatibility',
        status: 'FAIL',
        message: 'jest.config.js must use "export default" syntax',
      };
    }
    
    return {
      check: 'ES Module Compatibility',
      status: 'PASS',
      message: 'jest.config.js and package.json are compatible',
    };
  } catch (error) {
    return {
      check: 'ES Module Compatibility',
      status: 'FAIL',
      message: 'Error checking ES Module compatibility',
      error: error.message,
    };
  }
}

function checkNpmScripts() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);
    
    const testScript = packageJson.scripts?.test;
    
    if (!testScript) {
      return {
        check: 'NPM Scripts',
        status: 'FAIL',
        message: 'No test script defined',
      };
    }
    
    if (testScript === 'jest') {
      return {
        check: 'NPM Scripts',
        status: 'PASS',
        message: `test script is correct: "${testScript}"`,
      };
    } else if (testScript.includes('playwright')) {
      return {
        check: 'NPM Scripts',
        status: 'FAIL',
        message: `test script is wrong: "${testScript}" (should be "jest")`,
      };
    }
    
    return {
      check: 'NPM Scripts',
      status: 'WARN',
      message: `test script is: "${testScript}" (expected jest)`,
    };
  } catch (error) {
    return {
      check: 'NPM Scripts',
      status: 'FAIL',
      message: 'Error checking npm scripts',
      error: error.message,
    };
  }
}

function checkTypeScriptConfig() {
  try {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    const content = fs.readFileSync(tsconfigPath, 'utf-8');
    const tsconfig = JSON.parse(content);
    
    const isStrict = tsconfig.compilerOptions?.strict === true;
    
    if (isStrict) {
      return {
        check: 'TypeScript Config',
        status: 'PASS',
        message: 'Strict mode enabled',
      };
    } else {
      return {
        check: 'TypeScript Config',
        status: 'WARN',
        message: 'Strict mode not enabled (recommended for production)',
      };
    }
  } catch (error) {
    return {
      check: 'TypeScript Config',
      status: 'FAIL',
      message: 'Error checking TypeScript config',
      error: error.message,
    };
  }
}

function checkDirectoryStructure() {
  try {
    const requiredDirs = [
      'src',
      'src/agents',
      'src/core',
      'src/utils',
      'src/tests',
      'src/cli',
      'examples',
      'docs',
    ];
    
    const missing = [];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        missing.push(dir);
      }
    }
    
    if (missing.length === 0) {
      return {
        check: 'Directory Structure',
        status: 'PASS',
        message: `All required directories exist`,
      };
    } else {
      return {
        check: 'Directory Structure',
        status: 'FAIL',
        message: `Missing directories: ${missing.join(', ')}`,
      };
    }
  } catch (error) {
    return {
      check: 'Directory Structure',
      status: 'FAIL',
      message: 'Error checking directory structure',
      error: error.message,
    };
  }
}

function checkNodeModules() {
  try {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    
    if (fs.existsSync(nodeModulesPath)) {
      return {
        check: 'node_modules',
        status: 'PASS',
        message: 'node_modules directory exists',
      };
    } else {
      return {
        check: 'node_modules',
        status: 'FAIL',
        message: 'node_modules not found - run "npm install" first',
      };
    }
  } catch (error) {
    return {
      check: 'node_modules',
      status: 'FAIL',
      message: 'Error checking node_modules',
      error: error.message,
    };
  }
}

function checkTypeScriptCompilation() {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: process.cwd() });
    return {
      check: 'TypeScript Compilation',
      status: 'PASS',
      message: 'All TypeScript files compile successfully',
    };
  } catch (error) {
    return {
      check: 'TypeScript Compilation',
      status: 'FAIL',
      message: 'TypeScript compilation errors found',
      error: error.message.substring(0, 200),
    };
  }
}

function printResults() {
  console.log('\n');
  log(BOLD + BLUE, '═'.repeat(80));
  log(BOLD + BLUE, '  PLAYWRIGHT MIGRATION AGENT - VALIDATION REPORT');
  log(BOLD + BLUE, '═'.repeat(80));
  console.log('\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  for (const result of results) {
    const statusSymbol =
      result.status === 'PASS'
        ? `${GREEN}✓${RESET}`
        : result.status === 'FAIL'
          ? `${RED}✗${RESET}`
          : `${YELLOW}!${RESET}`;

    console.log(`${statusSymbol} ${BOLD}${result.check}${RESET}`);
    console.log(`  → ${result.message}`);
    if (result.error) {
      console.log(`  ${RED}Error: ${result.error}${RESET}`);
    }
    console.log('');
  }

  console.log('\n');
  log(BOLD + BLUE, '─'.repeat(80));
  console.log(`${GREEN}Passed: ${passed}${RESET} | ${RED}Failed: ${failed}${RESET} | ${YELLOW}Warned: ${warned}${RESET}`);
  log(BOLD + BLUE, '─'.repeat(80));
  console.log('\n');

  if (failed === 0) {
    log(GREEN + BOLD, '✓ All validations passed! Ready to run tests.');
  } else {
    log(RED + BOLD, `✗ ${failed} validation(s) failed. Fix the above issues.`);
  }

  console.log('\n');
  return failed === 0;
}

function runValidation() {
  log(BLUE, '\nStarting validation checks...\n');

  // Run all checks
  results.push(checkFileExists(path.join(process.cwd(), 'package.json'), 'package.json'));
  results.push(checkJsonValidity(path.join(process.cwd(), 'package.json'), 'package.json'));
  results.push(checkFileExists(path.join(process.cwd(), 'jest.config.js'), 'jest.config.js'));
  results.push(checkFileExists(path.join(process.cwd(), 'tsconfig.json'), 'tsconfig.json'));
  results.push(checkJsonValidity(path.join(process.cwd(), 'tsconfig.json'), 'tsconfig.json'));
  results.push(checkESModuleCompatibility());
  results.push(checkNpmScripts());
  results.push(checkTypeScriptConfig());
  results.push(checkDirectoryStructure());
  results.push(checkNodeModules());
  
  // Only check TypeScript if node_modules exists
  const nodeModulesCheck = results.find(r => r.check === 'node_modules');
  if (nodeModulesCheck?.status === 'PASS') {
    results.push(checkTypeScriptCompilation());
  }

  // Print results
  const success = printResults();

  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run validation
runValidation();
