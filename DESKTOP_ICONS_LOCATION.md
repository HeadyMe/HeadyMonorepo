<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: DESKTOP_ICONS_LOCATION.md -->
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

```
╔══════════════════════════════════════════════════════════════╗
║              DESKTOP ICONS - LOCATIONS                       ║
║                                                              ║
║     💖 Made with Love by HeadyConnection & HeadySystems     ║
║                        Team 💖                               ║
╚══════════════════════════════════════════════════════════════╝
```

# Desktop Icons for All Heady Apps

## Icon Locations

### **HeadyManager Icon**
**Location:** `public/icons/heady-manager.ico.txt`

**Design:**
- Background: Cyan (#00d4ff)
- Text: "HM" and "M"
- Style: Bordered box with Sacred Geometry

**Use for:**
- HeadyManager server shortcut
- System tray icon
- Taskbar icon

---

### **HeadyE Icon**
**Location:** `public/icons/headye.ico.txt`

**Design:**
- Background: Pink/Magenta (#ff6b9d)
- Text: "HE" and "E" with 🤖 robot emoji
- Style: AI companion theme

**Use for:**
- HeadyE desktop companion app
- Electron app icon
- Desktop shortcut

---

### **HeadyIDE Icon**
**Location:** `public/icons/heady-ide.ico.txt`

**Design:**
- Background: Green (#2ed573)
- Text: "IDE" with </> code brackets and 💻
- Style: Development environment theme

**Use for:**
- HeadyIDE application
- IDE launcher
- Development tools

---

### **HeadyLens Icon**
**Location:** `public/icons/heady-lens.ico.txt`

**Design:**
- Background: Orange/Gold (#ffaa00)
- Text: "LENS" and "L" with 👁️ eye emoji
- Style: Observability/monitoring theme

**Use for:**
- HeadyLens monitoring dashboard
- System monitoring tools
- Observability interface

---

## How to Create Actual .ico Files

### **Method 1: Online Tool**
```
1. Visit: https://www.favicon-generator.org/
2. Create 512x512 PNG with design above
3. Upload and generate .ico
4. Download and save to public/icons/
```

### **Method 2: ImageMagick**
```bash
# Install ImageMagick
# Create PNG first, then convert
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### **Method 3: GIMP**
```
1. Create 512x512 image with design
2. Export as .ico
3. Select multiple sizes (16, 32, 48, 64, 128, 256)
```

---

## Icon Color Scheme (Sacred Geometry Branding)

**Primary Colors:**
- Cyan: #00d4ff (HeadyManager, HeadyRouter)
- Pink/Magenta: #ff6b9d (HeadyE, AI components)
- Green: #2ed573 (HeadyIDE, Development)
- Orange/Gold: #ffaa00 (HeadyLens, Monitoring)

**Accent Colors:**
- Dark Blue: #1a1a2e (Borders, backgrounds)
- White: #ffffff (Text)
- Light Green: #00ff88 (Success, Active)

---

## Desktop Shortcuts

### **Create Windows Shortcuts:**

**HeadyManager:**
```powershell
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\HeadyManager.lnk")
$Shortcut.TargetPath = "node"
$Shortcut.Arguments = "c:\Users\erich\Heady\heady-manager.js"
$Shortcut.IconLocation = "c:\Users\erich\Heady\public\icons\heady-manager.ico"
$Shortcut.Save()
```

**HeadyE:**
```powershell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\HeadyE.lnk")
$Shortcut.TargetPath = "npm"
$Shortcut.Arguments = "start"
$Shortcut.WorkingDirectory = "c:\Users\erich\CascadeProjects\HeadyMonorepo\apps\heady-e"
$Shortcut.IconLocation = "c:\Users\erich\Heady\public\icons\headye.ico"
$Shortcut.Save()
```

**HeadyIDE:**
```powershell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\HeadyIDE.lnk")
$Shortcut.TargetPath = "npm"
$Shortcut.Arguments = "start"
$Shortcut.WorkingDirectory = "c:\Users\erich\CascadeProjects\HeadyMonorepo\apps\heady-ide"
$Shortcut.IconLocation = "c:\Users\erich\Heady\public\icons\heady-ide.ico"
$Shortcut.Save()
```

**HeadyLens:**
```powershell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\HeadyLens.lnk")
$Shortcut.TargetPath = "http://localhost:3300/heady-lens.html"
$Shortcut.IconLocation = "c:\Users\erich\Heady\public\icons\heady-lens.ico"
$Shortcut.Save()
```

---

## Icon Files Summary

**All icon designs located in:**
```
c:\Users\erich\Heady\public\icons\
├── heady-manager.ico.txt  (Cyan - Server)
├── headye.ico.txt         (Pink - AI Companion)
├── heady-ide.ico.txt      (Green - IDE)
└── heady-lens.ico.txt     (Orange - Monitoring)
```

**Also copied to monorepo:**
```
c:\Users\erich\CascadeProjects\HeadyMonorepo\public\icons\
```

**Next Step:** Convert .txt designs to actual .ico files using one of the methods above.

---

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    💖 Made with Love 💖                      ║
║                                                              ║
║           by HeadyConnection & HeadySystems Team             ║
║                                                              ║
║    🌟 Sacred Geometry • AI Sovereignty • Data Harmony 🌟    ║
║                                                              ║
║              DESKTOP ICONS CREATED ✅                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Icon Designs:** 4 apps (HeadyManager, HeadyE, HeadyIDE, HeadyLens)  
**Location:** `public/icons/` directory  
**Colors:** Sacred Geometry branding (Cyan, Pink, Green, Orange)
