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

  const filteredData = useMemo(() => {
    return assets?.filter(a => {
      const matchesSearch = (
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const currentSelectedLabId = typeof selectedLab === 'object' ? selectedLab?.id : selectedLab;
      const matchesCategory = !currentSelectedLabId || a.category === currentSelectedLabId;
      return matchesCategory && matchesSearch;
    }) || [];
  }, [assets, selectedLab, searchTerm]);

  const openEditModal = (asset: any) => {
    const sanitizedLab = typeof asset.lab === 'object' ? (asset.lab?.name || asset.lab?.id || 'Ruangan Admin (Aset Kantor)') : (asset.lab || 'Ruangan Admin (Aset Kantor)');
    setSelectedAssetForEdit({ ...asset, lab: sanitizedLab });
    setIsEditModalOpen(true);
  };

  const canEdit = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'dosen';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-4xl font-black text-gray-950 uppercase tracking-tight">KELOLA ASET</h2>
        {currentUser?.role?.toLowerCase() === 'admin' && (
          <button onClick={() => setIsAddAssetOpen(true)} 
            className="px-8 py-4 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            TAMBAH ALAT BARU
          </button>
        )}
      </div>

      <div className="relative group">
        <input type="text" placeholder="Cari seluruh aset laboratorium / ruangan..."
          className="w-full pl-16 pr-8 py-5 bg-[#F7F7F7] border border-transparent rounded-[2.5rem] outline-none focus:bg-white focus:border-gray-200 font-bold text-sm transition-all shadow-sm placeholder-gray-400 text-gray-800"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button onClick={() => setSelectedLab(null)}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${!selectedLab ? 'bg-gray-950 text-white border-gray-950 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}>
          Semua Klasifikasi
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
          filteredData.map((asset) => (
            <div key={asset.id} className="bg-white border border-gray-100 p-6 rounded-[2rem] flex items-center justify-between hover:shadow-xl hover:border-brand/10 transition-all group">
              <div className="flex items-center gap-6">
                <div>
                   <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-0.5">{asset.category}</p>
                   <h4 className="font-black text-gray-950 uppercase text-lg group-hover:text-brand transition-colors leading-tight">{asset.name}</h4>
                   <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                     SN: {asset.serialNumber || '-'} | Lokasi: {typeof asset.lab === 'object' ? (asset.lab?.name || 'Objek Lab') : asset.lab}
                   </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {canEdit && (
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(asset); }} 
                    className="px-5 py-2.5 bg-gray-50 text-gray-800 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-950 hover:text-white transition-all border border-gray-100">
                    Ubah
                  </button>
                )}
                <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${asset.status === 'AVAILABLE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                  {asset.status === 'AVAILABLE' ? 'Tersedia' : 'Dipinjam'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-[#FDFDFD] rounded-[2rem] border border-dashed border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-xs">
            Tidak ada data aset laboratorium ditemukan
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
          onDeleted={() => { setIsEditModalOpen(false); setSelectedAssetForEdit(null); }}
          initialData={selectedAssetForEdit} 
          t={t}
        />
      )}
    </div>
  );
};

export default ManageAssetTab;