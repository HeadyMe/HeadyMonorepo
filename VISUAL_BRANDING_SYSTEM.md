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
- `.sh`, `.bash` (Shell

- `.yml`, `.yaml` (YAML

- `Dockerfile`
- `.gitignore`, `.env`

**HTML Comments (<!-- -
**
- `.md` (Markdown)
- `.html`, `.xml`

### Usage

```bash
# Check branding status

node scripts/brand_head
js --check

# Apply branding to all
es
node scripts/brand_head
js --fix

# Brand only staged fil

node scripts/brand_head
js --fix --staged

# Verbose output
node scripts/brand_head
js --fix --verbose
```

### Example Branded Fil


**TypeScript:**
```typescript
<!-- HEADY_BRAND:BEGIN 

<!-- HEADY SYSTEMS :: S
D GEOMETRY -->
<!-- FILE: VISUAL_BRAND
SYSTEM.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  ___
  _    ____   __   __ -->
<!--        | | | || __
 / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _
/ _ \ | | | | \ V /  -->
<!--        |  _  || |_
 ___ \| |_| |  | |   -->
<!--        |_| |_||___
/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry
Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END --


import express from 'ex
s';
// ... rest of file
```

**Python:**
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACR
# EOMETRY
# FILE: src/worker.py
# LAYER: backend/src
# 
#         _   _  _____ 
#   __   __
#        | | | || ____|
# \ \  / /
#        | |_| ||  _|  
#  \ \ V / 
#        |  _  || |___ 
# _ \ | |  
#        |_| |_||_____/
#  \_\|_|  
# 
#    Sacred Geometry ::
# anic Systems :: Breathing Interfaces
# HEADY_BRAND:END

import sys
# ... rest of file
```

---

## Visual Excitement Fe
es

### 1. Colorful Termina
tput

All scripts use colored
put:
- **Cyan** - Headers an
ctions
- **Green** - Success m
ges
- **Yellow** - Warnings
 info
- **Red** - Errors
- **Gray** - Details an
tadata

### 2. Progress Indicat


```
═══════════════════════
═════════════════════════════════════
 HEADY CONTROL: EXECUTI
 CTION 'hs'
═══════════════════════
═════════════════════════════════════

[HC] Pausing System (St
ng Services)...
[HC] Catching up (Fetch
all remotes & Pruning worktrees)...
[HC] Fixing Errors & st
rdizing code...
[HC] Making Improvement
ptimization)...
[HC] Running Checkpoint
idation...
✅ Checkpoint validatio
ssed!
[HC] Finalizing Synchro
tion...

═══════════════════════
═════════════════════════════════════
 CYCLE COMPLETE. SYSTEM
 SED.
═══════════════════════
═════════════════════════════════════
```

### 3. ASCII Art in Doc
tation

All major documentation
es include:
- Sacred Geometry heade

- ASCII art logos
- Visual separators
- Emoji indicators (✅ 
🎯 🚀 etc.)

### 4. Branded Console 


```javascript
console.log(`
╔══════════════════════
════════════════════════════════════╗
║                    HE
ECOSYSTEM v14.3                     ║
║                      
                                    ║
║              🌟 Sacre
ometry Architecture 🌟              ║
╚══════════════════════
════════════════════════════════════╝
`);
```

---

## Automated Branding W
low

### Pre-Commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
node scripts/brand_head
js --check --staged
if [ $? -ne 0 ]; then
  echo "❌ Branding che
  ailed. Run: node scripts/brand_headers.js --fix"
  exit 1
fi
```

### CI/CD Integration

```yaml
# .github/workflows/bra
heck.yml
name: Brand Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-lat
    
    steps:
      - uses: actions/c
      out@v3
      - run: node scrip
      rand_headers.js --check
```

### Automatic Branding 
ave

**VS Code Settings:**
```json
{
  "files.onSave": {
    "commands": [
      "node scripts/bra
      eaders.js --fix --staged"
    ]
  }
}
```

---

## Branding Statistics

### Current Status

**Total Files Branded:*
660  
**HeadyMonorepo:** 1,50
les  
**HeadyEcosystem:** 35 
s  
**Heady:** 117 files  

**File Types:**
- JavaScript/TypeScript
0 files
- Python: 120 files
- PowerShell: 95 files
- YAML: 180 files
- Markdown: 250 files
- Shell Scripts: 65 fil

- Other: 100 files

**Coverage:** 100% of e
ble source files

---

## Visual Design Tokens


### Colors (Sacred Geom
 Palette)

**Light Theme:**
```css
--primary: #6366f1;   
 /* Indigo */
--secondary: #10b981; 
 /* Emerald */
--background: #fafaf9;
 /* Stone 50 */
--surface: #ffffff;   
 /* White */
--text: #1c1917;      
 /* Stone 900 */
```

**Dark Theme:**
```css
--primary: #8b5cf6;   
 /* Violet */
--secondary: #06b6d4; 
 /* Cyan */
--background: #0f0f10;
 /* Near Black */
--surface: #18181b;   
 /* Zinc 900 */
--text: #fafafa;      
 /* Stone 50 */
```

### Spacing (Fibonacci)

```css
--space-xs: 0.5rem;   /
x */
--space-sm: 0.75rem;  /
px */
--space-md: 1.25rem;  /
px */
--space-lg: 2rem;     /
px */
--space-xl: 3.25rem;  /
px */
```

### Border Radius (Orga

```css
--radius-sm: 0.5rem;   
px */
--radius-md: 1rem;     
6px */
--radius-lg: 1.5rem;   
4px */
--radius-xl: 2rem;     
2px */
--radius-full: 9999px; 
ill */
```

### Animations
```css
@keyframes breathe {
  0%, 100% { transform:
  le(1); opacity: 1; }
  50% { transform: scal
  02); opacity: 0.95; }
}

@keyframes pulse-glow {
  
  0%, 100% { box-shadow
  0 5px var(--primary-light); }
  50% { box-shadow: 0 0
  x var(--primary-light), 0 0 40px var(--primary); }
}

@keyframes float {
  0%, 100% { transform:
  nslateY(0); }
  50% { transform: tran
  eY(-10px); }
}
```

---

## Branding Enforcement


### Quality Gates

**Pre-Commit:**
- All staged files must
e branding
- Branding headers must
current
- ASCII art must be int


**Pre-Push:**
- All files in reposito
ust be branded
- No branding violation
lowed
- Checkpoint validation
ludes branding check

**CI/CD:**
- Automated branding ch
on PR
- Fails if branding mis
 or outdated
- Suggests fix command

### Violation Handling

```bash
# Check for violations
node scripts/brand_head
js --check

# Output if violations 
d:
[brand_headers] Missing
outdated branding headers in 5 file(s).
[brand_headers] Run: np
n brand:fix

# Fix violations
node scripts/brand_head
js --fix

# Output:
[brand_headers] Updated
ile(s) (checked 1509).
```

---

## Custom Branding

### Add Custom ASCII Ar


Edit `scripts/brand_hea
.js`:

```javascript
function bannerLines(me
{
  const art = [
    "        _   _  ___
      _  __   __",
    "       | | | || __
     / \\ \\ \\ / /",
    "       | |_| ||  _
    / _ \\ \\ V / ",
    "       |  _  || |_
     ___ \\ | |  ",
    "       |_| |_||___
    /   \\_\\|_|  ",
    "",
    "   Sacred Geometry
    Organic Systems :: Breathing Interfaces",
    // Add your custom 
    // here
  ];
  // ...
}
```

### Add Custom Layers

```javascript
function layerFromPath(
   {
  const p = rel.toLower
  ();
  if (p.startsWith("pub
  ")) return "ui/public";
  if (p.startsWith("fro
  d/")) return "ui/frontend";
  if (p.startsWith("bac
  /")) return "backend";
  // Add custom layers 
  
  return "root";
}
```

---

## Benefits

### 1. Brand Recognitio

- Every file instantly 
gnizable as Heady
- Consistent visual ide
y
- Professional appearan


### 2. File Tracking
- File path in header
- Layer information
- Easy navigation

### 3. Legal Protection

- Copyright notice in e
 file
- Ownership clear
- License information

### 4. Visual Excitemen

- ASCII art makes code 

- Sacred Geometry theme
oughout
- Breathing, organic fe


### 5. Automation
- No manual branding ne

- Automatic on save (op
al)
- Pre-commit enforcemen

- CI/CD validation

---

**Every file is a work 
rt! 🎨**  
**Sacred Geometry :: Or
c Systems :: Breathing Interfaces**
