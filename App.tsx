
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
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const reportRef = useRef<HTMLElement>(null);

  // Sync fullscreen state with browser events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    setError(null);

    if (!input.hotelName.trim() || !input.city.trim()) {
      setError("CRITICAL: Both Hotel Name and City are required to ground the commercial evaluation.");
      return;
    }

    setIsLoading(true);
    try {
      const evaluation = await evaluateHotel(input);
      setResult(evaluation);
    } catch (err: any) {
      setError(err.message || "Strategic Evaluation Failed. Please check connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setShowValidation(false);
  };

  const handleToggleFullScreen = async () => {
    if (!reportRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await reportRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !result) return;
    
    setIsExporting(true);
    const element = reportRef.current;
    const hotelName = result.executiveSummary.hotelName.replace(/[^a-z0-9]/gi, '_');
    
    const opt = {
      margin: [0.4, 0.4, 0.4, 0.4],
      filename: `Treebo_Strategy_Report_${hotelName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 3,
        useCORS: true,
        letterRendering: true,
        width: 1200,
        scrollY: 0,
        windowWidth: 1200,
        logging: false
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.break-before-page',
        avoid: ['.break-inside-avoid', 'table', 'section', '.room-card', '.ota-card']
      }
    };

    try {
      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        document.body.classList.add('is-exporting');
        element.classList.add('pdf-render-context');
        await html2pdf().set(opt).from(element).save();
        document.body.classList.remove('is-exporting');
        element.classList.remove('pdf-render-context');
      } else {
        window.print();
      }
    } catch (err) {
      console.error("PDF Export failed:", err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateHotelName = (newName: string) => {
    if (result) {
      setResult({
        ...result,
        executiveSummary: {
          ...result.executiveSummary,
          hotelName: newName
        }
      });
    }
  };

  const Logo = () => (
    <div className="relative w-10 h-10 flex overflow-hidden rounded shadow-sm">
      <div className="w-1/3 h-full bg-[#3e1d15]"></div>
      <div className="w-1/3 h-full bg-[#c54b2a]"></div>
      <div className="w-1/3 h-full bg-[#3e1d15]"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-black text-sm tracking-tighter leading-none">THV</span>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Treebo <span className="text-[#c54b2a]">Commercial Strategy</span></h1>
        </div>
        {result && (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleToggleFullScreen}
              className="text-xs font-black text-slate-600 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 transition-all flex items-center gap-2"
              title={isFullScreen ? "Exit Full Screen" : "Presentation Mode"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullScreen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 0l5-5m0 0l-5 0m5 0l0 5m-5 11l5 5m0 0l-5 0m5 0l0-5m-11 0l-5 5m0 0l5 0m-5 0l0-5" />
                ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
              {isFullScreen ? "Minimize" : "Full Screen"}
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`text-xs font-black px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${isExporting ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
               {isExporting ? "Generating..." : "Export PDF"}
            </button>
            <button 
              onClick={handleReset}
              className="text-xs font-black text-white bg-[#c54b2a] hover:bg-[#a63d22] px-4 py-2 rounded-lg transition-all shadow-md shadow-orange-100"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </header>
  );

  if (result) {
    const { 
      executiveSummary, 
      scorecard = [], 
      otaAudit = [], 
      roomTypes = [],
      competitors = [], 
      topCorporates = [], 
      topTravelAgents = [], 
      keyRisks = [], 
      commercialUpside = [], 
      finalRecommendation = '', 
      conditionalActionPlan = null, 
      hardStopFlag = false, 
      hardStopDetails = null, 
      groundingSources = [] 
    } = result;

    const isNew = executiveSummary.status.toLowerCase().includes('new');
    const themeColor = isNew ? "bg-[#c54b2a]" : "bg-[#3e1d15]";
    const themeText = isNew ? "text-[#c54b2a]" : "text-[#3e1d15]";

    return (
      <div className="min-h-screen bg-slate-50 pb-12 font-inter overflow-x-hidden">
        {renderHeader()}
        <main 
          ref={reportRef} 
          className={`max-w-7xl mx-auto px-4 py-8 report-body ${isFullScreen ? 'is-fullscreen-view' : ''}`}
        >
          {/* Top Level Strategic Header */}
          <div className="mb-10 break-inside-avoid">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-8 p-10 border-b lg:border-b-0 lg:border-r border-slate-100">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Portfolio Assessment</p>
                      <input 
                        type="text"
                        value={executiveSummary.hotelName}
                        onChange={(e) => handleUpdateHotelName(e.target.value)}
                        className="w-full bg-transparent text-4xl font-black text-slate-900 tracking-tighter leading-none border-b-2 border-transparent focus:border-orange-200 outline-none transition-all py-1 no-print"
                      />
                      <h1 className="hidden print-only-title text-4xl font-black text-slate-900 tracking-tighter mb-4">{executiveSummary.hotelName}</h1>
                    </div>
                    
                    <div className="flex flex-wrap gap-12">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Market</p>
                        <div className={`text-xl font-bold ${themeText} flex items-center gap-2 uppercase tracking-tight`}>
                          {executiveSummary.city}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Onboarding Logic</p>
                        <div className="text-xl font-bold text-slate-700 uppercase tracking-tight">{executiveSummary.status}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-slate-50/50 p-10 flex flex-col justify-center gap-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Recommendation</p>
                      <DecisionBadge decision={executiveSummary.finalDecision} size="lg" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Commercial Index</p>
                      <p className="text-5xl font-black text-slate-900 leading-none">
                        {executiveSummary.averageScore.toFixed(1)}<span className="text-xl text-slate-300 ml-1">/10</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hardStopFlag && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 border-l-8 border-l-red-600 break-inside-avoid">
              <h4 className="font-black text-red-800 uppercase text-xs tracking-widest">STRATEGIC HARD-STOP</h4>
              <p className="text-red-700 mt-1 font-bold">{hardStopDetails}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 space-y-8">
              <section className="break-inside-avoid">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <span className={`w-1 h-4 ${themeColor}`}></span> 13-Parameter Scorecard
                </h3>
                <ScorecardTable scores={scorecard} />
              </section>

              <section className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm break-inside-avoid relative overflow-hidden">
                <div className={`absolute left-0 top-0 h-full w-1.5 ${themeColor}`}></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Leadership Context</h3>
                <div className="text-2xl font-black text-slate-800 leading-tight italic">"{finalRecommendation}"</div>
              </section>

              {conditionalActionPlan && (
                <section className="bg-amber-50 rounded-[2rem] p-8 border border-amber-200 break-inside-avoid">
                  <h3 className="text-sm font-black text-amber-800 mb-6 uppercase tracking-widest">Mandatory Remediation Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conditionalActionPlan.map((step, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-amber-100 flex gap-4 text-xs font-bold shadow-sm">
                        <span className="bg-amber-100 text-amber-700 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-black">{idx + 1}</span>
                        <span className="text-slate-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-8">
              <section className="bg-red-50 rounded-[2rem] p-10 border border-red-100 break-inside-avoid">
                <h3 className="text-[10px] font-black text-red-800 mb-8 uppercase tracking-[0.2em]">Risk Exposure Audit</h3>
                <ul className="space-y-6">
                  {keyRisks.map((risk, idx) => (
                    <li key={idx} className="flex gap-4 text-red-900 text-xs font-bold leading-relaxed">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-emerald-50 rounded-[2rem] p-10 border border-emerald-100 break-inside-avoid">
                <h3 className="text-[10px] font-black text-emerald-800 mb-8 uppercase tracking-[0.2em]">Yield Growth Potential</h3>
                <ul className="space-y-6">
                  {commercialUpside.map((upside, idx) => (
                    <li key={idx} className="flex gap-4 text-emerald-900 text-xs font-bold leading-relaxed">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      {upside}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <div className="break-before-page pt-4">
            <MarketIntelligence corporates={topCorporates} travelAgents={topTravelAgents} />
          </div>

          <div className="mt-20">
            <RoomTypeAudit rooms={roomTypes} />
          </div>

          <div className="break-before-page pt-4">
            <CompetitiveLandscape 
              targetName={executiveSummary.hotelName}
              targetRating={executiveSummary.detectedRating}
              targetADR={executiveSummary.detectedADR}
              competitors={competitors} 
            />
          </div>
          
          <div className="break-before-page pt-4">
            <OTAPerformanceAudit audit={otaAudit} />
          </div>

          {groundingSources.length > 0 && (
            <section className="mt-20 pt-8 border-t border-slate-200 no-print">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Verification Grounding</h3>
              <div className="flex flex-wrap gap-2">
                {groundingSources.map((source, idx) => (
                  <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:text-[#c54b2a] transition-all">
                    {source.title}
                  </a>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {renderHeader()}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-[#c54b2a] p-12 text-white">
            <h2 className="text-4xl font-black tracking-tight uppercase mb-4">Strategic Onboarding</h2>
            <p className="text-orange-100 font-medium text-lg leading-relaxed max-w-xl opacity-90">
              Audit the micro-market and determine brand fit. Treebo AI generates a decision-ready commercial report in seconds.
            </p>
          </div>

          {isLoading ? (
            <div className="p-24 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-orange-100 border-t-[#c54b2a] rounded-full animate-spin mb-8"></div>
              <h3 className="text-xl font-black text-slate-800 tracking-widest">GROUNDING STRATEGIC DATA...</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-12 space-y-10">
              {error && <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Property Name</label>
                  <input type="text" value={input.hotelName} onChange={e => setInput({...input, hotelName: e.target.value})} placeholder="e.g. Treebo Trend Heritage" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-[#c54b2a] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">City Location</label>
                  <input type="text" value={input.city} onChange={e => setInput({...input, city: e.target.value})} placeholder="e.g. Pune" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-[#c54b2a] outline-none" />
                </div>
              </div>
              <div className="flex gap-4">
                {(['New Onboarding', 'Existing Treebo'] as const).map(option => (
                  <button key={option} type="button" onClick={() => setInput({...input, status: option})} className={`flex-1 py-4 border-2 rounded-2xl font-black text-sm uppercase transition-all ${input.status === option ? 'border-[#c54b2a] bg-orange-50 text-[#c54b2a]' : 'border-slate-100 text-slate-400'}`}>{option}</button>
                ))}
              </div>
              <button type="submit" className="w-full py-6 bg-[#c54b2a] text-white font-black text-xl rounded-2xl hover:bg-[#a63d22] transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98]">
                GENERATE AUDIT REPORT
              </button>
            </form>
          )}
        </div>
      </main>
      <style>{`
        /* Global Print Styles */
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-body { max-width: 100% !important; padding: 0 !important; width: 100% !important; margin: 0 !important; }
          .break-inside-avoid { page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 2rem !important; }
          .break-before-page { page-break-before: always !important; break-before: page !important; }
          .shadow-xl, .shadow-sm, .shadow-2xl { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          .print-only-title { display: block !important; }
        }

        /* Full Screen Presentation Mode Styles */
        .is-fullscreen-view {
          background-color: #f8fafc !important; /* bg-slate-50 */
          height: 100vh !important;
          overflow-y: auto !important;
          padding: 60px !important;
          max-width: none !important;
          width: 100% !important;
        }

        /* html2pdf specific rendering context overrides */
        .pdf-render-context {
          width: 1100px !important; 
          margin: 0 auto !important;
          background-color: #f8fafc !important; 
          padding: 30px !important;
        }

        .pdf-render-context .no-print {
          display: none !important;
        }

        .pdf-render-context .print-only-title {
          display: block !important;
        }

        .pdf-render-context input {
          display: none !important;
        }

        .pdf-render-context .grid {
          display: grid !important;
        }

        .pdf-render-context .lg\\:col-span-8 { grid-column: span 8 / span 8 !important; }
        .pdf-render-context .lg\\:col-span-4 { grid-column: span 4 / span 4 !important; }
        .pdf-render-context .lg\\:col-span-12 { grid-column: span 12 / span 12 !important; }
        .pdf-render-context .lg\\:col-span-7 { grid-column: span 7 / span 7 !important; }
        .pdf-render-context .lg\\:col-span-5 { grid-column: span 5 / span 5 !important; }
        .pdf-render-context .lg\\:col-span-2 { grid-column: span 2 / span 2 !important; }
        .pdf-render-context .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
        .pdf-render-context .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        .pdf-render-context .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        .pdf-render-context .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }

        .pdf-render-context .break-before-page {
          page-break-before: always !important;
          break-before: page !important;
          padding-top: 50px !important;
        }

        .pdf-render-context .break-inside-avoid {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .pdf-render-context section, 
        .pdf-render-context .room-card, 
        .pdf-render-context .ota-card {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      `}</style>
    </div>
  );
};

export default App;
