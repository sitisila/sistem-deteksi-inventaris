import React, { useState, useEffect, useMemo } from 'react'; 
import { Role, User, Asset, Loan, LoanStatus } from './types'; 
import { INITIAL_ASSETS, INITIAL_LOANS, TRANSLATIONS } from './constants'; 
import Login from './Login';
import DashboardMain from './DashboardMain';
import QRScanner from './components/QRScanner';
import Swal from 'sweetalert2'; 

// ✔ PERBAIKAN 1: Mendefinisikan URL API Laragon Anda dan interface ExtendedAsset agar tidak undefined
const API_BASE_URL = 'http://prisma-api.test'; 

interface ExtendedAsset extends Asset {
  [key: string]: any;
}

const App: React.FC = () => {
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const t = useMemo(() => TRANSLATIONS[lang], [lang]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // ✔ PERBAIKAN 2: Menambahkan state token autentikasi yang dibawa oleh update sistem teman Anda
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token'));
  
  const [assets, setAssets] = useState<Asset[]>([]); 
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedAsset, setScannedAsset] = useState<ExtendedAsset | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'labs' | 'admin-assets' | 'manage-assets' | 'loans' | 'monitoring' | 'history' | 'admin-panel' | string>('home');
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); 

  const [isLoanFormOpen, setIsLoanFormOpen] = useState(false);
  const [selectedAssetForLoan, setSelectedAssetForLoan] = useState<ExtendedAsset | null>(null);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [assetToPrint, setAssetToPrint] = useState<Asset | null>(null);

  const labList = useMemo(() => [
    { id: 'Admin', name: 'Ruangan Admin', room: 'Office', color: 'from-gray-600 to-gray-800' },
    { id: 'Mechanic Workshop', name: 'Mechanical and Electrical Workshop Laboratory', room: 'G13', color: 'from-blue-500 to-blue-700' },
    { id: 'TelNet', name: 'Telecommunication Networking (TelNet) Laboratory', room: 'G4', color: 'from-purple-500 to-purple-700' },
    { id: 'OCS', name: 'Optical Communication System (OCS) Laboratory', room: 'G9', color: 'from-orange-500 to-orange-700' },
    { id: 'WiComm', name: 'Wireless Communication (WiComm) Laboratory', room: 'E3', color: 'from-green-500 to-green-700' },
    { id: 'TTRL', name: 'Telecommunication Technology Research Laboratory', room: 'A1', color: 'from-red-500 to-red-700' },
    { id: 'CellComm', name: 'Cellular Communication (CellComm) Laboratory', room: 'A1', color: 'from-cyan-500 to-cyan-700' },
  ], []);

  // ✔ PERBAIKAN 3: Membuat helper fungsi authFetch agar request menyertakan token Bearer secara otomatis
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }
    return fetch(url, { ...options, headers });
  };

  const fetchAssets = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/get_assets.php`);
      const data = await response.json();
      if (data && Array.isArray(data)) setAssets(data);
    } catch (error) { console.error("Gagal mengambil data aset:", error); }
  };

  const fetchLoans = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/get_loans.php`);
      const data = await response.json();
      if (data && Array.isArray(data)) setLoans(data);
    } catch (error) { console.error("Gagal mengambil data peminjaman:", error); }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAssets();
      fetchLoans();
      const interval = setInterval(() => {
        fetchAssets();
        fetchLoans();
      }, 5000); 
      return () => clearInterval(interval);
    }
  }, [currentUser, authToken]);

  const handleLoginSubmit = async (formData: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.status === 'success') {
        setCurrentUser(result.user);
        if (result.token) {
          setAuthToken(result.token);
          localStorage.setItem('token', result.token);
        }
        return true;
      } else {
        Swal.fire({
          title: lang === 'id' ? 'Gagal Masuk!' : 'Login Failed!',
          text: result.message || (lang === 'id' ? 'Email atau Password salah!' : 'Incorrect Email or Password!'),
          icon: 'error',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        return false;
      }
    } catch (error) { 
      Swal.fire({
        title: lang === 'id' ? 'Error!' : 'Error!',
        text: lang === 'id' ? 'Koneksi ke server PHP gagal!' : 'Connection to PHP server failed!',
        icon: 'error',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
      return false;
    }
  };

  const handleRegisterSubmit = async (formData: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.status === 'success') {
        Swal.fire({
          title: lang === 'id' ? 'Berhasil!' : 'Success!',
          text: lang === 'id' ? 'Registrasi Berhasil! Silakan Login.' : 'Registration Successful! Please Login.',
          icon: 'success',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        return true;
      } else {
        Swal.fire({
          title: lang === 'id' ? 'Gagal Daftar!' : 'Registration Failed!',
          text: (lang === 'id' ? 'Gagal Daftar: ' : 'Failed: ') + result.message,
          icon: 'error',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        return false;
      }
    } catch (error) { 
      Swal.fire({
        title: lang === 'id' ? 'Error!' : 'Error!',
        text: lang === 'id' ? 'Koneksi ke server PHP gagal!' : 'Connection to PHP server failed!',
        icon: 'error',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
      return false;
    }
  };

  const handleSaveNewAsset = async (data: any) => {
    const isUpdate = !!data.id;
    const endpoint = isUpdate ? 'update_asset.php' : 'save_asset.php';
    try {
      const response = await authFetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.status === 'success') {
        Swal.fire({
          title: lang === 'id' ? 'Berhasil!' : 'Success!',
          text: isUpdate
            ? (lang === 'id' ? 'Aset berhasil diperbarui!' : 'Asset updated successfully!')
            : (lang === 'id' ? 'Aset berhasil disimpan!' : 'Asset saved successfully!'),
          icon: 'success',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        fetchAssets();
        setIsAddAssetOpen(false);
      } else { 
        Swal.fire({
          title: lang === 'id' ? 'Gagal!' : 'Failed!',
          text: (lang === 'id' ? 'Gagal simpan: ' : 'Save failed: ') + result.message,
          icon: 'error',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
      }
    } catch (error) { 
      Swal.fire({
        title: 'Error!',
        text: lang === 'id' ? 'Error koneksi ke API!' : 'API Connection error!',
        icon: 'error',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
    }
  };

  const handleLoanSubmit = async (loanData: any) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/request_loan.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData)
      });
      const result = await response.json();
      if (result.status === 'success') {
        Swal.fire({
          title: lang === 'id' ? 'Berhasil!' : 'Success!',
          text: lang === 'id' ? 'Permintaan peminjaman berhasil terkirim!' : 'Loan request sent successfully!',
          icon: 'success',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        setIsLoanFormOpen(false); 
        fetchLoans();
      } else { 
        Swal.fire({
          title: lang === 'id' ? 'Gagal!' : 'Failed!',
          text: (lang === 'id' ? 'Gagal: ' : 'Failed: ') + result.message,
          icon: 'error',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
      }
    } catch (error) { 
      Swal.fire({
        title: 'Error!',
        text: lang === 'id' ? 'Error koneksi saat meminjam.' : 'Connection error during loan request.',
        icon: 'error',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
    }
  };

  const handleScan = (data: string | null) => {
    if (data) {
      const foundAsset = assets.find(a => 
        String(a.id) === data.trim() || 
        (a.serialNumber && a.serialNumber.trim().toLowerCase() === data.trim().toLowerCase())
      );

      if (foundAsset) {
        setIsScannerOpen(false); 
        if (foundAsset.status === 'AVAILABLE') { 
          setSelectedAssetForLoan(foundAsset); 
          setIsLoanFormOpen(true); 
        } else { 
          Swal.fire({
            title: lang === 'id' ? 'Tidak Tersedia!' : 'Not Available!',
            text: lang === 'id' 
              ? `Aset ${foundAsset.name || ''} sedang tidak tersedia (Status: ${foundAsset.status}).`
              : `Asset ${foundAsset.name || ''} is currently unavailable (Status: ${foundAsset.status}).`,
            icon: 'warning',
            confirmButtonColor: '#5c1313',
            customClass: { popup: 'rounded-[2rem]' }
          });
        }
      } else {
        Swal.fire({
          title: lang === 'id' ? 'Tidak Ditemukan!' : 'Not Found!',
          text: lang === 'id'
            ? `Aset dengan kode "${data}" tidak ditemukan di database.`
            : `Asset with code "${data}" was not found in the database.`,
          icon: 'error',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
      }
    }
  };

  const handleForgotPassword = (email: string) => { 
    Swal.fire({
      title: lang === 'id' ? 'Lupa Password?' : 'Forgot Password?',
      text: lang === 'id' ? 'Silakan hubungi Admin Laboratorium.' : 'Please contact the Laboratory Admin.',
      icon: 'info',
      confirmButtonColor: '#5c1313',
      customClass: { popup: 'rounded-[2rem]' }
    });
  };

  const handleReturnAsset = async (loanId: string) => { 
    try {
      const response = await authFetch(`${API_BASE_URL}/return_loan.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId })
      });
      const result = await response.json();
      if (result.status === 'success') {
        Swal.fire({
          title: lang === 'id' ? 'Berhasil!' : 'Success!',
          text: lang === 'id' ? 'Aset berhasil dikembalikan.' : 'Asset returned successfully.',
          icon: 'success',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        fetchLoans();
        fetchAssets();
      } else {
        Swal.fire({
          title: lang === 'id' ? 'Gagal!' : 'Failed!',
          text: result.message,
          icon: 'error',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: lang === 'id' ? 'Gagal terhubung ke server.' : 'Failed to reach the server.',
        icon: 'error',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
    }
  };

  const filteredAssets = useMemo(() => {
    let result = assets;
    if (activeTab === 'admin-assets') result = assets.filter(a => a.lab === 'Ruangan Admin');
    else if (activeTab === 'labs' && selectedLab) result = assets.filter(a => a.lab === selectedLab);
    
    if (searchTerm) {
      result = result.filter(a => 
        (a.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (a.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return result;
  }, [assets, activeTab, selectedLab, searchTerm]);

  const openLoanForm = (asset: ExtendedAsset) => {
    setSelectedAssetForLoan(asset);
    setIsLoanFormOpen(true);
  };

  const handlePrint = (asset: ExtendedAsset) => {
    setAssetToPrint(asset);
    setIsPrintModalOpen(true);
  };

  useEffect(() => {
    const afterPrint = () => { setIsPrintModalOpen(false); setAssetToPrint(null); };
    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, []);

  if (!currentUser) {
    return (
      <Login 
        lang={lang} setLang={setLang} t={t}
        onLogin={handleLoginSubmit} 
        onRegister={handleRegisterSubmit} 
        onForgotPassword={handleForgotPassword}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .printable-label, .printable-label * { visibility: visible !important; }
          .printable-label { position: absolute; left: 0; top: 0; width: 80mm; height: 30mm; border: 1px solid black; }
        }
      `}</style>

      <div className="relative z-10 flex flex-col min-h-screen">
        <DashboardMain 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
          authToken={authToken}
          lang={lang} 
          setLang={setLang} 
          t={t} 
          assets={assets as any} 
          setAssets={setAssets as any} 
          loans={loans} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab as any} 
          selectedLab={selectedLab} 
          setSelectedLab={setSelectedLab} 
          setIsScannerOpen={setIsScannerOpen} 
          isAddAssetOpen={isAddAssetOpen} 
          setIsAddAssetOpen={setIsAddAssetOpen} 
          
          isLoanFormOpen={isLoanFormOpen}
          setIsLoanFormOpen={setIsLoanFormOpen}
          selectedAssetForLoan={selectedAssetForLoan}
          setSelectedAssetForLoan={setSelectedAssetForLoan as any}

          openLoanForm={openLoanForm} 
          handlePrint={handlePrint} 
          labList={labList} 
          filteredAssets={filteredAssets as any}
          onSaveAsset={handleSaveNewAsset}
          onLoanSubmit={handleLoanSubmit}
          onReturnAsset={handleReturnAsset} 
        />

        {isScannerOpen && (
          <QRScanner 
            onScan={handleScan} 
            onClose={() => setIsScannerOpen(false)} 
            lang={lang}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

export default App;