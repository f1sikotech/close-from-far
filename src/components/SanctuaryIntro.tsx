import React, { useState, useEffect } from "react";
import { Heart, Compass, Sparkles, Coffee, Moon, Sun, ArrowRight, X } from "lucide-react";
import { trackEvent } from "../utils/analytics";

interface SanctuaryIntroProps {
  partnerConfig: {
    loverOne: string;
    loverTwo: string;
    distance: string;
    loverOneCity: string;
    loverTwoCity: string;
    loverOneOffset: number;
    loverTwoOffset: number;
  };
  setPartnerConfig: React.Dispatch<React.SetStateAction<any>>;
  isNightMode: boolean;
  setIsNightMode: (val: boolean) => void;
  setRecipient: (val: string) => void;
  setSigner: (val: string) => void;
  setSelectedPaper: (val: "cream" | "blush" | "lavender" | "sage") => void;
  onComplete: () => void;
}

export default function SanctuaryIntro({
  partnerConfig,
  setPartnerConfig,
  isNightMode,
  setIsNightMode,
  setRecipient,
  setSigner,
  setSelectedPaper,
  onComplete,
}: SanctuaryIntroProps) {
  const [step, setStep] = useState<number>(0); // 0 = Welcome, 1 to 6 = Steps
  const [writingFor, setWritingFor] = useState(() => {
    return localStorage.getItem("sanctuary_writing_for") || "Aziza";
  });
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem("sanctuary_nickname") || "My Dearest ❤️";
  });
  const [cityA, setCityA] = useState(() => {
    return localStorage.getItem("sanctuary_city_a") || "New York";
  });
  const [cityB, setCityB] = useState(() => {
    return localStorage.getItem("sanctuary_city_b") || "Paris";
  });
  const [distanceInput, setDistanceInput] = useState(() => {
    return localStorage.getItem("sanctuary_distance") || "3,650 miles";
  });
  const [reason, setReason] = useState(() => {
    return localStorage.getItem("sanctuary_reason") || "I just want to write something beautiful";
  });
  const [selectedFeel, setSelectedFeel] = useState(() => {
    return localStorage.getItem("sanctuary_feel") || "Candle Night";
  });

  const [fade, setFade] = useState(true);

  // Auto-saves state fields to localStorage
  useEffect(() => {
    localStorage.setItem("sanctuary_writing_for", writingFor);
    localStorage.setItem("sanctuary_nickname", nickname);
    localStorage.setItem("sanctuary_city_a", cityA);
    localStorage.setItem("sanctuary_city_b", cityB);
    localStorage.setItem("sanctuary_distance", distanceInput);
    localStorage.setItem("sanctuary_reason", reason);
    localStorage.setItem("sanctuary_feel", selectedFeel);
  }, [writingFor, nickname, cityA, cityB, distanceInput, reason, selectedFeel]);

  // Adjust preview background dynamically based on chosen feel
  useEffect(() => {
    if (step === 5) {
      if (selectedFeel === "Morning Light") {
        setIsNightMode(false);
        setSelectedPaper("cream");
      } else if (selectedFeel === "Candle Night") {
        setIsNightMode(true);
        setSelectedPaper("blush");
      } else if (selectedFeel === "Cozy Café") {
        setIsNightMode(false);
        setSelectedPaper("cream");
      } else if (selectedFeel === "Spring Paper") {
        setIsNightMode(false);
        setSelectedPaper("sage");
      } else if (selectedFeel === "Quiet Midnight") {
        setIsNightMode(true);
        setSelectedPaper("lavender");
      }
    }
  }, [selectedFeel, step, setIsNightMode, setSelectedPaper]);

  // Helper to handle smooth step transitions with 300ms fade
  const handleNextStep = (next: number) => {
    setFade(false);
    setTimeout(() => {
      setStep(next);
      setFade(true);
    }, 300);
  };

  const handleSkip = () => {
    // Quick skip applies defaults
    setRecipient(writingFor);
    setSigner("Firdavs");
    trackEvent("sanctuary_created");
    onComplete();
  };

  // Complete and synchronize inputs into main state
  const handleFinalize = () => {
    setPartnerConfig((prev: any) => ({
      ...prev,
      loverOne: writingFor,
      loverTwo: "Firdavs",
      loverOneCity: cityB,
      loverTwoCity: cityA,
      distance: distanceInput,
    }));
    setRecipient(writingFor);
    setSigner("Firdavs");
    trackEvent("sanctuary_created");
    onComplete();
  };

  const nicknames = [
    "❤️ My Love",
    "🌙 My Moon",
    "✨ My Person"
  ];

  const reasons = [
    { title: "I miss someone", desc: "Keep their radiant presence near in daily life." },
    { title: "I'm in a long-distance relationship", desc: "Bridging the infinite miles between hearts." },
    { title: "I just want to write something beautiful", desc: "Slow, focused letters back to simpler days." }
  ];

  const feels = [
    { name: "☀ Morning Light", mode: "day", desc: "Warm dawn glow on clean pearl paper" },
    { name: "🕯 Candle Night", mode: "night", desc: "Soft amber shadow and intimate vintage warmth" },
    { name: "🌙 Quiet Midnight", mode: "night", desc: "Calm starfield cosmos for midnight quietness" }
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-1000 p-4 md:p-8 overflow-y-auto ${
      isNightMode ? "bg-[#160E0D]/98 text-[#F4EBE3]" : "bg-[#FDFBF7]/98 text-[#3E2723]"
    } paper-texture`}>
      
      {/* Tiny floating dust particles purely for cinematic ambiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[10%] left-[20%] w-1.5 h-1.5 rounded-full bg-current/40 animate-pulse" />
        <div className="absolute top-[40%] left-[80%] w-1 h-1 rounded-full bg-current/60 animate-bounce" />
        <div className="absolute bottom-[20%] left-[45%] w-2 h-2 rounded-full bg-current/20 animate-pulse" style={{ animationDuration: "6s" }} />
      </div>

      {/* Skip option on top-right */}
      {step < 6 && (
        <button
          onClick={handleSkip}
          className={`absolute top-6 right-6 flex items-center gap-1.5 font-serif text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full transition-all duration-300 ${
            isNightMode ? "text-[#E69B82] hover:bg-white/5" : "text-[#8C5D58] hover:bg-black/5"
          }`}
        >
          <span>Skip to sanctuary</span>
          <X size={12} />
        </button>
      )}

      {/* Main Card Container */}
      <div 
        className={`w-full max-w-xl mx-auto rounded-3xl p-8 md:p-12 relative transition-all duration-300 ${
          fade ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"
        }`}
        style={{ transitionProperty: "opacity, transform" }}
      >
        {/* Progress indicator */}
        {step > 0 && step < 6 && (
          <div className="text-center mb-8">
            <span className={`font-mono text-xs uppercase tracking-widest opacity-40`}>
              Weaving your sanctuary • {step} of 5
            </span>
            <div className="relative w-full h-[1px] bg-current/10 mt-3 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 bottom-0 left-0 bg-red-600/70 transition-all duration-500 rounded-full" 
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* WELCOME */}
        {step === 0 && (
          <div className="text-center py-10 flex flex-col items-center max-w-[600px] mx-auto">
            {/* Tag/Logo */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 font-serif text-xs uppercase tracking-widest select-none ${
              isNightMode ? "text-[#E69B82] bg-white/5 border border-white/5" : "text-[#B71C1C] bg-red-50/60 border border-red-100"
            }`}>
              <span>❤️</span>
              <span className="font-semibold">Close From Far</span>
            </div>

            {/* Headline */}
            <h1 className={`font-serif text-[36px] md:text-[56px] font-extrabold tracking-[-0.4px] leading-none mb-4 select-none max-w-[580px] ${
              isNightMode ? "text-white" : "text-[#3E2723]"
            }`}>
              Write something they'll keep forever.
            </h1>

            {/* Subheadline / paragraph */}
            <p className={`text-base md:text-lg max-w-[500px] mx-auto mb-10 font-sans tracking-wide leading-relaxed ${
              isNightMode ? "text-[#D3C4B4]/85" : "text-[#5D4037]/75"
            }`}>
              For the words that deserve more than a text.
            </p>

            {/* Action */}
            <div className="mb-12">
              <button
                onClick={() => {
                  trackEvent("begin_clicked");
                  handleNextStep(1);
                }}
                className={`cursor-pointer font-sans tracking-widest text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-all duration-300 px-10 py-4.5 rounded-full border active:scale-98 ${
                  isNightMode
                    ? "bg-[#3B1E1C] text-[#F3D7D2] border-[#5A312D] hover:border-[#E8BDB5] hover:bg-[#4C2825] shadow-lg"
                    : "bg-[#F3D7D2] text-[#4A2522] border-[#E8BDB5] hover:border-[#DF9F95] hover:bg-[#ECD0C9] shadow-md"
                }`}
              >
                <span>Begin</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {/* Visual: One beautiful paper preview below. */}
            <div className="w-full max-w-sm mt-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <p className={`text-[10px] font-mono tracking-widest uppercase mb-3 opacity-50 ${
                isNightMode ? "text-[#E69B82]" : "text-[#5D4037]"
              }`}>
                One beautiful paper preview below
              </p>
              
              <div className={`p-6 rounded-2xl border relative overflow-hidden text-left shadow-sm transition-all duration-500 ${
                isNightMode 
                  ? "bg-[#251A18]/80 border-white/5 shadow-2xl" 
                  : "bg-[#FAF7F2] border-[#F2ECE4] shadow-sm"
              }`}>
                {/* Deckled border trim outline */}
                <div className="absolute inset-3 border border-dashed border-current/8 rounded-xl pointer-events-none" />
                
                {/* Paper Lines */}
                <div className="space-y-3 font-serif italic text-sm md:text-base opacity-75">
                  <div className={`h-2.5 w-1/3 rounded opacity-40 ${isNightMode ? "bg-[#E69B82]" : "bg-[#5D4037]"}`} />
                  <div className={`h-2 w-full rounded opacity-25 ${isNightMode ? "bg-[#E69B82]" : "bg-[#5D4037]"}`} />
                  <div className={`h-2 w-5/6 rounded opacity-25 ${isNightMode ? "bg-[#E69B82]" : "bg-[#5D4037]"}`} />
                  <div className={`h-2 w-4/5 rounded opacity-25 ${isNightMode ? "bg-[#E69B82]" : "bg-[#5D4037]"}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Who are you writing for? */}
        {step === 1 && (
          <div className="text-center py-10 flex flex-col items-center max-w-[600px] mx-auto">
            <h2 className={`font-serif text-[32px] sm:text-[42px] tracking-tight font-extrabold leading-[1.05] mb-3 ${
              isNightMode ? "text-white" : "text-[#3E2723]"
            }`}>
              Who are you writing for?
            </h2>
            <p className={`text-base md:text-lg max-w-[500px] mx-auto mb-10 font-sans opacity-75 ${
              isNightMode ? "text-[#D3C4B4]" : "text-[#5D4037]"
            }`}>
              The recipient of your letters.
            </p>
 
            <div className="w-full max-w-md mb-10">
              <input
                type="text"
                value={writingFor}
                onChange={(e) => setWritingFor(e.target.value)}
                placeholder="Their name..."
                className={`w-full bg-transparent border-b-2 py-3 text-center text-2xl md:text-3xl font-serif outline-none transition-colors duration-300 focus:border-red-600/60 ${
                  isNightMode ? "border-neutral-700 text-white" : "border-neutral-300 text-[#3E2723]"
                }`}
                autoFocus
              />
              
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <span className="text-xs uppercase tracking-wider opacity-40 mr-1">Suggested:</span>
                {["Aziza", "Emma", "Leo"].map((nm) => (
                  <button
                    key={nm}
                    type="button"
                    onClick={() => setWritingFor(nm)}
                    className={`text-xs font-serif px-3.5 py-1.5 rounded-full border transition-all ${
                      writingFor === nm 
                        ? "bg-red-500/15 border-red-500 text-red-500" 
                        : "border-current/10 hover:bg-current/5"
                    }`}
                  >
                    {nm}
                  </button>
                ))}
              </div>
            </div>
 
            <button
              onClick={() => handleNextStep(2)}
              disabled={!writingFor.trim()}
              className={`cursor-pointer font-sans tracking-widest text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-all duration-300 px-10 py-4 rounded-full border ${
                isNightMode
                  ? "bg-[#3B1E1C] text-[#F3D7D2] border-[#5A312D] hover:border-[#E8BDB5] hover:bg-[#4C2825]"
                  : "bg-[#F3D7D2] text-[#4A2522] border-[#E8BDB5] hover:border-[#DF9F95] hover:bg-[#ECD0C9]"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span>Continue</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}
 
        {/* STEP 2: What do you call them? */}
        {step === 2 && (
          <div className="text-center py-10 flex flex-col items-center max-w-[600px] mx-auto">
            <h2 className={`font-serif text-[32px] sm:text-[42px] tracking-tight font-extrabold leading-[1.05] mb-3 ${
              isNightMode ? "text-white" : "text-[#3E2723]"
            }`}>
              What do you call them?
            </h2>
            <p className={`text-base md:text-lg max-w-[500px] mx-auto mb-10 font-sans opacity-75 ${
              isNightMode ? "text-[#D3C4B4]" : "text-[#5D4037]"
            }`}>
              A private term of endearment, or standard greeting label.
            </p>
 
            <div className="w-full max-w-md mb-10">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="My Dearest..."
                className={`w-full bg-transparent border-b-2 py-3 text-center text-2xl font-serif outline-none transition-colors duration-300 focus:border-red-600/60 ${
                  isNightMode ? "border-neutral-700 text-white" : "border-neutral-300 text-[#3E2723]"
                }`}
                autoFocus
              />
              
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {nicknames.map((nk) => (
                  <button
                    key={nk}
                    type="button"
                    onClick={() => setNickname(nk)}
                    className={`text-xs font-serif px-3.5 py-1.5 rounded-full border transition-all ${
                      nickname === nk 
                        ? "bg-red-500/15 border-red-500 text-red-500" 
                        : "border-current/10 hover:bg-current/5"
                    }`}
                  >
                    {nk}
                  </button>
                ))}
              </div>
            </div>
 
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleNextStep(1)}
                className={`font-sans tracking-wider text-xs uppercase opacity-60 hover:opacity-100 px-6 py-3`}
              >
                Back
              </button>
              <button
                onClick={() => handleNextStep(3)}
                disabled={!nickname.trim()}
                className={`cursor-pointer font-sans tracking-widest text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-all duration-300 px-10 py-4 rounded-full border ${
                  isNightMode
                    ? "bg-[#3B1E1C] text-[#F3D7D2] border-[#5A312D] hover:border-[#E8BDB5] hover:bg-[#4C2825]"
                    : "bg-[#F3D7D2] text-[#4A2522] border-[#E8BDB5] hover:border-[#DF9F95] hover:bg-[#ECD0C9]"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <span>Continue</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Where are your hearts today? */}
        {step === 3 && (
          <div className="text-center py-10 flex flex-col items-center max-w-[600px] mx-auto">
            <h2 className={`font-serif text-[32px] sm:text-[42px] tracking-tight font-extrabold leading-[1.05] mb-3 ${
              isNightMode ? "text-white" : "text-[#3E2723]"
            }`}>
              Where are your hearts today?
            </h2>
            <p className={`text-base md:text-lg max-w-[500px] mx-auto mb-10 font-sans opacity-75 ${
              isNightMode ? "text-[#D3C4B4]" : "text-[#5D4037]"
            }`}>
              We'll display the coordinates and local times of your cities dynamically.
            </p>
 
            <div className="w-full max-w-lg mb-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              <div className="flex flex-col text-left">
                <label className="text-[10px] uppercase tracking-wider opacity-50 mb-2 font-mono">Your City (Firdavs)</label>
                <input
                  type="text"
                  value={cityA}
                  onChange={(e) => setCityA(e.target.value)}
                  placeholder="Your City..."
                  className={`bg-transparent border-b py-2 text-lg font-serif outline-none ${
                    isNightMode ? "border-neutral-700 text-white" : "border-neutral-300 text-[#3E2723]"
                  }`}
                />
              </div>
 
              <div className="flex flex-col text-left">
                <label className="text-[10px] uppercase tracking-wider opacity-50 mb-2 font-mono">Their City ({writingFor})</label>
                <input
                  type="text"
                  value={cityB}
                  onChange={(e) => setCityB(e.target.value)}
                  placeholder="Their City..."
                  className={`bg-transparent border-b py-2 text-lg font-serif outline-none ${
                    isNightMode ? "border-neutral-700 text-white" : "border-neutral-300 text-[#3E2723]"
                  }`}
                />
              </div>
 
            </div>
 
            {/* Soft animated distance connector */}
            <div className="w-full max-w-md py-5 px-6 rounded-2xl bg-current/5 border border-current/5 mb-10 flex flex-col items-center">
              <div className="flex items-center gap-3 w-full justify-center">
                <span className="font-serif font-medium text-sm text-current/80">{cityA || "Here"}</span>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full border-t border-dashed border-current/25 relative flex items-center justify-center">
                    <Heart size={14} className="text-red-500 absolute bg-transparent fill-red-500 animate-pulse" />
                  </div>
                </div>
                <span className="font-serif font-medium text-sm text-current/80">{cityB || "There"}</span>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Distance Input:</span>
                <input 
                  type="text" 
                  value={distanceInput}
                  onChange={(e) => setDistanceInput(e.target.value)}
                  className="bg-transparent border-b border-current/20 text-xs font-mono py-0.5 px-1.5 focus:outline-none w-28 text-center" 
                />
              </div>
            </div>
 
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleNextStep(2)}
                className={`font-sans tracking-wider text-xs uppercase opacity-60 hover:opacity-100 px-6 py-3`}
              >
                Back
              </button>
              <button
                onClick={() => handleNextStep(4)}
                disabled={!cityA.trim() || !cityB.trim()}
                className={`cursor-pointer font-sans tracking-widest text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-all duration-300 px-10 py-4 rounded-full border ${
                  isNightMode
                    ? "bg-[#3B1E1C] text-[#F3D7D2] border-[#5A312D] hover:border-[#E8BDB5] hover:bg-[#4C2825]"
                    : "bg-[#F3D7D2] text-[#4A2522] border-[#E8BDB5] hover:border-[#DF9F95] hover:bg-[#ECD0C9]"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <span>Continue</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Why are you here today? */}
        {step === 4 && (
          <div className="text-center py-10 flex flex-col items-center max-w-[600px] mx-auto w-full">
            <h2 className={`font-serif text-[32px] sm:text-[42px] tracking-tight font-extrabold leading-[1.05] mb-3 ${
              isNightMode ? "text-white" : "text-[#3E2723]"
            }`}>
              Why are you here today?
            </h2>
            <p className={`text-base md:text-lg max-w-[500px] mx-auto mb-10 font-sans opacity-75 ${
              isNightMode ? "text-[#D3C4B4]" : "text-[#5D4037]"
            }`}>
              This helps tune the subtle sanctuary atmosphere.
            </p>
 
            <div className="w-full space-y-3 mb-10">
              {reasons.map((rs) => (
                <button
                  key={rs.title}
                  type="button"
                  onClick={() => setReason(rs.title)}
                  className={`w-full p-5 rounded-2xl text-left border cursor-pointer transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 transform ${
                    reason === rs.title
                      ? isNightMode
                        ? "bg-[#3B1E1C] border-[#8D5E54] hover:border-[#E8BDB5]"
                        : "bg-[#FBE4E1] border-[#ECD9D6] hover:border-[#DF9F95]"
                      : "bg-transparent border-current/10 hover:bg-current/5"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-serif font-semibold text-sm text-current leading-snug">
                      {rs.title}
                    </div>
                    <div className="text-[11px] font-serif italic text-current/60 mt-0.5">
                      {rs.desc}
                    </div>
                  </div>
                  {reason === rs.title && (
                    <span className="text-red-500 text-xs font-mono font-bold uppercase tracking-wider">Active</span>
                  )}
                </button>
              ))}
            </div>
 
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleNextStep(3)}
                className={`font-sans tracking-wider text-xs uppercase opacity-60 hover:opacity-100 px-6 py-3`}
              >
                Back
              </button>
              <button
                onClick={() => handleNextStep(5)}
                className={`cursor-pointer font-sans tracking-widest text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-all duration-300 px-10 py-4 rounded-full border ${
                  isNightMode
                    ? "bg-[#3B1E1C] text-[#F3D7D2] border-[#5A312D] hover:border-[#E8BDB5] hover:bg-[#4C2825]"
                    : "bg-[#F3D7D2] text-[#4A2522] border-[#E8BDB5] hover:border-[#DF9F95] hover:bg-[#ECD0C9]"
                }`}
              >
                <span>Continue</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
 
        {/* STEP 5: How should your sanctuary feel? */}
        {step === 5 && (
          <div className="text-center py-10 flex flex-col items-center max-w-[600px] mx-auto w-full">
            <h2 className={`font-serif text-[32px] sm:text-[42px] tracking-tight font-extrabold leading-[1.05] mb-3 ${
              isNightMode ? "text-white" : "text-[#3E2723]"
            }`}>
              How should your sanctuary feel?
            </h2>
            <p className={`text-base md:text-lg max-w-[500px] mx-auto mb-10 font-sans opacity-75 ${
              isNightMode ? "text-[#D3C4B4]" : "text-[#5D4037]"
            }`}>
              Watch the background change live to reflect your selection.
            </p>
 
            <div className="w-full space-y-3 mb-10">
              {feels.map((fl) => (
                <button
                  key={fl.name}
                  type="button"
                  onClick={() => setSelectedFeel(fl.name)}
                  className={`w-full p-5 rounded-2xl text-left border cursor-pointer transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 transform ${
                    selectedFeel === fl.name
                      ? isNightMode
                        ? "bg-[#3B1E1C] border-[#8D5E54] hover:border-[#E8BDB5]"
                        : "bg-[#FBE4E1] border-[#ECD9D6] hover:border-[#DF9F95]"
                      : "bg-transparent border-current/10 hover:bg-current/5"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-serif font-semibold text-sm text-current leading-snug">
                      {fl.name}
                    </div>
                    <div className="text-[11px] font-serif italic text-current/60 mt-0.5">
                      {fl.desc}
                    </div>
                  </div>
                  {selectedFeel === fl.name && (
                    <span className="text-red-500 text-xs font-mono font-bold uppercase tracking-wider">Previewing</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleNextStep(4)}
                className={`font-sans tracking-wider text-xs uppercase opacity-60 hover:opacity-100 px-6 py-3`}
              >
                Back
              </button>
              <button
                onClick={() => handleNextStep(6)}
                className={`cursor-pointer font-sans tracking-widest text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-all duration-300 px-10 py-4 rounded-full border ${
                  isNightMode
                    ? "bg-[#3B1E1C] text-[#F3D7D2] border-[#5A312D] hover:border-[#E8BDB5] hover:bg-[#4C2825]"
                    : "bg-[#F3D7D2] text-[#4A2522] border-[#E8BDB5] hover:border-[#DF9F95] hover:bg-[#ECD0C9]"
                }`}
              >
                <span>Continue</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
 
        {/* STEP 6: Display sanctuary ready summary */}
        {step === 6 && (
          <div className="text-center py-10 flex flex-col items-center max-w-[600px] mx-auto">
            {/* Elegant Tag/Logo */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 font-serif text-xs uppercase tracking-widest select-none ${
              isNightMode ? "text-[#E69B82] bg-white/5 border border-white/5" : "text-[#B71C1C] bg-red-50/60 border border-red-100"
            }`}>
              <span>❤️</span>
              <span className="font-semibold">Sanctuary Built</span>
            </div>
            
            <h2 className={`font-serif text-[32px] sm:text-[42px] tracking-tight font-extrabold leading-[1.05] mb-3 ${
              isNightMode ? "text-white" : "text-[#3E2723]"
            }`}>
              Your sanctuary is ready.
            </h2>
            <p className={`text-base md:text-lg max-w-[500px] mx-auto mb-10 font-sans opacity-75 ${
              isNightMode ? "text-[#D3C4B4]" : "text-[#5D4037]"
            }`}>
              "One day, you'll both come back and read these words again."
            </p>
            
            {/* Elegant Luxury summary box */}
            <div className="my-8 w-full max-w-sm rounded-2xl bg-current/5 border border-current/5 p-6 space-y-4 text-left font-sans">
              <div className="flex justify-between items-center pb-2.5 border-b border-current/10">
                <span className="text-[11px] uppercase tracking-wider opacity-60 font-mono">Beloved Partner</span>
                <span className="font-serif font-bold text-sm text-red-600 flex items-center gap-1">
                  {writingFor} ❤️
                </span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-current/10">
                <span className="text-[11px] uppercase tracking-wider opacity-60 font-mono">Distance Bridged</span>
                <span className="font-serif font-bold text-sm text-current/90">{distanceInput}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] uppercase tracking-wider opacity-60 font-mono">Selected Atmosphere</span>
                <span className="font-serif font-bold text-sm text-[#FF8F00]">{selectedFeel}</span>
              </div>
            </div>
 
            <button
              onClick={handleFinalize}
              className={`cursor-pointer font-sans tracking-widest text-xs font-semibold uppercase flex items-center justify-center gap-2.5 transition-all duration-300 px-12 py-5 rounded-full border ${
                isNightMode
                  ? "bg-[#3B1E1C] text-[#F3D7D2] border-[#5A312D] hover:border-[#E8BDB5] hover:bg-[#4C2825] hover:-translate-y-0.5 shadow-lg shadow-black/30"
                  : "bg-[#F3D7D2] text-[#4A2522] border-[#E8BDB5] hover:border-[#DF9F95] hover:bg-[#ECD0C9] hover:-translate-y-0.5 shadow-md shadow-red-200/20"
              }`}
            >
              <span>Begin</span>
              <Heart size={14} fill="currentColor" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
