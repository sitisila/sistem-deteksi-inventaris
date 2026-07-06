import React, { useState, useMemo } from 'react';

interface LabsTabProps {
  t: any;
  assets: any[];
  selectedLab: string | null | any;
  setSelectedLab: (lab: string | null) => void;
  openLoanForm: (asset: any) => void;
  currentUser: any;
}

const LabsTab: React.FC<LabsTabProps> = ({ 
  t, assets, selectedLab, setSelectedLab, openLoanForm, currentUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Daftar klasifikasi kategori persis seperti di menu Kelola Aset kelompok lu
  const categories = [
    { id: 'ALL', idLabel: 'SEMUA KLASIFIKASI', enLabel: 'ALL CLASSIFICATIONS' },
    { id: 'IT', idLabel: 'PERANGKAT IT & KOMPUTASI', enLabel: 'IT & COMPUTING DEVICES' },
    { id: 'NETWORK', idLabel: 'PERANGKAT JARINGAN & TELEKOMUNIKASI', enLabel: 'NETWORKING & TELECOMMUNICATION' },
    { id: 'IOT', idLabel: 'PERANGKAT ELEKTRONIKA & IOT', enLabel: 'ELECTRONICS & IOT DEVICES' },
    { id: 'LAB', idLabel: 'PERALATAN LABORATORIUM & PENGUKURAN', enLabel: 'LABORATORY & MEASUREMENT TOOLS' },
    { id: 'DOC', idLabel: 'ASET DOKUMEN & ADMINISTRASI', enLabel: 'DOCUMENT & ADMINISTRATIVE ASSETS' },
    { id: 'SECURITY', idLabel: 'PERANGKAT KEAMANAN & KONTROL AKSES', enLabel: 'SECURITY & ACCESS CONTROL DEVICES' },
    { id: 'NON_TECH', idLabel: 'ASET NON-TEKNIS TAPI BERNILAI', enLabel: 'NON-TECHNICAL VALUABLE ASSETS' }
  ];

  // 1. Filter awal berdasarkan lokasi laboratorium aktif (menggunakan logika normalisasi file asli lu)
  const baseLabAssets = useMemo(() => {
    if (!selectedLab) return [];
    const targetLabName = typeof selectedLab === 'object' ? selectedLab?.name : selectedLab;
    
    return assets.filter(a => {
      const assetLabClean = String(a.lab || '').trim().toLowerCase();
      const targetLabClean = String(targetLabName || '').trim().toLowerCase();
      return assetLabClean === targetLabClean;
    });
  }, [assets, selectedLab]);

  // 2. Filter lanjutan berdasarkan Search Bar kata kunci dan Klasifikasi Kategori
  const filteredLabAssets = useMemo(() => {
    return baseLabAssets.filter(asset => {
      // Filter Pencarian kata kunci nama / kode aset
      const assetName = String(asset.name || asset.asset_name || '').toLowerCase();
      const assetCode = String(asset.code || '').toLowerCase();
      const matchesSearch = assetName.includes(searchTerm.toLowerCase()) || assetCode.includes(searchTerm.toLowerCase());

      // Filter Klasifikasi Kategori
      const assetCategory = String(asset.category || '').toUpperCase();
      const matchesCategory = selectedCategory === 'ALL' || assetCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [baseLabAssets, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!selectedLab ? (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black text-utama uppercase tracking-tighter">
              {t?.labListTitle || 'Daftar Laboratorium'}
            </h2>
            <p className="text-gray-500 font-medium">
              {t?.labListDesc || 'Silahkan pilih laboratorium untuk melihat aset'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              { id: 'Mechanical Workshop', name: 'Mechanical and Electrical Workshop Laboratory', room: 'G13', color: 'from-blue-500 to-blue-700' },
              { id: 'TelNet', name: 'Telecommunication Networking (TelNet) Laboratory', room: 'G4', color: 'from-purple-500 to-purple-700' },
              { id: 'OCS', name: 'Optical Communication System (OCS) Laboratory', room: 'G9', color: 'from-orange-500 to-orange-700' },
              { id: 'WiComm', name: 'Wireless Communication (WiComm) Laboratory', room: 'E3', color: 'from-green-500 to-green-700' },
              { id: 'TTRL', name: 'Telecommunication Technology Research Laboratory', room: 'A1', color: 'from-brand to-utama' },
              { id: 'CellComm', name: 'Cellular Communication (CellComm) Laboratory', room: 'A1', color: 'from-cyan-500 to-cyan-700' },
            ].map((lab) => (
              <button key={lab.id} onClick={() => { setSelectedLab(lab.name); setSearchTerm(''); setSelectedCategory('ALL'); }} className="group relative overflow-hidden bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all text-left">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${lab.color} opacity-10 rounded-bl-[4rem] group-hover:scale-110 transition-transform`}></div>
                <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-2">{t?.roomLabel || 'Ruang'}: {lab.room}</p>
                <h3 className="text-xl font-black text-utama leading-tight uppercase group-hover:text-brand transition-colors">{lab.name}</h3>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>{t?.viewAsset || 'Lihat Aset'}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Tombol Kembali ke Daftar */}
          <button onClick={() => setSelectedLab(null)} className="flex items-center gap-2 text-gray-400 hover:text-brand font-black text-[10px] uppercase tracking-widest transition-colors bg-gray-50 hover:bg-brand/5 px-4 py-2.5 rounded-full w-fit border border-gray-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t?.backToList || 'Kembali ke Daftar'}
          </button>
          
          {/* Banner Judul Lab */}
          <div className="bg-gradient-to-r from-utama to-brand p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight mb-2">
                {typeof selectedLab === 'object' ? (selectedLab?.name || selectedLab?.id) : selectedLab}
              </h2>
              <p className="text-white/50 font-bold text-xs uppercase tracking-[0.3em]">{t?.labInventory || 'Inventaris Aset Laboratorium'}</p>
            </div>
          </div>

          {/* 🔍 REVISI: FITUR CARI (SEARCH BAR) */}
          <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center px-6 gap-3">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t?.searchPlaceholder || "Cari seluruh aset berdasarkan nama atau kode..."}
              className="w-full text-xs font-bold text-gray-800 bg-transparent focus:outline-none placeholder-gray-400"
            />
          </div>

          {/* 🎯 REVISI: TOMBOL KLASIFIKASI BAGIAN PER KATEGORI (SAMA SEPERTI KELOLA ASET) */}
          <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const currentLangLabel = t?.lang === 'en' ? cat.enLabel : cat.idLabel;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider whitespace-nowrap transition-all snap-center shadow-sm ${
                    isActive 
                      ? 'bg-utama text-white scale-100' 
                      : 'bg-white border border-gray-100 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  {currentLangLabel}
                </button>
              );
            })}
          </div>

          {/* 🎯 REVISI: TAMPILAN KARTU CARD DIUBAH MENJADI LIST ROW MEMANJANG */}
          <div className="space-y-4">
            {filteredLabAssets.length > 0 ? (
               filteredLabAssets.map((asset) => {
                const isAvailable = asset.status === 'AVAILABLE' || asset.status === 'TERSEDIA' || String(asset.status).toLowerCase() === 'tersedia';
                const realStock = asset.quantity ?? asset.qty ?? asset.QTY ?? asset.jumlah ?? 1;

                return (
                  <div 
                    key={asset.id} 
                    className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group hover:border-brand/20"
                  >
                    <div className="absolute top-0 left-0 h-full w-1.5 bg-brand opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                    {/* Informasi Deskripsi Aset Sebelah Kiri */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[9px] font-mono font-bold text-gray-400 tracking-wider">
                          {asset.code || '#PRISMA-FIT'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-black text-[9px] uppercase tracking-wider">
                          {t?.stockLabel || 'STOK'}: {realStock} PCS
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border ${
                          isAvailable 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {isAvailable ? (t?.available || 'TERSEDIA') : (t?.borrowed || 'DIPINJAM')}
                        </span>
                      </div>

                      <h4 className="font-black text-utama uppercase text-base group-hover:text-brand transition-colors leading-tight truncate">
                        {asset.name || asset.asset_name}
                      </h4>
                      
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                        <span>Kondisi / Condition: </span>
                        <span className="text-brand font-black">{asset.conditionStatus || asset.condition || 'GOOD'}</span>
                      </div>
                    </div>

                    {/* Tombol Peminjaman Sebelah Kanan */}
                    <div className="shrink-0 flex items-center justify-end">
                      {currentUser?.role?.toLowerCase() === 'dosen' ? (
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center">
                          {t?.monitorOnly || 'Hanya Pantau'}
                        </span>
                      ) : (
                        <button 
                          onClick={() => openLoanForm(asset)} 
                          disabled={!isAvailable} 
                          className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] transition-all duration-300 px-5 py-3 rounded-xl border shadow-sm active:scale-95 text-center leading-normal ${
                            isAvailable 
                              ? 'bg-brand text-white border-brand shadow-brand/10 hover:bg-utama hover:border-utama' 
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100 shadow-none'
                          }`}
                        >
                          {t?.borrowBtn || 'PINJAM ALAT'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-24 text-center bg-white rounded-[2.5rem] border border-gray-50 shadow-sm">
                <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-xs">
                  {t?.noAssetInLab || 'TIDAK ADA ASET DI KLASIFIKASI INI'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabsTab;