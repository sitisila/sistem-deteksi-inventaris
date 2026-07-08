import React, { useState, useMemo, useEffect } from 'react';

interface Asset {
  id?: number | string;
  code?: string;
  name?: string;
  asset_name?: string;
  qty?: number | string;
  QTY?: number | string;
  quantity?: number | string;
  stok?: number | string;
  status?: string;
  conditionStatus?: string;
  condition?: string;
  lab?: string;
  serialNumber?: string;
  category?: string;
}

interface ManageAssetTabProps {
  assets: Asset[];
  onSaveAsset: (data: any) => Promise<void> | void;
  currentUser: any;
  t?: any;
}

const ManageAssetTab: React.FC<ManageAssetTabProps> = ({ assets, onSaveAsset, currentUser, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);

  // State Form Input Tambah/Edit Aset
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    name: '',
    qty: '1',
    status: 'AVAILABLE',
    condition: 'GOOD',
    lab: 'Mechanical and Electrical Workshop Laboratory',
    serialNumber: '',
    category: 'IT'
  });

  // 🎯 DETEKTOR LIVE ANTI-GAGAL: Membaca teks DOM agar sinkron bahasa murni
  useEffect(() => {
    const handleLangCheck = () => {
      const pageText = document.body?.innerText || '';
      const hasEnglishMenu = pageText.includes('Manage Assets') || pageText.includes('Loan History') || pageText.includes('Active Monitoring');
      setIsEnglish(t?.lang === 'en' || localStorage.getItem('lang') === 'en' || hasEnglishMenu);
    };
    const interval = setInterval(handleLangCheck, 300);
    handleLangCheck();
    return () => clearInterval(interval);
  }, [t]);

  const categories = [
    { id: 'ALL', idLabel: 'SEMUA', enLabel: 'ALL' },
    { id: 'IT', idLabel: 'PERANGKAT IT & KOMPUTASI', enLabel: 'IT & COMPUTING DEVICES' },
    { id: 'NETWORK', idLabel: 'PERANGKAT JARINGAN & TELEKOMUNIKASI', enLabel: 'NETWORKING & TELECOMMUNICATION' },
    { id: 'IOT', idLabel: 'PERANGKAT ELEKTRONIKA & IOT', enLabel: 'ELECTRONICS & IOT DEVICES' },
    { id: 'LAB', idLabel: 'PERALATAN LABORATORIUM & PENGUKURAN', enLabel: 'LABORATORY & MEASUREMENT TOOLS' },
    { id: 'DOC', idLabel: 'ASET DOKUMEN & ADMINISTRASI', enLabel: 'DOCUMENT & ADMINISTRATIVE ASSETS' },
  ];

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const assetName = String(asset.name || asset.asset_name || '').toLowerCase();
      const assetCode = String(asset.code || '').toLowerCase();
      const matchesSearch = assetName.includes(searchTerm.toLowerCase()) || assetCode.includes(searchTerm.toLowerCase());
      const assetCategory = String(asset.category || '').toUpperCase();
      const matchesCategory = selectedCategory === 'ALL' || assetCategory === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [assets, searchTerm, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveAsset(formData);
    setIsModalOpen(false);
    setFormData({ id: '', code: '', name: '', qty: '1', status: 'AVAILABLE', condition: 'GOOD', lab: 'Mechanical and Electrical Workshop Laboratory', serialNumber: '', category: 'IT' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-3xl font-black text-gray-950 uppercase tracking-tight">
          {isEnglish ? 'MANAGE LAB ASSETS' : 'KELOLA DATA ASET'}
        </h3>
        
        {/* 🎯 REVISI SAKTI: Deteksi fleksibel mencakup ketikan role "Asisten Lab" kelompok lu woi! */}
        {(
          currentUser?.role?.toLowerCase() === 'admin' || 
          currentUser?.role?.toLowerCase().includes('aslab') || 
          currentUser?.role?.toLowerCase().includes('asisten')
        ) && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-brand hover:bg-gray-950 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md transform active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span>{isEnglish ? 'ADD NEW ASSET' : 'TAMBAH ASET BARU'}</span>
          </button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full max-w-2xl px-1">
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isEnglish ? "Search asset by name or code..." : "Cari nama atau kode aset..."}
          className="w-full pl-12 pr-4 py-4 bg-[#F7F7F7] border border-transparent rounded-full text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all shadow-sm" />
        <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      {/* CATEGORY FILTERS */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-none">
        {categories.map((cat) => (
          <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider border whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-utama text-white border-utama shadow-sm' : 'bg-white text-gray-400 border-gray-100'}`}>
            {isEnglish ? cat.enLabel : cat.idLabel}
          </button>
        ))}
      </div>

      {/* LIST INVENTARIS ASSET */}
      <div className="space-y-4 px-1">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => {
            const stock = asset.quantity ?? asset.qty ?? asset.QTY ?? asset.stok ?? 0;
            return (
              <div key={asset.id} className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm flex items-center justify-between relative overflow-hidden group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                    <span className="font-mono text-brand uppercase">{asset.code || 'CODE'}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-black uppercase">{isEnglish ? 'STOCK' : 'STOK'}: {stock} PCS</span>
                  </div>
                  <h4 className="font-black text-utama text-base uppercase leading-tight">{asset.name || asset.asset_name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-md">SN: {asset.serialNumber || '-'} | LOCATION: {asset.lab}</p>
                </div>
                <span className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-xl font-black text-[9px] uppercase tracking-wider">
                  {isEnglish ? 'AVAILABLE' : 'TERSEDIA'}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white border border-gray-100 rounded-[2rem]">
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest">{isEnglish ? 'NO ASSETS FOUND' : 'DATA ASET TIDAK DITEMUKAN'}</p>
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH ASET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-utama tracking-tight uppercase">
                {isEnglish ? 'ADD NEW LAB ASSET' : 'FORM TAMBAH ALAT BARU'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-brand bg-gray-50 p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'ASSET CODE' : 'KODE ASET'}</label>
                <input type="text" required placeholder="Contoh: FIT-G13-001" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'ASSET NAME' : 'NAMA ALAT'}</label>
                <input type="text" required placeholder={isEnglish ? "e.g., Digital Oscilloscope" : "Contoh: Solder Listrik / Toolkit"} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'STOCK QUANTITY' : 'JUMLAH STOK'}</label>
                  <input type="number" required min="1" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">SERIAL NUMBER (SN)</label>
                  <input type="text" placeholder="Optional" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'LABORATORY LOCATION' : 'LOKASI LABORATORIUM'}</label>
                <select value={formData.lab} onChange={(e) => setFormData({...formData, lab: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama">
                  <option value="Mechanical and Electrical Workshop Laboratory">Mechanical Workshop (G13)</option>
                  <option value="Telecommunication Networking (TelNet) Laboratory">TelNet Laboratory (G4)</option>
                  <option value="Optical Communication System (OCS) Laboratory">OCS Laboratory (G9)</option>
                  <option value="Wireless Communication (WiComm) Laboratory">WiComm Laboratory (E3)</option>
                  <option value="Telecommunication Technology Research Laboratory">TTRL Laboratory (A1)</option>
                  <option value="Cellular Communication (CellComm) Laboratory">CellComm Laboratory (A1)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'CLASSIFICATION CATEGORY' : 'KLASIFIKASI KATEGORI'}</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama">
                  <option value="IT">IT & COMPUTING DEVICES</option>
                  <option value="NETWORK">NETWORKING & TELECOMMUNICATION</option>
                  <option value="IOT">ELECTRONICS & IOT DEVICES</option>
                  <option value="LAB">LABORATORY & MEASUREMENT TOOLS</option>
                  <option value="DOC">DOCUMENT & ADMINISTRATIVE ASSETS</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">{isEnglish ? 'CANCEL' : 'BATAL'}</button>
                <button type="submit" className="flex-1 py-3.5 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand/10">{isEnglish ? 'SAVE ASSET' : 'SIMPAN ASET'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAssetTab;