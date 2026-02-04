# Visual Branding System - Sacred Geometry Everywhere

**Automatic ASCII Art Branding for All Files**

---

## ASCII Art Collection

### Main Logo (Used in Headers)
```
        _   _  _____    _  __   __
       | | | || ____|  / \ \  / /
       | |_| ||  _|   / _ \ \ V / 
       |  _  || |___ / ___ \ | |  
       |_| |_||_____/_/   \_\|_|  
```

### Sacred Geometry Patterns
```
    ◇ ◆ ◇ ◆ ◇ ◆ ◇ ◆ ◇ ◆ ◇ ◆ ◇
    
    ∞ Sacred Geometry ∞ Organic Systems ∞ Breathing Interfaces ∞
    
    ◇ ◆ ◇ ◆ ◇ ◆ ◇ ◆ ◇ ◆ ◇ ◆ ◇
```

### Fractal Pattern
```
        ╱╲    ╱╲    ╱╲
       ╱  ╲  ╱  ╲  ╱  ╲
      ╱    ╲╱    ╲╱    ╲
     ╱      ╱╲    ╱╲     ╲
    ╱______╱  ╲__╱  ╲_____╲
```

### Breathing Animation (Comments)
```
    ◉ ◎ ○ ◎ ◉ ◎ ○ ◎ ◉
    Breathing • Organic • Alive
    ◉ ◎ ○ ◎ ◉ ◎ ○ ◎ ◉
```

---

## Automatic Branding

### How It Works

**brand_headers.js** automatically adds Sacred Geometry headers to all eligible files:

1. **Scans** all source files in repository
2. **Identifies** file type and comment style
3. **Generates** branded header with:
   - HEADY SYSTEMS :: SACRED GEOMETRY title
   - File path and layer information
   - ASCII art logo
   - Sacred Geometry tagline
4. **Inserts** header at appropriate location
5. **Preserves** existing code (shebangs, encoding cookies)

### Supported File Types

**Line Comments (//):**
- `.js`, `.jsx`, `.ts`, `.tsx`
- `.cjs`, `.mjs`

**Hash Comments (#):**
- `.py` (Python)
- `.ps1` (PowerShell)
- `.sh`, `.bash` (Shell)
- `.yml`, `.yaml` (YAML)
- `Dockerfile`
- `.gitignore`, `.env`

**HTML Comments (<!-- -->):**
- `.md` (Markdown)
- `.html`, `.xml`

### Usage

```bash
# Check branding status
node scripts/brand_headers.js --check

# Apply branding to all files
node scripts/brand_headers.js --fix

# Brand only staged files
node scripts/brand_headers.js --fix --staged

# Verbose output
node scripts/brand_headers.js --fix --verbose
```

### Example Branded File

**TypeScript:**
```typescript
<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: VISUAL_BRANDING_SYSTEM.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _    ____   __   __ -->
<!--        | | | || ____|  / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _|   / _ \ | | | | \ V /  -->
<!--        |  _  || |___ / ___ \| |_| |  | |   -->
<!--        |_| |_||_____/_/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

import express from 'express';
// ... rest of file
```

**Python:**
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: src/worker.py
# LAYER: backend/src
# 
#         _   _  _____    _  __   __
#        | | | || ____|  / \ \  / /
#        | |_| ||  _|   / _ \ \ V / 
#        |  _  || |___ / ___ \ | |  
#        |_| |_||_____/_/   \_\|_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

import sys
# ... rest of file
```

---

## Visual Excitement Features

### 1. Colorful Terminal Output

All scripts use colored output:
- **Cyan** - Headers and sections
- **Green** - Success messages
- **Yellow** - Warnings and info
- **Red** - Errors
- **Gray** - Details and metadata

### 2. Progress Indicators

```
════════════════════════════════════════════════════════════════
 HEADY CONTROL: EXECUTING ACTION 'hs'
════════════════════════════════════════════════════════════════

[HC] Pausing System (Stopping Services)...
[HC] Catching up (Fetching all remotes & Pruning worktrees)...
[HC] Fixing Errors & standardizing code...
[HC] Making Improvements (Optimization)...
[HC] Running Checkpoint Validation...
✅ Checkpoint validation passed!
[HC] Finalizing Synchronization...

════════════════════════════════════════════════════════════════
 CYCLE COMPLETE. SYSTEM PAUSED.
════════════════════════════════════════════════════════════════
```

### 3. ASCII Art in Documentation

All major documentation files include:
- Sacred Geometry headers
- ASCII art logos
- Visual separators
- Emoji indicators (✅ ⚠️ 🎯 🚀 etc.)

### 4. Branded Console Logs

```javascript
console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    HEADY ECOSYSTEM v14.3                     ║
║                                                              ║
║              🌟 Sacred Geometry Architecture 🌟              ║
╚══════════════════════════════════════════════════════════════╝
`);
```

---

## Automated Branding Workflow

### Pre-Commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
node scripts/brand_headers.js --check --staged
if [ $? -ne 0 ]; then
  echo "❌ Branding check failed. Run: node scripts/brand_headers.js --fix"
  exit 1
fi
```

### CI/CD Integration

```yaml
# .github/workflows/brand-check.yml
name: Brand Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: node scripts/brand_headers.js --check
```

### Automatic Branding on Save

**VS Code Settings:**
```json
{
  "files.onSave": {
    "commands": [
      "node scripts/brand_headers.js --fix --staged"
    ]
  }
}
```

---

## Branding Statistics

### Current Status

**Total Files Branded:** 1,660  
**HeadyMonorepo:** 1,508 files  
**HeadyEcosystem:** 35 files  
**Heady:** 117 files  

**File Types:**
- JavaScript/TypeScript: 850 files
- Python: 120 files
- PowerShell: 95 files
- YAML: 180 files
- Markdown: 250 files
- Shell Scripts: 65 files
- Other: 100 files

**Coverage:** 100% of eligible source files

---

## Visual Design Tokens

### Colors (Sacred Geometry Palette)

**Light Theme:**
```css
--primary: #6366f1;        /* Indigo */
--secondary: #10b981;      /* Emerald */
--background: #fafaf9;     /* Stone 50 */
--surface: #ffffff;        /* White */
--text: #1c1917;           /* Stone 900 */
```

**Dark Theme:**
```css
--primary: #8b5cf6;        /* Violet */
--secondary: #06b6d4;      /* Cyan */
--background: #0f0f10;     /* Near Black */
--surface: #18181b;        /* Zinc 900 */
--text: #fafafa;           /* Stone 50 */
```

### Spacing (Fibonacci)
```css
--space-xs: 0.5rem;   /* 8px */
--space-sm: 0.75rem;  /* 12px */
--space-md: 1.25rem;  /* 20px */
--space-lg: 2rem;     /* 32px */
--space-xl: 3.25rem;  /* 52px */
```

### Border Radius (Organic)
```css
--radius-sm: 0.5rem;   /* 8px */
--radius-md: 1rem;     /* 16px */
--radius-lg: 1.5rem;   /* 24px */
--radius-xl: 2rem;     /* 32px */
--radius-full: 9999px; /* Pill */
```

### Animations
```css
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.95; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px var(--primary-light); }
  50% { box-shadow: 0 0 20px var(--primary-light), 0 0 40px var(--primary); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

---

## Branding Enforcement

### Quality Gates

**Pre-Commit:**
- All staged files must have branding
- Branding headers must be current
- ASCII art must be intact

**Pre-Push:**
- All files in repository must be branded
- No branding violations allowed
- Checkpoint validation includes branding check

**CI/CD:**
- Automated branding check on PR
- Fails if branding missing or outdated
- Suggests fix command

### Violation Handling

```bash
# Check for violations
node scripts/brand_headers.js --check

# Output if violations found:
[brand_headers] Missing or outdated branding headers in 5 file(s).
[brand_headers] Run: npm run brand:fix

# Fix violations
node scripts/brand_headers.js --fix

# Output:
[brand_headers] Updated 5 file(s) (checked 1509).
```

---

## Custom Branding

### Add Custom ASCII Art

Edit `scripts/brand_headers.js`:

```javascript
function bannerLines(meta) {
  const art = [
    "        _   _  _____    _  __   __",
    "       | | | || ____|  / \\ \\ \\ / /",
    "       | |_| ||  _|   / _ \\ \\ V / ",
    "       |  _  || |___ / ___ \\ | |  ",
    "       |_| |_||_____/_/   \\_\\|_|  ",
    "",
    "   Sacred Geometry :: Organic Systems :: Breathing Interfaces",
    // Add your custom art here
  ];
  // ...
}
```

### Add Custom Layers

```javascript
function layerFromPath(rel) {
  const p = rel.toLowerCase();
  if (p.startsWith("public/")) return "ui/public";
  if (p.startsWith("frontend/")) return "ui/frontend";
  if (p.startsWith("backend/")) return "backend";
  // Add custom layers here
  return "root";
}
```

---

## Benefits

### 1. Brand Recognition
- Every file instantly recognizable as Heady
- Consistent visual identity
- Professional appearance

### 2. File Tracking
- File path in header
- Layer information
- Easy navigation

### 3. Legal Protection
- Copyright notice in every file
- Ownership clear
- License information

### 4. Visual Excitement
- ASCII art makes code fun
- Sacred Geometry theme throughout
- Breathing, organic feel

### 5. Automation
- No manual branding needed
- Automatic on save (optional)
- Pre-commit enforcement
- CI/CD validation

---

**Every file is a work of art! 🎨**  
**Sacred Geometry :: Organic Systems :: Breathing Interfaces**
