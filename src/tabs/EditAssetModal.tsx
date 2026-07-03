import React, { useState, useEffect } from 'react';
import AssetQRCode from '../components/AssetQRCode';
import Swal from 'sweetalert2'; 

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  labList: any[];
  initialData?: any; 
  t: any;
}

const EditAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSave, labList, initialData, t }) => {
  const [renderQR, setRenderQR] = useState(false);

  const [formData, setFormData] = useState({
    name: '', brandType: '', serialNumber: '',
    procurementYear: '', fundingSource: '', invoiceNumber: '',
    lab: 'Ruangan Admin (Aset Kantor)', specificLocation: '', 
    category: '', conditionStatus: 'Baik', pic: '',
    description: '', accessories: '',
    manualBookUrl: '', photoMainUrl: '', photoLabelUrl: '',
    quantity: 1 
  });

  useEffect(() => {
    if (isOpen) {
      // Mencegah error unmounted DOM cetak label, tunggu render dasar modal selesai
      const timer = setTimeout(() => {
        setRenderQR(true);
      }, 350);

      if (initialData) {
        let extractedLab = 'Ruangan Admin (Aset Kantor)';
        if (initialData.lab) {
          extractedLab = typeof initialData.lab === 'object' 
            ? (initialData.lab.name || initialData.lab.id || 'Ruangan Admin (Aset Kantor)') 
            : initialData.lab;
        }

        setFormData({
          name: initialData.name || initialData.nama_aset || '',
          brandType: initialData.brandType || initialData.merk_tipe || '',
          serialNumber: initialData.serialNumber || initialData.serial_number || '',
          procurementYear: initialData.procurementYear || initialData.tahun_pengadaan || '',
          fundingSource: initialData.fundingSource || initialData.sumber_dana || '',
          invoiceNumber: initialData.invoiceNumber || initialData.nomor_invoice || '',
          lab: extractedLab, 
          category: initialData.category || initialData.kategori || '',
          conditionStatus: initialData.conditionStatus || initialData.status_kelayakan || 'Baik',
          pic: initialData.pic || initialData.person_in_charge || '',
          description: initialData.description || initialData.deskripsi || '',
          accessories: initialData.accessories || initialData.aksesoris || '',
          specificLocation: initialData.specificLocation || initialData.lokasi_spesifik || '',
          manualBookUrl: initialData.manualBookUrl || '',
          photoMainUrl: initialData.photoMainUrl || '',
          photoLabelUrl: initialData.photoLabelUrl || '',
          quantity: initialData.quantity ? Number(initialData.quantity) : 1 
        });
      } else {
        let defaultLab = 'Ruangan Admin (Aset Kantor)';
        if (labList && labList.length > 0) {
          defaultLab = typeof labList[0] === 'object' ? (labList[0].name || labList[0].id) : labList[0];
        }

        setFormData({
          name: '', brandType: '', serialNumber: '',
          procurementYear: '', fundingSource: '', invoiceNumber: '',
          lab: defaultLab, specificLocation: '',
          category: '', conditionStatus: 'Baik', pic: '',
          description: '', accessories: '',
          manualBookUrl: '', photoMainUrl: '', photoLabelUrl: '',
          quantity: 1 
        });
      }

      return () => clearTimeout(timer);
    } else {
      setRenderQR(false); 
    }
  }, [initialData, isOpen, labList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, Number(value)) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDeleteAsset = async () => {
    if (!initialData?.id) return;
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Aset "${formData.name}" akan dihapus secara permanen beserta datanya!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#991b1b', 
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost/prisma-api/delete_asset.php?id=${initialData.id}`);
        const data = await res.json();
        if (data.status === 'success') {
          Swal.fire('Terhapus!', 'Aset berhasil dihapus dari sistem logistik.', 'success');
          onClose();
          window.location.reload(); 
        } else {
          Swal.fire('Error', data.message || 'Gagal menghapus aset', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Gagal terhubung ke database server', 'error');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl overflow-hidden border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Section */}
        <div className="bg-brand h-20 flex items-center justify-between px-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-black tracking-[0.1em] text-sm lg:text-base uppercase">
                {initialData ? (t?.updateBtn || 'PERBARUI DATA ASET') : (t?.addBtn || 'TAMBAH ALAT BARU')}
              </h3>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-0.5">Sistem Logistik Prisma Fit</p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="p-2.5 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/10 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body Container */}
        <form onSubmit={handleSubmit} className="p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 bg-gradient-to-b from-white to-slate-50/40 max-h-[calc(100vh-160px)] overflow-y-auto">
          
          {/* LEFT SECTION */}
          <section className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.assetNameLabel || 'NAMA ASET / ALAT'}</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300" placeholder="e.g. Dumbbell 10kg, Treadmill Pro" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.brandTypeLabel || 'MERK / TIPE'}</label>
                <input type="text" name="brandType" value={formData.brandType} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300" placeholder="e.g. Shua, Kettler X1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.serialNumberLabel || 'NOMOR SERI / KODE QR'}</label>
                <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300" placeholder="e.g. SN-DB-2024-001" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.procurementYearLabel || 'TAHUN PENGADAAN'}</label>
                <input type="text" name="procurementYear" value={formData.procurementYear} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300" placeholder="e.g. 2024" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.fundingSourceLabel || 'SUMBER DANA'}</label>
                <input type="text" name="fundingSource" value={formData.fundingSource} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300" placeholder="e.g. RKAT 2024, Hibah" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.invoiceNumberLabel || 'NOMOR INVOICE'}</label>
                <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300" placeholder="e.g. INV/2024/VIII/1029" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.labLabel || 'LABORATORIUM / LOKASI'}</label>
                <select name="lab" value={formData.lab} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-700 transition-all bg-white appearance-none cursor-pointer">
                  {labList && labList.length > 0 ? (
                    labList.map((l, idx) => {
                      const labValue = typeof l === 'object' ? (l.name || l.id) : l;
                      return (
                        <option key={idx} value={labValue}>
                          {labValue}
                        </option>
                      );
                    })
                  ) : (
                    <option value="Ruangan Admin (Aset Kantor)">Ruangan Admin (Aset Kantor)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.specificLocationLabel || 'LOKASI SPESIFIK'}</label>
                <input type="text" name="specificLocation" value={formData.specificLocation} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300" placeholder="e.g. Rak Besi Samping Kiri" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.categoryLabel || 'KATEGORI ASET'}</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300" placeholder="e.g. Alat Kardio, Beban Bebas" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">JUMLAH ALAT (QTY)</label>
                <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.conditionLabel || 'STATUS KELAYAKAN'}</label>
                <select name="conditionStatus" value={formData.conditionStatus} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-700 transition-all bg-white appearance-none cursor-pointer">
                  <option value="Baik">Baik / Layak</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat / Perbaikan</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.picLabel || 'PERSON IN CHARGE (PIC)'}</label>
                <input type="text" name="pic" value={formData.pic} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300" placeholder="e.g. Nama Laboran / PIC" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.descriptionLabel || 'DESKRIPSI ASET'}</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300 resize-none" placeholder="Keterangan tambahan mengenai alat..." />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t?.accessoriesLabel || 'AKSESORIS ALAT'}</label>
                <textarea name="accessories" value={formData.accessories} onChange={handleChange} rows={3} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 text-xs font-bold text-gray-800 transition-all placeholder:text-gray-300 resize-none" placeholder="e.g. Adapter, Strap tambahan, Kunci L..." />
              </div>
            </div>
          </section>

          {/* RIGHT SECTION */}
          <section className="lg:col-span-5 space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{t?.qrLabel || 'KODE QR OTOMATIS'}</label>
                
                {formData.serialNumber ? (
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] flex flex-col items-center justify-center shadow-inner relative group min-h-[220px]">
                    {/* 🛡️ DIKUNCI: Menggunakan payload assetData sesuai kontrak baru AssetQRCodeProps */}
                    {renderQR ? (
                      <AssetQRCode 
                        t={t || { lang: 'id', printLabel: 'CETAK LABEL' }} 
                        assetData={{
                          name: formData.name || 'Tanpa Nama',
                          serialNumber: formData.serialNumber,
                          lab: formData.lab || 'Ruangan Admin',
                          brandType: formData.brandType || '-'
                        }} 
                      />
                    ) : (
                      <div className="animate-pulse flex items-center justify-center h-32 w-32 bg-slate-200 rounded-xl" />
                    )}
                    <p className="text-[10px] font-bold text-slate-400 mt-4 tracking-wider select-all">{formData.serialNumber}</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 11v1m4-6h1m-11 0h1m5-4v3m-1 1h2" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">{t?.qrHelper || 'KODE QR AKAN MUNCUL SETELAH NO. SERI DIISI'}</p>
                  </div>
                )}
                
                <div className="mt-6 border-2 border-dashed border-zinc-100 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center hover:border-brand/20 transition-all cursor-pointer group">
                  <p className="text-[10px] font-black uppercase text-gray-400 group-hover:text-brand transition-colors mb-2 tracking-widest">{t?.photoLabel || 'UNGGAH FOTO ALAT'}</p>
                  <input type="file" multiple className="text-[10px] opacity-50" />
                </div>
                
                <div className="bg-brand/5 p-6 rounded-[2rem] flex items-center gap-4 border border-brand/10">
                   <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-brand tracking-tighter">{t?.manualBookLabel || 'DOKUMEN MANUAL BOOK (PDF)'}</p>
                    <input type="file" className="text-[10px] mt-1 opacity-60" />
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-6 flex gap-4 w-full">
              {initialData && (
                <button 
                  type="button" 
                  onClick={handleDeleteAsset} 
                  className="px-6 py-6 bg-red-50 hover:bg-red-100 border border-red-200/60 text-red-700 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest transition-all active:scale-[0.97]"
                >
                  HAPUS ALAT
                </button>
              )}
              
              <button 
                type="submit" 
                className="flex-1 py-6 bg-brand hover:bg-utama text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98]"
              >
                {initialData ? (t?.updateBtn || 'PERBARUI DATA ASET') : (t?.addBtn || 'TAMBAH ALAT')}
              </button>
            </div>
          </section>

        </form>
      </div>
    </div>
  );
};

export default EditAssetModal;