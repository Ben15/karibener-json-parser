# Tartarus Keymap Editor - Web App

A Next.js web application for visually editing and managing Karabiner-Elements keybindings for the Razer Tartarus V2.

## Features

- 🎨 **Visual Tartarus Layout** - Interactive visual representation of the Tartarus V2 device
- 📤 **JSON Upload** - Upload or paste Karabiner-Elements JSON configuration files
- 🔍 **Key Mapping Display** - See all keybindings mapped to their physical positions
- ✏️ **Interactive Editing** - Click on keys to view and edit their bindings
- ✅ **Validation** - Automatic validation of key mappings

## Getting Started

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Upload JSON File**: Click "Upload File" and select your Karabiner-Elements JSON file
2. **Or Paste JSON**: Click "Paste from Clipboard" to paste JSON directly
3. **View Bindings**: The Tartarus visual will show all mapped keys with their actions
4. **Click Keys**: Click on any key to see detailed binding information
5. **Edit Bindings**: (Coming soon) Edit keybindings directly in the interface

## Project Structure

```
web-app/
├── app/
│   ├── api/
│   │   └── parse/          # API route for parsing JSON
│   └── page.tsx            # Main page component
├── components/
│   └── TartarusVisual.tsx  # Visual Tartarus component
├── lib/
│   ├── parser/             # Parser modules (from CLI tool)
│   └── tartarus-layout.ts  # Layout definitions
└── public/                 # Static assets
```

## API

### POST `/api/parse`

Parse a Karabiner-Elements JSON file and return bindings.

**Request Body:**
```json
{
  "jsonData": "{ ... }"
}
```

**Response:**
```json
{
  "success": true,
  "rules": [...],
  "bindings": {
    "01": { ... },
    "02": { ... },
    ...
  }
}
```

## Next Steps

- [ ] Add keybinding editor component
- [ ] Implement save/export functionality
- [ ] Add validation warnings display
- [ ] Support for editing bindings inline
- [ ] Dark mode support
