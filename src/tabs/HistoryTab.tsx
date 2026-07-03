import React, { useMemo } from 'react';
import { Loan } from '../types';
import * as XLSX from 'xlsx';

interface HistoryTabProps {
  t: any; 
  loans: Loan[];
  currentUser: any;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ t, loans, currentUser }) => {
  
  const historyData = useMemo(() => {
    const finishedStatus = ['RETURNED', 'REJECTED'];
    let filtered = loans.filter(loan => finishedStatus.includes(loan.status));
    if (currentUser.role?.toLowerCase() !== 'admin') {
      filtered = filtered.filter(loan => loan.userId === currentUser.id);
    }
    return filtered;
  }, [loans, currentUser]);

  const exportToExcel = () => {
    const reportData = historyData.map(loan => ({
      'ID Peminjaman': loan.id,
      'Nama Peminjam': loan.userName,
      'Email': loan.userEmail,
      'Nama Alat': loan.assetName,
      'Tanggal Pinjam': new Date(loan.createdAt).toLocaleString(t.lang === 'id' ? 'id-ID' : 'en-US'),
      'Tanggal Kembali': loan.returnedAt ? new Date(loan.returnedAt).toLocaleString(t.lang === 'id' ? 'id-ID' : 'en-US') : '-',
      'Status Akhir': loan.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Peminjaman");

    const fileName = `Laporan_PrismaFit_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h3 className="text-3xl font-black text-utama tracking-tighter uppercase leading-none">
            {t.historyTitle}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-3">
            {t.archiveSystem} <span className="text-brand">({historyData.length} {t.records})</span>
          </p>
        </div>
        
        {(currentUser.role?.toLowerCase() === 'admin') && historyData.length > 0 && (
          <button 
            onClick={exportToExcel}
            className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-100 hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t.exportBtn}
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-zinc-200/50 overflow-hidden mx-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-zinc-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
              <tr>
                <th className="px-8 py-6">{t.assetTable}</th>
                <th className="px-8 py-6">{t.statusTable}</th>
                <th className="px-8 py-6">{t.dateTable}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historyData.map(loan => (
                <tr key={loan.id} className="group hover:bg-brand/[0.02] transition-all">
                  <td className="px-8 py-6">
                    <p className="font-black text-utama uppercase leading-none mb-2 group-hover:text-brand transition-colors">{loan.assetName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{loan.userName}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      loan.status === 'RETURNED' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-brand/5 text-brand border-brand/10'
                    }`}>
                      {loan.status === 'RETURNED' ? t.statusApproved : t.statusRejected}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="text-utama font-black text-xs">
                            {loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString(t.lang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                            {loan.returnedAt ? new Date(loan.returnedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {historyData.length === 0 && (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-50 rounded-full mb-4 border border-zinc-100">
                 <svg className="w-6 h-6 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-[10px]">{t.noRecentData}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;