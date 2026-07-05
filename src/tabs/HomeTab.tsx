import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';

interface HomeTabProps {
  t: any;
  assets: any[];
  loans: any[];
  setActiveTab: (tab: string) => void;
  currentUser?: any;
  onLoanSubmit?: (loanData: any) => Promise<void> | void; 
}

const GUIDE_URL_STORAGE_KEY = 'prismafit_guide_url';

const HomeTab: React.FC<HomeTabProps> = ({ t, assets, loans, setActiveTab, currentUser, onLoanSubmit }) => {
  const [guideUrl, setGuideUrl] = useState<string>(
    () => localStorage.getItem(GUIDE_URL_STORAGE_KEY) || 'https://drive.google.com'
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  const isMahasiswa = currentUser?.role?.toLowerCase() === 'mahasiswa';
  const currentUserId = currentUser?.id || currentUser?.user_id;

  // --- 📊 CALCULATOR STATISTIK KHUSUS MAHASISWA ---
  const mahasiswaStats = useMemo(() => {
    const myLoans = loans?.filter(loan => String(loan.userId || loan.user_id || loan.nim) === String(currentUserId || currentUser?.nim)) || [];

    const borrowedCount = myLoans.filter(l => 
      ['APPROVED', 'ACTIVE', 'DIPINJAM', 'BORROWED'].includes(String(l.status).toUpperCase())
    ).length;

    const returnedCount = myLoans.filter(l => 
      ['RETURNED', 'DIKEMBALIKAN'].includes(String(l.status).toUpperCase())
    ).length;

    const deadlineCount = myLoans.filter(l => {
      const statusText = String(l.status).toUpperCase();
      const isCurrentlyBorrowed = ['APPROVED', 'ACTIVE', 'DIPINJAM', 'BORROWED'].includes(statusText);
      const targetDate = l.return_date || l.returnDate || l.tanggal_kembali;
      
      if (isCurrentlyBorrowed && targetDate) {
        return new Date(targetDate).getTime() < new Date().getTime();
      }
      return false;
    }).length;

    return { borrowedCount, returnedCount, deadlineCount, myLoans };
  }, [loans, currentUserId, currentUser]);

  // --- 🔄 STATE FORM PEMINJAMAN (UPGRADED: DURASI DIHAPUS, DIGANTI INPUT TIME) ---
  const [formData, setFormData] = useState({
    assetId: '',
    borrowTime: '',
    returnTime: '',
    phoneNumber: '', 
    reason: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetId || !formData.borrowTime || !formData.returnTime || !formData.phoneNumber || !formData.reason) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Silakan isi seluruh kolom formulir termasuk Jam Mulai & Jam Selesai secara lengkap woi!',
        icon: 'warning',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
      return;
    }

    // Validasi logika waktu agar jam selesai tidak mendahului jam mulai
    if (formData.returnTime <= formData.borrowTime) {
      Swal.fire({
        title: 'Waktu Tidak Valid!',
        text: 'Jam Selesai tidak boleh sama atau mendahului Jam Mulai peminjaman woi!',
        icon: 'error',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
      return;
    }

    const selectedAsset = assets.find(a => String(a.id) === String(formData.assetId));
    const currentQty = selectedAsset ? parseInt(selectedAsset.QTY || selectedAsset.qty || selectedAsset.quantity || selectedAsset.stok || '0') : 0;

    if (currentQty <= 0) {
      Swal.fire({
        title: 'Stok Habis!',
        text: 'Maaf woi, kuantitas aset logistik laboratorium ini sedang kosong!',
        icon: 'error',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
      return;
    }

    const today = new Date();
    const startDateFormated = today.toISOString().slice(0, 19).replace('T', ' ');
    const endDateFormated = today.toISOString().slice(0, 19).replace('T', ' '); // Pinjam di hari yang sama

    // 🎯 PAYLOAD DI-UPGRADE: Mengirim data borrowTime dan returnTime murni ke backend PHP
    const payload = {
      assetId: formData.assetId,
      asset_id: formData.assetId,
      assetName: selectedAsset?.asset_name || selectedAsset?.name || 'Alat Lab',
      startDate: startDateFormated,
      endDate: endDateFormated,
      borrowTime: formData.borrowTime,
      returnTime: formData.returnTime,
      phone: formData.phoneNumber,
      purpose: formData.reason,
      reason: formData.reason,
      quantity: 1
    };

    try {
      if (onLoanSubmit) {
        await onLoanSubmit(payload); 
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Permintaan peminjaman alat berhasil diajukan ke asisten lab woi!',
          icon: 'success',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });

        setFormData({ assetId: '', borrowTime: '', returnTime: '', phoneNumber: '', reason: '' });
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Gagal submit loan frontend:", err);
      Swal.fire('Error!', 'Gagal terhubung atau memproses data di server API.', 'error');
    }
  };

  const handleEditGuideLink = async () => {
    const { value: url } = await Swal.fire({
      title: 'Perbarui Tautan Panduan',
      input: 'url',
      inputLabel: 'Masukkan Link Google Drive / Dropbox Berkas Panduan',
      inputValue: guideUrl,
      placeholder: 'https://example.com/buku-panduan.pdf',
      showCancelButton: true,
      confirmButtonColor: '#5c1313',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Simpan Tautan',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-[2rem]' }
    } as any);

    if (url) {
      setGuideUrl(url);
      localStorage.setItem(GUIDE_URL_STORAGE_KEY, url);
      Swal.fire({ title: 'Berhasil!', text: 'Tautan panduan diperbarui.', icon: 'success', confirmButtonColor: '#5c1313' });
    }
  };

  const handleOpenDocument = () => {
    if (guideUrl) window.open(guideUrl, '_blank', 'noopener,noreferrer');
    else Swal.fire('Kosong!', 'Dokumen panduan belum diatur oleh admin.', 'info');
  };

  const displayActivities = useMemo(() => {
    if (isAdmin) return loans?.slice(0, 3) || [];
    return mahasiswaStats.myLoans.slice(0, 3);
  }, [loans, isAdmin, mahasiswaStats.myLoans]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* BANNER WELCOME */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand via-[#5c1313] to-utama py-6 px-10 rounded-[2rem] text-white shadow-lg shadow-brand/10">
        <div className="absolute top-0 right-0 w-52 h-52 bg-white/[0.03] rounded-full blur-2xl"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="text-[9px] font-black tracking-[0.3em] uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10">
            {isMahasiswa ? "Panel Beranda Mahasiswa" : "Sistem Monitoring Aset"}
          </span>
          <h3 className="text-3xl lg:text-4xl font-black tracking-tight mb-1 uppercase leading-none mt-3">PRISMA FIT</h3>
          <p className="text-white/80 text-sm font-medium leading-relaxed normal-case">
            {isMahasiswa 
              ? `Selamat datang kembali, ${currentUser?.name || 'User Biasa'}! Pantau status peminjaman logistik aktif , kelola batas deadline pengembalian barang, dan ajukan peminjaman alat langsung pada halaman ini.`
              : "Pengelolaan, pemantauan, dan peminjaman alat laboratorium Laboratorium Fakultas Ilmu Terapan Telkom University"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* STATISTIK RINGKASAN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-4 bg-brand rounded-full"></span>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {isMahasiswa ? "RINGKASAN LOGISTIK SAYA" : "RINGKASAN DATA LOGISTIK"}
              </h4>
            </div>

            {isMahasiswa && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-gray-950 transition-all transform active:scale-95 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                <span>Isi Form Peminjaman</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isMahasiswa ? (
              <>
                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">ASET SEDANG DIPINJAM</p>
                    <p className="text-4xl font-black text-orange-500 tracking-tight">{mahasiswaStats.borrowedCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50"><svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                </div>

                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">TELAH DIKEMBALIKAN</p>
                    <p className="text-4xl font-black text-green-600 tracking-tight">{mahasiswaStats.returnedCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50"><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                </div>

                <div className="p-6 bg-white border border-red-100 rounded-[1.5rem] shadow-md sm:col-span-2 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1.5">TOTAL ASET TERKENA DEADLINE</p>
                    <p className="text-4xl font-black text-brand tracking-tight">{mahasiswaStats.deadlineCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand/5"><svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">TOTAL ASET</p>
                    <p className="text-4xl font-black text-utama tracking-tight">{assets?.length || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50"><svg className="w-5 h-5 text-utama" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
                </div>

                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">DIPINJAM</p>
                    <p className="text-4xl font-black text-orange-500 tracking-tight">
                      {loans?.filter(l => ['APPROVED', 'ACTIVE', 'DIPINJAM', 'BORROWED'].includes(String(l.status).toUpperCase())).length || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50"><svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                </div>

                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">PERSETUJUAN</p>
                    <p className="text-4xl font-black text-brand tracking-tight">
                      {loans?.filter(l => ['PENDING', 'PROSES'].includes(String(l.status).toUpperCase())).length || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand/5"><svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg></div>
                </div>

                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">TERSEDIA</p>
                    <p className="text-4xl font-black text-green-600 tracking-tight">
                      {assets?.filter(a => ['AVAILABLE', 'TERSEDIA'].includes(String(a.status).toUpperCase())).length || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50"><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* PANDUAN LAB */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <span className="w-1.5 h-4 bg-brand rounded-full"></span>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">DOKUMEN PANDUAN</h4>
          </div>
          <div className="p-6 bg-gradient-to-br from-zinc-900 to-utama text-white rounded-[1.5rem] shadow-md relative overflow-hidden">
            {isAdmin && (
              <button onClick={handleEditGuideLink} className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/5 transition-all z-20">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
              </button>
            )}
            <h5 className="text-xs font-black tracking-widest text-brand uppercase mb-1">PANDUAN PENGGUNA</h5>
            <p className="text-[11px] text-zinc-400 normal-case mb-4 leading-relaxed">
              Butuh bantuan operasional laboratorium? Unduh modul tata cara peminjaman alat di sini.
            </p>
            <button onClick={handleOpenDocument} className="text-[9px] font-black uppercase tracking-wider bg-white/10 hover:bg-brand hover:text-white border border-white/10 px-4 py-2 rounded-lg transition-all">
              Buka Dokumen
            </button>
          </div>
        </div>
      </div>

      {/* LOG AKTIVITAS BAWAH */}
      <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-gray-100/80 shadow-sm">
        <div className="flex items-center justify-between mb-6 px-1">
          <h4 className="text-[10px] font-black text-utama uppercase tracking-[0.25em]">
            {isMahasiswa ? "LOG AKTIVITAS SAYA" : "AKTIVITAS TERAKHIR"}
          </h4>
          <div className="h-px flex-grow mx-4 bg-gray-200/70"></div>
        </div>
        <div className="space-y-3">
          {displayActivities?.length > 0 ? displayActivities.map((loan: any) => (
            <div key={loan.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100/60 hover:border-brand/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand/5 flex items-center justify-center text-brand font-black text-xs">
                  {String(loan.assetName || loan.asset_name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-utama text-xs tracking-tight normal-case">
                    {isMahasiswa ? (
                      <>Mengajukan peminjaman alat <span className="font-black text-brand">{loan.assetName || loan.asset_name || 'Aset'}</span></>
                    ) : (
                      <>Mahasiswa <span className="font-black text-brand">{loan.nim || 'Anonim'}</span> mengajukan alat <span className="font-semibold text-brand">{loan.assetName || loan.asset_name}</span></>
                    )}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                    STATUS: <span className={['PENDING', 'PROSES'].includes(String(loan.status).toUpperCase()) ? 'text-brand' : 'text-green-600'}>{loan.status}</span>
                  </p>
                </div>
              </div>
              <div className="text-[9px] font-bold text-gray-300 uppercase tracking-wider px-2">
                {loan.loan_date || loan.tanggal_pinjam || "Baru saja"}
              </div>
            </div>
          )) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center px-4">
              <h5 className="text-xs font-black text-utama uppercase tracking-wider mb-1">BELUM ADA DATA</h5>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto normal-case">
                {isMahasiswa ? "kamu belum pernah mengajukan aktivitas peminjaman logistik apa pun." : "Belum ada aktivitas."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* POP-UP MODAL PEMINJAMAN MAHASISWA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-gray-100 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-utama tracking-tight uppercase">FORM PEMINJAMAN ALAT</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-brand bg-gray-50 p-1 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleQuickLoanSubmit} className="space-y-4">
              
              {/* IDENTITAS PEMINJAM RAPI */}
              <div className="bg-brand/[0.02] border border-brand/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-brand/10 pb-2">
                  <span className="text-[9px] font-black tracking-widest text-brand uppercase bg-brand/5 px-2.5 py-1 rounded-md">Identitas Peminjam</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Sistem Terverifikasi</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Nama Lengkap</p>
                    <p className="text-xs font-black text-utama truncate">{currentUser?.name || 'User Biasa'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Email Kampus</p>
                    <p className="text-xs font-bold text-utama truncate opacity-90">{currentUser?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">NIM / Nomor Induk</p>
                    <p className="text-xs font-black text-brand tracking-wider">{currentUser?.nim || currentUser?.id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">No. Telepon Akun</p>
                    <p className="text-xs font-bold text-gray-700">{currentUser?.phone || currentUser?.telepon || currentUser?.no_telp || '081299998888'}</p>
                  </div>
                </div>
              </div>

              {/* INPUT: WHATSAPP */}
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">Nomor WhatsApp / Telp Aktif</label>
                <input 
                  type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Contoh: 081234567890"
                  className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama placeholder-gray-400 focus:outline-none focus:border-brand transition-all"
                />
              </div>

              {/* SELECT ALAT */}
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">Pilih Alat / Aset Lab</label>
                <select 
                  name="assetId" value={formData.assetId} onChange={handleInputChange}
                  className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama focus:outline-none focus:border-brand transition-all"
                >
                  <option value="">-- Klik Untuk Memilih Aset --</option>
                  {assets?.map(a => {
                    const stock = parseInt(a.QTY || a.qty || a.quantity || a.stok || '0');
                    const hasStock = stock > 0;
                    
                    return (
                      <option key={a.id} value={a.id} disabled={!hasStock}>
                        {a.name || a.asset_name || a.assetName} {` (Tersedia: ${stock} Pcs)`} {!hasStock ? ' - [HABIS / DILUAR]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 🎯 FIX VISUAL FRONTEND: DROPDOWN DURASI HARI DIHAPUS, DIGANTI GRID 2 INPUT WAKTU JAM MULAI & SELESAI */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">Jam Mulai</label>
                  <input 
                    type="time" name="borrowTime" value={formData.borrowTime} onChange={handleInputChange} required
                    className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama focus:outline-none focus:border-brand transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">Jam Selesai</label>
                  <input 
                    type="time" name="returnTime" value={formData.returnTime} onChange={handleInputChange} required
                    className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama focus:outline-none focus:border-brand transition-all"
                  />
                </div>
              </div>

              {/* INPUT: ALASAN */}
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">Alasan Keperluan</label>
                <textarea 
                  name="reason" rows={2} value={formData.reason} onChange={handleInputChange} placeholder="Masukkan alasan peminjaman lu secara jelas..."
                  className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-2.5 border border-gray-100 text-utama placeholder-gray-400 focus:outline-none focus:border-brand transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-3.5 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand/10">
                  Ajukan Pinjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTab;