# Tartarus Keymap Reporter

A Node.js command-line tool that produces a clear, accurate, human-readable list of all Karabiner-Elements modifications applied to a Razer Tartarus V2 (or any specified device).

## Purpose

The tool exists to answer one core question:

> "What has this device been modified to do, according to Karabiner?"

The output acts as a source of truth for:

- What physical Tartarus inputs are intercepted
- What keycodes Karabiner sees
- What actions are ultimately sent to applications (e.g. Photoshop)

**This tool is documentation and audit tooling, not a remapper.**

## Reality Model

### Tartarus on macOS

- The Tartarus V2 presents itself as a standard HID keyboard
- It does NOT emit unique Tartarus-specific keycodes
- It emits standard key events (tab, caps_lock, q, 1, etc.)
- "Key numbers" like 01–19 are physical labels only and do not exist at the OS level

### Karabiner-Elements behavior

- When Karabiner is running, it intercepts keyboard events and re-emits them via a virtual keyboard
- This happens even when no custom rules are enabled
- Karabiner JSON rules define the authoritative record of all modifications
- The JSON is the only reliable source of truth for "what does this key do"

## Installation

```bash
npm install
```

Or install globally:

```bash
npm install -g .
```

## Usage

### Basic Usage

```bash
tartarus-keymap --in ./photoshop.json
```

### With Filters

Filter by device (vendor_id and product_id):

```bash
tartarus-keymap --in ./photoshop.json --vendor 5426 --product 555
```

Filter by application:

```bash
tartarus-keymap --in ./photoshop.json --app com.adobe.Photoshop
```

Filter by rule description:

```bash
tartarus-keymap --in ./photoshop.json --rule "Photoshop"
```

### Output Options

Save to file:

```bash
tartarus-keymap --in ./photoshop.json --out keybindings.txt
```

Output as JSON:

```bash
tartarus-keymap --in ./photoshop.json --format json
```

Output as plain text:

```bash
tartarus-keymap --in ./photoshop.json --format text
```

### Multiple Input Files

```bash
tartarus-keymap --in ./rule1.json --in ./rule2.json
```

## CLI Options

| Option              | Short | Description                                            |
| ------------------- | ----- | ------------------------------------------------------ |
| `--in <file>`       | `-i`  | Input JSON file (can be specified multiple times)      |
| `--vendor <id>`     | `-v`  | Filter by vendor_id                                    |
| `--product <id>`    | `-p`  | Filter by product_id                                   |
| `--app <bundle>`    | `-a`  | Filter by application bundle identifier                |
| `--rule <pattern>`  | `-r`  | Filter by rule description (substring match)           |
| `--format <format>` | `-f`  | Output format: `md`, `text`, or `json` (default: `md`) |
| `--out <file>`      | `-o`  | Output file (default: stdout)                          |
| `--help`            | `-h`  | Show help message                                      |

## Input Format

The tool accepts Karabiner-Elements JSON files in one of these formats:

1. **Full complex modifications file:**

```json
{
  "rules": [
    {
      "description": "My Rule",
      "manipulators": [...]
    }
  ]
}
```

2. **Single rule object:**

```json
{
  "description": "My Rule",
  "manipulators": [...]
}
```

## Output Format

### Markdown (default)

The markdown output includes:

1. **Header** - Tool name, timestamp, source files
2. **Interpretation Note** - Explanation of Tartarus behavior
3. **Scope Summary** - Devices, applications, rule counts
4. **Bindings List** - Table showing:
   - From: formatted key + modifiers
   - To: formatted output key(s) + modifiers
   - Scope: device + app or "Global"
   - Notes: lazy modifiers, optional modifiers, etc.

### JSON

When `--format json` is used, outputs a normalized structure containing:

- Rule metadata
- Original manipulator index
- Parsed from/to events
- Human-readable strings
- Original JSON fragments for traceability

### Text

Plain text format suitable for terminal output or simple text files.

## Requirements

- Node.js 18 or newer
- macOS (primary target, but OS-agnostic if JSON paths are supplied)

## Validation

The tool includes automatic validation to prevent common mapping mistakes:

- ✅ Validates that `FROM` keycodes match what physical keys actually emit
- ✅ Warns about unmapped physical keys
- ✅ Detects D-pad mapping issues
- ✅ Provides helpful error messages with fix suggestions

See [VALIDATION.md](VALIDATION.md) for details on common mistakes and how to avoid them.

## What This Tool Does NOT Do

- ❌ Attempt to infer physical Tartarus key numbers
- ❌ Modify Karabiner configuration
- ❌ Depend on Karabiner being installed or running
- ❌ Guess physical layouts or firmware behavior

## Examples

### Example 1: Basic Report

```bash
tartarus-keymap --in ~/.config/karabiner/assets/complex_modifications/photoshop.json
```

### Example 2: Filtered Report for Specific Device

```bash
tartarus-keymap \
  --in ./my-rules.json \
  --vendor 5426 \
  --product 555 \
  --out tartarus-photoshop.md
```

### Example 3: JSON Output for Scripting

```bash
tartarus-keymap \
  --in ./rules.json \
  --format json \
  --out report.json
```

## License

MIT
