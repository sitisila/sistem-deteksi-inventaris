import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../App';

interface HistoryTabProps {
  t: any;
  loans: any[];
  currentUser: any;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ t, loans, currentUser }) => {
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [condition, setCondition] = useState('Baik / Layak');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState('bukti_default.jpg'); // Fallback foto bukti biar ga kosong woi
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter data peminjaman milik user yang login saat ini (jika mahasiswa)
  const myLoans = loans.filter(l => {
    if (currentUser?.role?.toLowerCase() === 'admin') return true;
    return String(l.user_id || l.userId) === String(currentUser?.id);
  });

  const openReturnModal = (loan: any) => {
    setSelectedLoan(loan);
    setCondition('Baik / Layak');
    setNotes('');
    setPhoto('bukti_default.jpg');
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Biar halaman ga hard-refresh woi
    if (!selectedLoan) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const payload = {
        loanId: selectedLoan.id || selectedLoan.loan_id,
        assetId: selectedLoan.asset_id || selectedLoan.assetId,
        condition: condition,
        notes: notes,
        photo: photo // API wajib minta photo diisi woi
      };

      const res = await fetch(`${API_BASE_URL}/return_loan.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.status === 'success') {
        Swal.fire({
          title: 'Berhasil!',
          text: result.message || 'Barang berhasil dikembalikan',
          icon: 'success',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        
        setIsReturnModalOpen(false);
        // Memicu trigger refresh otomatis data peminjaman di App.tsx tanpa reload
        window.dispatchEvent(new CustomEvent('refreshLoansData'));
      } else {
        Swal.fire('Gagal!', result.message || 'Gagal memproses pengembalian.', 'error');
      }
    } catch (error) {
      console.error("Error submitting return:", error);
      Swal.fire('Error!', 'Gagal terhubung ke database server.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 px-2">
        <h3 className="text-3xl font-black text-utama tracking-tighter uppercase leading-none">
          RIWAYAT PEMINJAMAN
        </h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          LOG AKTIVITAS LOGISTIK ANDA
        </p>
      </div>

      <div className="overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 shadow-sm mx-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-utama text-white">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">ASET & QTY</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">WAKTU PINJAM</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">STATUS</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {myLoans.length > 0 ? (
              myLoans.map((loan) => {
                const idLoan = loan.id || loan.loan_id || '';
                const namaAset = loan.assetName || loan.asset_name || 'Aset';
                const statusText = String(loan.status || '').toUpperCase();

                return (
                  <tr key={idLoan} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-brand text-sm uppercase">{namaAset}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">JUMLAH: {loan.quantity || loan.qty || 1}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-gray-600">{loan.loan_date || '2026-07-05'}</p>
                      <p className="text-[10px] text-brand font-black">{loan.borrowTime?.substring(0, 5) || '00:00'} WIB</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                        statusText === 'DISETUJUI' || statusText === 'APPROVED' || statusText === 'DIKEMBALIKAN'
                          ? 'bg-green-50 text-green-600 border-green-100'
                          : statusText === 'DITOLAK' || statusText === 'REJECTED'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                      }`}>
                        {statusText === 'APPROVED' ? 'DISETUJUI' : statusText}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      {/* 🎯 FIX UTAMA: Tombol kembalikan cuma tampil jika status disetujui DAN role user adalah mahasiswa */}
                      {(statusText === 'APPROVED' || statusText === 'DISETUJUI') && currentUser?.role?.toLowerCase() === 'mahasiswa' ? (
                        <button
                          type="button"
                          onClick={() => openReturnModal(loan)}
                          className="px-4 py-2 bg-brand hover:bg-gray-950 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95"
                        >
                          Kembalikan Aset
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                  Tidak ada data riwayat peminjaman.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal Pengembalian */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-black text-utama text-base uppercase tracking-tight">FORM PENGEMBALIAN</h3>
              <button type="button" onClick={() => setIsReturnModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Kondisi Pengembalian</label>
                <select 
                  value={condition} 
                  onChange={(e) => setCondition(e.target.value)} 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-gray-700 bg-white"
                >
                  <option value="Baik / Layak">Baik / Layak</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Foto Bukti Pengembalian</label>
                <input 
                  type="file" 
                  onChange={(e) => {
                    if(e.target.files && e.target.files[0]) {
                      setPhoto(e.target.files[0].name);
                    }
                  }}
                  className="w-full block text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer" 
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Catatan Tambahan</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  rows={3} 
                  placeholder="Ketik catatan di sini..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsReturnModalOpen(false)} 
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center"
                >
                  {isSubmitting ? 'MENGIRIM...' : 'KIRIM'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;