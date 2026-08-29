export const formatDurationFromDays = (totalDaysInput) => {
  const totalDays = Math.round(totalDaysInput);
  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;
  const weeks = Math.floor(remainingAfterYears / 7);
  const days = remainingAfterYears % 7;

  const parts = [];
  if (years > 0) parts.push(`${years}y`);
  if (weeks > 0) parts.push(`${weeks}w`);
  if (days > 0 || parts.length === 0) parts.push(`${days}d`);

  return parts.join(' ');
};
