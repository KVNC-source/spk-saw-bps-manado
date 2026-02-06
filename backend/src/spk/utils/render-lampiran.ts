export function renderLampiranRows(rows: any[]): string {
  if (!Array.isArray(rows)) {
    console.error('❌ lampiran_rows is NOT an array:', rows);
    return '';
  }

  if (rows.length === 0) {
    return '';
  }

  return rows
    .map((r, i) => {
      return `
        <tr>
          <td class="dynamic" style="text-align:center;">${i + 1}</td>
          <td class="dynamic">${r.uraian ?? ''}</td>
          <td class="dynamic" style="text-align:center;">${r.jangkaWaktu ?? ''}</td>
          <td class="dynamic" style="text-align:right;">${r.volume ?? ''}</td>
          <td class="dynamic" style="text-align:center;">${r.satuan ?? ''}</td>
          <td class="dynamic" style="text-align:right;">
            Rp ${Number(r.hargaSatuan ?? 0).toLocaleString('id-ID')}
          </td>
          <td class="dynamic" style="text-align:right;">
            Rp ${Number(r.nilai ?? 0).toLocaleString('id-ID')}
          </td>
          <td class="dynamic">${r.bebanAnggaran ?? ''}</td>
        </tr>
      `;
    })
    .join('');
}
