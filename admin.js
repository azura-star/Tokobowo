const ENCRYPTED_PASSWORD = "YmVsbGFqZWxlaw==";
const MAX_ATTEMPTS = 3;
const BASE_LOCKOUT_TIME = 30000;    // 30 detik awal, berlipat ganda (30s, 60s, 120s...)
const DEFAULT_IMAGE = 'https://via.placeholder.com/80?text=Menu';

const defaultMenu = [
  { id: 1, nama: 'Nasi Goreng Spesial', harga: 12000, ada: true, gambar: '', deskripsi: 'Nasi goreng lezat dengan suwiran ayam, telur, dan kerupuk.' },
  { id: 2, nama: 'Mie Ayam Pangsit', harga: 10000, ada: true, gambar: '', deskripsi: 'Mie kenyal dengan topping ayam gurih dan pangsit renyah.' },
  { id: 3, nama: 'Es Teh Manis', harga: 4000, ada: true, gambar: '', deskripsi: 'Teh manis segar disajikan dingin.' },
  { id: 4, nama: 'Roti Bakar Cokelat', harga: 7000, ada: false, gambar: '', deskripsi: 'Roti bakar empuk dengan selai lumer cokelat di dalamnya.' }
];

function cekSesiLogin() {
  const statusLogin = sessionStorage.getItem('adminLoggedIn');
  const loginContainer = document.getElementById('login-container');
  const adminDashboard = document.getElementById('admin-dashboard');

  if (statusLogin === 'true') {
    if (loginContainer) loginContainer.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'block';
    renderPengaturanStok();
    tampilkanRekap();
  } else {
    if (loginContainer) loginContainer.style.display = 'flex';
    if (adminDashboard) adminDashboard.style.display = 'none';
    cekStatusKunci();
  }
}

// Proteksi Hukuman Lipat Ganda & Hitung Mundur 30 Detik
function cekStatusKunci() {
  const lockoutUntil = localStorage.getItem('adminLockoutUntil');
  const btnLogin = document.getElementById('btn-login');
  const inputPass = document.getElementById('admin-pass');
  const msg = document.getElementById('login-msg');

  if (lockoutUntil) {
    const sisaWaktu = lockoutUntil - Date.now();
    if (sisaWaktu > 0) {
      const detik = Math.ceil(sisaWaktu / 1000);
      if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.style.background = '#333';
        btnLogin.style.cursor = 'not-allowed';
      }
      if (inputPass) inputPass.disabled = true;
      if (msg) {
        msg.textContent = `❌ Akses dikunci karena salah 3x! Tunggu ${detik} detik.`;
      }

      setTimeout(cekStatusKunci, 1000);
      return;
    } else {
      localStorage.removeItem('adminLockoutUntil');
      localStorage.setItem('adminFailedAttempts', '0');
    }
  }

  if (btnLogin) {
    btnLogin.disabled = false;
    btnLogin.style.background = 'var(--danger-main)';
    btnLogin.style.cursor = 'pointer';
  }
  if (inputPass) inputPass.disabled = false;
  if (msg) msg.textContent = '';
}

function prosesLogin(e) {
  e.preventDefault();

  const lockoutUntil = localStorage.getItem('adminLockoutUntil');
  if (lockoutUntil && Date.now() < lockoutUntil) return;

  const inputPass = document.getElementById('admin-pass').value;
  let failedAttempts = parseInt(localStorage.getItem('adminFailedAttempts')) || 0;
  const msg = document.getElementById('login-msg');

  const hashedInput = btoa(inputPass);

  if (hashedInput === ENCRYPTED_PASSWORD) {
    localStorage.setItem('adminFailedAttempts', '0');
    localStorage.removeItem('adminLockoutUntil');
    localStorage.setItem('adminLockoutLevel', '0'); 
    sessionStorage.setItem('adminLoggedIn', 'true');
    
    document.getElementById('admin-pass').value = '';
    if (msg) msg.textContent = '';

    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    renderPengaturanStok();
    tampilkanRekap();
  } else {
    failedAttempts++;
    localStorage.setItem('adminFailedAttempts', failedAttempts);
    document.getElementById('admin-pass').value = '';

    const sisaKesempatan = MAX_ATTEMPTS - failedAttempts;

    if (failedAttempts >= MAX_ATTEMPTS) {
      let level = parseInt(localStorage.getItem('adminLockoutLevel')) || 0;
      const durasiHukuman = BASE_LOCKOUT_TIME * Math.pow(2, level); // Lipat ganda (30s, 60s, 120s...)
      const waktuHukuman = Date.now() + durasiHukuman;
      
      localStorage.setItem('adminLockoutUntil', waktuHukuman);
      localStorage.setItem('adminLockoutLevel', level + 1);
      localStorage.setItem('adminFailedAttempts', '0');

      cekStatusKunci();
    } else {
      if (msg) {
        msg.textContent = `❌ Password salah! Sisa kesempatan: ${sisaKesempatan} kali.`;
      }
    }
  }
}

function logoutAdmin() {
  sessionStorage.removeItem('adminLoggedIn');
  cekSesiLogin();
}

function renderPengaturanStok() {
  const container = document.getElementById('stok-menu-list');
  if (!container) return;
  
  if (!localStorage.getItem('daftarMenuKantin')) {
    localStorage.setItem('daftarMenuKantin', JSON.stringify(defaultMenu));
  }
  
  let daftarMenu = JSON.parse(localStorage.getItem('daftarMenuKantin')) || defaultMenu;
  container.innerHTML = '';

  daftarMenu.forEach(item => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: linear-gradient(145deg, #141414, #1a1a1a); padding: 12px 16px; border-radius: 12px; border: 1px solid #222; margin-bottom: 10px; gap: 12px;';

    const imgUrl = item.gambar || DEFAULT_IMAGE;

    const btnStatus = item.ada 
      ? `<button onclick="toggleStok(${item.id})" style="background: #28a745; color: #fff; border: none; padding: 6px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.78rem;">Stok Ready</button>`
      : `<button onclick="toggleStok(${item.id})" style="background: #dc3545; color: #fff; border: none; padding: 6px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.78rem;">SLOT OUT</button>`;

    const btnHapus = `<button onclick="hapusMenu(${item.id})" style="background: none; border: none; color: #777; margin-left: 8px; cursor: pointer; font-size: 1rem;"><i class="fa-solid fa-trash"></i></button>`;

    div.innerHTML = `
      <img src="${imgUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #333; flex-shrink: 0;">
      <div class="menu-info" style="flex: 1;">
        <h4 style="font-size: 0.95rem; color: #fff; font-weight: 600; margin-bottom: 2px;">${item.nama}</h4>
        <span class="price" style="font-size: 0.85rem; color: var(--gold-bright); font-weight: 700;">Rp ${item.harga.toLocaleString('id-ID')}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        ${btnStatus}
        ${btnHapus}
      </div>
    `;

    container.appendChild(div);
  });
}

function toggleStok(id) {
  let daftarMenu = JSON.parse(localStorage.getItem('daftarMenuKantin')) || defaultMenu;
  daftarMenu = daftarMenu.map(item => {
    if (item.id === id) { item.ada = !item.ada; }
    return item;
  });
  localStorage.setItem('daftarMenuKantin', JSON.stringify(daftarMenu));
  renderPengaturanStok();
}

function tambahMenuBaru(e) {
  e.preventDefault();
  const nama = document.getElementById('menu-nama').value.trim();
  const harga = parseInt(document.getElementById('menu-harga').value);
  const deskripsi = document.getElementById('menu-deskripsi') ? document.getElementById('menu-deskripsi').value.trim() : '';
  const fileInput = document.getElementById('menu-gambar');

  if (!nama || isNaN(harga)) return;

  const simpanKeStorage = (gambarBase64 = '') => {
    let daftarMenu = JSON.parse(localStorage.getItem('daftarMenuKantin')) || defaultMenu;
    daftarMenu.push({ 
      id: Date.now(), 
      nama: nama, 
      harga: harga, 
      ada: true, 
      gambar: gambarBase64,
      deskripsi: deskripsi
    });

    localStorage.setItem('daftarMenuKantin', JSON.stringify(daftarMenu));
    document.getElementById('menu-nama').value = '';
    document.getElementById('menu-harga').value = '';
    if(document.getElementById('menu-deskripsi')) document.getElementById('menu-deskripsi').value = '';
    if (fileInput) fileInput.value = '';
    renderPengaturanStok();
  };

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      simpanKeStorage(evt.target.result);
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    simpanKeStorage('');
  }
}

function hapusMenu(id) {
  if (confirm('Yakin ingin menghapus menu ini?')) {
    let daftarMenu = JSON.parse(localStorage.getItem('daftarMenuKantin')) || defaultMenu;
    daftarMenu = daftarMenu.filter(item => item.id !== id);
    localStorage.setItem('daftarMenuKantin', JSON.stringify(daftarMenu));
    renderPengaturanStok();
  }
}

function tampilkanRekap() {
  const rekapContainer = document.getElementById('rekap-container');
  if (!rekapContainer) return;
  
  const daftarPesanan = JSON.parse(localStorage.getItem('pesananKantin')) || [];
  rekapContainer.innerHTML = '';

  if (daftarPesanan.length === 0) {
    rekapContainer.innerHTML = '<p style="color: #777; font-size: 0.85rem; text-align: center; padding: 15px 0;">Belum ada pesanan masuk.</p>';
    return;
  }

  daftarPesanan.forEach((pesanan) => {
    const div = document.createElement('div');
    div.className = 'rekap-item';
    div.style.cssText = 'position: relative;';

    let rincianItems = '';
    pesanan.items.forEach(item => {
      rincianItems += `<li>${item.nama} (${item.jumlah}x)</li>`;
    });

    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <strong>${pesanan.nama}</strong> (${pesanan.kelas}) - <small style="color:#aaa;">${pesanan.waktu}</small>
        </div>
        <button onclick="hapusSatuPesanan(${pesanan.id})" title="Hapus Pesanan Ini" style="background: rgba(255, 77, 77, 0.15); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.3); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: bold;">
          <i class="fa-solid fa-trash"></i> Hapus
        </button>
      </div>
      <ul class="rekap-list">${rincianItems}</ul>
      <div>Catatan: <em>${pesanan.catatan}</em></div>
      <div style="margin-top: 4px; color: var(--gold-bright);">Metode Pembayaran: <strong>${pesanan.metodePembayaran || 'Tunai'}</strong></div>
      <div style="margin-top: 6px; color: var(--gold-main);">Total Tagihan: <strong>Rp ${pesanan.total.toLocaleString('id-ID')}</strong></div>
    `;
    rekapContainer.appendChild(div);
  });
}

function hapusSatuPesanan(idPesanan) {
  if (confirm('Yakin ingin menghapus pesanan ini?')) {
    let daftarPesanan = JSON.parse(localStorage.getItem('pesananKantin')) || [];
    daftarPesanan = daftarPesanan.filter(pesanan => pesanan.id !== idPesanan);
    localStorage.setItem('pesananKantin', JSON.stringify(daftarPesanan));
    tampilkanRekap();
  }
}

function hapusSemuaPesanan() {
  if (confirm('Yakin ingin menghapus seluruh rekap data pesanan?')) {
    localStorage.removeItem('pesananKantin');
    tampilkanRekap();
  }
}

function keHalamanPelanggan() {
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', cekSesiLogin);
