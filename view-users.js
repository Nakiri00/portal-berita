// Script untuk melihat data user di console browser
// Jalankan di console browser (F12 -> Console)

console.log('=== PORTAL BERITA - USER DATA VIEWER ===');

// Fungsi untuk melihat semua data user
function viewAllUsers() {
  console.log('\n📊 SEMUA DATA USER:');
  console.log('==================');
  
  let userCount = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('portal_user')) {
      userCount++;
      const userData = localStorage.getItem(key);
      if (userData) {
        const user = JSON.parse(userData);
        console.log(`\n👤 User ${userCount}:`, user);
      }
    }
  }
  
  if (userCount === 0) {
    console.log('❌ Tidak ada data user ditemukan');
  } else {
    console.log(`\n✅ Total: ${userCount} user(s) ditemukan`);
  }
}

// Fungsi untuk melihat user yang sedang login
function viewCurrentUser() {
  console.log('\n🔐 USER YANG SEDANG LOGIN:');
  console.log('==========================');
  
  const currentUser = localStorage.getItem('portal_user');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    console.log('✅ User sedang login:', user);
  } else {
    console.log('❌ Tidak ada user yang login');
  }
}

// Fungsi untuk melihat semua data localStorage
function viewAllLocalStorage() {
  console.log('\n💾 SEMUA DATA LOCALSTORAGE:');
  console.log('============================');
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value);
  }
}

// Fungsi untuk menghapus semua data user
function clearAllUsers() {
  if (confirm('Yakin ingin menghapus semua data user?')) {
    localStorage.clear();
    console.log('🗑️ Semua data user telah dihapus');
  }
}

// Jalankan semua fungsi
viewCurrentUser();
viewAllUsers();
viewAllLocalStorage();

console.log('\n🛠️ FUNGSI YANG TERSEDIA:');
console.log('========================');
console.log('- viewAllUsers() - Lihat semua user');
console.log('- viewCurrentUser() - Lihat user yang login');
console.log('- viewAllLocalStorage() - Lihat semua data localStorage');
console.log('- clearAllUsers() - Hapus semua data user');

console.log('\n🌐 ADMIN PANEL:');
console.log('==============');
console.log('Kunjungi: http://localhost:5173/admin (untuk development)');
console.log('Atau: https://yourdomain.com/admin (untuk production)');
