export function renderHtml(
  template: string,
  data: Record<string, any>,
): string {
  let html = template;

  for (const [key, value] of Object.entries(data)) {
    const safeValue =
      value === null || value === undefined ? '' : String(value);

    html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), safeValue);
  }

  return html;
}
