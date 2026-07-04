import React, { useState } from 'react';
import HomeTab from './tabs/HomeTab';
import AdminRoomTab from './tabs/AdminRoomTab'; 
import ManageAssetTab from './tabs/ManageAssetTab';
import LabsTab from './tabs/LabsTab';
import AddAssetModal from './tabs/EditAssetModal'; 
import LoanRequestModal from './components/LoanRequestModal'; 
import ApprovalTab from './tabs/ApprovalTab';
import MonitoringTab from './tabs/MonitoringTab'; 
import HistoryTab from './tabs/HistoryTab';
import AdminPanel from './tabs/AdminPanel'; 
import Swal from 'sweetalert2';
import { API_BASE_URL } from './App';

interface DashboardProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  authToken: string | null;
  lang: 'id' | 'en';
  setLang: (l: 'id' | 'en') => void;
  t: any;
  assets: any[];
  setAssets: React.Dispatch<React.SetStateAction<any[]>>;
  loans: any[];
  activeTab: 'home' | 'labs' | 'admin-assets' | 'manage-assets' | 'loans' | 'monitoring' | 'history' | 'admin-panel' | string;
  setActiveTab: React.Dispatch<React.SetStateAction<any>>;
  selectedLab: string | null;
  setSelectedLab: (lab: string | null) => void;
  setIsScannerOpen: (val: boolean) => void;
  setIsAddAssetOpen: (val: boolean) => void;
  isAddAssetOpen: boolean; 
  isLoanFormOpen: boolean;
  setIsLoanFormOpen: (val: boolean) => void; 
  selectedAssetForLoan: any; 
  setSelectedAssetForLoan: (asset: any) => void; 
  openLoanForm: (asset: any) => void;
  handlePrint: (asset: any) => void;
  labList: any[];
  filteredAssets: any[];
  onSaveAsset: (data: any) => void; 
  onLoanSubmit: (data: any) => void;
  onReturnAsset?: (loanId: string) => void; 
}

const DashboardMain: React.FC<DashboardProps> = ({
  currentUser, setCurrentUser, authToken, lang, setLang, t, assets, setAssets, loans, activeTab, setActiveTab, 
  selectedLab, setSelectedLab, setIsScannerOpen, setIsAddAssetOpen, isAddAssetOpen, 
  isLoanFormOpen, setIsLoanFormOpen, selectedAssetForLoan, setSelectedAssetForLoan,
  openLoanForm, handlePrint, labList, filteredAssets, onSaveAsset, onLoanSubmit, onReturnAsset 
}) => {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingLoanId, setProcessingLoanId] = useState<string | null>(null);

  const handleOpenLoanForm = (asset: any) => {
    setSelectedAssetForLoan(asset);
    setIsLoanFormOpen(true);
    if (openLoanForm) openLoanForm(asset);
  };

  const handleApproveLoan = async (loanId: string, assetId: string) => {
    setProcessingLoanId(loanId);
    try {
      const res = await fetch(`${API_BASE_URL}/approve_loan.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ id: loanId, assetId })
      });
      const result = await res.json();
      if (result.status === 'success') {
        Swal.fire({ title: 'Berhasil!', text: 'Peminjaman disetujui!', icon: 'success', confirmButtonColor: '#5c1313' });
      } else {
        Swal.fire({ title: 'Gagal!', text: result.message, icon: 'error', confirmButtonColor: '#5c1313' });
      }
    } catch (error) {
      console.error("Error approving loan:", error);
      Swal.fire({ title: 'Error!', text: 'Gagal menghubungi server.', icon: 'error', confirmButtonColor: '#5c1313' });
    } finally {
      setProcessingLoanId(null);
    }
  };

  const handleRejectLoan = async (loanId: string) => {
    setProcessingLoanId(loanId);
    try {
      const res = await fetch(`${API_BASE_URL}/reject_loan.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ id: loanId })
      });
      const result = await res.json();
      if (result.status === 'success') {
        Swal.fire({ title: 'Berhasil', text: 'Peminjaman ditolak.', icon: 'success', confirmButtonColor: '#5c1313' });
      } else {
        Swal.fire({ title: 'Gagal!', text: result.message, icon: 'error', confirmButtonColor: '#5c1313' });
      }
    } catch (error) {
      console.error("Error rejecting loan:", error);
    } finally {
      setProcessingLoanId(null);
    }
  };

  const navItems = [
    { id: 'home', label: lang === 'id' ? 'Beranda' : 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['admin', 'mahasiswa', 'dosen', 'asisten laboratorium'] },
    { id: 'labs', label: lang === 'id' ? 'Daftar Laboratorium' : 'Laboratory List', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5', roles: ['admin', 'mahasiswa', 'dosen', 'asisten laboratorium'] },
    { id: 'admin-assets', label: lang === 'id' ? 'Aset Laboratorium' : 'Lab Assets', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944', roles: ['admin', 'mahasiswa', 'dosen', 'asisten laboratorium'] },
    { id: 'manage-assets', label: lang === 'id' ? 'Kelola Aset' : 'Manage Assets', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11', roles: ['admin', 'asisten laboratorium'] },
    { id: 'loans', label: lang === 'id' ? 'Persetujuan Peminjaman' : 'Loan Approvals', icon: 'M9 12l2 2 4-4', roles: ['admin', 'asisten laboratorium'] },
    { id: 'monitoring', label: lang === 'id' ? 'Pemantauan Aktif' : 'Active Monitoring', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['admin', 'dosen', 'asisten laboratorium'] },
    { id: 'history', label: lang === 'id' ? 'Riwayat Peminjaman' : 'Loan History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['admin', 'mahasiswa', 'dosen', 'asisten laboratorium'] },
    { id: 'admin-panel', label: lang === 'id' ? 'Kelola Pengguna' : 'Manage Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['admin'] },
  ];

  return (
    <div className="no-print flex flex-col min-h-screen bg-slate-50/70">
      <header className="bg-brand h-14 flex items-center justify-between px-6 text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button aria-label="Toggle sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/20 rounded-lg transition-all">
            <svg className={`w-5 h-5 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <span className="text-base font-black tracking-[0.2em] uppercase opacity-95">PRISMA FIT</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/10 p-0.5 rounded-lg">
            <button onClick={() => setLang('id')} className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all ${lang === 'id' ? 'bg-white text-brand shadow' : 'text-white/40 hover:text-white'}`}>ID</button>
            <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all ${lang === 'en' ? 'bg-white text-brand shadow' : 'text-white/40 hover:text-white'}`}>EN</button>
          </div>
          <button aria-label="Logout" onClick={() => setCurrentUser(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <div className={`bg-gradient-to-r from-brand via-[#5c1313] to-utama transition-all duration-500 overflow-hidden relative ${isSidebarOpen ? 'h-40' : 'h-0 opacity-0'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="h-full w-full relative">
          <div className="absolute top-6 right-8 text-right">
            <h1 className="text-white text-3xl lg:text-4xl font-black tracking-[0.15em] uppercase opacity-10 pointer-events-none select-none leading-tight">
              PRISMA <br/> 
              <span className="text-xl lg:text-2xl">TELKOM UNIVERSITY</span>
            </h1>
          </div>
        </div>
      </div>

      <div className={`mx-auto w-full px-4 lg:px-6 transition-all duration-500 flex flex-col lg:flex-row gap-6 pb-12 relative z-30 
        ${isSidebarOpen ? '-mt-14 max-w-[1600px]' : 'mt-6 max-w-[1600px]'}`}>
        
        <aside className={`shrink-0 space-y-4 transition-all duration-500 ease-in-out 
          ${isSidebarOpen ? 'w-full lg:w-72 opacity-100' : 'w-0 h-0 opacity-0 pointer-events-none'}`}>
          
          <div className="bg-white rounded-[24px] shadow-xl shadow-black/5 overflow-hidden border border-gray-100/80">
            <div className="h-14 bg-gray-50"></div>
            <div className="px-6 pb-6 -mt-8 flex flex-col items-center">
              <h2 className="text-utama font-bold text-lg leading-tight mb-1.5 text-center tracking-tight pt-2">
                {currentUser?.name}
              </h2>
              <div className="bg-brand/5 px-3 py-1 rounded-full border border-brand/10 mb-2">
                <p className="text-brand font-black text-[9px] uppercase tracking-widest">
                  {currentUser?.role?.toLowerCase() === 'mahasiswa' ? (t?.userLabel || 'Mahasiswa') : currentUser?.role}
                </p>
              </div>
              <p className="text-[10px] font-semibold text-gray-400 lowercase tracking-wider">{currentUser?.email}</p>
            </div>
          </div>

          <nav className="bg-white rounded-[24px] shadow-xl shadow-black/5 border border-gray-100/80 overflow-hidden py-2">
            {navItems.map(nav => {
              const hasAccess = nav.roles.map(r => r.toLowerCase().trim()).includes(currentUser?.role?.toLowerCase().trim());
              return hasAccess && (
                <button 
                  key={nav.id} 
                  onClick={() => { setActiveTab(nav.id); setSelectedLab(null); }} 
                  className={`w-full flex items-center gap-3.5 px-6 py-3.5 font-bold text-xs transition-all border-l-[5px] group
                    ${activeTab === nav.id 
                      ? 'bg-brand/5 text-brand border-brand font-extrabold' 
                      : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-utama'}`}
                >
                  <svg className={`w-4 h-4 transition-colors ${activeTab === nav.id ? 'text-brand' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d={nav.icon} />
                  </svg>
                  {nav.label}
                </button>
              );
            })}
            
            <div className="px-6 py-3">
              <button 
                onClick={() => setIsScannerOpen(true)} 
                className="w-full py-3.5 bg-gradient-to-r from-brand to-[#4a0d0d] text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-brand/20 hover:from-[#4a0d0d] hover:to-brand transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 11v1m4-6h1m-11 0h1m5-4v3m-1 1h2" />
                </svg>
                {t?.scanBtn || 'PINDAI QR CODE'}
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 w-full bg-white rounded-[1.5rem] lg:rounded-[2rem] shadow-xl shadow-black/5 p-6 lg:p-8 border border-gray-100/60 min-h-[550px] transition-all duration-500 overflow-hidden">
          {activeTab === 'home' && <HomeTab t={t} assets={assets} loans={loans} setActiveTab={setActiveTab} currentUser={currentUser} />}
          
          {activeTab === 'labs' && (
            <LabsTab 
              t={t} assets={assets} selectedLab={selectedLab} setSelectedLab={setSelectedLab} 
              openLoanForm={handleOpenLoanForm} currentUser={currentUser} 
            />
          )}
          
          {activeTab === 'loans' && (
            <ApprovalTab t={t} loans={loans} onApprove={handleApproveLoan} onReject={handleRejectLoan} processingLoanId={processingLoanId} />
          )}
          
          {activeTab === 'monitoring' && (
            <MonitoringTab t={t} loans={loans} onReturnAsset={(id) => onReturnAsset ? onReturnAsset(id) : undefined} />
          )}
          
          {activeTab === 'history' && <HistoryTab t={t} loans={loans} currentUser={currentUser} />}
          
          {activeTab === 'admin-panel' && currentUser?.role?.toLowerCase() === 'admin' && (
            <AdminPanel authToken={authToken} />
          )}
          
          {activeTab === 'admin-assets' && (
            <AdminRoomTab 
              assets={assets} setAssets={setAssets} currentUser={currentUser} t={t} 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedLab={selectedLab} setSelectedLab={setSelectedLab} 
              handlePrint={handlePrint} onSaveAsset={onSaveAsset} labList={labList}
            />
          )}

          {activeTab === 'manage-assets' && (
            <ManageAssetTab 
              assets={assets} setAssets={setAssets} currentUser={currentUser} t={t} 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedLab={selectedLab} setSelectedLab={setSelectedLab} 
              setIsAddAssetOpen={setIsAddAssetOpen} handlePrint={handlePrint} onSaveAsset={onSaveAsset} labList={labList}
            />
          )}
        </main>
      </div>

      <AddAssetModal 
        isOpen={isAddAssetOpen} 
        onClose={() => setIsAddAssetOpen(false)} 
        labList={labList} 
        t={t} 
        onSave={(data) => onSaveAsset(data)} 
      />
      
      <LoanRequestModal 
        isOpen={isLoanFormOpen} 
        onClose={() => setIsLoanFormOpen(false)} 
        asset={selectedAssetForLoan} 
        onSubmit={(loanData) => onLoanSubmit(loanData)} 
      />
    </div>
  );
};

export default DashboardMain;