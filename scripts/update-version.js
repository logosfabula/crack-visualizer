#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the new version from package.json (set by npm version command)
const newVersion = process.env.npm_package_version;

if (!newVersion) {
  console.error('❌ Error: Could not detect version. Run this via npm version command.');
  process.exit(1);
}

const today = new Date().toISOString().split('T')[0];

console.log(`\n📦 Updating project to version ${newVersion}...\n`);

// =============================================================================
// HELPER: Get commits since last tag
// =============================================================================
function getCommitsSinceLastTag() {
  try {
    // Try to get the last tag
    let lastTag;
    try {
      lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', { encoding: 'utf8' })
        .toString()
        .trim();
    } catch (e) {
      lastTag = null;
    }
    
    if (lastTag) {
      console.log(`📚 Last tag found: ${lastTag}`);
      
      // Get commits since last tag
      const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s"`, { encoding: 'utf8' })
        .toString()
        .trim()
        .split('\n')
        .filter(line => line.trim() !== '');
      
      console.log(`📚 Found ${commits.length} commits since ${lastTag}:`);
      commits.forEach(c => console.log(`   - ${c.substring(0, 70)}${c.length > 70 ? '...' : ''}`));
      console.log();
      
      return commits;
    } else {
      console.log('⚠️  No previous tags found!');
      console.log('   This appears to be the first versioned release.');
      console.log('   The CHANGELOG will have empty sections.\n');
      console.log('💡 To initialize: git tag v<current-version> && git push origin v<current-version>\n');
      return [];
    }
  } catch (error) {
    console.log('⚠️  Error getting commits:', error.message);
    console.log('   The CHANGELOG will have empty sections.\n');
    return [];
  }
}

// =============================================================================
// HELPER: Parse commits by type
// =============================================================================
function parseCommits(commits) {
  const sections = {
    added: [],
    changed: [],
    fixed: [],
    removed: []
  };

  commits.forEach(commit => {
    // Extract tags like [ADD], [CHG], [FIX], [DEL], or combinations like [CHG, ADD]
    const tagMatch = commit.match(/^\[([^\]]+)\]/);
    
    if (!tagMatch) {
      // No tag found - skip with warning
      console.log(`   ⚠️  Skipping commit without tag: ${commit.substring(0, 60)}...`);
      return;
    }

    // Extract the tags (could be multiple: "CHG, ADD")
    const tags = tagMatch[1].split(',').map(t => t.trim().toUpperCase());
    
    // Get the message without the tag
    const message = commit.replace(/^\[([^\]]+)\]\s*/, '').trim();
    
    if (!message) {
      console.log(`   ⚠️  Skipping empty commit message`);
      return;
    }

    // Track if we found a recognized tag
    let hasRecognizedTag = false;

    // Add to appropriate section(s)
    tags.forEach(tag => {
      switch (tag) {
        case 'ADD':
        case 'ADDED':
          sections.added.push(message);
          hasRecognizedTag = true;
          break;
        case 'CHG':
        case 'CHANGE':
        case 'CHANGED':
          sections.changed.push(message);
          hasRecognizedTag = true;
          break;
        case 'FIX':
        case 'FIXED':
          sections.fixed.push(message);
          hasRecognizedTag = true;
          break;
        case 'DEL':
        case 'DELETED':
        case 'REMOVE':
        case 'REMOVED':
          sections.removed.push(message);
          hasRecognizedTag = true;
          break;
        default:
          // Unknown tag - will be handled below
          break;
      }
    });

    // If no recognized tags were found, add to Changed section with warning
    if (!hasRecognizedTag) {
      console.log(`   ℹ️  Unknown tag(s) [${tags.join(', ')}] → Adding to Changed: ${message.substring(0, 50)}...`);
      sections.changed.push(message);
    }
  });

  return sections;
}

// =============================================================================
// HELPER: Format section for CHANGELOG
// =============================================================================
function formatSection(items) {
  if (items.length === 0) {
    return '';
  }
  
  // Remove duplicates (in case same message added to multiple sections)
  const uniqueItems = [...new Set(items)];
  
  return uniqueItems.map(item => `- ${item}`).join('\n');
}

// =============================================================================
// 1. UPDATE CHANGELOG.md
// =============================================================================
try {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  let changelog = fs.readFileSync(changelogPath, 'utf8');

  // Get and parse commits
  const commits = getCommitsSinceLastTag();
  const sections = parseCommits(commits);

  // Build the version entry dynamically, only including non-empty sections
  let newEntry = `## [${newVersion}] - ${today}\n`;
  
  // Add sections only if they have content
  if (sections.added.length > 0) {
    newEntry += `### Added\n${formatSection(sections.added)}\n\n`;
  }
  
  if (sections.changed.length > 0) {
    newEntry += `### Changed\n${formatSection(sections.changed)}\n\n`;
  }
  
  if (sections.fixed.length > 0) {
    newEntry += `### Fixed\n${formatSection(sections.fixed)}\n\n`;
  }
  
  if (sections.removed.length > 0) {
    newEntry += `### Removed\n${formatSection(sections.removed)}\n\n`;
  }

  // If no sections at all, add a placeholder
  if (sections.added.length === 0 && 
      sections.changed.length === 0 && 
      sections.fixed.length === 0 && 
      sections.removed.length === 0) {
    newEntry += `### Changed\n- Version bump\n\n`;
  }

  newEntry += '---\n\n';

  // Insert after the [Unreleased] section
  const unreleasedSection = '## [Unreleased]\n(No unreleased changes)\n\n---\n\n';
  
  if (changelog.includes(unreleasedSection)) {
    changelog = changelog.replace(
      unreleasedSection,
      `${unreleasedSection}${newEntry}`
    );
    
    fs.writeFileSync(changelogPath, changelog);
    console.log('✅ CHANGELOG.md updated with commits:');
    if (sections.added.length > 0) console.log(`   📝 Added: ${sections.added.length} items`);
    if (sections.changed.length > 0) console.log(`   📝 Changed: ${sections.changed.length} items`);
    if (sections.fixed.length > 0) console.log(`   📝 Fixed: ${sections.fixed.length} items`);
    if (sections.removed.length > 0) console.log(`   📝 Removed: ${sections.removed.length} items`);
    
    if (sections.added.length === 0 && 
        sections.changed.length === 0 && 
        sections.fixed.length === 0 && 
        sections.removed.length === 0) {
      console.log('   ℹ️  No tagged commits found - added placeholder');
    }
    console.log();
  } else {
    console.warn('⚠️  Warning: Could not find [Unreleased] section in CHANGELOG.md');
    console.warn('   Please update CHANGELOG.md manually.\n');
  }
} catch (error) {
  console.error('❌ Error updating CHANGELOG.md:', error.message);
}

// =============================================================================
// 2. UPDATE README.md (if it has version references)
// =============================================================================
try {
  const readmePath = path.join(__dirname, '../README.md');
  let readme = fs.readFileSync(readmePath, 'utf8');
  let readmeUpdated = false;

  // Update version badge if it exists (example patterns)
  const patterns = [
    // GitHub release badge
    { 
      regex: /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[\d.]+/g,
      replacement: `![Version](https://img.shields.io/badge/version-${newVersion}`
    },
    // GitHub tree links
    {
      regex: /crack-visualizer\/tree\/v[\d.]+/g,
      replacement: `crack-visualizer/tree/v${newVersion}`
    },
    // Direct version mentions (be careful with this one)
    {
      regex: /\(v[\d.]+\)/g,
      replacement: `(v${newVersion})`
    }
  ];

  patterns.forEach(({ regex, replacement }) => {
    if (regex.test(readme)) {
      readme = readme.replace(regex, replacement);
      readmeUpdated = true;
    }
  });

  if (readmeUpdated) {
    fs.writeFileSync(readmePath, readme);
    console.log('✅ README.md updated - Version references updated\n');
  } else {
    console.log('ℹ️  README.md - No version references found to update\n');
  }
} catch (error) {
  console.error('❌ Error updating README.md:', error.message);
}

// =============================================================================
// 3. CHECK TODO.md FOR COMPLETION
// =============================================================================
try {
  const todoPath = path.join(__dirname, '../TODO.md');
  
  if (fs.existsSync(todoPath)) {
    const todo = fs.readFileSync(todoPath, 'utf8');
    
    // Check if there's a section for this version
    const versionRegex = new RegExp(`v${newVersion.replace(/\./g, '\\.')}[\\s\\S]*?(?=v\\d|Backlog|$)`, 'i');
    const versionSection = todo.match(versionRegex);
    
    if (versionSection) {
      const hasIncomplete = versionSection[0].includes('[ ]');
      
      if (hasIncomplete) {
        console.log('⚠️  TODO.md - Found incomplete items for v' + newVersion);
        console.log('   Please review and mark items as complete: [x]\n');
      } else {
        console.log('✅ TODO.md - All v' + newVersion + ' items marked complete\n');
      }
    } else {
      console.log('ℹ️  TODO.md - No section found for v' + newVersion + '\n');
    }
    
    console.log('📋 ACTION REQUIRED: Review TODO.md manually');
    console.log('   - Mark completed items for v' + newVersion);
    console.log('   - Plan items for next version\n');
  } else {
    console.log('ℹ️  TODO.md not found - skipping\n');
  }
} catch (error) {
  console.error('❌ Error checking TODO.md:', error.message);
}

// =============================================================================
// 4. SHOW GIT STATUS
// =============================================================================
console.log('📊 Git Status:');
console.log('─'.repeat(50));
try {
  const gitStatus = execSync('git status --short', { encoding: 'utf8' });
  console.log(gitStatus || '  (no changes)');
} catch (error) {
  console.log('  Could not get git status');
}

// =============================================================================
// 5. SUMMARY & NEXT STEPS
// =============================================================================
console.log('─'.repeat(50));
console.log('\n🎯 Version Update Summary:');
console.log(`   Version bumped to: v${newVersion}`);
console.log(`   Date: ${today}`);
console.log('\n📝 Next Steps:');
console.log('   1. Review CHANGELOG.md - Verify auto-populated entries');
console.log('   2. Edit TODO.md - Mark completed items, plan next version');
console.log('   3. Review changes: git diff');
console.log('   4. Commit will be created automatically by npm version');
console.log('   5. Push with: git push && git push --tags\n');