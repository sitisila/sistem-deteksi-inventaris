import React, { useMemo } from 'react';
import { Loan } from '../types'; 

interface MonitoringTabProps {
  t: any;
  loans: Loan[];
  onReturnAsset: (loanId: string) => void;
}

const MonitoringTab: React.FC<MonitoringTabProps> = ({ t, loans, onReturnAsset }) => {
  

  const activeLoans = useMemo(() => {
    return loans.filter(loan => loan.status === 'BORROWED' || loan.status === 'APPROVED');
  }, [loans]);

  const handleConfirmReturn = (loanId: string, assetName: string) => {
    if (window.confirm(`${t.confirmReturnAlert}${assetName}${t.confirmReturnSubAlert}`)) {
      onReturnAsset(loanId);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-2xl lg:text-3xl font-black text-utama tracking-tighter uppercase">
          {t.monitoringTitle} <span className="text-brand">({activeLoans.length})</span>
        </h3>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-zinc-200/50 overflow-hidden mx-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50/50 text-gray-400 text-left text-[10px] uppercase tracking-[0.2em] font-black border-bottom border-gray-50">
              <tr>
                <th className="px-8 py-6">{t.thBorrower}</th>
                <th className="px-8 py-6">{t.thDeviceInfo}</th>
                <th className="px-8 py-6">{t.thBorrowTime}</th>
                <th className="px-8 py-6">{t.thReturnEst}</th>
                <th className="px-8 py-6 text-center">{t.thStatusAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeLoans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-24">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                        <svg className="w-8 h-8 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-gray-300 font-black uppercase tracking-[0.3em] text-[10px]">
                        {t.noActiveLoan}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeLoans.map(loan => (
                  <tr key={loan.id} className="hover:bg-brand/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-utama flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-zinc-200 group-hover:bg-brand transition-colors">
                          {loan.userName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-utama uppercase tracking-tight leading-none mb-1.5">{loan.userName}</p>
                          <p className="text-[10px] text-gray-400 font-bold lowercase tracking-wide">{loan.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100 inline-block font-black text-xs text-utama uppercase tracking-tight">
                        {loan.assetName}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-gray-500 font-bold text-[11px] uppercase">
                      {new Date(loan.createdAt).toLocaleDateString(t.lang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-brand font-black text-xs uppercase">
                           {new Date(loan.returnDate).toLocaleDateString(t.lang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{t.estimatedLabel || 'EST. RETURN'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => handleConfirmReturn(loan.id, loan.assetName)}
                        className="px-6 py-3 bg-utama text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand hover:scale-105 transition-all shadow-xl hover:shadow-brand/20 active:scale-95"
                      >
                        {t.confirmReturnBtn}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonitoringTab;