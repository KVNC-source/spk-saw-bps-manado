export function logout() {
  localStorage.removeItem("bps-auth");
  window.location.replace("/login");
}
