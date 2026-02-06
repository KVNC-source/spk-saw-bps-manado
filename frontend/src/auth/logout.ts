export function logout() {
  localStorage.removeItem('token'); // or sessionStorage
  localStorage.removeItem('user');

  window.location.href = '/login';
}
