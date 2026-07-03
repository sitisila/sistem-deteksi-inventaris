import React from 'react';

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
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!selectedLab ? (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black text-utama uppercase tracking-tighter">{t?.labListTitle || 'Daftar Laboratorium'}</h2>
            <p className="text-gray-500 font-medium">{t?.labListDesc || 'Silahkan pilih laboratorium untuk melihat aset'}</p>
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
              <button key={lab.id} onClick={() => setSelectedLab(lab.name)} className="group relative overflow-hidden bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all text-left">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${lab.color} opacity-10 rounded-bl-[4rem] group-hover:scale-110 transition-transform`}></div>
                <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-2">{t?.roomLabel || 'Ruang'}: {lab.room}</p>
                <h3 className="text-xl font-black text-utama leading-tight uppercase group-hover:text-brand transition-colors">{lab.name}</h3>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>{t?.viewAsset || 'Lihat Aset'}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <button onClick={() => setSelectedLab(null)} className="flex items-center gap-2 text-gray-400 hover:text-brand font-black text-[10px] uppercase tracking-widest transition-colors bg-gray-50 hover:bg-brand/5 px-4 py-2.5 rounded-full w-fit border border-gray-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t?.backToList || 'Kembali ke Daftar'}
          </button>
          
          <div className="bg-gradient-to-r from-utama to-brand p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">
                {/* Solusi Pengaman: Cek jika selectedLab ternyata tidak sengaja terisi Objek */}
                {typeof selectedLab === 'object' ? (selectedLab?.name || selectedLab?.id) : selectedLab}
              </h2>
              <p className="text-white/50 font-bold text-xs uppercase tracking-[0.3em]">{t?.labInventory || 'Inventaris Aset Laboratorium'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {assets.filter(a => a.lab === (typeof selectedLab === 'object' ? selectedLab?.name : selectedLab)).length > 0 ? (
              assets.filter(a => a.lab === (typeof selectedLab === 'object' ? selectedLab?.name : selectedLab)).map((asset) => {
                const isAvailable = asset.status === 'AVAILABLE' || asset.status === 'TERSEDIA';
                
                return (
                  <div 
                    key={asset.id} 
                    className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-brand/20"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] font-mono font-bold text-gray-400 tracking-wider">
                          {asset.code || '#PRISMA-FIT'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                          isAvailable 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {isAvailable ? (t?.available || 'TERSEDIA') : (t?.borrowed || 'DIPINJAM')}
                        </span>
                      </div>

                      <h4 className="font-black text-utama uppercase text-base group-hover:text-brand transition-colors leading-tight mb-4 break-words">
                        {asset.name}
                      </h4>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4 mt-auto">
                      <div className="text-left shrink-0">
                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Kondisi</span>
                        <span className="text-xs font-black text-utama">GOOD</span>
                      </div>

                      <div className="flex-1 flex justify-end min-w-0">
                        {currentUser?.role?.toLowerCase() === 'dosen' ? (
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-center">
                            {t?.monitorOnly || 'Hanya Pantau'}
                          </span>
                        ) : (
                          <button 
                            onClick={() => openLoanForm(asset)} 
                            disabled={!isAvailable} 
                            className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] transition-all duration-300 px-4 py-2.5 rounded-xl border shadow-sm active:scale-95 text-center leading-normal break-words max-w-full ${
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
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center">
                <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-xs">{t?.noAssetInLab || 'TIDAK ADA ASET DI LAB INI'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabsTab;