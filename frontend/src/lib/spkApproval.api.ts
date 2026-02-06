import api from "./axios";

export async function getAllSpk(tahun: number, bulan: number) {
  const res = await api.get("/admin/spk", {
    params: { tahun, bulan },
  });
  return res.data;
}

export async function approveSpk(id: number) {
  await api.patch(`/admin/spk/${id}/approve`);
}

export async function rejectSpk(id: number, admin_note: string) {
  await api.patch(`/admin/spk/${id}/reject`, {
    admin_note,
  });
}
