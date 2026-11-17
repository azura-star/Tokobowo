const DEFAULT_IMAGE = 'https://via.placeholder.com/80?text=Menu';

const defaultMenu = [
  { id: 1, nama: 'Nasi Goreng Spesial', harga: 12000, ada: true, gambar: '', deskripsi: 'Nasi goreng lezat dengan suwiran ayam, telur, dan kerupuk.' },
  { id: 2, nama: 'Mie Ayam Pangsit', harga: 10000, ada: true, gambar: '', deskripsi: 'Mie kenyal dengan topping ayam gurih dan pangsit renyah.' },
  { id: 3, nama: 'Es Teh Manis', harga: 4000, ada: true, gambar: '', deskripsi: 'Teh manis segar disajikan dingin.' },
  { id: 4, nama: 'Roti Bakar Cokelat', harga: 7000, ada: false, gambar: '', deskripsi: 'Roti bakar empuk dengan selai lumer cokelat di dalamnya.' }
];

let keranjang = [];

function renderMenuPelanggan() {
  const container = document.getElementById('menu-list');
  if (!container) return;

  if (!localStorage.getItem('daftarMenuKantin')) {
    localStorage.setItem('daftarMenuKantin', JSON.stringify(defaultMenu));
  }

  const daftarMenu = JSON.parse(localStorage.getItem('daftarMenuKantin')) || defaultMenu;
  container.innerHTML = '';

  daftarMenu.forEach(item => {
    const div = document.createElement('div');
    const imgUrl = item.gambar || DEFAULT_IMAGE;
    
    if (item.ada) {
      div.className = 'menu-item';
      div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; cursor: pointer;" onclick="bukaDetailMenu(${item.id})">
          <img src="${imgUrl}" class="menu-thumb" alt="${item.nama}">
          <div class="menu-info">
            <h4>${item.nama}</h4>
            <span class="price">Rp ${item.harga.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <button class="btn-add" onclick="tambahKeKeranjang('${item.nama}', ${item.harga})">+ Tambah</button>
      `;
    } else {
      div.className = 'menu-item disabled';
      div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; cursor: pointer;" onclick="bukaDetailMenu(${item.id})">
          <img src="${imgUrl}" class="menu-thumb" alt="${item.nama}" style="filter: grayscale(100%); opacity: 0.5;">
          <div class="menu-info">
            <h4>${item.nama} <span class="badge-out" style="color:#ff4d4d; font-size:0.75rem;">(SLOT OUT)</span></h4>
            <span class="price">Rp ${item.harga.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <button class="btn-add btn-disabled" disabled style="background:#333; color:#777; cursor:not-allowed;">Habis</button>
      `;
    }
    container.appendChild(div);
  });

  tampilkanSemuaPesananSiswa();
}

function bukaDetailMenu(id) {
  const daftarMenu = JSON.parse(localStorage.getItem('daftarMenuKantin')) || defaultMenu;
  const item = daftarMenu.find(m => m.id === id);
  if (!item) return;

  const modal = document.getElementById('menu-modal');
  const modalImg = document.getElementById('modal-img');
  const modalNama = document.getElementById('modal-nama');
  const modalHarga = document.getElementById('modal-harga');
  const modalDeskripsi = document.getElementById('modal-deskripsi');
  const modalBtnTambah = document.getElementById('modal-btn-tambah');

  modalImg.src = item.gambar || DEFAULT_IMAGE;
  modalNama.textContent = item.nama;
  modalHarga.textContent = `Rp ${item.harga.toLocaleString('id-ID')}`;
  modalDeskripsi.textContent = item.deskripsi || 'Tidak ada deskripsi tersedia untuk menu ini.';

  if (item.ada) {
    modalBtnTambah.disabled = false;
    modalBtnTambah.style.background = 'linear-gradient(135deg, var(--gold-main), var(--gold-glow))';
    modalBtnTambah.style.color = '#000';
    modalBtnTambah.style.cursor = 'pointer';
    modalBtnTambah.onclick = function() {
      tambahKeKeranjang(item.nama, item.harga);
      tutupModalMenu();
    };
    modalBtnTambah.textContent = '+ Tambah ke Keranjang';
  } else {
    modalBtnTambah.disabled = true;
    modalBtnTambah.style.background = '#333';
    modalBtnTambah.style.color = '#777';
    modalBtnTambah.style.cursor = 'not-allowed';
    modalBtnTambah.textContent = 'Menu Habis (Slot Out)';
  }

  modal.style.display = 'flex';
}

function tutupModalMenu() {
  const modal = document.getElementById('menu-modal');
  if (modal) modal.style.display = 'none';
}

function tambahKeKeranjang(nama, harga) {
  const itemAda = keranjang.find(item => item.nama === nama);
  if (itemAda) {
    itemAda.jumlah += 1;
  } else {
    keranjang.push({ nama, harga, jumlah: 1 });
  }
  updateTampilanKeranjang();
}

function kurangiDariKeranjang(nama) {
  const itemAda = keranjang.find(item => item.nama === nama);
  if (itemAda) {
    itemAda.jumlah -= 1;
    if (itemAda.jumlah <= 0) {
      keranjang = keranjang.filter(item => item.nama !== nama);
    }
  }
  updateTampilanKeranjang();
}

function updateTampilanKeranjang() {
  const listKeranjang = document.getElementById('cart-items');
  const totalText = document.getElementById('total-price');
  if (!listKeranjang) return;

  listKeranjang.innerHTML = '';
  let totalHarga = 0;

  if (keranjang.length === 0) {
    listKeranjang.innerHTML = '<li class="empty-cart">Keranjang masih kosong.</li>';
    if (totalText) totalText.textContent = 'Rp 0';
    return;
  }

  keranjang.forEach((item) => {
    const subtotal = item.harga * item.jumlah;
    totalHarga += subtotal;
    const li = document.createElement('li');
    li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed #222;';
    
    li.innerHTML = `
      <span>${item.nama} (${item.jumlah}x)</span>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: var(--gold-bright);">Rp ${subtotal.toLocaleString('id-ID')}</span>
        <button type="button" onclick="kurangiDariKeranjang('${item.nama}')" style="background: #ff4d4d; color: #fff; border: none; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
        <button type="button" onclick="tambahKeKeranjang('${item.nama}', ${item.harga})" style="background: #28a745; color: #fff; border: none; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
      </div>
    `;
    listKeranjang.appendChild(li);
  });
  if (totalText) totalText.textContent = `Rp ${totalHarga.toLocaleString('id-ID')}`;
}

function simpanPesanan(event) {
  event.preventDefault();

  const nama = document.getElementById('nama').value.trim();
  const kelas = document.getElementById('kelas').value.trim();
  const metodePembayaran = document.getElementById('metode-pembayaran').value;
  const catatan = document.getElementById('catatan').value.trim() || '-';

  if (!nama || !kelas || !metodePembayaran) {
    alert('Mohon isi Nama, Kelas, dan pilih Metode Pembayaran terlebih dahulu!');
    return;
  }

  if (keranjang.length === 0) {
    alert('Keranjang belanja masih kosong!');
    return;
  }

  const total = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
  const idPesananBaru = Date.now();

  const pesananBaru = {
    id: idPesananBaru,
    nama,
    kelas,
    catatan,
    metodePembayaran,
    items: [...keranjang],
    total,
    waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  // Simpan ke daftar pesanan global admin
  const daftarPesanan = JSON.parse(localStorage.getItem('pesananKantin')) || [];
  daftarPesanan.push(pesananBaru);
  localStorage.setItem('pesananKantin', JSON.stringify(daftarPesanan));

  // Simpan ID pesanan ke array lokal perangkat siswa untuk mendukung multi-pesanan
  let arrIdSiswa = JSON.parse(localStorage.getItem('arrIdPesananSiswa')) || [];
  arrIdSiswa.push(pesananBaru);
  localStorage.setItem('arrIdPesananSiswa', JSON.stringify(arrIdSiswa));

  // Reset keranjang
  keranjang = [];
  updateTampilanKeranjang();
  document.getElementById('order-form').reset();

  tampilkanSemuaPesananSiswa();
  alert('Pesanan berhasil dikirim ke kantin!');
}

function tampilkanSemuaPesananSiswa() {
  const containerSection = document.getElementById('nota-container-section');
  const listNota = document.getElementById('list-semua-nota');
  if (!containerSection || !listNota) return;

  const arrIdSiswa = JSON.parse(localStorage.getItem('arrIdPesananSiswa')) || [];
  const daftarPesananGlobal = JSON.parse(localStorage.getItem('pesananKantin')) || [];

  const pesananAktifSiswa = daftarPesananGlobal.filter(p => arrIdSiswa.some(s => s.id === p.id));

  if (pesananAktifSissanceSiswa = pesananAktifSiswa.length === 0) {
    containerSection.style.display = 'none';
    localStorage.removeItem('arrIdPesananSiswa');
    return;
  }

  // Jika ada pesanan aktif
  if (pesananAktifSiswa.length === 0) {
    containerSection.style.display = 'none';
    localStorage.removeItem('arrIdPesananSiswa');
    return;
  }

  containerSection.style.display = 'block';
  listNota.innerHTML = '';

  pesananAktifSiswa.forEach((pesanan) => {
    let rincian = '';
    pesanan.items.forEach(i => {
      rincian += `<li>${i.nama} (${i.jumlah}x)</li>`;
    });

    let infoPembayaran = '';
    if (pesanan.metodePembayaran === 'QRIS') {
      infoPembayaran = `
        <div style="margin-top: 10px; text-align: center; background: #fff; padding: 10px; border-radius: 6px;">
          <p style="color: #000; font-size: 0.75rem; font-weight: bold; margin-bottom: 6px;">Scan QRIS Pembayaran:</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BOWO-SHOP-${pesanan.id}-${pesanan.total}" alt="QRIS" style="width: 120px; height: 120px;">
          <p style="color: #333; font-size: 0.7rem; margin-top: 4px;">NMID: ID102938475689</p>
        </div>
      `;
    } else if (pesanan.metodePembayaran === 'Transfer Bank (TF)') {
      infoPembayaran = `
        <div style="margin-top: 10px; background: #222; padding: 8px; border-radius: 6px; font-size: 0.8rem;">
          <p style="color: var(--gold-main); font-weight: bold;"><i class="fa-solid fa-building-columns"></i> Transfer Bank (BCA):</p>
          <p style="color: #fff; margin-top: 2px;">No. Rekening: <strong>1234-5678-9010</strong> (a.n Bowo Shop)</p>
        </div>
      `;
    } else {
      infoPembayaran = `<p style="margin-top: 6px; color: #aaa; font-size: 0.8rem;"><strong>Pembayaran:</strong> Bayar Tunai langsung di Kantin</p>`;
    }

    const itemDiv = document.createElement('div');
    itemDiv.style.cssText = 'font-size: 0.85rem; background: #181818; padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #333;';
    itemDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="color: var(--gold-main); font-weight: bold;">Pesanan ID: ${pesanan.id.toString().slice(-4)} (${pesanan.waktu})</span>
        <button onclick="batalkanSatuPesanan(${pesanan.id})" style="background: rgba(255, 77, 77, 0.2); color: #ff4d4d; border: 1px solid #ff4d4d; border-radius: 4px; padding: 3px 8px; font-size: 0.7rem; font-weight: bold; cursor: pointer;">Batalkan</button>
      </div>
      <p><strong>Nama:</strong> ${pesanan.nama} (${pesanan.kelas})</p>
      <p><strong>Catatan:</strong> ${pesanan.catatan}</p>
      <p><strong>Metode Pembayaran:</strong> <span style="color: var(--gold-bright);">${pesanan.metodePembayaran}</span></p>
      <ul style="margin: 6px 0; padding-left: 15px; color: #ccc;">${rincian}</ul>
      <p style="color: var(--gold-main); margin-top: 6px;"><strong>Total Tagihan: Rp ${pesanan.total.toLocaleString('id-ID')}</strong></p>
      ${infoPembayaran}
    `;
    listNota.appendChild(itemDiv);
  });
}

function batalkanSatuPesanan(idPesanan) {
  if (confirm('Yakin ingin membatalkan pesanan ini?')) {
    let daftarPesananGlobal = JSON.parse(localStorage.getItem('pesananKantin')) || [];
    daftarPesananGlobal = daftarPesananGlobal.filter(p => p.id !== idPesanan);
    localStorage.setItem('pesananKantin', JSON.stringify(daftarPesananGlobal));

    let arrIdSiswa = JSON.parse(localStorage.getItem('arrIdPesananSiswa')) || [];
    arrIdSiswa = arrIdSiswa.filter(s => s.id !== idPesanan);
    localStorage.setItem('arrIdPesananSiswa', JSON.stringify(arrIdSiswa));

    tampilkanSemuaPesananSiswa();
    alert('Pesanan berhasil dibatalkan.');
  }
}

document.addEventListener('DOMContentLoaded', renderMenuPelanggan);
