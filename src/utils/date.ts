export function formatDate (
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
) {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date))
}
