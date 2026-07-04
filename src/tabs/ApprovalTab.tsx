import React from 'react';

interface ApprovalTabProps {
  t: any;
  loans: any[];
  onApprove: (loanId: string, assetId: string) => void;
  onReject: (loanId: string) => void;
  processingLoanId?: string | null;
}

const ApprovalTab: React.FC<ApprovalTabProps> = ({ t, loans, onApprove, onReject, processingLoanId }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 px-2">
        <h2 className="text-3xl font-black text-utama uppercase tracking-tighter leading-none">{t.approvalTitle}</h2>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">{t.approvalDesc}</p>
      </div>

      <div className="overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 shadow-sm mx-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-utama text-white">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">{t.thApplicant}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">{t.thAssetQty}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">{t.thBorrowTime}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">{t.thStatus}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">{t.thAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loans.length > 0 ? loans.map((loan) => {
              const isProcessing = processingLoanId === loan.id;
              return (
                <tr key={loan.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="p-6">
                    <p className="font-black text-utama uppercase text-sm">{loan.userName || 'Mahasiswa'}</p>
                    <p className="text-[10px] text-gray-400 font-bold italic mt-1">"{loan.purpose}"</p>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-brand text-xs uppercase group-hover:scale-105 transition-transform origin-left">{loan.assetName}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">{t.qtyLabel}: {loan.quantity || 1}</p>
                  </td>
                  <td className="p-6 text-[10px] font-black text-gray-500 uppercase leading-relaxed">
                    {loan.loanDate} <br/>
                    <span className="text-brand font-black">{loan.borrowTime} WIB</span>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      loan.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                      loan.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-zinc-100 text-gray-600 border-zinc-200'
                    }`}>
                      {loan.status === 'PENDING' ? t.statusPending : loan.status === 'APPROVED' ? t.statusApproved : t.statusRejected}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {loan.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onApprove(loan.id, loan.assetId)} disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-green-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
                          {isProcessing ? '...' : t.approveBtn}
                        </button>
                        <button onClick={() => onReject(loan.id)} disabled={isProcessing}
                          className="bg-utama hover:bg-brand text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-zinc-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
                          {isProcessing ? '...' : t.rejectBtn}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="p-24 text-center">
                  <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-xs">{t.noApprovalQueue}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalTab;