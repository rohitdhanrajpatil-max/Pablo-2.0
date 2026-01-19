
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
      margin: [0.3, 0.4, 0.3, 0.4],
      filename: `Treebo_Strategy_${hotelName}_${cityName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        width: 1100,
        scrollY: 0,
        windowWidth: 1100,
        logging: false
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        element.classList.add('pdf-generation-mode');
        await html2pdf().set(opt).from(element).save();
        element.classList.remove('pdf-generation-mode');
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
              onClick={handleExportPDF}
              disabled={isExporting}
              className="text-xs font-black text-slate-600 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 transition-all flex items-center gap-2"
            >
               {isExporting ? 'Optimizing PDF...' : 'Export Strategy PDF'}
            </button>
            <button 
              onClick={handleReset}
              className="text-xs font-black text-white bg-[#c54b2a] hover:bg-[#a63d22] px-4 py-2 rounded-lg transition-all flex items-center gap-1 shadow-md shadow-orange-100"
            >
              New Audit
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
        <main ref={reportRef} className="max-w-7xl mx-auto px-4 py-8 report-container">
          <div className="mb-10 page-header break-inside-avoid">
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
                      <h1 className="hidden print-title text-4xl font-black text-slate-900 tracking-tighter">{executiveSummary.hotelName}</h1>
                    </div>
                    
                    <div className="flex flex-wrap gap-12">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Market</p>
                        <div className={`text-xl font-bold ${themeText} flex items-center gap-2 uppercase tracking-tight`}>
                          {executiveSummary.city}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Status</p>
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
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 border-l-8 border-l-red-600 break-inside-avoid shadow-sm">
              <h4 className="font-black text-red-800 uppercase text-xs tracking-widest">CRITICAL STRATEGIC BLOCKER</h4>
              <p className="text-red-700 mt-1 font-bold">{hardStopDetails}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 main-content">
            <div className="lg:col-span-2 space-y-8">
              <section className="break-inside-avoid section-scorecard">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <span className={`w-1 h-4 ${themeColor}`}></span> Evaluation Scorecard
                </h3>
                <ScorecardTable scores={scorecard} />
              </section>

              <section className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm break-inside-avoid relative overflow-hidden section-leadership">
                <div className={`absolute left-0 top-0 h-full w-1.5 ${themeColor}`}></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Leadership Context</h3>
                <div className="text-2xl font-black text-slate-800 leading-tight italic">"{finalRecommendation}"</div>
              </section>

              {conditionalActionPlan && (
                <section className="bg-amber-50 rounded-[2rem] p-8 border border-amber-200 break-inside-avoid section-actions shadow-sm">
                  <h3 className="text-sm font-black text-amber-800 mb-6 uppercase tracking-widest">Strategic Remediation Plan</h3>
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

            <div className="space-y-8 side-content">
              <section className="bg-red-50 rounded-[2rem] p-10 border border-red-100 break-inside-avoid shadow-sm">
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

              <section className="bg-emerald-50 rounded-[2rem] p-10 border border-emerald-100 break-inside-avoid shadow-sm">
                <h3 className="text-[10px] font-black text-emerald-800 mb-8 uppercase tracking-[0.2em]">Growth & Yield Upside</h3>
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

          <div className="break-inside-avoid mt-20">
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
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Strategic Data Sources</h3>
              <div className="flex flex-wrap gap-2">
                {groundingSources.map((source, idx) => (
                  <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:text-[#c54b2a] transition-all shadow-xs">
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
            <h2 className="text-4xl font-black tracking-tight uppercase mb-4">Strategic Evaluation</h2>
            <p className="text-orange-100 font-medium text-lg leading-relaxed max-w-xl opacity-90">
              Audit unit economics and brand fit. Our AI scans the micro-market for real-time RevPAR and OTA performance data.
            </p>
          </div>

          {isLoading ? (
            <div className="p-24 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-orange-100 border-t-[#c54b2a] rounded-full animate-spin mb-8"></div>
              <h3 className="text-xl font-black text-slate-800 tracking-widest">CALIBRATING MARKET GROUNDING...</h3>
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">City Focus</label>
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
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; width: 100% !important; height: auto !important; }
          .printable-area { width: 100% !important; max-width: none !important; padding: 0 !important; margin: 0 !important; }
          .shadow-xl, .shadow-sm, .shadow-2xl { box-shadow: none !important; border: 1px solid #eee !important; }
          .break-inside-avoid { page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 2rem !important; }
          .break-before-page { page-break-before: always !important; break-before: page !important; padding-top: 2rem !important; margin-top: 0 !important; }
          .bg-slate-50, .bg-slate-50\\/50, .bg-amber-50, .bg-red-50, .bg-emerald-50 { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
          input { border: none !important; padding: 0 !important; font-size: 2rem !important; font-weight: 900 !important; }
          h1, h2, h3, h4 { page-break-after: avoid !important; }
          .print-title { display: block !important; }
        }

        /* Specialized styles for html2pdf capture */
        .pdf-generation-mode {
          width: 1080px !important; 
          max-width: 1080px !important;
          margin: 0 auto !important;
          padding: 30px !important;
          background: #f8fafc !important; 
        }

        .pdf-generation-mode .no-print {
          display: none !important;
        }

        .pdf-generation-mode .print-title {
          display: block !important;
        }

        .pdf-generation-mode .grid {
          display: grid !important;
        }

        .pdf-generation-mode .lg\\:col-span-8 { grid-column: span 8 / span 8 !important; }
        .pdf-generation-mode .lg\\:col-span-4 { grid-column: span 4 / span 4 !important; }
        .pdf-generation-mode .lg\\:col-span-2 { grid-column: span 2 / span 2 !important; }
        .pdf-generation-mode .lg\\:col-span-12 { grid-column: span 12 / span 12 !important; }
        .pdf-generation-mode .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .pdf-generation-mode .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        .pdf-generation-mode .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }

        .pdf-generation-mode .break-inside-avoid {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .pdf-generation-mode .break-before-page {
          page-break-before: always !important;
          break-before: page !important;
          padding-top: 50px !important;
        }

        .pdf-generation-mode .ota-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 15px !important;
        }
      `}</style>
    </div>
  );
};

export default App;
