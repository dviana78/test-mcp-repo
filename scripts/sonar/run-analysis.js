#!/usr/bin/env node

/**
 * SonarQube Analysis Script
 * 
 * This script provides standalone SonarQube analysis functionality
 * that can be run independently or integrated with the MCP server.
 * 
 * Usage:
 *   node scripts/sonar/run-analysis.js
 *   node scripts/sonar/run-analysis.js --coverage
 *   node scripts/sonar/run-analysis.js --wait-quality-gate
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../..');

// Parse command line arguments
const args = process.argv.slice(2);
const includeCoverage = args.includes('--coverage') || args.includes('-c');
const waitForQualityGate = args.includes('--wait-quality-gate') || args.includes('-w');
const verbose = args.includes('--verbose') || args.includes('-v');

// Configuration
const config = {
  projectPath: projectRoot,
  sonarUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
  sonarToken: process.env.SONAR_TOKEN,
  includeCoverage,
  waitForQualityGate,
  verbose
};

function log(message, ...args) {
  console.log(`[SonarQube] ${message}`, ...args);
}

function logVerbose(message, ...args) {
  if (config.verbose) {
    console.log(`[SonarQube][DEBUG] ${message}`, ...args);
  }
}

function logError(message, ...args) {
  console.error(`[SonarQube][ERROR] ${message}`, ...args);
}

async function checkSonarProperties() {
  const sonarPropsPath = path.join(config.projectPath, 'sonar-project.properties');
  try {
    await fs.access(sonarPropsPath);
    logVerbose('Found sonar-project.properties');
    return true;
  } catch {
    logError('sonar-project.properties file not found in project root');
    return false;
  }
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    logVerbose(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: config.verbose ? 'inherit' : 'pipe',
      ...options
    });

    let stdout = '';
    let stderr = '';

    if (!config.verbose) {
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with exit code ${code}${stderr ? ': ' + stderr : ''}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runCoverage() {
  if (!config.includeCoverage) return;

  log('Running test coverage...');
  try {
    await runCommand('npm', ['run', 'test:coverage'], {
      cwd: config.projectPath
    });
    log('✅ Test coverage completed successfully');
  } catch (error) {
    logError('⚠️  Test coverage failed, continuing with analysis:', error.message);
    // Continue even if tests fail
  }
}

async function runSonarAnalysis() {
  log('Starting SonarQube analysis...');
  
  const sonarCommand = process.platform === 'win32' ? 'sonar-scanner.bat' : 'sonar-scanner';
  const sonarArgs = [
    `-Dsonar.host.url=${config.sonarUrl}`,
    `-Dsonar.projectBaseDir=${config.projectPath}`
  ];

  if (config.sonarToken) {
    sonarArgs.push(`-Dsonar.login=${config.sonarToken}`);
    logVerbose('Using authentication token');
  }

  if (config.waitForQualityGate) {
    sonarArgs.push('-Dsonar.qualitygate.wait=true');
    logVerbose('Waiting for quality gate result');
  }

  try {
    const result = await runCommand(sonarCommand, sonarArgs, {
      cwd: config.projectPath,
      env: {
        ...process.env,
        SONAR_HOST_URL: config.sonarUrl,
        ...(config.sonarToken && { SONAR_TOKEN: config.sonarToken })
      }
    });

    log('✅ SonarQube analysis completed successfully');
    
    if (!config.verbose && result.stdout) {
      // Extract important information from output
      const lines = result.stdout.split('\n');
      const successLine = lines.find(line => line.includes('ANALYSIS SUCCESSFUL'));
      const dashboardLine = lines.find(line => line.includes('you can browse'));
      const qualityGateLine = lines.find(line => line.includes('Quality Gate'));
      
      if (successLine) log('✅', successLine.trim());
      if (dashboardLine) log('🔗', dashboardLine.trim());
      if (qualityGateLine) log('🚦', qualityGateLine.trim());
    }

    return result;
  } catch (error) {
    logError('❌ SonarQube analysis failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    log('SonarQube Analysis Tool');
    log('Configuration:', {
      projectPath: config.projectPath,
      sonarUrl: config.sonarUrl,
      hasToken: !!config.sonarToken,
      includeCoverage: config.includeCoverage,
      waitForQualityGate: config.waitForQualityGate,
      verbose: config.verbose
    });

    // Check prerequisites
    if (!(await checkSonarProperties())) {
      process.exit(1);
    }

    // Run analysis steps
    await runCoverage();
    await runSonarAnalysis();

    log('🎉 Analysis completed successfully!');
    process.exit(0);

  } catch (error) {
    logError('Analysis failed:', error.message);
    if (config.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
SonarQube Analysis Tool

Usage:
  node scripts/sonar/run-analysis.js [options]

Options:
  -c, --coverage           Run test coverage before analysis
  -w, --wait-quality-gate  Wait for quality gate result
  -v, --verbose            Show detailed output
  -h, --help              Show this help message

Environment Variables:
  SONAR_HOST_URL          SonarQube server URL (default: http://localhost:9000)
  SONAR_TOKEN             Authentication token for SonarQube

Examples:
  node scripts/sonar/run-analysis.js --coverage
  node scripts/sonar/run-analysis.js --coverage --wait-quality-gate --verbose
`);
  process.exit(0);
}

// Run the main function
main().catch(console.error);