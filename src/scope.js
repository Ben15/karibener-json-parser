/**
 * Scope Detection Module
 * Detects device_if, frontmost_application_if conditions and determines effective scope
 */

function extractScope(conditions = []) {
  const scope = {
    devices: [],
    applications: [],
    isGlobal: true,
  };

  for (const condition of conditions) {
    if (!condition || typeof condition !== 'object') continue;

    // Device conditions
    if (condition.type === 'device_if' && Array.isArray(condition.identifiers)) {
      for (const identifier of condition.identifiers) {
        if (!identifier || typeof identifier !== 'object') continue;
        scope.devices.push({
          vendor_id: identifier.vendor_id ?? null,
          product_id: identifier.product_id ?? null,
          description: identifier.description || null,
        });
      }
      scope.isGlobal = false;
    }

    // Application conditions
    if (condition.type === 'frontmost_application_if' && Array.isArray(condition.bundle_identifiers)) {
      scope.applications.push(...condition.bundle_identifiers);
      scope.isGlobal = false;
    }

    if (condition.type === 'frontmost_application_unless' && Array.isArray(condition.bundle_identifiers)) {
      // This is a negative condition, but still scopes the rule
      scope.isGlobal = false;
    }
  }

  return scope;
}

function formatScope(scope) {
  if (scope.isGlobal) {
    return 'Global';
  }

  const parts = [];

  if (scope.devices.length > 0) {
    const deviceParts = scope.devices.map(dev => {
      if (dev.vendor_id && dev.product_id) {
        return `vendor ${dev.vendor_id} / product ${dev.product_id}`;
      }
      return dev.description || 'device';
    });
    parts.push(...deviceParts);
  }

  if (scope.applications.length > 0) {
    parts.push(...scope.applications);
  }

  return parts.length > 0 ? parts.join(', ') : 'Scoped';
}

module.exports = { extractScope, formatScope };

