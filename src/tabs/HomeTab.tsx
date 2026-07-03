import React, { useState } from 'react';
import { LoanStatus } from '../types';
import Swal from 'sweetalert2';

interface HomeTabProps {
  t: any;
  assets: any[];
  loans: any[];
  setActiveTab: (tab: string) => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ t, assets, loans, setActiveTab }) => {
  const [guideUrl, setGuideUrl] = useState<string>('https://drive.google.com'); 


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
    });

    if (url) {
      setGuideUrl(url);
      Swal.fire({
        title: 'Berhasil!',
        text: 'Tautan dokumen panduan berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
    }
  };

  const handleOpenDocument = () => {
    if (guideUrl) {
      window.open(guideUrl, '_blank', 'noopener,noreferrer');
    } else {
      Swal.fire('Kosong!', 'Dokumen panduan belum diatur oleh admin.', 'info');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* BANNER UTAMA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand via-[#5c1313] to-utama py-6 px-10 rounded-[2rem] text-white shadow-lg shadow-brand/10">
        <div className="absolute top-0 right-0 w-52 h-52 bg-white/[0.03] rounded-full -mr-12 -mt-12 blur-2xl"></div>
        <div className="absolute -bottom-10 left-1/3 w-40 h-40 bg-black/[0.1] rounded-full blur-xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="text-[9px] font-black tracking-[0.3em] uppercase bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
            {t.systemSubtitle || "Sistem Manajemen Aset"}
          </span>
          <h3 className="text-3xl lg:text-4xl font-black tracking-tight mb-1 uppercase leading-none mt-3">
            PRISMA FIT
          </h3>
          <p className="text-white/80 text-sm font-medium leading-relaxed normal-case">
            {t.loginDesc || "Selamat datang kembali! Kelola, pantau, dan lakukan pemindaian aset laboratorium dengan cepat menggunakan integrasi sistem berbasis kode QR terpadu."}
          </p>
        </div>
      </div>

      {/* STATISTIK & PUSAT DOKUMEN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RINGKASAN DATA LOGISTIK */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 px-1">
            <span className="w-1.5 h-4 bg-brand rounded-full"></span>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {t.logisticSummary || "Ringkasan Data Logistik"}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { 
                label: t.totalAsset || "TOTAL ASET", 
                val: assets?.length || 0, 
                col: "text-utama", 
                bg: "group-hover:bg-utama/5",
                icon: (
                  <svg className="w-5 h-5 text-utama" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )
              },
              { 
                label: t.borrowed || "DIPINJAM", 
                val: assets?.filter(a => a.status === 'BORROWED').length || 0, 
                col: "text-orange-500", 
                bg: "group-hover:bg-orange-50",
                icon: (
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              { 
                label: t.loans || "PERMINTAAN", 
                val: loans?.filter(l => l.status === LoanStatus.PENDING).length || 0, 
                col: "text-brand", 
                bg: "group-hover:bg-brand/5",
                icon: (
                  <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                )
              },
              { 
                label: t.available || "TERSEDIA", 
                val: assets?.filter(a => a.status === 'AVAILABLE').length || 0, 
                col: "text-green-600", 
                bg: "group-hover:bg-green-50",
                icon: (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md shadow-black/[0.02] hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-1 transition-all duration-300 group flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 group-hover:text-brand transition-colors">{stat.label}</p>
                  <p className={`text-4xl font-black ${stat.col} tracking-tight`}>{stat.val}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gray-50 transition-colors duration-300 ${stat.bg}`}>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PUSAT DOKUMEN (SEBELUMNYA PINTASAN BERKAS) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <span className="w-1.5 h-4 bg-brand rounded-full"></span>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              DOKUMEN PANDUAN
            </h4>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-zinc-900 to-utama text-white rounded-[1.5rem] shadow-md relative overflow-hidden group">
            <button 
              onClick={handleEditGuideLink}
              className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/5 transition-all z-20 opacity-80 hover:opacity-100"
              title="Ubah File Panduan (Admin Only)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>

            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>

            <h5 className="text-xs font-black tracking-widest text-brand uppercase mb-1">
              {t.guideTitle || "Buku Panduan Lab"}
            </h5>
            <p className="text-[11px] text-zinc-400 normal-case mb-4 leading-relaxed">
              {t.guideDesc || "Akses panduan operasional laboratorium, regulasi peminjaman, serta tata tertib penggunaan instrumen terintegrasi."}
            </p>

            {/* Tombol Interaktif */}
            <button 
              onClick={handleOpenDocument}
              className="text-[9px] font-black uppercase tracking-wider bg-white/10 hover:bg-brand hover:text-white border border-white/10 px-4 py-2 rounded-lg transition-all active:scale-95"
            >
              {t.openDocBtn || "Buka Dokumen"}
            </button>
          </div>
        </div>

      </div>

      {/* AKTIVITAS TERBARU */}
      <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-gray-100/80 shadow-sm">
        <div className="flex items-center justify-between mb-6 px-1">
          <h4 className="text-[10px] font-black text-utama uppercase tracking-[0.25em]">
            {t.recentActivity || "AKTIVITAS TERBARU"}
          </h4>
          <div className="h-px flex-grow mx-4 bg-gray-200/70"></div>
        </div>
        
        <div className="space-y-3">
          {loans?.length > 0 ? loans.slice(0, 3).map((loan: any) => (
            <div key={loan.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100/60 hover:border-brand/30 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand/5 flex items-center justify-center text-brand font-black text-xs border border-brand/5">
                  {loan.nim?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-utama text-xs tracking-tight normal-case">
                    {t.userLabel || "Mahasiswa"} <span className="font-black text-brand">{loan.nim || 'Anonim'}</span> {t.loanActionLabel || "mengajukan alat"}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                    {t.statusLabel || "STATUS"}: <span className={loan.status === 'PENDING' ? 'text-brand' : 'text-green-600'}>{loan.status}</span>
                  </p>
                </div>
              </div>
              <div className="text-[9px] font-bold text-gray-300 uppercase tracking-wider px-2">
                {t.timeAgo || "Baru saja"}
              </div>
            </div>
          )) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 relative">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand/5 animate-ping opacity-60"></span>
                <svg className="w-5 h-5 text-gray-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2h2a2 2 0 002-2V7a2 2 0 012-2h4a2 2 0 012 2v3a2 2 0 002 2h2a2 2 0 012 2z" />
                </svg>
              </div>
              <h5 className="text-xs font-black text-utama uppercase tracking-wider mb-1">
                {t.noRecentData || "Belum Ada Aktivitas"}
              </h5>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto leading-relaxed normal-case">
                {t.noRecentDataDesc || "Mulai eksplorasi daftar laboratorium untuk melihat log atau mengajukan surat izin peminjaman alat."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeTab;