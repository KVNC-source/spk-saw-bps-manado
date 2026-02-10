export function renderLampiranRows(rows: any[]): string {
  if (!Array.isArray(rows) || rows.length === 0) {
    return '';
  }

  return rows
    .map(
      (r, i) => `
      <tr>
        <td class="dynamic" style="text-align:center;">
          ${i + 1}
        </td>

        <td class="dynamic">
          ${r.uraian_tugas ?? ''}
        </td>

        <td class="dynamic" style="text-align:center;">
          ${r.jangka_waktu ?? ''}
        </td>

        <td class="dynamic" style="text-align:right;">
          ${r.volume ?? ''}
        </td>

        <td class="dynamic" style="text-align:center;">
          ${r.satuan ?? ''}
        </td>

        <td class="dynamic" style="text-align:right;">
          Rp ${Number(r.harga_satuan ?? 0).toLocaleString('id-ID')}
        </td>

        <td class="dynamic" style="text-align:right;">
          Rp ${Number(r.nilai ?? 0).toLocaleString('id-ID')}
        </td>

        <td class="dynamic">
          ${r.beban_anggaran ?? ''}
        </td>
      </tr>
    `,
    )
    .join('');
}
