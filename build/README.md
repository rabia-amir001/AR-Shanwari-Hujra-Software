# Icon Placement Guide — AR Shinwari POS

Place your custom application icon in **this folder** as:

```
build/icon.ico
```

## Requirements

| File         | Format | Minimum Size         |
|--------------|--------|----------------------|
| `icon.ico`   | ICO    | 256×256 px (multi-size recommended) |

## What it Controls

| Location                        | Controlled by        |
|---------------------------------|----------------------|
| Window title-bar icon           | `main.js` icon path  |
| Windows taskbar icon            | `main.js` icon path  |
| `.exe` file icon                | `package.json` win.icon |
| Installer (NSIS setup) icon     | `package.json` nsis.installerIcon |
| Uninstaller icon                | `package.json` nsis.uninstallerIcon |
| Desktop shortcut icon           | Inherited from .exe  |
| Start Menu shortcut icon        | Inherited from .exe  |

## How to Update the Icon

1. Design or obtain your icon in `.ico` format (256×256 recommended, with embedded 16px/32px/48px/128px/256px sizes)
2. Replace `build/icon.ico` with your new file
3. Rebuild: `npm run package`

## Recommended Free Tools

- **IcoFX** (Windows, free trial) — create multi-size .ico from PNG
- **GIMP** — export as .ico natively
- **https://convertico.com** — online PNG to ICO converter (up to 256px)
- **https://www.icoconverter.com** — batch size ICO generator

## Tip

For best results, generate an ICO that contains all these embedded sizes:
`16x16`, `32x32`, `48x48`, `64x64`, `128x128`, `256x256`

This ensures sharp icons at every display density and DPI scaling level on Windows.
