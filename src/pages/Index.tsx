import { useState } from "react";
import { AppProvider, useAppData } from "@/context/AppContext";
import Header from "@/components/Header";
import DashboardTab from "@/components/tabs/DashboardTab";
import MarketBar from "@/components/MarketBar";
import SignalsTab from "@/components/tabs/SignalsTab";
import ArchiveTab from "@/components/tabs/ArchiveTab";
import PortfolioTab from "@/components/tabs/PortfolioTab";
import FinansAnaliziTab from "@/components/tabs/FinansAnaliziTab";
import SearchTab from "@/components/tabs/SearchTab";
import FundamentalTab from "@/components/tabs/FundamentalTab";
import KacirilanlarTab from "@/components/tabs/KacirilanlarTab";
import RehberTab from "@/components/tabs/RehberTab";
import StockDetail from "@/components/StockDetail";
import Footer from "@/components/Footer";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("anasayfa");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const { loading, error } = useAppData();

  const handleTickerClick = (ticker: string) => {
    setSelectedTicker(ticker);
  };

  const handleBackFromDetail = () => {
    setSelectedTicker(null);
  };

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSelectedTicker(null); }} />
      <main className="mt-[60px] min-h-[calc(100vh-60px)]">
        <div className="max-w-[1600px] mx-auto p-7 max-md:p-[12px_10px]">
          <MarketBar />

          {activeTab === "finans" ? (
            <div className="animate-fade-in">
              <FinansAnaliziTab />
            </div>
          ) : activeTab === "kacirilanlar" ? (
            <div className="animate-fade-in">
              <KacirilanlarTab />
            </div>
          ) : activeTab === "rehber" ? (
            <div className="animate-fade-in">
              <RehberTab />
            </div>
          ) : loading ? (
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
          ) : selectedTicker ? (
            <div className="animate-fade-in">
              <StockDetail ticker={selectedTicker} onBack={handleBackFromDetail} />
            </div>
          ) : (
            <div className="animate-fade-in">
              {activeTab === "anasayfa" && <DashboardTab onTickerClick={handleTickerClick} />}
              {activeTab === "sinyaller" && <SignalsTab onTickerClick={handleTickerClick} />}
              {activeTab === "ara" && <SearchTab onTickerClick={handleTickerClick} />}
              {activeTab === "temel" && <FundamentalTab onTickerClick={handleTickerClick} />}
              {activeTab === "arsiv" && <ArchiveTab />}
              {activeTab === "portfolio" && <PortfolioTab />}
              {activeTab === "kacirilanlar" && <KacirilanlarTab />}
            </div>
          )}
        </div>
      </main>
      <Footer />
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
