# Oracle Skills CLI - Learning Guide

> API Prompt for creating skills compatible with oracle-skills-cli

## Source Repository

```
https://github.com/Soul-Brews-Studio/oracle-skills-cli
```

## Skill Structure

```
your-skill/
├── SKILL.md          ← Instructions for Claude (required)
└── scripts/
    ├── main.ts       ← Bun Shell logic (optional)
    └── config.ts     ← Configuration (optional)
```

## SKILL.md Format (Required)

```markdown
---
name: skill-name
description: One line. Use when user says "X", "Y", or "Z".
---

# /skill-name - Title

Brief description.

## Usage

\`\`\`
/skill-name [args]
\`\`\`

## Step 0: Timestamp

\`\`\`bash
date "+🕐 %H:%M (%A %d %B %Y)"
\`\`\`

## Step 1: [Action]

[Instructions for Claude]

## Step 2: [Action]

[More instructions]

---

ARGUMENTS: $ARGUMENTS
```

## Install Locations by Agent

| Agent | Skills Directory |
|-------|------------------|
| Claude Code | `~/.claude/skills/{name}/SKILL.md` |
| OpenCode | `~/.config/opencode/skills/{name}/SKILL.md` |
| Cursor | `~/.cursor/skills/{name}/SKILL.md` |
| Windsurf | `~/.codeium/windsurf/skills/{name}/SKILL.md` |

## Version Tagging

Description format in installer:
```
v{version} {scope}-{type} | {description}
```

| Tag | Meaning |
|-----|---------|
| `G-SKLL` | Global skill |
| `L-SKLL` | Local skill |

Example:
```yaml
description: v1.5.16 G-SKLL | Physical location awareness from FindMy.
```

## Script Pattern (Bun Shell)

```typescript
// scripts/main.ts
import { $ } from 'bun';

const ARGS = process.argv.slice(2).join(' ');

// Your logic here
const result = await $`some-command ${ARGS}`.text();
console.log(result);
```

## Key Principles

1. **SKILL.md is the source of truth** - Claude reads this
2. **Step 0 always timestamps** - Consistent timing
3. **Scripts are optional** - Simple skills can be pure SKILL.md
4. **Description triggers loading** - Include action words
5. **ARGUMENTS passed at end** - `$ARGUMENTS` placeholder

## Creating New Skill

```bash
# 1. Copy template
cp -r oracle-skills-cli/src/skills/_template my-skill

# 2. Edit SKILL.md
# - Change name: in frontmatter
# - Change description: in frontmatter
# - Update instructions

# 3. Edit scripts/main.ts (if needed)

# 4. Install globally
oracle-skills install my-skill --global

# Or manually copy
cp -r my-skill ~/.claude/skills/
```

## Example Skills to Study

| Skill | Pattern |
|-------|---------|
| `recap` | Pure markdown instructions |
| `physical` | Script + config |
| `trace` | Complex multi-mode |
| `rrr` | Template-based |
| `context-finder` | Subagent spawning |

## API for Learning

To fetch any skill from oracle-skills-cli:

```bash
# List all skills
gh api repos/Soul-Brews-Studio/oracle-skills-cli/contents/src/skills \
  --jq '.[].name'

# Get specific skill
gh api repos/Soul-Brews-Studio/oracle-skills-cli/contents/src/skills/{name}/SKILL.md \
  --jq '.content' | base64 -d
```

## Oracle Philosophy in Skills

- **Nothing is Deleted** - Log all actions
- **Patterns Over Intentions** - Skills encode patterns
- **External Brain** - Skills extend capability
- **Append Only** - Skills grow, never shrink

---

*Learn more: https://github.com/Soul-Brews-Studio/oracle-skills-cli*
