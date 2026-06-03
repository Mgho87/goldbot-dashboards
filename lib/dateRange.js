// Translate a date-range preset into {from, to} ISO bounds, anchored to the
// most recent date in the dataset so presets stay meaningful even if the
// sheet's latest entries aren't from the literal "today".

export function resolveRange(preset, anchorIso) {
  const anchor = anchorIso ? new Date(anchorIso) : new Date();
  if (Number.isNaN(anchor.getTime())) return { from: null, to: null };

  const end = new Date(anchor);
  end.setHours(23, 59, 59, 999);
  let from = null;

  switch (preset) {
    case "Today":
      from = new Date(anchor);
      from.setHours(0, 0, 0, 0);
      break;
    case "Last 7 Days":
      from = new Date(anchor);
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      break;
    case "This Month":
      from = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      break;
    case "Last 30 Days":
      from = new Date(anchor);
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      break;
    case "This Year":
      from = new Date(anchor.getFullYear(), 0, 1);
      break;
    case "All Time":
    default:
      return { from: null, to: null };
  }
  return { from: from.toISOString(), to: end.toISOString() };
}
