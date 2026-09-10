
export function getWeekBounds(anchorDate = Temporal.Now.plainDateISO(), weeks: number = 1) {
  const baseDate = anchorDate.toPlainDateTime({ hour: 0, minute: 0 });

  const startOfWeek = baseDate.subtract({ days: baseDate.dayOfWeek });
  const endOfWeek = baseDate.add({
    days: (7 * weeks) - baseDate.dayOfWeek - 1,
    hours: 23,
    minutes: 59,
  });

  return { startOfWeek, endOfWeek, baseDate };
}
