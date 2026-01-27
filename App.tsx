
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
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const handleToggleFullScreen = async () => {
    if (!reportRef.current) return;
    try {
      if (!document.fullscreenElement) {
        // Fallback for environments that block FS or if browser FS fails
        const fsSucceeded = await reportRef.current.requestFullscreen().catch(() => false);
        if (fsSucceeded === false) {
           setIsFullScreen(true); // Toggle the local "fake" fullscreen state if native fails
        }
      } else {
        await document.exitFullscreen();
        setIsFullScreen(false);
      }
    } catch (err) {
      // Manual state fallback for restricted iframes
      setIsFullScreen(!isFullScreen);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !result) return;
    setIsExporting(true);
    const element = reportRef.current;
    const hotelName = result.executiveSummary.hotelName.replace(/[^a-z0-9]/gi, '_');
    
    const opt = {
      margin: [0.4, 0.4, 0.4, 0.4],
      filename: `Treebo_Audit_${hotelName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, width: 1200 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.break-before-page' }
    };

    try {
      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        element.classList.add('pdf-render-context');
        await html2pdf().set(opt).from(element).save();
        element.classList.remove('pdf-render-context');
      } else {
        window.print();
      }
    } catch (err) {
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const ControlStrip = () => (
    <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm px-2 py-1.5 gap-1">
      {/* Device View Toggle */}
      <button 
        onClick={() => setIsMobilePreview(!isMobilePreview)}
        className={`p-2 rounded-xl transition-all ${isMobilePreview ? 'bg-orange-50 text-[#c54b2a]' : 'text-slate-400 hover:bg-slate-50'}`}
        title="Toggle Device Layout"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Reset Audit */}
      <button 
        onClick={handleReset}
        className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-all"
        title="Reset Audit"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* Full Screen Toggle */}
      <button 
        onClick={handleToggleFullScreen}
        className={`p-2 rounded-xl transition-all ${isFullScreen ? 'bg-orange-50 text-[#c54b2a]' : 'text-slate-400 hover:bg-slate-50'}`}
        title="Fullscreen Mode"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isFullScreen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 3h6m0 0v6m0-6L14 10M9 21H3m0 0v-6m0 6l7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          )}
        </svg>
      </button>

      {result && (
        <>
          <div className="w-px h-6 bg-slate-100 mx-1"></div>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </>
      )}
    </div>
  );

  const Header = () => (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] no-print">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-9 h-9 flex overflow-hidden rounded-xl shadow-md border border-slate-200">
            <div className="w-1/3 h-full bg-[#3e1d15]"></div>
            <div className="w-1/3 h-full bg-[#c54b2a]"></div>
            <div className="w-1/3 h-full bg-[#3e1d15]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-black text-[10px] tracking-tighter">THV</span>
            </div>
          </div>
          <h1 className="text-sm font-black text-slate-800 tracking-tight uppercase">Treebo <span className="text-[#c54b2a]">Commercial Evaluator</span></h1>
        </div>
        <ControlStrip />
      </div>
    </header>
  );

  if (result) {
    const { executiveSummary, scorecard, otaAudit, roomTypes, competitors, topCorporates, topTravelAgents, keyRisks, commercialUpside, finalRecommendation, conditionalActionPlan, hardStopFlag, hardStopDetails, groundingSources = [] } = result;
    const isNew = executiveSummary.status.toLowerCase().includes('new');
    const themeColor = isNew ? "bg-[#c54b2a]" : "bg-[#3e1d15]";

    return (
      <div className={`min-h-screen bg-slate-50 font-inter ${isFullScreen ? 'app-fullscreen' : ''}`}>
        <Header />
        <main 
          ref={reportRef} 
          className={`max-w-7xl mx-auto px-6 py-10 report-body transition-all duration-500 ${isMobilePreview ? 'max-w-2xl' : 'max-w-7xl'} ${isFullScreen ? 'fullscreen-active' : ''}`}
        >
          {/* Executive Header Section */}
          <div className="mb-10 break-inside-avoid">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-8 p-12">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Portfolio Deep-Dive Assessment</p>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Decision Verdict</p>
                    <DecisionBadge decision={executiveSummary.finalDecision} size="lg" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Strategic Fit Index</p>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-6xl font-black text-slate-900 leading-none">{executiveSummary.averageScore.toFixed(1)}</span>
                      <span className="text-lg font-bold text-slate-300">/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hardStopFlag && (
            <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-8 mb-10 flex items-start gap-6 break-inside-avoid">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 border border-red-200 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-red-800 uppercase text-xs tracking-[0.3em]">Critical Commercial Hard-Stop</h4>
                <p className="text-red-700 text-lg font-bold leading-tight">{hardStopDetails}</p>
              </div>
            </div>
          )}

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
                   <div className="w-2 h-2 rounded-full bg-red-500"></div> Risks Audit
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
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Upside Potential
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
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Commercial Data Sources</p>
              <div className="flex flex-wrap gap-2">
                {groundingSources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noopener" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:text-[#c54b2a] transition-all shadow-sm">
                    {s.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-[#c54b2a] p-16 text-white relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-6 leading-none">Market <br/>Audit Hub</h2>
            <p className="text-orange-100 font-bold text-lg leading-relaxed max-w-lg opacity-90">
              Onboard properties with precision. Generate enterprise-grade commercial reports grounded in real-time OTA data.
            </p>
          </div>

          <div className="p-16">
            {isLoading ? (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 border-[6px] border-orange-50 border-t-[#c54b2a] rounded-full animate-spin mb-8"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Scanning Micro-Market Dynamics...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-12">
                {error && <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl text-red-700 text-xs font-black flex items-center gap-3"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-[#c54b2a] transition-colors">Property Designation</label>
                    <input type="text" value={input.hotelName} onChange={e => setInput({...input, hotelName: e.target.value})} placeholder="e.g. Treebo Trend Heritage" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-[#c54b2a] focus:bg-white outline-none transition-all shadow-inner" />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-[#c54b2a] transition-colors">Micro-Market City</label>
                    <input type="text" value={input.city} onChange={e => setInput({...input, city: e.target.value})} placeholder="e.g. Pune" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-[#c54b2a] focus:bg-white outline-none transition-all shadow-inner" />
                  </div>
                </div>
                <div className="flex p-2 bg-slate-100 rounded-[2rem] gap-2">
                  {(['New Onboarding', 'Existing Treebo'] as const).map(opt => (
                    <button key={opt} type="button" onClick={() => setInput({...input, status: opt})} className={`flex-1 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${input.status === opt ? 'bg-white text-[#c54b2a] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{opt}</button>
                  ))}
                </div>
                <button type="submit" className="w-full py-7 bg-[#c54b2a] text-white font-black text-2xl rounded-[2rem] hover:bg-[#a63d22] transition-all shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98]">
                  INITIATE AUDIT REPORT
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <style>{`
        /* Dynamic Fullscreen Mode Overrides */
        .app-fullscreen .report-body {
          max-width: none !important;
          width: 100% !important;
          padding: 60px !important;
          background: #f8fafc;
        }

        .fullscreen-active {
          position: fixed !important;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          overflow-y: auto;
          background: #f8fafc;
          padding: 80px 40px !important;
        }

        @media print {
          .no-print { display: none !important; }
          .report-body { max-width: 100% !important; padding: 0 !important; }
          .break-inside-avoid { page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 2rem !important; }
          .break-before-page { page-break-before: always !important; break-before: page !important; }
        }

        .pdf-render-context { width: 1100px !important; margin: 0 auto !important; padding: 40px !important; }
        .pdf-render-context .no-print { display: none !important; }
      `}</style>
    </div>
  );
};

export default App;
