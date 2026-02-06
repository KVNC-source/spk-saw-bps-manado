import type { Spk } from "./spk.types";

interface Props {
  data: Spk[];
  onDetail: (spk: Spk) => void;
}

export default function SpkTable({ data, onDetail }: Props) {
  const badge = (status: string) => {
    if (status === "APPROVED") return "bg-green-100 text-green-700";
    if (status === "REJECTED") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="bg-white rounded-xl shadow">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-3 text-left">No</th>
            <th className="p-3 text-left">Nomor SPK</th>
            <th className="p-3 text-left">Mitra</th>
            <th className="p-3 text-left">Honorarium</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((spk, i) => (
            <tr key={spk.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{i + 1}</td>
              <td className="p-3 font-medium">{spk.nomor_spk}</td>
              <td className="p-3">{spk.mitra.nama_mitra}</td>
              <td className="p-3">
                Rp {Number(spk.total_honorarium).toLocaleString("id-ID")}
              </td>
              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${badge(
                    spk.status,
                  )}`}
                >
                  {spk.status}
                </span>
              </td>
              <td className="p-3">
                <button
                  onClick={() => onDetail(spk)}
                  className="text-blue-600 hover:underline"
                >
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
