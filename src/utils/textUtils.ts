export const recursiveSafeText = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (Array.isArray(val)) return val.map(recursiveSafeText).join(', ');

    // Priority keys
    const keys = [
      'text',
      'char',
      'value',
      'label',
      'clue',
      'title',
      'word',
      'name',
      'content',
      'data',
      'val',
    ];
    for (const key of keys) {
      if (val[key] !== undefined && val[key] !== null) return recursiveSafeText(val[key]);
    }

    // If no priority keys, try any string property
    for (const key in val) {
      if (typeof val[key] === 'string') return val[key];
    }

    try {
      return JSON.stringify(val);
    } catch (e) {
      return '';
    }
  }
  return String(val);
};
