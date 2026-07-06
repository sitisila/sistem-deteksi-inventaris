import React, { useMemo, useState } from 'react'; 
import EditAssetModal from './EditAssetModal'; 

interface ManageAssetTabProps {
  currentUser: any;
  authToken?: string | null;
  setIsAddAssetOpen: (val: boolean) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  assets: any[];
  setAssets: React.Dispatch<React.SetStateAction<any[]>>;
  selectedLab: any;
  setSelectedLab: (val: string | null) => void;
  onSaveAsset: (data: any) => void; 
  labList: any[]; 
  t: any;
}

const ManageAssetTab: React.FC<ManageAssetTabProps> = ({ 
  currentUser, authToken, setIsAddAssetOpen, searchTerm, setSearchTerm, 
  assets, setAssets, selectedLab, setSelectedLab, onSaveAsset, labList, t 
}) => {
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<any>(null);

  const adminCategories = [
    { id: 'Perangkat IT & Komputasi', label: t?.catIT || 'Perangkat IT' },
    { id: 'Perangkat Jaringan & Telekomunikasi', label: t?.catNet || 'Jaringan' },
    { id: 'Perangkat Elektronika & IoT', label: t?.catIoT || 'Elektronika & IoT' },
    { id: 'Peralatan Laboratorium & Pengukuran', label: t?.catLab || 'Peralatan Lab' },
    { id: 'Aset Dokumen & Administrasi', label: t?.catDoc || 'Administrasi' },
    { id: 'Perangkat Keamanan & Kontrol Akses', label: t?.catSec || 'Keamanan' },
    { id: 'Aset Non-Teknis tapi Bernilai', label: t?.catOther || 'Lainnya' }
  ];

  const parseAssetQty = (descriptionStr: string): number => {
    if (!descriptionStr || !descriptionStr.includes('||META:')) return 0;
    try {
      const parts = descriptionStr.split('||');
      const metaPart = parts.find(p => p.startsWith('META:'));
      if (metaPart) {
        const base64Str = metaPart.replace('META:', '');
        const decodedJson = atob(base64Str);
        const metaObj = JSON.parse(decodedJson);
        return parseInt(metaObj.qty || metaObj.quantity || 0);
      }
    } catch (e) {
      console.error("Gagal ekstraksi QTY dari meta-data description", e);
    }
    return 0;
  };

  const filteredData = useMemo(() => {
    return assets?.filter(a => {
      const nameKey = a.asset_name || a.name || '';
      const matchesSearch = (
        nameKey.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (a.serialNumber && a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      const currentSelectedLabId = typeof selectedLab === 'object' ? selectedLab?.id : selectedLab;
      
      let matchesCategory = true;
      if (currentSelectedLabId) {
        const assetCat = String(a.category || '').toLowerCase();
        const filterCat = String(currentSelectedLabId).toLowerCase();
        
        const keyword = filterCat.split(' ')[0]; 
        matchesCategory = assetCat.includes(keyword) || filterCat.includes(assetCat) || assetCat === filterCat;
      }
      
      return matchesCategory && matchesSearch;
    }) || [];
  }, [assets, selectedLab, searchTerm]);

  const openEditModal = (asset: any) => {
    const sanitizedLab = typeof asset.lab === 'object' ? (asset.lab?.name || asset.lab?.id || 'Ruangan Admin (Aset Kantor)') : (asset.lab || 'Ruangan Admin (Aset Kantor)');
    const extractedQty = parseAssetQty(asset.description || asset.deskripsi || '');
    
    setSelectedAssetForEdit({ 
      ...asset, 
      lab: sanitizedLab, 
      name: asset.asset_name || asset.name,
      QTY: extractedQty,
      qty: extractedQty
    });
    setIsEditModalOpen(true);
  };

  const canEdit = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'dosen';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* 🎯 TRANSLATED: Judul Halaman */}
        <h2 className="text-4xl font-black text-gray-950 uppercase tracking-tight">
          {t?.manageAssetTitle || 'KELOLA ASET'}
        </h2>
        {currentUser?.role?.toLowerCase() === 'admin' && (
          <button onClick={() => setIsAddAssetOpen(true)} 
            className="px-8 py-4 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            {t?.addAsset || 'TAMBAH ALAT BARU'}
          </button>
        )}
      </div>

      {/* 🎯 TRANSLATED: Placeholder Input Cari */}
      <div className="relative group">
        <input type="text" placeholder={t?.searchAssetPlaceholder || "Cari seluruh aset laboratorium / ruangan..."}
          className="w-full pl-16 pr-8 py-5 bg-[#F7F7F7] border border-transparent rounded-[2.5rem] outline-none focus:bg-white focus:border-gray-200 font-bold text-sm transition-all shadow-sm placeholder-gray-400 text-gray-800"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      {/* 🎯 TRANSLATED: Tombol Semua Klasifikasi */}
      <div className="flex flex-wrap gap-2.5">
        <button onClick={() => setSelectedLab(null)}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${!selectedLab ? 'bg-gray-950 text-white border-gray-950 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}>
          {t?.allFilter || 'Semua Klasifikasi'}
        </button>
        {adminCategories.map((cat) => {
          const currentSelectedLabId = typeof selectedLab === 'object' ? selectedLab?.id : selectedLab;
          return (
            <button key={cat.id} onClick={() => setSelectedLab(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${currentSelectedLabId === cat.id ? 'bg-gray-950 text-white border-gray-950 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}>
              {cat.label || cat.id}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredData.length > 0 ? (
          filteredData.map((asset) => {
            const stockQty = parseAssetQty(asset.description || asset.deskripsi || '');
            
            return (
              <div key={asset.id} className="bg-white border border-gray-100 p-6 rounded-[2rem] flex items-center justify-between hover:shadow-xl hover:border-brand/10 transition-all group">
                <div className="flex items-center gap-6">
                  <div>
                     <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-0.5">{asset.category || (t?.lang === 'en' ? 'General' : 'Umum')}</p>
                     
                     <div className="flex items-center gap-3">
                       <h4 className="font-black text-gray-950 uppercase text-lg group-hover:text-brand transition-colors leading-tight">
                         {asset.asset_name || asset.name || (t?.lang === 'en' ? 'Unnamed Asset' : 'Aset Tanpa Nama')}
                       </h4>
                       {/* 🎯 TRANSLATED: Label Stok Row */}
                       <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-md border border-zinc-200">
                         {t?.stockLabel || 'Stok'}: {stockQty} Pcs
                       </span>
                     </div>

                     <p className="text-[10px] font-bold text-gray-400 mt-1.5 uppercase tracking-wider">
                       SN: {asset.serialNumber || '-'} | {t?.location || 'Lokasi'}: {typeof asset.lab === 'object' ? (asset.lab?.name || 'Objek Lab') : asset.lab}
                     </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {canEdit && (
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(asset); }} 
                      className="px-5 py-2.5 bg-gray-50 text-gray-800 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-950 hover:text-white transition-all border border-gray-100">
                      {t?.editBtn || 'Ubah'}
                    </button>
                  )}
                  {/* 🎯 TRANSLATED: Badge Ketersediaan */}
                  <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    stockQty > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {stockQty > 0 ? (t?.available || 'Tersedia') : (t?.lang === 'en' ? 'Empty' : 'Habis')}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* 🎯 TRANSLATED: Teks Data Kosong */
          <div className="py-20 text-center bg-[#FDFDFD] rounded-[2rem] border border-dashed border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-xs">
            {t?.noAssetInLab || 'Tidak ada data aset laboratorium ditemukan'}
          </div>
        )}
      </div>

      {isEditModalOpen && selectedAssetForEdit && (
        <EditAssetModal 
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedAssetForEdit(null); }}
          labList={labList}
          authToken={authToken}
          onSave={(updatedData) => {
            onSaveAsset({ ...updatedData, id: selectedAssetForEdit.id });
            setIsEditModalOpen(false);
            setSelectedAssetForEdit(null);
          }}
          t={t}
          initialData={selectedAssetForEdit} 
        />
      )}
    </div>
  );
};

export default ManageAssetTab;