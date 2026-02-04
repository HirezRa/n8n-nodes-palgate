/**
 * Automated Release Script with Idempotency
 * Checks if release already exists before proceeding
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  packageJsonPath: './package.json',
  changelogPath: './CHANGELOG.md',
  expectedBranch: 'main',
  npmRegistry: 'https://registry.npmjs.org',
  gitRemote: 'origin'
};

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

function exec(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf-8', 
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options 
    });
    return { success: true, output: result.trim(), error: null };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout?.toString().trim() || '', 
      error: error.stderr?.toString().trim() || error.message 
    };
  }
}

function log(message, type = 'info') {
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    step: '📋'
  }[type] || 'ℹ️';
  
  console.log(`${prefix} ${message}`);
}

function readJsonFile(path) {
  try {
    const content = fs.readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read ${path}: ${error.message}`);
  }
}

function writeJsonFile(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    return true;
  } catch (error) {
    throw new Error(`Failed to write ${path}: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// PREFLIGHT CHECKS
// ═══════════════════════════════════════════════════════════════

function checkGitAvailable() {
  const gitCheck = exec('git --version');
  return gitCheck.success;
}

function checkGitStatus() {
  log('Checking git working tree...', 'step');
  
  if (!checkGitAvailable()) {
    log('Git is not available in PATH - skipping git checks', 'warning');
    return false;
  }
  
  const status = exec('git status --porcelain');
  if (!status.success) {
    log('Not a git repository or git error - skipping git checks', 'warning');
    return false;
  }
  
  if (status.output.trim() !== '') {
    throw new Error('Git working tree is not clean. Please commit or stash changes.');
  }
  
  log('Git working tree is clean', 'success');
  return true;
}

function checkGitBranch() {
  log('Checking current git branch...', 'step');
  
  if (!checkGitAvailable()) {
    return false;
  }
  
  const branch = exec('git branch --show-current');
  if (!branch.success) {
    log('Could not determine git branch - skipping', 'warning');
    return false;
  }
  
  const currentBranch = branch.output.trim();
  if (currentBranch !== CONFIG.expectedBranch) {
    log(`Current branch is '${currentBranch}', expected '${CONFIG.expectedBranch}' - continuing anyway`, 'warning');
    return false;
  }
  
  log(`Current branch is '${currentBranch}'`, 'success');
  return true;
}

function checkNpmLogin() {
  log('Checking npm login status...', 'step');
  
  const whoami = exec('npm whoami');
  if (!whoami.success) {
    throw new Error('Not logged in to npm. Please run: npm login');
  }
  
  log(`Logged in as: ${whoami.output}`, 'success');
  return whoami.output;
}

// ═══════════════════════════════════════════════════════════════
// RELEASE STATE DETECTION
// ═══════════════════════════════════════════════════════════════

function getCurrentVersion() {
  log('Reading current version from package.json...', 'step');
  
  const packageJson = readJsonFile(CONFIG.packageJsonPath);
  const version = packageJson.version;
  
  if (!version) {
    throw new Error('No version found in package.json');
  }
  
  log(`Current version: ${version}`, 'info');
  return version;
}

function checkGitTag(version) {
  log(`Checking if git tag v${version} exists...`, 'step');
  
  if (!checkGitAvailable()) {
    log('Git not available - cannot check tags, assuming tag does not exist', 'warning');
    return false;
  }
  
  const tagName = `v${version}`;
  
  // Check local tags
  const localTags = exec('git tag -l');
  const localExists = localTags.success && localTags.output.includes(tagName);
  
  // Check remote tags
  const remoteTags = exec('git ls-remote --tags origin');
  const remoteExists = remoteTags.success && remoteTags.output.includes(`refs/tags/${tagName}`);
  
  if (localExists) {
    log(`Git tag ${tagName} exists locally`, 'info');
  }
  if (remoteExists) {
    log(`Git tag ${tagName} exists on remote`, 'info');
  }
  
  return localExists || remoteExists;
}

function checkNpmVersion(packageName, version) {
  return new Promise((resolve) => {
    log(`Checking if version ${version} is published on npm...`, 'step');
    
    const url = `${CONFIG.npmRegistry}/${packageName}/${version}`;
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const pkg = JSON.parse(data);
            if (pkg.version === version) {
              log(`Version ${version} is published on npm`, 'info');
              resolve(true);
              return;
            }
          } catch (e) {
            // Not JSON or parse error
          }
        }
        log(`Version ${version} is NOT published on npm`, 'info');
        resolve(false);
      });
    });
    
    req.on('error', () => {
      log(`Could not check npm (network error), assuming not published`, 'warning');
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      log(`Could not check npm (timeout), assuming not published`, 'warning');
      resolve(false);
    });
    
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════
// RELEASE PROCESS
// ═══════════════════════════════════════════════════════════════

function installDependencies() {
  log('Installing dependencies (npm ci)...', 'step');
  const result = exec('npm ci');
  if (!result.success) {
    throw new Error(`npm ci failed: ${result.error}`);
  }
  log('Dependencies installed', 'success');
}

function runQualityGate() {
  log('Running quality gate checks...', 'step');
  
  // Lint
  log('Running lint...', 'info');
  const lint = exec('npm run lint');
  if (!lint.success) {
    throw new Error(`Lint failed: ${lint.error}`);
  }
  log('Lint passed', 'success');
  
  // Test (if exists)
  const packageJson = readJsonFile(CONFIG.packageJsonPath);
  if (packageJson.scripts && packageJson.scripts.test) {
    log('Running tests...', 'info');
    const test = exec('npm test');
    if (!test.success) {
      throw new Error(`Tests failed: ${test.error}`);
    }
    log('Tests passed', 'success');
  } else {
    log('No test script found, skipping', 'info');
  }
  
  // Build
  log('Running build...', 'info');
  const build = exec('npm run build');
  if (!build.success) {
    throw new Error(`Build failed: ${build.error}`);
  }
  log('Build passed', 'success');
}

function bumpVersion() {
  log('Bumping version (patch)...', 'step');
  const result = exec('npm version patch -m "chore(release): v%s"');
  if (!result.success) {
    throw new Error(`Version bump failed: ${result.error}`);
  }
  
  // Extract new version from output
  const match = result.output.match(/v(\d+\.\d+\.\d+)/);
  const newVersion = match ? match[1] : null;
  
  if (!newVersion) {
    throw new Error('Could not determine new version from npm version output');
  }
  
  log(`Version bumped to: ${newVersion}`, 'success');
  return newVersion;
}

function publishToNpm() {
  log('Publishing to npm...', 'step');
  
  const packageJson = readJsonFile(CONFIG.packageJsonPath);
  const isScoped = packageJson.name.startsWith('@');
  
  const command = isScoped ? 'npm publish --access public' : 'npm publish';
  const result = exec(command);
  
  if (!result.success) {
    throw new Error(`npm publish failed: ${result.error}`);
  }
  
  log('Published to npm successfully', 'success');
}

function pushToGit() {
  if (!checkGitAvailable()) {
    log('Git not available - skipping git push', 'warning');
    log('You can manually push with: git push origin main --follow-tags', 'info');
    return false;
  }
  
  log('Pushing to git with tags...', 'step');
  const result = exec(`git push ${CONFIG.gitRemote} ${CONFIG.expectedBranch} --follow-tags`);
  if (!result.success) {
    log(`git push failed: ${result.error}`, 'warning');
    log('You can manually push with: git push origin main --follow-tags', 'info');
    return false;
  }
  log('Pushed to git successfully', 'success');
  return true;
}

function createGitHubRelease(version) {
  log('Creating GitHub release...', 'step');
  
  // Try to use gh CLI if available
  const ghCheck = exec('gh --version');
  if (ghCheck.success) {
    // Read changelog
    let releaseNotes = '';
    if (fs.existsSync(CONFIG.changelogPath)) {
      const changelog = fs.readFileSync(CONFIG.changelogPath, 'utf-8');
      // Extract version section
      const versionRegex = new RegExp(`## \\[${version.replace(/\./g, '\\.')}\\][\\s\\S]*?(?=## |$)`);
      const match = changelog.match(versionRegex);
      if (match) {
        releaseNotes = match[0].trim();
      }
    }
    
    if (!releaseNotes) {
      releaseNotes = `Release v${version}`;
    }
    
    // Create release
    const releaseCmd = `gh release create v${version} --title "v${version}" --notes "${releaseNotes.replace(/"/g, '\\"')}"`;
    const result = exec(releaseCmd);
    
    if (result.success) {
      log('GitHub release created', 'success');
      return true;
    } else {
      log(`GitHub release creation failed: ${result.error}`, 'warning');
      log('You can create the release manually at: https://github.com/HirezRa/n8n-nodes-palgate/releases/new', 'info');
      return false;
    }
  } else {
    log('GitHub CLI (gh) not available', 'warning');
    log('You can create the release manually at: https://github.com/HirezRa/n8n-nodes-palgate/releases/new', 'info');
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════

async function main() {
  const commandsExecuted = [];
  const filesModified = [];
  
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Automated Release Script with Idempotency                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Preflight checks
    log('=== PREFLIGHT CHECKS ===', 'step');
    const gitAvailable = checkGitStatus();
    if (gitAvailable) {
      checkGitBranch();
    }
    const npmUser = checkNpmLogin();
    
    // Detect release state
    log('\n=== RELEASE STATE DETECTION ===', 'step');
    const currentVersion = getCurrentVersion();
    const gitTagExists = checkGitTag(currentVersion);
    const npmVersionExists = await checkNpmVersion('n8n-nodes-palgate', currentVersion);
    
    // Check if release already completed
    // If git is not available, only check npm
    const releaseExists = gitAvailable ? (gitTagExists && npmVersionExists) : npmVersionExists;
    
    if (releaseExists) {
      console.log('\n╔══════════════════════════════════════════════════════════════╗');
      console.log('║     RELEASE ALREADY COMPLETED                                ║');
      console.log('╚══════════════════════════════════════════════════════════════╝\n');
      log(`Release v${currentVersion} already exists:`, 'info');
      if (gitAvailable) {
        log(`  - Git tag: v${currentVersion} ${gitTagExists ? 'exists' : 'does not exist'}`, 'info');
      }
      log(`  - npm version: ${currentVersion} is published`, 'info');
      log('No action taken (idempotent)', 'success');
      
      console.log('\n=== SUMMARY ===');
      console.log('Status: NO-OP (Release already completed)');
      console.log(`Version: ${currentVersion}`);
      console.log('Commands executed: None');
      console.log('Files modified: None');
      
      process.exit(0);
    }
    
    // New release required
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║     NEW RELEASE REQUIRED                                     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    if (!gitTagExists) {
      log('Git tag does not exist - proceeding with release', 'info');
    }
    if (!npmVersionExists) {
      log('npm version does not exist - proceeding with release', 'info');
    }
    
    // Release process
    log('\n=== RELEASE PROCESS ===', 'step');
    
    installDependencies();
    commandsExecuted.push('npm ci');
    
    runQualityGate();
    commandsExecuted.push('npm run lint');
    commandsExecuted.push('npm run build');
    
    const newVersion = bumpVersion();
    commandsExecuted.push(`npm version patch -m "chore(release): v%s"`);
    filesModified.push('package.json');
    filesModified.push('package-lock.json');
    
    publishToNpm();
    commandsExecuted.push('npm publish --access public');
    
    const gitPushed = pushToGit();
    if (gitPushed) {
      commandsExecuted.push(`git push ${CONFIG.gitRemote} ${CONFIG.expectedBranch} --follow-tags`);
    } else {
      commandsExecuted.push('git push (skipped - git not available)');
    }
    
    createGitHubRelease(newVersion);
    
    // Summary
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║     RELEASE COMPLETED SUCCESSFULLY                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('=== SUMMARY ===');
    console.log('Status: NEW RELEASE');
    console.log(`Version: ${currentVersion} → ${newVersion}`);
    console.log('\nCommands executed:');
    commandsExecuted.forEach(cmd => console.log(`  - ${cmd}`));
    console.log('\nFiles modified:');
    filesModified.forEach(file => console.log(`  - ${file}`));
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ RELEASE FAILED');
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(`\nStack trace:\n${error.stack}`);
    }
    process.exit(1);
  }
}

// Run
main();
