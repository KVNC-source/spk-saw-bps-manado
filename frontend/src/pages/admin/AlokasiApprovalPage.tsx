import { useEffect, useState } from "react";

interface Alokasi {
  id: number;
  mitra: string;
  kegiatan: string;
  volume: number;
  tarif: number;
  jumlah: number;
}

export default function AlokasiApprovalPage() {
  const [data, setData] = useState<Alokasi[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetch("http://localhost:3000/spk/alokasi-approved?tahun=2026&bulan=1", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id: number) => {
    await fetch(`http://localhost:3000/spk/alokasi/${id}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setData((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) return <p>Memuat data...</p>;

  return (
    <div className="page">
      <h1>Approval Alokasi Mitra</h1>

      <table className="gov-table">
        <thead>
          <tr>
            <th>Mitra</th>
            <th>Kegiatan</th>
            <th>Volume</th>
            <th>Tarif</th>
            <th>Jumlah</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((a) => (
            <tr key={a.id}>
              <td>{a.mitra}</td>
              <td>{a.kegiatan}</td>
              <td>{a.volume}</td>
              <td>Rp {a.tarif.toLocaleString("id-ID")}</td>
              <td>Rp {a.jumlah.toLocaleString("id-ID")}</td>
              <td>
                <button onClick={() => approve(a.id)}>Approve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
