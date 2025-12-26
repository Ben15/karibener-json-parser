/**
 * Filtering Module
 * Filters manipulators based on vendor_id, product_id, app, and rule description
 */

function matchesDevice(scope, vendorId, productId) {
  if (!vendorId && !productId) return true;

  if (scope.devices.length === 0) return false;

  return scope.devices.some(device => {
    const vendorMatch = !vendorId || device.vendor_id === vendorId;
    const productMatch = !productId || device.product_id === productId;
    return vendorMatch && productMatch;
  });
}

function matchesApplication(scope, appBundleId) {
  if (!appBundleId) return true;

  if (scope.applications.length === 0) return false;

  return scope.applications.includes(appBundleId);
}

function matchesRuleDescription(ruleDescription, filterPattern) {
  if (!filterPattern) return true;

  const pattern = filterPattern.toLowerCase();
  const description = (ruleDescription || '').toLowerCase();
  return description.includes(pattern);
}

function filterManipulators(rules, filters = {}) {
  const {
    vendorId,
    productId,
    appBundleId,
    ruleDescription,
  } = filters;

  const filteredRules = [];

  for (const rule of rules) {
    // Check rule description filter first
    if (!matchesRuleDescription(rule.description, ruleDescription)) {
      continue;
    }

    const filteredManipulators = [];

    for (const manipulatorData of rule.manipulators) {
      const scope = manipulatorData.scope;

      // Check device filter
      if (!matchesDevice(scope, vendorId, productId)) {
        continue;
      }

      // Check application filter
      if (!matchesApplication(scope, appBundleId)) {
        continue;
      }

      filteredManipulators.push(manipulatorData);
    }

    // Only include rule if it has matching manipulators
    if (filteredManipulators.length > 0) {
      filteredRules.push({
        ...rule,
        manipulators: filteredManipulators,
      });
    }
  }

  return filteredRules;
}

module.exports = { filterManipulators };

