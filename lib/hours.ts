const HOURS_DESCRIPTION_KEY = 'weekdayDescriptions';

function extractWeekdayDescriptions(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const cleaned = value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return cleaned.length > 0 ? cleaned : null;
}

export function formatHoursFromJson(hoursJson: Record<string, unknown> | null): string | null {
  if (!hoursJson) {
    return null;
  }

  const descriptions = extractWeekdayDescriptions(hoursJson[HOURS_DESCRIPTION_KEY]);
  if (!descriptions) {
    return null;
  }

  return descriptions.join(' • ');
}

export function normalizeHoursText(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (parsed && typeof parsed === 'object') {
      const formatted = formatHoursFromJson(parsed);
      if (formatted) {
        return formatted;
      }
    }
  } catch {
    // Ignore parsing errors and fall back to the provided string.
  }

  return value;
}
