#!/usr/bin/env node
/**
 * Tartarus Keymap Reporter
 * CLI entry point for parsing Karabiner-Elements JSON and generating reports
 */

const fs = require('fs');
const path = require('path');
const { parseKarabinerJSON } = require('./parser');
const { extractManipulatorData } = require('./manipulator');
const { extractScope, formatScope } = require('./scope');
const { filterManipulators } = require('./filter');
const { formatMarkdown, formatText, formatJSON } = require('./formatter');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputFiles: [],
    vendorId: null,
    productId: null,
    appBundleId: null,
    ruleDescription: null,
    format: 'md',
    outputFile: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--in':
      case '-i':
        if (nextArg && !nextArg.startsWith('--')) {
          options.inputFiles.push(nextArg);
          i++;
        }
        break;

      case '--vendor':
      case '-v':
        if (nextArg && !nextArg.startsWith('--')) {
          options.vendorId = parseInt(nextArg, 10);
          i++;
        }
        break;

      case '--product':
      case '-p':
        if (nextArg && !nextArg.startsWith('--')) {
          options.productId = parseInt(nextArg, 10);
          i++;
        }
        break;

      case '--app':
      case '-a':
        if (nextArg && !nextArg.startsWith('--')) {
          options.appBundleId = nextArg;
          i++;
        }
        break;

      case '--rule':
      case '-r':
        if (nextArg && !nextArg.startsWith('--')) {
          options.ruleDescription = nextArg;
          i++;
        }
        break;

      case '--format':
      case '-f':
        if (nextArg && !nextArg.startsWith('--')) {
          if (['md', 'markdown', 'text', 'json'].includes(nextArg.toLowerCase())) {
            options.format = nextArg.toLowerCase() === 'markdown' ? 'md' : nextArg.toLowerCase();
          }
          i++;
        }
        break;

      case '--out':
      case '-o':
        if (nextArg && !nextArg.startsWith('--')) {
          options.outputFile = nextArg;
          i++;
        }
        break;

      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;

      default:
        // If it doesn't start with --, treat as input file
        if (!arg.startsWith('--') && !arg.startsWith('-')) {
          options.inputFiles.push(arg);
        }
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Tartarus Keymap Reporter

Usage:
  tartarus-keymap --in <file> [options]

Options:
  --in, -i <file>          Input JSON file (can be specified multiple times)
  --vendor, -v <id>        Filter by vendor_id
  --product, -p <id>       Filter by product_id
  --app, -a <bundle>       Filter by application bundle identifier
  --rule, -r <pattern>     Filter by rule description (substring match)
  --format, -f <format>    Output format: md, text, or json (default: md)
  --out, -o <file>         Output file (default: stdout)
  --help, -h               Show this help message

Examples:
  tartarus-keymap --in ./photoshop.json
  tartarus-keymap --in ./photoshop.json --vendor 5426 --product 555
  tartarus-keymap --in ./photoshop.json --app com.adobe.Photoshop
  tartarus-keymap --in ./photoshop.json --out keybindings.txt
  tartarus-keymap --in ./photoshop.json --format json
`);
}

function readInputFiles(inputFiles) {
  if (inputFiles.length === 0) {
    throw new Error('No input files specified. Use --in <file> or see --help');
  }

  const results = [];

  for (const filePath of inputFiles) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`);
    }

    const content = fs.readFileSync(resolvedPath, 'utf8');
    let jsonObj;
    try {
      jsonObj = JSON.parse(content);
    } catch (err) {
      throw new Error(`Invalid JSON in ${resolvedPath}: ${err.message}`);
    }

    results.push({
      path: resolvedPath,
      data: jsonObj,
    });
  }

  return results;
}

function processRules(rules) {
  // Process each rule's manipulators
  const processedRules = rules.map(rule => {
    const processedManipulators = rule.manipulators
      .map((manipulator, index) => {
        const manipulatorData = extractManipulatorData(manipulator, index);
        if (!manipulatorData) return null;

        // Extract scope
        const scope = extractScope(manipulatorData.conditions);
        manipulatorData.scope = {
          ...scope,
          formatted: formatScope(scope),
        };

        return manipulatorData;
      })
      .filter(m => m !== null);

    return {
      ...rule,
      manipulators: processedManipulators,
    };
  });

  return processedRules;
}

function main() {
  try {
    const options = parseArgs();

    // Read input files
    const inputFiles = readInputFiles(options.inputFiles);
    const sourceFiles = inputFiles.map(f => f.path);

    // Parse JSON from all files
    let allRules = [];
    for (const inputFile of inputFiles) {
      const rules = parseKarabinerJSON(inputFile.data);
      allRules.push(...rules);
    }

    // Process manipulators (extract scope, format data)
    allRules = processRules(allRules);

    // Apply filters
    const filteredRules = filterManipulators(allRules, {
      vendorId: options.vendorId,
      productId: options.productId,
      appBundleId: options.appBundleId,
      ruleDescription: options.ruleDescription,
    });

    // Format output
    let output;
    switch (options.format) {
      case 'md':
      case 'markdown':
        output = formatMarkdown(filteredRules, sourceFiles);
        break;
      case 'text':
        output = formatText(filteredRules, sourceFiles);
        break;
      case 'json':
        output = formatJSON(filteredRules, sourceFiles);
        break;
      default:
        throw new Error(`Unknown format: ${options.format}`);
    }

    // Write output
    if (options.outputFile) {
      fs.writeFileSync(options.outputFile, output, 'utf8');
    } else {
      process.stdout.write(output);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };

