
import React, { useState, useRef, useEffect } from 'react';
import { evaluateHotel } from './services/geminiService';
import { HotelInput, EvaluationResult } from './types';
import DecisionBadge from './components/DecisionBadge';
import ScorecardTable from './components/ScorecardTable';
import OTAPerformanceAudit from './components/OTAPerformanceAudit';
import CompetitiveLandscape from './components/CompetitiveLandscape';
import MarketIntelligence from './components/MarketIntelligence';
import RoomTypeAudit from './components/RoomTypeAudit';

const App: React.FC = () => {
  const [input, setInput] = useState<HotelInput>({
    hotelName: '',
    city: '',
    status: 'New Onboarding',
    rawDetails: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleToggleFullScreen();
      }
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!input.hotelName.trim() || !input.city.trim()) {
      setError("Strategic inputs required: Hotel Name and City must be verified.");
      return;
    }
    setIsLoading(true);
    try {
      const evaluation = await evaluateHotel(input);
      setResult(evaluation);
    } catch (err: any) {
      setError(err.message || "Strategic Evaluation Failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    setResult(null);
    setError(null);
    setInput({
      hotelName: '',
      city: '',
      status: 'New Onboarding',
      rawDetails: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (confirm("Reset current audit? This will clear all calculated metrics.")) {
      handleNewSearch();
    }
  };

  const handleToggleFullScreen = async () => {
    if (!reportRef.current) return;
    try {
      if (!document.fullscreenElement && !isFullScreen) {
        try {
          await reportRef.current.requestFullscreen();
        } catch {
          setIsFullScreen(true);
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setIsFullScreen(false);
      }
    } catch (err) {
      setIsFullScreen(!isFullScreen);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !result) return;
    setIsExporting(true);
    
    // Preparation for PDF
    const element = reportRef.current;
    element.classList.add('pdf-export-mode');
    
    const hotelName = result.executiveSummary.hotelName.replace(/[^a-z0-9]/gi, '_');
    
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5], // Balanced margins
      filename: `THV_Strategic_Audit_${hotelName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false,
        scrollY: 0,
        windowWidth: 1200 // Lock width for consistent rendering
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'], 
        before: '.break-before-page',
        avoid: ['.break-inside-avoid', '.ota-card', '.room-card', 'table'] 
      }
    };

    try {
      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        await html2pdf().set(opt).from(element).save();
      } else {
        window.print();
      }
    } catch (err) {
      console.error("PDF Export Error:", err);
      window.print();
    } finally {
      element.classList.remove('pdf-export-mode');
      setIsExporting(false);
    }
  };

  const ControlStrip = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center bg-white border border-slate-200 rounded-[1.2rem] shadow-lg px-2 py-1.5 gap-1 select-none no-print ${className}`}>
      <button 
        onClick={() => setIsMobilePreview(!isMobilePreview)}
        className={`p-2 rounded-lg transition-all ${isMobilePreview ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}
        title="Toggle Layout"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2h4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4" />
        </svg>
      </button>

      <button 
        onClick={handleReset}
        className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-all"
        title="Clear Audit"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <button 
        onClick={handleToggleFullScreen}
        className={`p-2 rounded-lg transition-all ${isFullScreen ? 'bg-orange-50 text-[#c54b2a]' : 'text-slate-400 hover:bg-slate-50'}`}
        title="Toggle Fullscreen"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

      {result && (
        <div className="flex items-center gap-1 ml-1">
          <div className="w-px h-6 bg-slate-100 mx-1"></div>
          <button 
            onClick={handleNewSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#c54b2a] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#a63d22] transition-all shadow-sm"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            New Audit
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
          >
            {isExporting ? 'Wait' : 'PDF'}
          </button>
        </div>
      )}
    </div>
  );

  const Logo = () => (
    <div className="relative w-10 h-10 flex overflow-hidden rounded-lg shadow-md border border-[#3e1d15]/20 font-black text-[10px] text-white">
      <div className="w-1/3 h-full bg-[#3e1d15] flex items-center justify-center">T</div>
      <div className="w-1/3 h-full bg-[#c54b2a] flex items-center justify-center">H</div>
      <div className="w-1/3 h-full bg-[#3e1d15] flex items-center justify-center">V</div>
    </div>
  );

  const Header = () => (
    <header className={`bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] no-print ${isFullScreen ? 'hidden' : 'block'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          <h1 className="text-sm font-black text-slate-800 tracking-tight uppercase">THV <span className="text-[#c54b2a]">Evaluator</span></h1>
        </div>
        <ControlStrip />
      </div>
    </header>
  );

  if (result) {
    const { executiveSummary, scorecard, otaAudit, roomTypes, competitors, topCorporates, topTravelAgents, keyRisks, commercialUpside, finalRecommendation, groundingSources = [] } = result;
    const themeColor = "bg-[#c54b2a]";

    return (
      <div className={`min-h-screen bg-slate-50 font-inter text-slate-900 ${isFullScreen ? 'app-fullscreen' : ''}`}>
        <Header />
        
        {isFullScreen && <ControlStrip className="fixed top-6 right-6 z-[10001] shadow-2xl scale-90" />}

        <main 
          ref={reportRef} 
          id="report-container"
          className={`max-w-7xl mx-auto px-6 py-10 report-body transition-all duration-500 ${isMobilePreview ? 'max-w-2xl' : 'max-w-7xl'} ${isFullScreen ? 'fullscreen-active' : ''}`}
        >
          {/* Cover Section / Executive Header */}
          <div className="mb-10 break-inside-avoid">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-8 p-12">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Profile</p>
                      <button 
                        onClick={handleNewSearch} 
                        className="no-print flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        New Evaluation
                      </button>
                    </div>
                    <div>
                      <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">{executiveSummary.hotelName}</h1>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          {executiveSummary.city}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{executiveSummary.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-slate-50/50 p-12 flex flex-col items-end justify-center gap-6 border-l border-slate-100">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Decision Status</p>
                    <DecisionBadge decision={executiveSummary.finalDecision} size="lg" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Market Alignment Score</p>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-6xl font-black text-slate-900 leading-none">{executiveSummary.averageScore.toFixed(1)}</span>
                      <span className="text-lg font-bold text-slate-300">/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${isMobilePreview ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-8 mb-10`}>
            <div className="lg:col-span-2 space-y-8">
              <ScorecardTable scores={scorecard} />
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden break-inside-avoid">
                <div className={`absolute left-0 top-0 h-full w-2 ${themeColor}`}></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Strategic Recommendation</h3>
                <div className="text-2xl font-black text-slate-800 leading-tight italic">"{finalRecommendation}"</div>
              </div>
            </div>
            
            <div className="space-y-8">
              <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 break-inside-avoid">
                <h3 className="text-[10px] font-black text-red-600 mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500"></div> Identified Risks
                </h3>
                <ul className="space-y-5">
                  {keyRisks.map((risk, idx) => (
                    <li key={idx} className="flex gap-4 text-slate-600 text-[13px] font-bold leading-relaxed items-start">
                      <span className="w-5 h-5 rounded-md bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 font-black text-[10px]">{idx+1}</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 break-inside-avoid">
                <h3 className="text-[10px] font-black text-emerald-600 mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Growth Opportunities
                </h3>
                <ul className="space-y-5">
                  {commercialUpside.map((upside, idx) => (
                    <li key={idx} className="flex gap-4 text-slate-600 text-[13px] font-bold leading-relaxed items-start">
                      <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 font-black text-[10px]">✔</span>
                      {upside}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <MarketIntelligence corporates={topCorporates} travelAgents={topTravelAgents} />
          <RoomTypeAudit rooms={roomTypes} />
          <CompetitiveLandscape targetName={executiveSummary.hotelName} targetRating={executiveSummary.detectedRating} targetADR={executiveSummary.detectedADR} competitors={competitors} />
          <OTAPerformanceAudit audit={otaAudit} />

          {groundingSources.length > 0 && (
            <div className="mt-20 pt-10 border-t border-slate-200 no-print">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Market Data Sources</p>
              <div className="flex flex-wrap gap-2">
                {groundingSources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noopener" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:text-[#c54b2a] transition-all shadow-sm">
                    {s.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-20 py-20 text-center no-print">
            <h4 className="text-xl font-black text-slate-800 mb-6">Complete Audit?</h4>
            <button 
              onClick={handleNewSearch} 
              className="px-10 py-5 bg-[#c54b2a] text-white font-black text-lg rounded-[2rem] hover:bg-[#a63d22] transition-all shadow-2xl shadow-orange-500/20"
            >
              Evaluate New Property
            </button>
          </div>
        </main>

        <style>{`
          .fullscreen-active {
            position: fixed !important;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            overflow-y: auto;
            background: #f8fafc;
            padding: 40px 60px !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
          }

          .app-fullscreen header {
            display: none !important;
          }

          /* PDF and PRINT SPECIFIC OVERRIDES */
          @media print, .pdf-export-mode {
            .no-print { display: none !important; }
            .report-body { 
              max-width: 100% !important; 
              padding: 0 !important; 
              margin: 0 !important;
              background: white !important;
            }
            .break-inside-avoid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .break-before-page {
              page-break-before: always !important;
              break-before: page !important;
            }
            /* Flat shadows for better PDF output */
            .shadow-2xl, .shadow-lg, .shadow-md, .shadow-sm {
              box-shadow: none !important;
              border: 1px solid #e2e8f0 !important;
            }
            /* Ensure text contrast in PDF */
            .text-slate-400 { color: #64748b !important; }
            .bg-slate-50\/50 { background-color: #f8fafc !important; }
          }
          
          .pdf-export-mode {
            width: 1200px !important;
            min-width: 1200px !important;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-[#c54b2a] p-16 text-white relative">
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-6 leading-none">Market <br/>Audit Hub</h2>
            <p className="text-orange-50 font-bold text-lg leading-relaxed max-w-lg opacity-90">
              High-fidelity property evaluation and micro-market analysis powered by THV intelligence.
            </p>
          </div>

          <div className="p-16">
            {isLoading ? (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 border-[6px] border-orange-50 border-t-[#c54b2a] rounded-full animate-spin mb-8"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse text-center">
                  Synthesizing Market Data...<br/>
                  <span className="text-[10px] font-bold opacity-60">Cross-referencing OTA and Local demand signals</span>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-12">
                {error && (
                  <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-700 text-xs font-bold flex items-center gap-3">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Property Name</label>
                    <input 
                      type="text" 
                      value={input.hotelName} 
                      onChange={e => setInput({...input, hotelName: e.target.value})} 
                      placeholder="e.g. Grand Heritage Hotel" 
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-[#c54b2a] focus:bg-white outline-none transition-all shadow-inner" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">City</label>
                    <input 
                      type="text" 
                      value={input.city} 
                      onChange={e => setInput({...input, city: e.target.value})} 
                      placeholder="e.g. New Delhi" 
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-[#c54b2a] focus:bg-white outline-none transition-all shadow-inner" 
                    />
                  </div>
                </div>
                <div className="flex p-2 bg-slate-100 rounded-[2rem] gap-2">
                  {(['New Onboarding', 'Portfolio Health'] as const).map(opt => (
                    <button 
                      key={opt} 
                      type="button" 
                      onClick={() => setInput({...input, status: opt as any})} 
                      className={`flex-1 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${input.status === opt ? 'bg-white text-[#c54b2a] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button 
                  type="submit" 
                  className="w-full py-7 bg-[#c54b2a] text-white font-black text-2xl rounded-[2rem] hover:bg-[#a63d22] transition-all shadow-2xl shadow-orange-500/20 active:scale-[0.98]"
                >
                  START ANALYSIS
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
