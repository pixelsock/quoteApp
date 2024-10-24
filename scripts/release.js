const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function exec(command) {
  console.log(`Executing: ${command}`);
  return execSync(command, { stdio: 'inherit' });
}

function incrementVersion(version) {
  const parts = version.split('.').map(Number);
  parts[2] += 1;
  return parts.join('.');
}

try {
  // Read current package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Increment version
  const newVersion = incrementVersion(packageJson.version);
  const version = `v${newVersion}`;

  // Check for unstaged changes and untracked files
  const status = execSync('git status --porcelain').toString().trim();
  const hasChanges = status.length > 0;

  if (hasChanges) {
    console.log('Stashing changes...');
    exec('git stash push -u -m "Temporary stash for release"');
  }

  // Ensure Git LFS is installed and initialized
  exec('git lfs install');

  // Track large files with Git LFS if not already tracked
  if (!fs.existsSync('.gitattributes') || !fs.readFileSync('.gitattributes', 'utf8').includes('src/data/output.json filter=lfs')) {
    exec('git lfs track "src/data/output.json"');
    exec('git add .gitattributes');
    exec('git commit -m "Add Git LFS tracking for output.json"');
  }

  // Ensure we're on the main branch and it's up to date
  exec('git checkout main && git pull');

  // Update version in package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Check for untracked files (including scripts folder)
  const untrackedFiles = execSync('git ls-files --others --exclude-standard').toString().trim();
  if (untrackedFiles) {
    console.log('Adding untracked files...');
    exec('git add .');
    exec('git commit -m "Add untracked files"');
  }

  // Add all changes
  exec('git add .');

  // Commit changes
  exec(`git commit -m "Release ${version}"`);

  // Push changes, including LFS objects
  exec('git push --all');
  exec('git lfs push --all origin');

  // Create and push new tag
  exec(`git tag -a ${version} -m "Release ${version}"`);
  exec(`git push origin ${version}`);

  // Create GitHub release
  exec(`gh release create ${version} --generate-notes`);

  console.log(`Successfully released ${version}`);

  if (hasChanges) {
    console.log('Popping stashed changes...');
    exec('git stash pop');
  }
} catch (error) {
  console.error('Error during release process:', error.message);
  
  // Attempt to pop stashed changes if there was an error
  try {
    if (hasChanges) {
      console.log('Popping stashed changes due to error...');
      exec('git stash pop');
    }
  } catch (stashError) {
    console.error('Error while popping stash:', stashError.message);
  }

  process.exit(1);
}