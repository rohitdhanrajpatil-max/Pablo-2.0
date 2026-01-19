
import React, { useState, useRef } from 'react';
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
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const reportRef = useRef<HTMLElement>(null);

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

  const handleExportPDF = async () => {
    if (!reportRef.current || !result) return;
    
    setIsExporting(true);
    const element = reportRef.current;
    const hotelName = result.executiveSummary.hotelName.replace(/[^a-z0-9]/gi, '_');
    const cityName = result.executiveSummary.city.replace(/[^a-z0-9]/gi, '_');
    
    const opt = {
      margin: 0.5,
      filename: `Treebo_Evaluation_${hotelName}_${cityName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // Use the global html2pdf provided via index.html script tag
      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        await html2pdf().set(opt).from(element).save();
      } else {
        // Fallback if library fails to load
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
          <button 
            onClick={handleReset}
            className="text-sm font-semibold text-[#c54b2a] hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 transition-all flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/></svg>
            New Evaluation
          </button>
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
    const reportTypeLabel = isNew ? "Strategic Onboarding Assessment" : "Portfolio Asset Health Report";
    const themeColor = isNew ? "bg-[#c54b2a]" : "bg-[#3e1d15]";
    const themeText = isNew ? "text-[#c54b2a]" : "text-[#3e1d15]";

    return (
      <div className="min-h-screen bg-slate-50 pb-12 font-inter">
        {renderHeader()}
        <main ref={reportRef} className="max-w-7xl mx-auto px-4 py-8 printable-area">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4 no-print">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded text-white ${themeColor}`}>
                  EXECUTIVE SUMMARY
                </span>
                <div className="h-px w-24 bg-slate-200"></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-8 p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-slate-100">
                  <div className="space-y-6">
                    <div className="group">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Property Identity</p>
                      <input 
                        type="text"
                        value={executiveSummary.hotelName}
                        onChange={(e) => handleUpdateHotelName(e.target.value)}
                        className="w-full bg-transparent text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none border-b-2 border-transparent focus:border-orange-200 outline-none transition-all py-1 no-print"
                      />
                      <h1 className="hidden print:block text-4xl font-black text-slate-900 tracking-tighter">{executiveSummary.hotelName}</h1>
                    </div>
                    
                    <div className="flex flex-wrap gap-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                        <div className={`text-xl font-bold ${themeText} flex items-center gap-2`}>
                          <svg className="w-5 h-5 opacity-60" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9z"/></svg>
                          {executiveSummary.city}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Report Category</p>
                        <div className="text-xl font-bold text-slate-700">{reportTypeLabel}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-slate-50/50 p-8 md:p-10 flex flex-col justify-center gap-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Decision</p>
                      <DecisionBadge decision={executiveSummary.finalDecision} size="lg" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Commercial Score</p>
                      <p className="text-5xl font-black text-slate-900 leading-none">
                        {executiveSummary.averageScore.toFixed(1)}<span className="text-xl text-slate-300 ml-1">/10</span>
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className={`no-print w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 hover:text-[#c54b2a] hover:border-[#c54b2a] transition-all shadow-sm active:scale-95 uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isExporting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-[#c54b2a] border-t-transparent rounded-full animate-spin"></div>
                        Generating Report...
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                        Export Evaluation (PDF)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {hardStopFlag && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 border-l-8 border-l-red-600">
              <h4 className="font-black text-red-800 uppercase text-xs tracking-widest">CRITICAL BLOCKER</h4>
              <p className="text-red-700 mt-1 font-semibold">{hardStopDetails}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              <section className="break-inside-avoid">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <span className={`w-2 h-6 rounded-full ${themeColor}`}></span>
                    Commercial Scorecard
                  </h3>
                </div>
                <ScorecardTable scores={scorecard} />
              </section>

              <section className="bg-white rounded-2xl p-8 border border-slate-200 relative overflow-hidden break-inside-avoid shadow-sm">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${themeColor}`}></div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Strategic Recommendation</h3>
                <div className="text-xl text-slate-800 font-bold leading-tight">"{finalRecommendation}"</div>
              </section>

              {conditionalActionPlan && (
                <section className="bg-amber-50 rounded-2xl p-8 border border-amber-200 break-inside-avoid">
                  <h3 className="text-xl font-black text-amber-800 mb-6">Action Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conditionalActionPlan.map((step, idx) => (
                      <div key={idx} className="bg-white/50 p-4 rounded-xl border border-amber-100 flex gap-3 text-sm font-bold">
                        <span className="bg-amber-200 text-amber-800 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px]">{idx + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-8">
              <section className="bg-red-50 rounded-2xl p-8 border border-red-100 break-inside-avoid">
                <h3 className="text-xs font-black text-red-800 mb-6 uppercase tracking-widest">Risks</h3>
                <ul className="space-y-4">
                  {keyRisks.map((risk, idx) => (
                    <li key={idx} className="flex gap-3 text-red-900 text-sm font-bold">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100 break-inside-avoid">
                <h3 className="text-xs font-black text-emerald-800 mb-6 uppercase tracking-widest">Upside</h3>
                <ul className="space-y-4">
                  {commercialUpside.map((upside, idx) => (
                    <li key={idx} className="flex gap-3 text-emerald-900 text-sm font-bold">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                      {upside}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <div className="break-before-page">
            <MarketIntelligence corporates={topCorporates} travelAgents={topTravelAgents} />
          </div>

          <RoomTypeAudit rooms={roomTypes} />

          <div className="break-before-page">
            <CompetitiveLandscape 
              targetName={executiveSummary.hotelName}
              targetRating={executiveSummary.detectedRating}
              targetADR={executiveSummary.detectedADR}
              competitors={competitors} 
            />
          </div>
          
          <OTAPerformanceAudit audit={otaAudit} />

          {groundingSources.length > 0 && (
            <section className="mt-20 pt-8 border-t border-slate-200 no-print">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Verification Sources</h3>
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
              Trigger a real-time market grounding. Treebo AI scans the city's commercial ecosystem to evaluate your property's ROI potential.
            </p>
          </div>

          {isLoading ? (
            <div className="p-20 flex flex-col items-center animate-pulse">
              <div className="w-16 h-16 border-4 border-orange-100 border-t-[#c54b2a] rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-black text-slate-800">SCANNING MARKET ECOSYSTEM...</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-12 space-y-10">
              {error && <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hotel Name</label>
                  <input type="text" value={input.hotelName} onChange={e => setInput({...input, hotelName: e.target.value})} placeholder="e.g. Treebo Trend Heritage" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-[#c54b2a] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">City</label>
                  <input type="text" value={input.city} onChange={e => setInput({...input, city: e.target.value})} placeholder="e.g. Pune" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-[#c54b2a] outline-none" />
                </div>
              </div>
              <div className="flex gap-4">
                {(['New Onboarding', 'Existing Treebo'] as const).map(option => (
                  <button key={option} type="button" onClick={() => setInput({...input, status: option})} className={`flex-1 py-4 border-2 rounded-2xl font-black text-sm uppercase transition-all ${input.status === option ? 'border-[#c54b2a] bg-orange-50 text-[#c54b2a]' : 'border-slate-100 text-slate-400'}`}>{option}</button>
                ))}
              </div>
              <button type="submit" className="w-full py-6 bg-[#c54b2a] text-white font-black text-xl rounded-2xl hover:bg-[#a63d22] transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98]">
                START EVALUATION
              </button>
            </form>
          )}
        </div>
      </main>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .printable-area { width: 100% !important; max-width: none !important; padding: 0 !important; }
          .shadow-xl, .shadow-sm, .shadow-2xl { box-shadow: none !important; border: 1px solid #eee !important; }
          .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
          .break-before-page { page-break-before: always; break-before: page; padding-top: 40px; }
          .bg-slate-50, .bg-slate-50\\/50, .bg-amber-50, .bg-red-50, .bg-emerald-50 { print-color-adjust: exact; }
          input { border: none !important; padding: 0 !important; font-size: 2rem !important; font-weight: 900 !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
