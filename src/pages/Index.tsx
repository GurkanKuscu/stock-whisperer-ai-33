import { useState } from "react";
import { AppProvider, useAppData } from "@/context/AppContext";
import Header from "@/components/Header";
import MarketBar from "@/components/MarketBar";
import SignalsTab from "@/components/tabs/SignalsTab";
import FundamentalTab from "@/components/tabs/FundamentalTab";
import AlarmsTab from "@/components/tabs/AlarmsTab";
import KapNewsTab from "@/components/tabs/KapNewsTab";
import ArchiveTab from "@/components/tabs/ArchiveTab";
import SectorsTab from "@/components/tabs/SectorsTab";
import SearchTab from "@/components/tabs/SearchTab";
import PortfolioTab from "@/components/tabs/PortfolioTab";
import Footer from "@/components/Footer";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("sinyaller");
  const { loading, error } = useAppData();

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="mt-[60px] min-h-[calc(100vh-60px)]">
        <div className="max-w-[1600px] mx-auto p-7 max-md:p-[12px_10px]">
          <MarketBar />

          {loading ? (
            <div className="p-[80px_20px] text-center text-t-txt3">
              <div className="text-[44px] mb-4 animate-pulse">⚡</div>
              <div className="text-[14px] font-bold text-t-txt2">Veriler yükleniyor...</div>
              <div className="text-[11px] mt-1">API'ye bağlanılıyor</div>
            </div>
          ) : error ? (
            <div className="p-[80px_20px] text-center text-t-txt3">
              <div className="text-[44px] mb-4">⚠️</div>
              <div className="text-[14px] font-bold text-t-red mb-2">Bağlantı Hatası</div>
              <div className="text-[11px]">{error}</div>
              <div className="text-[10px] mt-3 text-t-txt3">Demo veriler ile çalışılıyor</div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {activeTab === "sinyaller" && <SignalsTab />}
              {activeTab === "temel" && <FundamentalTab />}
              {activeTab === "alarmlar" && <AlarmsTab />}
              {activeTab === "kap" && <KapNewsTab />}
              {activeTab === "arsiv" && <ArchiveTab />}
              {activeTab === "sektor" && <SectorsTab />}
              {activeTab === "ara" && <SearchTab />}
              {activeTab === "portfolio" && <PortfolioTab />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Index() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
