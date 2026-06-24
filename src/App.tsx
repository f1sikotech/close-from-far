import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Send, 
  Sparkles, 
  Clock, 
  MapPin, 
  Trash2, 
  X, 
  Maximize2, 
  Coffee, 
  Moon, 
  Sun,
  Settings,
  Edit2,
  Check,
  Compass,
  Feather,
  Share2
} from "lucide-react";
import SanctuaryIntro from "./components/SanctuaryIntro";
import { trackEvent } from "./utils/analytics";

interface Letter {
  id: string;
  content: string;
  signedBy: string;
  to: string;
  date: string;
  rotation: number;
  paperStyle: "cream" | "blush" | "lavender" | "sage";
  floatStyle: "float-1" | "float-2" | "float-3";
  reactions: number;
}

interface PartnerConfig {
  loverOne: string;
  loverTwo: string;
  distance: string;
  loverOneCity: string;
  loverTwoCity: string;
  loverOneOffset: number; // UTC offset hours
  loverTwoOffset: number; // UTC offset hours
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  driftX: number;
  rotation: number;
  type: "heart" | "petal" | "dust";
}

export default function App() {
  // Pre-load deeply romantic, beautifully written initial letters so the room is instantly alive
  const initialLetters: Letter[] = [
    {
      id: "letter-1",
      content: "I looked at the moon tonight and realized that even though we are thousands of miles apart, we are still staring at the exact same light. Goodnight, my safe haven.",
      signedBy: "Firdavs",
      to: "Aziza",
      date: "Jun 21, 11:34 PM",
      rotation: -2.5,
      paperStyle: "cream",
      floatStyle: "float-1",
      reactions: 4
    },
    {
      id: "letter-2",
      content: "The antique poetry book we bought together arrived today. I opened it to page 43, and the stanza about holding onto a worn sweater made me smile. I'm wearing your oversized gray cardigan while writing this.",
      signedBy: "Aziza",
      to: "Firdavs",
      date: "Jun 20, 08:12 AM",
      rotation: 3,
      paperStyle: "blush",
      floatStyle: "float-2",
      reactions: 7
    },
    {
      id: "letter-3",
      content: "Distance is only space. Our love is the signal. Every sunrise brings us one morning closer to our reunion. I already have the calendar marked, only 45 days left.",
      signedBy: "Firdavs",
      to: "Aziza",
      date: "Jun 18, 04:15 PM",
      rotation: -1.5,
      paperStyle: "sage",
      floatStyle: "float-3",
      reactions: 5
    },
    {
      id: "letter-4",
      content: "Sipping coffee on my balcony while you are fast asleep over there. Sending you all the warm morning gold before it makes its way over to your horizon. Watch for it.",
      signedBy: "Aziza",
      to: "Firdavs",
      date: "Jun 17, 07:02 AM",
      rotation: 2,
      paperStyle: "lavender",
      floatStyle: "float-1",
      reactions: 9
    }
  ];

  // Default partner config
  const initialConfig: PartnerConfig = {
    loverOne: "Aziza",
    loverTwo: "Firdavs",
    distance: "3,650 miles",
    loverOneCity: "Paris",
    loverTwoCity: "New York",
    loverOneOffset: 2, // UTC+2
    loverTwoOffset: -4 // UTC-4 (EDT)
  };

  // State Management
  const [letters, setLetters] = useState<Letter[]>(() => {
    const saved = localStorage.getItem("close_from_far_letters");
    return saved ? JSON.parse(saved) : initialLetters;
  });

  const [partnerConfig, setPartnerConfig] = useState<PartnerConfig>(() => {
    const saved = localStorage.getItem("close_from_far_config");
    return saved ? JSON.parse(saved) : initialConfig;
  });

  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Editor states
  const [newContent, setNewContent] = useState("");
  const [signer, setSigner] = useState("Firdavs");
  const [recipient, setRecipient] = useState("Aziza");
  const [selectedPaper, setSelectedPaper] = useState<"cream" | "blush" | "lavender" | "sage">("cream");
  const [selectedVariant, setSelectedVariant] = useState<1 | 2 | 3>(1);
  const [selectedSeal, setSelectedSeal] = useState<"heart" | "sprig" | "star">("heart");
  
  // Custom interactive timezone/distance states
  const [tempConfig, setTempConfig] = useState<PartnerConfig>({ ...partnerConfig });
  const [isConfigEditing, setIsConfigEditing] = useState(false);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("close_from_far_night_mode");
    return saved ? JSON.parse(saved) : false;
  });
   const [bgParticles, setBgParticles] = useState<Particle[]>([]);
  const [heartSparkles, setHeartSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [localTimes, setLocalTimes] = useState({ loverOneTime: "", loverTwoTime: "" });
  
  // Premium romantic features states
  const [isFocused, setIsFocused] = useState(false);
  const [sendingState, setSendingState] = useState<"idle" | "folding" | "envelope" | "flying" | "delivered">("idle");
  const [presenceText, setPresenceText] = useState("");
  const [hasTrackedStarted, setHasTrackedStarted] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedLetterId, setCopiedLetterId] = useState<string | null>(null);

  // Track if page was opened from shared/invite link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("invite") || params.get("letter") || params.get("shared") || params.get("share")) {
      trackEvent("shared_link_opened");
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("close_from_far_letters", JSON.stringify(letters));
  }, [letters]);

  useEffect(() => {
    localStorage.setItem("close_from_far_config", JSON.stringify(partnerConfig));
  }, [partnerConfig]);

  useEffect(() => {
    localStorage.setItem("close_from_far_night_mode", JSON.stringify(isNightMode));
  }, [isNightMode]);

  // Generate beautiful background particles on mount
  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 12 }, (_, index) => {
      const types: ("heart" | "petal" | "dust")[] = ["heart", "petal", "dust"];
      const type = types[index % 3];
      return {
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 35 * -1, // Use spread delays so some items appear deep into the timeline and pacing is highly elegant
        duration: type === "dust" ? 45 + Math.random() * 35 : 40 + Math.random() * 25, // extremely slow and gentle
        size: type === "dust" ? 1.5 + Math.random() * 2 : (type === "heart" ? 4.5 + Math.random() * 5.5 : 7.5 + Math.random() * 8.5),
        driftX: -60 + Math.random() * 120,
        rotation: 120 + Math.random() * 240,
        type
      };
    });
    setBgParticles(generated);
  }, []);

  // Intimate presence status rotator
  useEffect(() => {
    const presencePhrases = [
      `${recipient} is reading your last letter...`,
      `${recipient} last opened the sanctuary 3 minutes ago ❤️`,
      `${recipient} is looking at the same moon right now... 🌙`,
      `The sky in ${recipient === partnerConfig.loverOne ? partnerConfig.loverOneCity : partnerConfig.loverTwoCity} matches your thoughts... ✨`,
      `💌 One letter. Thousands of miles. One smile.`,
      `You are ${recipient}'s sweetest thought...`
    ];

    const pickPhrase = () => {
      const randomIdx = Math.floor(Math.random() * presencePhrases.length);
      setPresenceText(presencePhrases[randomIdx]);
    };

    pickPhrase();
    const interval = setInterval(pickPhrase, 14000); // cycle every 14 seconds gently
    return () => clearInterval(interval);
  }, [recipient, partnerConfig, isNightMode]);

  // Soft clock synchronization for the two lover locations
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      // Calculate times based on specified UTC offsets
      const getFormattedTime = (offset: number) => {
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const targetDate = new Date(utc + 3600000 * offset);
        return targetDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });
      };
      setLocalTimes({
        loverOneTime: getFormattedTime(partnerConfig.loverOneOffset),
        loverTwoTime: getFormattedTime(partnerConfig.loverTwoOffset)
      });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, [partnerConfig]);

  // Handle letter creation with premium fold, envelope, flying airplane timeline
  const handleSendLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || sendingState !== "idle") return;

    // Track letter sent event
    trackEvent("letter_sent");
    setHasTrackedStarted(false);

    // Save form data into closure so we append the correct letter when timeline completes
    const contentToSave = newContent.trim();
    const paperToSave = selectedPaper;
    const authorToSave = signer || "Heart";
    const recipientToSave = recipient || "My Love";

    // 1. Fold paper
    setSendingState("folding");

    // 2. Animate into envelope with wax seal (after 600ms)
    setTimeout(() => {
      setSendingState("envelope");
    }, 600);

    // 3. Float a paper airplane and display "Traveling to [Recipient]..." (after 1500ms total)
    setTimeout(() => {
      setSendingState("flying");
    }, 1500);

    // 4. Delivered ❤️ (after another 1.5 seconds of flying, i.e., 3000ms total)
    setTimeout(() => {
      setSendingState("delivered");
      
      // Spray subtle sparks
      const formEl = document.getElementById("composer-card");
      if (formEl) {
        const rect = formEl.getBoundingClientRect();
        const sparkles = Array.from({ length: 16 }, (_, i) => ({
          id: Date.now() + i,
          x: rect.left + rect.width / 2 + (Math.random() * 160 - 80),
          y: rect.top + rect.height / 2 + (Math.random() * 80 - 40)
        }));
        setHeartSparkles((prev) => [...prev, ...sparkles]);
        setTimeout(() => {
          setHeartSparkles((prev) => prev.filter((s) => !sparkles.includes(s)));
        }, 1500);
      }
    }, 3000);

    // 5. Wrap up, clear form inputs, add to floating letter list, and reset state (after 4500ms total)
    setTimeout(() => {
      const rotations = [-3, -2, -1, 1, 2, 3, 4, -4];
      const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
      const floats: ("float-1" | "float-2" | "float-3")[] = ["float-1", "float-2", "float-3"];
      const randomFloat = floats[Math.floor(Math.random() * floats.length)];

      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      }) + ", " + now.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true
      });

      const newLetter: Letter = {
        id: `letter-${Date.now()}`,
        content: contentToSave,
        signedBy: authorToSave,
        to: recipientToSave,
        date: formattedDate,
        rotation: randomRotation,
        paperStyle: paperToSave,
        floatStyle: randomFloat,
        reactions: 0
      };

      setLetters((prev) => [newLetter, ...prev]);
      setNewContent("");
      setSendingState("idle");

      // Constant handwritten roles: Firdavs (writer) and Aziza (recipient)
      setSigner("Firdavs");
      setRecipient("Aziza");
    }, 4500);
  };

  // Helper styles for envelope colors
  const getPaperColorClasses = (style: "cream" | "blush" | "lavender" | "sage") => {
    switch (style) {
      case "blush":
        return {
          bg: "bg-[#FFF6F5] border-[#F4DDD9] hover:border-[#ECD0CB]",
          badge: "bg-[#FBE4E1] text-[#A6453B]",
          gradient: "from-[#FFF6F5] to-[#FDECE9]"
        };
      case "lavender":
        return {
          bg: "bg-[#FAF7FD] border-[#EADFF4] hover:border-[#DDCBEA]",
          badge: "bg-[#F1E6FA] text-[#694294]",
          gradient: "from-[#FAF7FD] to-[#F5EEFB]"
        };
      case "sage":
        return {
          bg: "bg-[#FAFAF6] border-[#E2EADF] hover:border-[#CCDCC8]",
          badge: "bg-[#E6F0E1] text-[#4F6C40]",
          gradient: "from-[#FAFAF6] to-[#F3F6F0]"
        };
      case "cream":
      default:
        return {
          bg: "bg-[#FFFDFB] border-[#F2E8D9] hover:border-[#E8D9C2]",
          badge: "bg-[#FAF0E1] text-[#8C6D3F]",
          gradient: "from-[#FFFDFB] to-[#FAF5EC]"
        };
    }
  };

  // React to a letter with heart sparkles
  const handleReactToLetter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering full screen zoom overlay
    setLetters(prev => prev.map(l => {
      if (l.id === id) {
        return { ...l, reactions: l.reactions + 1 };
      }
      return l;
    }));
  };

  // Dissolve/delete a letter softly
  const handleDeleteLetter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering full screen zoom overlay
    setConfirmDeleteId(id);
  };

  // Update space configs
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerConfig(tempConfig);
    setIsConfigEditing(false);
    // Reset Composer Signer and Recipient choices on names update
    setSigner(tempConfig.loverOne);
    setRecipient(tempConfig.loverTwo);
  };

  return (
    <div 
      className={`relative min-h-screen pb-24 overflow-hidden transition-all duration-1000 ${
        isNightMode 
          ? "bg-[#1E1412] text-[#F3EBE1] selection:bg-[#5D4037] selection:text-[#FFFDFB]" 
          : "bg-[#FAF8F5] text-[#3E2723] selection:bg-[#FBE4E1] selection:text-[#B71C1C]"
      }`} 
      id="main-cozy-container"
    >
      {showIntro && (
        <SanctuaryIntro
          partnerConfig={partnerConfig}
          setPartnerConfig={setPartnerConfig}
          isNightMode={isNightMode}
          setIsNightMode={setIsNightMode}
          setRecipient={setRecipient}
          setSigner={setSigner}
          setSelectedPaper={setSelectedPaper}
          onComplete={() => {
            setShowIntro(false);
          }}
        />
      )}

      {/* Premium gentle light vignette background overlay */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${
        isNightMode 
          ? "bg-[radial-gradient(circle_at_center,rgba(244,117,97,0.05)_0%,rgba(30,20,18,0.95)_70%,rgba(18,12,11,1)_100%)]" 
          : "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,rgba(250,248,245,0.95)_60%,rgba(244,239,230,1)_100%)]"
      }`} />

      {/* Subtle background paper-like noise texture overlay */}
      <div className={`absolute inset-0 pointer-events-none paper-texture z-0 transition-opacity duration-1000 ${
        isNightMode ? "opacity-[0.012] mix-blend-overlay" : "opacity-[0.025]"
      }`} />

      {/* Slow warm sunlight / candlelight lamp desk sweep flare */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.9]">
        <div 
          className={`absolute top-0 bottom-0 w-1/3 blur-[120px] pointer-events-none ${
            isNightMode 
              ? "bg-linear-to-r from-transparent via-[#E65100]/5 to-transparent" 
              : "bg-linear-to-r from-transparent via-[#FFF9F2]/20 to-transparent"
          }`}
          style={{
            animation: "light-sweep 24s ease-in-out infinite",
            transformOrigin: "center top",
          }}
        />
      </div>

      {/* Premium Frosted Glass Blurred background drift elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000" id="frosted-glass-drift">
        {isNightMode ? (
          <>
            <div className="absolute top-20 left-[15%] w-72 h-72 bg-[#D84315] rounded-full mix-blend-screen filter blur-[90px] opacity-10 animate-[drift_12s_infinite_ease-in-out]"></div>
            <div className="absolute bottom-20 right-[15%] w-96 h-96 bg-[#AD1457] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-[drift_16s_infinite_ease-in-out_reverse]"></div>
            <div className="absolute top-[40%] right-[30%] w-64 h-64 bg-[#E65100] rounded-full mix-blend-screen filter blur-[80px] opacity-12 animate-[drift_14s_infinite_ease-in-out]"></div>
          </>
        ) : (
          <>
            <div className="absolute top-20 left-[15%] w-64 h-64 bg-[#FBE4E1] rounded-full mix-blend-multiply filter blur-[80px] opacity-25 animate-[drift_12s_infinite_ease-in-out]"></div>
            <div className="absolute bottom-20 right-[15%] w-80 h-80 bg-[#B71C1C] rounded-full mix-blend-multiply filter blur-[90px] opacity-[0.04] animate-[drift_16s_infinite_ease-in-out_reverse]"></div>
          </>
        )}
      </div>

      {/* Cinematic Background Particles - Very Slow & Subtle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" id="particles-container">
        {bgParticles.map((pt) => {
          const animationClass = pt.type === "heart" 
            ? "animate-[heart-rise_var(--drift-duration)_linear_infinite]" 
            : pt.type === "petal"
              ? "animate-[petal-fall_var(--drift-duration)_linear_infinite]"
              : "animate-[heart-rise_var(--drift-duration)_linear_infinite]";

          return (
            <div
              key={pt.id}
              className={`particle flex items-center justify-center transition-all duration-1000 ${animationClass} ${
                isNightMode ? "text-[#F4A261]/20" : "text-[#B71C1C]/20"
              }`}
              style={{
                left: `${pt.left}%`,
                "--drift-duration": `${pt.duration}s`,
                "--drift-delay": `${pt.delay}s`,
                "--drift-x": `${pt.driftX}px`,
                "--drift-rotation": `${pt.rotation}deg`
              } as React.CSSProperties}
            >
              {pt.type === "heart" && (
                <Heart size={pt.size} fill="currentColor" stroke="none" className="opacity-30" />
              )}
              {pt.type === "petal" && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="opacity-25" style={{ width: pt.size, height: pt.size }}>
                  <path d="M17,8 C14.2,8 10,10.5 8,13 C6,15.5 5,18 5,20 C5,21 6,22 7,22 C9,22 11.5,21 14,19 C16.5,17 19,12.8 19,10 C19,9 18,8 17,8 Z" />
                </svg>
              )}
              {pt.type === "dust" && (
                <div 
                  className={`rounded-full blur-[0.5px] transition-all duration-1000 ${
                    isNightMode ? "bg-[#FFD54F]/25" : "bg-[#D7CCC8]/45"
                  }`}
                  style={{ width: pt.size, height: pt.size }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Love sparks explosion on Sending */}
      {heartSparkles.map((sp) => (
        <div
          key={sp.id}
          className={`fixed pointer-events-none z-50 animate-ping ${
            isNightMode ? "text-purple-300" : "text-[#B71C1C]"
          }`}
          style={{
            left: sp.x,
            top: sp.y,
            width: "16px",
            height: "16px",
          }}
        >
          <Heart fill="currentColor" size={16} />
        </div>
      ))}

      {/* Private Room Header / Settings Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 pt-4 md:px-6 md:pt-6 relative z-10 animate-entrance" id="header-bar">
        <div className={`flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 glass paper-shadow rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 transition-all duration-700 ${
          isNightMode 
            ? "bg-[#181124]/40 border-purple-950/40 shadow-[0_4px_20px_rgba(0,0,0,0.35)]" 
            : "bg-white/65 border-[#F2ECE4]"
        }`}>
          {/* Couple status and connection info */}
          <div className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-[11px] sm:text-xs transition-colors duration-700 w-full md:w-auto text-center justify-center md:text-left md:justify-start ${
            isNightMode ? "text-purple-200" : "text-[#5D4037]"
          }`}>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              Private Sanctuary
              <span className="text-[#D3C7B9] hidden sm:inline">|</span>
            </div>
            {isConfigEditing ? (
              <span className={`italic transition-colors ${isNightMode ? "text-purple-300" : "text-[#B71C1C]"}`}>Customizing our private space...</span>
            ) : (
              <span className="flex items-center gap-1 flex-wrap justify-center">
                <MapPin size={11} className={`transition-colors ${isNightMode ? "text-purple-400" : "text-[#B71C1C] inline-block mr-0.5"}`} />
                <span className="hidden sm:inline">
                  <strong>{partnerConfig.loverOne}</strong> in {partnerConfig.loverOneCity} to <strong>{partnerConfig.loverTwo}</strong> in {partnerConfig.loverTwoCity}
                </span>
                <span className="sm:hidden">
                  <strong>{partnerConfig.loverOne}</strong> ⇆ <strong>{partnerConfig.loverTwo}</strong>
                </span>
                <span className="mx-1 opacity-45">•</span>
                <span className={`font-semibold px-2 py-0.5 rounded-full transition-all duration-700 text-[10px] sm:text-xs ${
                  isNightMode 
                    ? "text-purple-300 bg-purple-950/60 border border-purple-800/30" 
                    : "text-[#B71C1C] bg-[#FBE4E1]"
                }`}>{partnerConfig.distance}</span>
              </span>
            )}
          </div>

          {/* Local times, Night Mode slider switch & edit triggers */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center w-full md:w-auto">
            {!isConfigEditing && (
              <div className={`flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-mono transition-colors duration-700 ${
                isNightMode ? "text-[#E69B82]/85" : "text-[#5D4037]"
              }`}>
                <div className="flex items-center gap-1">
                  {parseInt(localTimes.loverOneTime) > 6 && parseInt(localTimes.loverOneTime) < 18 ? (
                    <Sun size={11} className="text-amber-500" />
                  ) : (
                    <Moon size={11} className="text-orange-400" />
                  )}
                  <span>{partnerConfig.loverOneCity}: <strong className={`transition-colors ${isNightMode ? "text-[#F5EFE6]" : "text-[#3E2723]"}`}>{localTimes.loverOneTime}</strong></span>
                </div>
                <div className="opacity-40">⇆</div>
                <div className="flex items-center gap-1">
                  {parseInt(localTimes.loverTwoTime) > 6 && parseInt(localTimes.loverTwoTime) < 18 ? (
                    <Sun size={11} className="text-amber-500" />
                  ) : (
                    <Moon size={11} className="text-orange-400" />
                  )}
                  <span>{partnerConfig.loverTwoCity}: <strong className={`transition-colors ${isNightMode ? "text-[#F5EFE6]" : "text-[#3E2723]"}`}>{localTimes.loverTwoTime}</strong></span>
                </div>
              </div>
            )}

            {/* Night Time Love Mode Toggle Slider Button */}
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className={`relative flex items-center p-0.5 rounded-full cursor-pointer transition-transform duration-150 transform transition-shadow hover:-translate-y-0.5 hover:shadow-md ${
                isNightMode 
                  ? "bg-[#331E1B] border-[#8D5E54]/45 text-[#FFA726]" 
                  : "bg-[#F2ECE4] border-[#ECD9D6] text-[#5D4037]"
              }`}
              style={{ width: "52px", height: "28px" }}
              title={isNightMode ? "Sunrise Mode" : "Sunset Moonglow Mode"}
            >
              <div className="absolute inset-0 flex justify-between px-1.5 items-center pointer-events-none opacity-40 text-[9px] select-none font-sans">
                <span>🌙</span>
                <span>☀️</span>
              </div>
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center transform transition-transform duration-500 shadow-md ${
                  isNightMode 
                    ? "translate-x-6 bg-[#E65100] text-amber-100" 
                    : "translate-x-0 bg-white text-amber-500"
                }`}
              >
                {isNightMode ? <Moon size={10} fill="currentColor" stroke="none" /> : <Sun size={10} fill="currentColor" />}
              </div>
            </button>

            {/* Copy Invite Link / Share Sanctuary Button */}
            <button
              onClick={() => {
                const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=true`;
                navigator.clipboard.writeText(inviteUrl);
                trackEvent("share_clicked", { type: "invite_link" });
                setCopiedInvite(true);
                setTimeout(() => setCopiedInvite(false), 2500);
              }}
              className={`transition-all duration-150 p-1.5 rounded-lg hover:-translate-y-0.5 hover:shadow-xs relative ${
                isNightMode 
                  ? "text-[#E69B82] hover:text-[#FFA726] hover:bg-[#3E2723]/60" 
                  : "text-[#5D4037] hover:text-[#B71C1C] hover:bg-[#F2ECE4]/50"
              }`}
              title="Copy sanctuary invite link"
              id="share-sanctuary-trigger"
            >
              {copiedInvite ? <Check size={15} className="text-emerald-500 animate-pulse" /> : <Share2 size={15} />}
              {copiedInvite && (
                <span className={`absolute bottom-full mb-1.5 right-0 text-[10px] px-2.5 py-1 rounded-md shadow-md z-30 font-sans tracking-wide transition-colors ${
                  isNightMode ? "bg-[#331E1B] text-[#FFA726] border border-[#8D5E54]/30" : "bg-white text-[#B71C1C] border border-[#ECD9D6]"
                }`}>
                  Invite Link Copied!
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setTempConfig({ ...partnerConfig });
                setIsConfigEditing(!isConfigEditing);
              }}
              className={`transition-all duration-150 p-1.5 rounded-lg hover:-translate-y-0.5 hover:shadow-xs ${
                isNightMode 
                  ? "text-[#E69B82] hover:text-[#FFA726] hover:bg-[#3E2723]/60" 
                  : "text-[#5D4037] hover:text-[#B71C1C] hover:bg-[#F2ECE4]/50"
              }`}
              title="Personalize your hearts space"
              id="settings-trigger"
            >
              {isConfigEditing ? <X size={15} /> : <Settings size={15} />}
            </button>
          </div>
        </div>

        {/* Inline Space Personalizer Form */}
        {isConfigEditing && (
          <form 
            onSubmit={handleSaveConfig} 
            className="mt-3 glass paper-shadow rounded-2xl p-5 text-sm animate-entrance"
            id="partner-config-form"
          >
            <h3 className="font-serif text-[#B71C1C] text-base mb-4 flex items-center gap-2 border-b border-[#F5EFE6] pb-2">
              <Heart fill="currentColor" size={14} className="text-[#B71C1C]" />
              Personalize Your Lovers Sanctuary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#5D4037] mb-1">Partner 1 Name</label>
                <input
                  type="text"
                  value={tempConfig.loverOne}
                  onChange={(e) => setTempConfig({ ...tempConfig, loverOne: e.target.value })}
                  className="w-full bg-[#FCFAF6]/60 border border-[#F2E8D9] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#B71C1C] outline-none text-[#3E2723]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs text-[#5D4037] mb-1">Partner 2 Name</label>
                <input
                  type="text"
                  value={tempConfig.loverTwo}
                  onChange={(e) => setTempConfig({ ...tempConfig, loverTwo: e.target.value })}
                  className="w-full bg-[#FCFAF6]/60 border border-[#F2E8D9] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#B71C1C] outline-none text-[#3E2723]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-[#5D4037] mb-1">Partner 1 Location / City</label>
                <input
                  type="text"
                  value={tempConfig.loverOneCity}
                  onChange={(e) => setTempConfig({ ...tempConfig, loverOneCity: e.target.value })}
                  className="w-full bg-[#FCFAF6]/60 border border-[#F2E8D9] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#B71C1C] outline-none text-[#3E2723]"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5D4037] mb-1">Partner 2 Location / City</label>
                <input
                  type="text"
                  value={tempConfig.loverTwoCity}
                  onChange={(e) => setTempConfig({ ...tempConfig, loverTwoCity: e.target.value })}
                  className="w-full bg-[#FCFAF6]/60 border border-[#F2E8D9] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#B71C1C] outline-none text-[#3E2723]"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5D4037] mb-1">Custom Distance (e.g., 3,650 miles)</label>
                <input
                  type="text"
                  value={tempConfig.distance}
                  onChange={(e) => setTempConfig({ ...tempConfig, distance: e.target.value })}
                  className="w-full bg-[#FCFAF6]/60 border border-[#F2E8D9] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#B71C1C] outline-none text-[#3E2723]"
                  placeholder="3,650 miles"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#5D4037] mb-1">Lover 1 GMT Timezone</label>
                  <select
                    value={tempConfig.loverOneOffset}
                    onChange={(e) => setTempConfig({ ...tempConfig, loverOneOffset: parseInt(e.target.value) })}
                    className="w-full bg-[#FCFAF6]/60 border border-[#F2E8D9] rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-[#B71C1C] outline-none text-[#3E2723]"
                  >
                    {Array.from({ length: 25 }, (_, i) => i - 12).map(val => (
                      <option key={val} value={val}>GMT {val >= 0 ? `+${val}` : val}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#5D4037] mb-1">Lover 2 GMT Timezone</label>
                  <select
                    value={tempConfig.loverTwoOffset}
                    onChange={(e) => setTempConfig({ ...tempConfig, loverTwoOffset: parseInt(e.target.value) })}
                    className="w-full bg-[#FCFAF6]/60 border border-[#F2E8D9] rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-[#B71C1C] outline-none text-[#3E2723]"
                  >
                    {Array.from({ length: 25 }, (_, i) => i - 12).map(val => (
                      <option key={val} value={val}>GMT {val >= 0 ? `+${val}` : val}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex justify-end gap-3 border-t border-[#F5EFE6]">
              <button
                type="button"
                onClick={() => setIsConfigEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#5D4037] hover:bg-[#F5EFE6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#B71C1C] hover:bg-[#8E1616] text-white font-medium text-xs px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Check size={12} />
                Save Connection details
              </button>
            </div>
          </form>
        )}
      </header>

      {/* Main Single-View Content Container */}
      <main className="w-full max-w-4xl mx-auto px-4 mt-6 md:px-6 md:mt-8 relative z-10" id="main-content-area">
        
        {/* HERO SECTION */}
        <section className="text-center mb-10 sm:mb-14 animate-entrance flex flex-col items-center relative" id="hero-section">
          {/* Subtle logo emblem */}
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 font-serif text-xs uppercase tracking-widest select-none ${
            isNightMode ? "text-[#E69B82] bg-white/5 border border-white/5" : "text-[#B71C1C] bg-red-50/60 border border-red-100"
          }`}>
            <span>❤️</span>
            <span className="font-semibold">Close From Far</span>
          </div>

          <h1 className={`font-serif text-[36px] sm:text-[56px] md:text-[60px] tracking-[-0.4px] leading-none font-extrabold mb-4 max-w-2xl transition-colors duration-1000 ${
            isNightMode ? "text-white" : "text-[#3E2723]"
          }`} id="app-title">
            Some words deserve more than a text.
          </h1>
          <p className={`text-base sm:text-lg max-w-xl mx-auto font-sans tracking-wide leading-relaxed transition-colors duration-1000 ${
            isNightMode ? "text-[#D3C4B4]/85" : "text-[#5D4037]/75"
          }`} id="app-subtitle">
            Because some feelings shouldn't disappear in a chat.
          </p>
        </section>

        {/* LETTER COMPOSER */}
        <section className={`glass p-8 rounded-3xl paper-shadow max-w-2xl mx-auto mb-16 animate-entrance transition-all duration-700 ${
          isNightMode 
            ? "bg-[#251A18]/65 border-white/5 shadow-[0_6px_28px_rgba(0,0,0,0.4)]" 
            : "bg-white/65 border-[#F2ECE4]"
        }`} id="composer-card" style={{ animationDelay: "0.2s" }}>
          <form onSubmit={handleSendLetter}>
            
            {/* INTIMATE PRESENCE INDICATOR */}
            <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in py-1 px-3.5 bg-neutral-100/5 hover:bg-neutral-100/10 rounded-full border border-neutral-200/5 max-w-max mx-auto text-[11px] font-sans tracking-wide">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
              </span>
              <span className={`italic font-serif transition-colors duration-1000 ${
                isNightMode ? "text-[#E69B82]/90" : "text-[#5D4037]/75"
              }`}>
                {presenceText || `Aziza is reading your last letter...`}
              </span>
              <span className="text-rose-500/80 text-[10px] animate-pulse">❤️</span>
            </div>

            {/* Premium physical paper sheet wrap - with paper-texture, soft edges & premium low opacity shadow */}
            <div 
              className={`my-6 rounded-3xl border relative overflow-hidden transition-all duration-500 paper-sheet group/paper paper-texture shadow-inner ${
                sendingState === "idle" 
                  ? "shadow-[inset_0_0_24px_rgba(93,64,55,0.025),_0_12px_32px_-4px_rgba(93,64,55,0.08),_0_4px_16px_-4px_rgba(93,64,55,0.04)] hover:shadow-[inset_0_0_24px_rgba(93,64,55,0.025),_0_18px_48px_-4px_rgba(93,64,55,0.12),_0_8px_24px_-4px_rgba(93,64,55,0.06)]"
                  : "shadow-2xl"
              } ${getPaperColorClasses(selectedPaper).bg}`}
              style={{
                transform: sendingState === "idle" && newContent.length > 0 && isFocused 
                   ? "translate(1px, 1px)" 
                   : "translate(0px, 0px)",
                transition: "transform 0.15s ease-out, background-color 0.5s ease-in-out, border-color 0.5s ease-in-out"
              }}
            >
              {/* Stacked paper sheets effect on bottom/side (subtle 3D layering) */}
              <div className="absolute bottom-[-3px] right-[-3px] left-[3px] top-[3px] translate-y-1.5 translate-x-1.5 rounded-3xl border border-dashed border-current/10 pointer-events-none -z-10 bg-current/2 opacity-25" />
              <div className="absolute bottom-[-6px] right-[-6px] left-[6px] top-[6px] translate-y-3 translate-x-3 rounded-3xl border border-dashed border-current/5 pointer-events-none -z-20 bg-current/1 opacity-10" />

              {/* Deckled border trim outline inside */}
              <div className="absolute inset-4 border border-dashed border-current/8 rounded-2xl pointer-events-none z-10" />

              {/* Realistic stationary pink double-line left margin - slightly wider for realism */}
              <div className="absolute top-0 bottom-0 left-[3.5rem] border-r border-[#FF8A80]/20 pointer-events-none z-10" />
              <div className="absolute top-0 bottom-0 left-[3.625rem] border-r border-[#FF8A80]/15 pointer-events-none z-10" />

              {/* Ambient watermarks */}
              <div className="absolute top-8 left-8 opacity-4 pointer-events-none z-10 text-current">
                <Heart size={24} />
              </div>
              <div className="absolute bottom-8 right-8 opacity-[0.03] pointer-events-none z-10 text-current">
                <Sparkles size={24} className="animate-pulse" />
              </div>

              {/* Solid horizontal ruled paper lines for vintage expensive stationary look */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.06] z-0"
                style={{
                  backgroundImage: "linear-gradient(#5D4037 1px, transparent 1px)",
                  backgroundSize: "100% 2.5rem",
                  backgroundPosition: "0 2.2rem"
                }}
              />

              {sendingState === "idle" ? (
                <div className="flex flex-col relative z-20 w-full animate-fade-in">
                  
                  {/* Handwritten date in top right corner */}
                  <div className="absolute top-8 right-10 font-handwritten text-xl md:text-2xl text-[#3E2723]/75 select-none pointer-events-none rotate-[-1.5deg] tracking-wide">
                    {(() => {
                      const now = new Date();
                      return now.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + now.getFullYear();
                    })()}
                  </div>

                  {/* Elegant static handwritten Recipient Label */}
                  <div className="font-handwritten text-3xl md:text-4xl text-[#3E2723] pt-14 pb-2 pl-[4.8rem] pr-6 select-none pointer-events-none text-left tracking-wide leading-relaxed">
                    To My Dearest, <br />
                    <span className="text-[#B71C1C] font-semibold flex items-center gap-1.5 mt-1">Aziza ❤️</span>
                  </div>

                  {/* Typing area with generous cotton paper padding and writing margin */}
                  <textarea
                    value={newContent}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewContent(val);
                      if (val.trim().length > 0 && !hasTrackedStarted) {
                        trackEvent("letter_started");
                        setHasTrackedStarted(true);
                      } else if (val.trim().length === 0) {
                        setHasTrackedStarted(false);
                      }
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Write what your heart wants to say…"
                    rows={6}
                    maxLength={600}
                    className="w-full bg-transparent border-0 outline-none text-xl sm:text-2xl font-serif leading-loose text-left pl-[4.8rem] pr-10 focus:ring-0 resize-none relative z-10 transition-colors duration-500"
                    style={{
                      color: "#3E2723", // keep ink universally beautiful warm chocolate
                      minHeight: "220px",
                      lineHeight: "2.5rem",
                      paddingTop: "0.2rem"
                    }}
                    id="love-textarea"
                    required
                  />

                  {/* Elegant static handwritten Sender Sign-off */}
                  <div className="font-handwritten text-3xl md:text-4xl text-[#3E2723] pr-10 pb-12 mt-4 text-right select-none pointer-events-none leading-relaxed flex flex-col items-end">
                    <span className="text-[12px] italic font-serif opacity-40 block pr-6 mb-1">With love, forever,</span>
                    <span>Love, Firdavs</span>
                  </div>
                </div>
              ) : (
                <div className="w-full min-h-[160px] flex items-center justify-center py-8 px-6 relative z-10 text-center">
                  {/* FOLDING ANIMATION STAGE */}
                  {sendingState === "folding" && (
                    <div className="animate-fold-paper flex flex-col justify-center items-center w-full h-full max-w-sm">
                      <p className="font-serif italic text-sm text-[#3E2723]/60 truncate w-full px-4 mb-2">"{newContent}"</p>
                      <div className="h-[2px] w-1/3 bg-[#3E2723]/10" />
                    </div>
                  )}

                  {/* ENVELOPE STAGE (with wax seal stamp) */}
                  {sendingState === "envelope" && (
                    <div className="animate-envelope-appear flex flex-col items-center justify-center relative py-4">
                      {/* Envelope visuals with wax seal stamped */}
                      <div className="w-36 h-24 bg-amber-50/90 border-2 border-amber-900/10 rounded-lg relative shadow-md flex items-center justify-center">
                        {/* Flap lines */}
                        <div className="absolute inset-0 border-b border-dashed border-amber-900/10 pointer-events-none" />
                        <svg className="absolute top-0 inset-x-0 w-full h-12 text-amber-900/15" viewBox="0 0 100 50" preserveAspectRatio="none">
                          <polygon points="0,0 50,45 100,0" fill="currentColor" stroke="none" />
                        </svg>
                        
                        {/* Premium Wax Seal depending on selectedSeal */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-seal-stamp z-20">
                          {selectedSeal === "heart" && (
                            <div className="w-10 h-10 bg-rose-800 text-rose-100 border-2 border-rose-900/40 rounded-full flex items-center justify-center shadow-lg transform rotate-6 hover:scale-105 active:scale-95 transition-all duration-300" title="Crimson Heart Wax Seal">
                              <Heart size={12} fill="currentColor" className="opacity-90" />
                            </div>
                          )}
                          {selectedSeal === "sprig" && (
                            <div className="w-10 h-10 bg-[#4E6151] text-[#D4E8D7] border-2 border-[#38483B]/40 rounded-full flex items-center justify-center shadow-lg transform -rotate-3 hover:scale-105 active:scale-95 transition-all duration-300" title="Organic Sage Sprig Wax Seal">
                              <Coffee size={12} className="opacity-90" />
                            </div>
                          )}
                          {selectedSeal === "star" && (
                            <div className="w-10 h-10 bg-[#C68B2C] text-[#FCF3CF] border-2 border-[#93641B]/40 rounded-full flex items-center justify-center shadow-lg transform rotate-12 hover:scale-105 active:scale-95 transition-all duration-300" title="Antique Gold Stardust Wax Seal">
                              <Sparkles size={12} fill="currentColor" className="opacity-90" />
                            </div>
                          )}
                          {/* Drips details */}
                          <div className={`absolute top-[1.95rem] left-[1.1rem] w-1.5 h-1.5 rounded-full opacity-80 transition-all duration-300 ${
                            selectedSeal === "heart" ? "bg-rose-800" :
                            selectedSeal === "sprig" ? "bg-[#4E6151]" :
                            "bg-[#C68B2C]"
                          }`} />
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-wider mt-3 text-[#3E2723]/50">
                        {selectedSeal === "heart" && "Sealed with Crimson Rose Wax"}
                        {selectedSeal === "sprig" && "Sealed with Forest Moss Wax"}
                        {selectedSeal === "star" && "Sealed with Cosmic Stardust Wax"}
                      </span>
                    </div>
                  )}

                  {/* FLYING STAGE & DELIVERED STAGE */}
                  {(sendingState === "flying" || sendingState === "delivered") && (
                    <div className="flex flex-col items-center justify-center py-4 w-full">
                      {sendingState === "flying" ? (
                        <div className="relative w-full h-20 mb-4 overflow-hidden flex items-center justify-center">
                          {/* Floating paper airplane */}
                          <div className="animate-plane-fly absolute">
                            <svg className="w-10 h-10 text-rose-500/80 drop-shadow-md fill-current" viewBox="0 0 24 24">
                              <path d="M21 3L3 10.5L9.75 13.5L18.75 6L11.25 15L14.25 21.75L21 3Z" />
                            </svg>
                            {/* Sparks trail */}
                            <div className="absolute -left-2 top-4 w-1 h-1 rounded-full bg-rose-300 animate-ping opacity-75" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3 animate-bounce shadow-sm">
                          <Heart fill="currentColor" size={22} className="animate-pulse" />
                        </div>
                      )}

                      <h4 className="font-serif text-lg text-[#3E2723] animate-text-pulse-soft flex flex-col items-center gap-1 text-center">
                        {sendingState === "flying" ? (
                          <>
                            <span className="text-sm font-sans tracking-wide text-[#3E2723]/60 italic">Your words are on their way ❤️</span>
                            <span className="font-serif italic text--[#3E2723]/85 text-base mt-1">
                              Traveling past space and time to <span className="font-semibold text-rose-600 font-sans text-base">{recipient}</span>...
                            </span>
                          </>
                        ) : (
                          <span className="text-rose-600 font-semibold text-xl font-serif">Your letter found its way home. ❤️</span>
                        )}
                      </h4>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ceremonial letter specs */}
            <div className={`mt-5 p-4 rounded-2xl border transition-all duration-700 flex flex-col gap-4 ${
              isNightMode 
                ? "bg-[#2A1B1A]/80 border-[#5D4037]/35" 
                : "bg-[#FAFAF9]/90 border-[#ECD9D6]/60 shadow-[inset_0_1px_3px_rgba(93,64,55,0.02)]"
            }`}>
              
              {/* Top Row: Paper Tint and Wax Seal Stamp Selection */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                
                {/* Paper Tint */}
                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] uppercase tracking-widest font-semibold transition-colors duration-700 ${
                    isNightMode ? "text-[#E69B82]" : "text-[#5D4037]/75"
                  }`}>Paper Tint:</span>
                  <div className="flex items-center gap-2" id="paper-selectors">
                    <button
                      type="button"
                      onClick={() => setSelectedPaper("cream")}
                      className={`w-5 h-5 rounded-full bg-[#FFFDFB] border transition-all duration-200 ${selectedPaper === "cream" ? "border-[#B71C1C] scale-110 ring-2 ring-rose-200" : "border-[#E8D9C2]/80 hover:scale-105"} cursor-pointer`}
                      title="Warm Pearl"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedPaper("blush")}
                      className={`w-5 h-5 rounded-full bg-[#FFF6F5] border transition-all duration-200 ${selectedPaper === "blush" ? "border-[#B71C1C] scale-110 ring-2 ring-rose-200" : "border-[#F4DDD9] hover:scale-105"} cursor-pointer`}
                      title="Blush Rose"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedPaper("lavender")}
                      className={`w-5 h-5 rounded-full bg-[#FAF7FD] border transition-all duration-200 ${selectedPaper === "lavender" ? "border-[#B71C1C] scale-110 ring-2 ring-rose-200" : "border-[#EADFF4] hover:scale-105"} cursor-pointer`}
                      title="Dreamy Lavender"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedPaper("sage")}
                      className={`w-5 h-5 rounded-full bg-[#FAFAF6] border transition-all duration-200 ${selectedPaper === "sage" ? "border-[#B71C1C] scale-110 ring-2 ring-rose-200" : "border-[#E2EADF] hover:scale-105"} cursor-pointer`}
                      title="Sage Breath"
                    />
                  </div>
                </div>

                {/* Wax Seal Stamp Picker */}
                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] uppercase tracking-widest font-semibold transition-colors duration-700 ${
                    isNightMode ? "text-[#E69B82]" : "text-[#5D4037]/75"
                  }`}>Wax Seal Stamp:</span>
                  <div className="flex items-center gap-2" id="seal-selectors">
                    <button
                      type="button"
                      onClick={() => setSelectedSeal("heart")}
                      className={`flex items-center justify-center w-[26px] h-[26px] rounded-full text-rose-100 hover:scale-105 transition-all ${
                        selectedSeal === "heart" 
                          ? "bg-rose-800 border-2 border-rose-900/70 scale-110 shadow-sm" 
                          : "bg-rose-800/40 border border-rose-900/10 opacity-70 hover:opacity-100"
                      }`}
                      title="Crimson Heart"
                    >
                      <Heart size={10} fill="currentColor" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSeal("sprig")}
                      className={`flex items-center justify-center w-[26px] h-[26px] rounded-full text-[#D4E8D7] hover:scale-105 transition-all ${
                        selectedSeal === "sprig" 
                          ? "bg-[#4E6151] border-2 border-[#38483B] scale-110 shadow-sm" 
                          : "bg-[#4E6151]/40 border border-[#38483B]/10 opacity-70 hover:opacity-100"
                      }`}
                      title="Organic Sage Sprig"
                    >
                      <Coffee size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSeal("star")}
                      className={`flex items-center justify-center w-[26px] h-[26px] rounded-full text-[#FCF3CF] hover:scale-105 transition-all ${
                        selectedSeal === "star" 
                          ? "bg-[#C68B2C] border-2 border-[#93641B] scale-110 shadow-sm" 
                          : "bg-[#C68B2C]/40 border border-[#93641B]/10 opacity-70 hover:opacity-100"
                      }`}
                      title="Antique Gold Stardust"
                    >
                      <Sparkles size={10} fill="currentColor" />
                    </button>
                  </div>
                </div>

                {/* Character Count */}
                <span className={`text-[11px] font-mono transition-colors duration-700 ${
                  isNightMode ? "text-[#D3C4B4]/50" : "text-[#5D4037]/50"
                }`}>
                  {newContent.length} / 600 characters
                </span>
              </div>

              {/* Divider line */}
              <div className={`h-[1px] ${isNightMode ? "bg-[#5D4037]/25" : "bg-[#ECD9D6]/40"}`} />

              {/* Bottom Row: Emotional Intention Switcher (three elegant luxury items) */}
              <div className="flex flex-col gap-2">
                <span className={`text-[10px] uppercase tracking-widest font-semibold text-center block ${
                  isNightMode ? "text-[#E69B82]/85" : "text-[#5D4037]/70"
                }`}>Choose your Send Dedication Mood</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(1)}
                    className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all duration-300 ${
                      selectedVariant === 1
                        ? isNightMode
                          ? "bg-[#3B1E1C] border-[#8D5E54] text-[#FFA726] shadow-sm transform -translate-y-0.5"
                          : "bg-[#FBE4E1] border-[#ECD9D6] text-[#3E2723] shadow-xs transform -translate-y-0.5"
                        : isNightMode
                          ? "bg-[#1C1210]/40 border-transparent text-[#EAD6C0]/50 hover:text-white"
                          : "bg-[#FAF7F6]/60 border-transparent text-[#5D4037]/60 hover:text-[#3E2723]"
                    }`}
                  >
                    <div className="font-serif font-semibold text-xs flex items-center gap-1">
                      <span className="opacity-40">I.</span> Seal & Send
                    </div>
                    <div className="text-[10px] italic font-serif leading-tight opacity-75 mt-0.5">
                      "Your words deserve an envelope."
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedVariant(2)}
                    className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all duration-300 ${
                      selectedVariant === 2
                        ? isNightMode
                          ? "bg-[#3B1E1C] border-[#8D5E54] text-[#FFA726] shadow-sm transform -translate-y-0.5"
                          : "bg-[#FBE4E1] border-[#ECD9D6] text-[#3E2723] shadow-xs transform -translate-y-0.5"
                        : isNightMode
                          ? "bg-[#1C1210]/40 border-transparent text-[#EAD6C0]/50 hover:text-white"
                          : "bg-[#FAF7F6]/60 border-transparent text-[#5D4037]/60 hover:text-[#3E2723]"
                    }`}
                  >
                    <div className="font-serif font-semibold text-xs flex items-center gap-1">
                      <span className="opacity-40">II.</span> Let This Letter Travel
                    </div>
                    <div className="text-[10px] italic font-serif leading-tight opacity-75 mt-0.5">
                      "Across distance, toward someone you love."
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedVariant(3)}
                    className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all duration-300 ${
                      selectedVariant === 3
                        ? isNightMode
                          ? "bg-[#3B1E1C] border-[#8D5E54] text-[#FFA726] shadow-sm transform -translate-y-0.5"
                          : "bg-[#FBE4E1] border-[#ECD9D6] text-[#3E2723] shadow-xs transform -translate-y-0.5"
                        : isNightMode
                          ? "bg-[#1C1210]/40 border-transparent text-[#EAD6C0]/50 hover:text-white"
                          : "bg-[#FAF7F6]/60 border-transparent text-[#5D4037]/60 hover:text-[#3E2723]"
                    }`}
                  >
                    <div className="font-serif font-semibold text-xs flex items-center gap-1">
                      <span className="opacity-40">III.</span> Send with Love ❤️
                    </div>
                    <div className="text-[10px] italic font-serif leading-tight opacity-75 mt-0.5">
                      "A small moment that will be remembered."
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* COMPOSER SUBMIT ACTION (Luxury invitation card stationery styling) */}
            <div className="mt-7 text-center flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={sendingState !== "idle" || !newContent.trim()}
                className={`group/btn relative cursor-pointer font-serif tracking-widest text-[13px] md:text-sm font-semibold uppercase flex flex-col items-center justify-center transition-all duration-300 outline-none select-none rounded-full px-12 py-5 border ${
                  sendingState === "idle"
                    ? isNightMode 
                      ? "bg-[#3B1E1C] text-[#F3D7D2] border-[#5A312D] hover:border-[#E8BDB5] hover:bg-[#4C2825] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(74,37,34,0.6),_0_0_15px_rgba(243,215,210,0.15)] active:translate-y-0"
                      : "bg-[#F3D7D2] text-[#4A2522] border-[#E8BDB5] hover:border-[#DF9F95] hover:bg-[#ECD0C9] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(232,189,181,0.5),_0_0_15px_rgba(74,37,34,0.06)] active:translate-y-0"
                    : isNightMode
                      ? "bg-[#2A1B1A]/40 text-[#EAD6C0]/40 border-transparent cursor-not-allowed"
                      : "bg-[#FAFAF9]/60 text-[#5D4037]/40 border-transparent cursor-not-allowed"
                }`}
                style={{
                  cursor: sendingState === "idle" && newContent.trim()
                    ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' style=\'font-size:24px;\'><text y=\'24\' x=\'2\'>✒️</text></svg>"), pointer'
                    : "not-allowed"
                }}
                id="send-letter-btn"
              >
                {/* Visual feedback glow ring */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none ring-4 ring-rose-500/10" />

                <div className="flex items-center gap-2.5 relative z-10">
                  <Feather size={14} className="opacity-80 animate-pulse" />
                  <span>
                    {(() => {
                      if (sendingState === "folding" || sendingState === "envelope" || sendingState === "flying") {
                        return "Traveling...";
                      }
                      if (sendingState === "delivered") {
                        return "Delivered ❤️";
                      }
                      // Idle state
                      if (selectedVariant === 1) return "Seal & Send";
                      if (selectedVariant === 2) return "Let This Letter Travel";
                      return "Send with Love ❤️";
                    })()}
                  </span>
                </div>

                {sendingState === "idle" && (
                  <span className={`text-[9px] mt-1 font-serif italic tracking-normal lowercase opacity-80 transition-colors duration-300 select-none ${
                    isNightMode ? "text-[#E69B82]" : "text-[#8C5D58]"
                  }`}>
                    {selectedVariant === 1 ? "Your words deserve an envelope." :
                     selectedVariant === 2 ? "Across distance, toward someone you love." :
                     "A small moment that will be remembered."}
                  </span>
                )}
              </button>

              {/* Required microcopy */}
              <span className={`text-[10px] font-sans uppercase tracking-[0.22em] transition-all duration-700 ${
                isNightMode ? "opacity-35 text-[#D3C4B4]" : "opacity-40 text-[#5D4037]"
              }`}>
                Distance is only space. Love is the signal.
              </span>
            </div>
          </form>
        </section>

        {/* FLOATING LETTER SPACE CONTAINER */}
        <section className="mt-12 animate-entrance" style={{ animationDelay: "0.4s" }} id="floating-space-section">
          <div className={`flex items-center justify-between border-b pb-3 mb-8 transition-colors duration-700 ${
            isNightMode ? "border-[#5D4037]/35" : "border-[#F2ECE4]"
          }`}>
            <h2 className={`font-serif text-xl tracking-tight flex items-center gap-2 transition-colors duration-700 ${
              isNightMode ? "text-[#F5EFE6]" : "text-[#3E2723]"
            }`}>
              <Sparkles size={16} className={isNightMode ? "text-[#FFA726]" : "text-[#B71C1C]"} />
              Our Floating Letter Universe
            </h2>
            <span className={`text-xs font-serif italic transition-colors duration-700 ${
              isNightMode ? "text-[#D3C4B4]/70" : "text-[#5D4037]/70"
            }`}>
              {letters.length} correspondence{letters.length !== 1 ? "s" : ""} drifted here
            </span>
          </div>

          {letters.length === 0 ? (
            <div className={`text-center py-20 px-6 glass rounded-3xl max-w-lg mx-auto transition-all duration-700 ${
              isNightMode 
                ? "bg-[#251A18]/50 border border-dashed border-[#5D4037]/35" 
                : "bg-white/65 border border-dashed border-[#ECD9D6]"
            }`} id="empty-state">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce transition-colors duration-700 ${
                isNightMode ? "bg-[#FFA726]/15 border border-[#FFA726]/35 text-[#FFA726]" : "bg-[#FBE4E1] border border-[#ECD9D6] text-[#B71C1C]"
              }`}>
                <Heart size={20} className="opacity-70" />
              </div>
              <h3 className={`font-serif text-lg mb-2 transition-colors duration-700 ${
                isNightMode ? "text-[#F5EFE6]" : "text-[#3E2723]"
              }`}>Our letter universe is currently empty</h3>
              <p className={`text-xs leading-relaxed max-w-xs mx-auto transition-colors duration-700 ${
                isNightMode ? "text-[#D3C4B4]/70" : "text-[#5D4037]/80"
              }`}>
                Write a warm love letter above to send your signal across the distance. It will float here inside your beautiful private sanctuary.
              </p>
            </div>
          ) : (
            /* Layout: staggered visual bento/grid for a hand-crafted look, not repetitive rigid columns */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start align-top" id="letters-masonry">
              {letters.map((letter) => {
                const styles = getPaperColorClasses(letter.paperStyle);
                const isShort = letter.content.length < 120;
                
                return (
                  <div
                    key={letter.id}
                    onClick={() => setActiveLetter(letter)}
                    className={`animate-letter ${letter.floatStyle} ${styles.bg} border rounded-2xl p-6 paper-shadow transition-all duration-300 cursor-pointer group relative flex flex-col justify-between ${
                      isNightMode 
                        ? "shadow-[0_4px_22px_rgba(255,255,255,0.01)] hover:shadow-[0_10px_30px_rgba(183,28,28,0.12)] hover:scale-[1.012]" 
                        : "hover:shadow-xl hover:scale-[1.012]"
                    }`}
                    style={{ 
                       "--rot": `${letter.rotation}deg`,
                      transform: `rotate(${letter.rotation}deg)`,
                    } as React.CSSProperties}
                  >
                    {/* Retro Love Stamp/Seals Decoration */}
                    <div className={`absolute top-4 right-4 flex items-center gap-1 backdrop-blur-xs px-2 py-0.5 rounded-md border text-[10px] font-mono scale-90 shadow-2xs transition-colors duration-700 ${
                      isNightMode 
                        ? "bg-[#331E1B]/80 border-[#5D4037]/40 text-[#FFA726]" 
                        : "bg-white/50 border-[#F2ECE4] text-[#3E2723]"
                    }`}>
                      <Clock size={10} className={isNightMode ? "text-[#FFA726]" : "text-[#B71C1C]"} />
                      <span>{letter.date}</span>
                    </div>

                    {/* Tiny delicate heart watermark stamp inside the card */}
                    <div className={`absolute bottom-4 right-4 opacity-[0.03] group-hover:opacity-[0.09] transition-opacity duration-300 pointer-events-none ${
                      isNightMode ? "text-[#FFA726]" : "text-[#B71C1C]"
                    }`}>
                      <Heart fill="currentColor" size={48} />
                    </div>

                    {/* Letter contents */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold py-0.5 px-2 rounded-full ${styles.badge}`}>
                          From {letter.signedBy}
                        </span>
                        <span className="text-[#C4B7A7] text-xs">→</span>
                        <span className={`text-[10px] uppercase font-mono ${isNightMode ? "text-[#EAD6C0]/75" : "text-[#5D4037]/70"}`}>
                          To {letter.to}
                        </span>
                      </div>

                      <p className={`font-serif text-[#3E2723] leading-relaxed italic ${isShort ? "text-lg pt-1" : "text-sm"}`}>
                        “{letter.content}”
                      </p>
                    </div>

                    {/* Interactive Bottom details: Heartbeat reactions counter & delete dissolution */}
                    <div className="mt-6 pt-3 border-t border-[#F2ECE4]/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleReactToLetter(letter.id, e)}
                          className={`flex items-center gap-1 text-xs transition-colors duration-150 py-1 px-2.5 rounded-full border active:scale-95 group/btn ${
                            isNightMode 
                              ? "text-[#3E2723] bg-[#FAF8F5]/90 hover:bg-[#FBE4E1] border-[#ECD9D6]/30" 
                              : "text-[#5D4037] hover:text-[#B71C1C] bg-white/60 hover:bg-[#FBE4E1] border-[#F2ECE4]"
                          }`}
                          title="Send a heart beat reaction"
                        >
                          <Heart 
                            size={12} 
                            fill={letter.reactions > 0 ? "#B71C1C" : "none"} 
                            className={`transition-all duration-150 text-[#B71C1C] ${letter.reactions > 0 ? "scale-110" : ""}`} 
                          />
                          <span className="font-mono text-[11px] font-medium text-[#3E2723]">
                            {letter.reactions}
                          </span>
                        </button>

                        {confirmDeleteId === letter.id ? (
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] animate-fade-in ${
                            isNightMode 
                              ? "bg-[#331E1B] border-[#5D4037]/45 text-[#EAD6C0] shadow-sm" 
                              : "bg-[#FBE4E1] border-[#ECD9D6] text-[#5D4037]"
                          }`} onClick={(e) => e.stopPropagation()}>
                            <span className={isNightMode ? "text-[#D3C4B4] font-medium" : "text-[#5D4037] font-medium"}>Dissolve?</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLetters(prev => prev.filter(l => l.id !== letter.id));
                                setConfirmDeleteId(null);
                                if (activeLetter?.id === letter.id) {
                                  setActiveLetter(null);
                                }
                              }}
                              className={`font-semibold hover:underline ${isNightMode ? "text-pink-300" : "text-[#B71C1C]"}`}
                            >
                              Yes
                            </button>
                            <span className="opacity-40">•</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(null);
                              }}
                              className={`hover:underline ${isNightMode ? "text-purple-300" : "text-[#5D4037]"}`}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleDeleteLetter(letter.id, e)}
                            className="text-[#C4B7A7] hover:text-[#B71C1C] hover:bg-[#FBE4E1] p-1 rounded-full transition-all duration-300"
                            title="Dissolve this letter softly"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1 font-serif text-[11px] italic text-[#5D4037]/70 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Read dispatch</span>
                        <Maximize2 size={9} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

       {/* DETAILED CINEMATIC POPUP OVERLAY */}
      {activeLetter && (
        <div 
          className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in transition-colors duration-700 ${
            isNightMode ? "bg-[#1E1412]/90" : "bg-[#3E2723]/45"
          }`}
          onClick={() => setActiveLetter(null)}
          id="cinematic-overlay"
        >
          <div 
            onClick={(e) => e.stopPropagation()} // Stop propagation from parent click dismiss
            className={`w-full max-w-lg rounded-3xl p-8 md:p-10 paper-shadow relative overflow-hidden text-center transition-all duration-300 bg-linear-to-b ${getPaperColorClasses(activeLetter.paperStyle).bg} border border-[#ECD9D6] animate-entrance`}
            id="zoomed-paper-card"
          >
            {/* Stamp badge decoration inside zoomed frame */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#B71C1C] animate-ping"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5D4037]/60">Distance Love Dispatch</span>
            </div>

            {/* Close trigger overlay button */}
            <button
              onClick={() => setActiveLetter(null)}
              className="absolute top-6 right-6 text-[#5D4037] hover:text-[#B71C1C] bg-[#3E2723]/5 hover:bg-[#3E2723]/10 rounded-full p-2 transition-all cursor-pointer"
              title="Close and return to private room"
              id="close-overlay"
            >
              <X size={16} />
            </button>

            {/* Inner envelope / postmark layout stamp */}
            <div className="my-8 flex justify-center items-center pointer-events-none">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#B71C1C]/30 flex flex-col items-center justify-center text-[#B71C1C]/60 p-1 select-none">
                <Heart fill="currentColor" size={16} className="text-[#B71C1C]" />
                <span className="text-[8px] font-mono mt-1 font-semibold uppercase">{partnerConfig.distance}</span>
              </div>
            </div>

            {/* Letter zoom contents */}
            <div className="my-6">
              <div className="flex items-center justify-center gap-4 text-xs font-serif italic text-[#5D4037] mb-4">
                <span>From: <strong className="text-[#3E2723] not-italic">{activeLetter.signedBy}</strong></span>
                <span className="text-[#E2D6C7]">✿</span>
                <span>To: <strong className="text-[#3E2723] not-italic">{activeLetter.to}</strong></span>
              </div>

              {/* Cinematic display typography */}
              <p className="font-serif text-[#3E2723] text-base md:text-lg leading-loose italic whitespace-pre-line px-2 md:px-4">
                “{activeLetter.content}”
              </p>
            </div>

            {/* Footer stamp context */}
            <div className="mt-8 pt-4 border-t border-[#F2ECE4] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5D4037] gap-3">
              <span className="font-mono text-[11px]">
                {activeLetter.date}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleReactToLetter(activeLetter.id, e)}
                  className="flex items-center gap-1.5 text-xs text-[#5D4037] hover:text-[#B71C1C] transition-colors bg-white/60 hover:bg-[#FBE4E1] py-1 px-3 rounded-full border border-[#F2ECE4] active:scale-95"
                >
                  <Heart 
                    size={12} 
                    fill={activeLetter.reactions > 0 ? "#B71C1C" : "none"} 
                    className="text-[#B71C1C]" 
                  />
                  <span className="font-mono text-[11px]">Pulse Love ({activeLetter.reactions})</span>
                </button>

                <button
                  onClick={() => {
                    const letterUrl = `${window.location.origin}${window.location.pathname}?letter=${activeLetter.id}`;
                    navigator.clipboard.writeText(letterUrl);
                    trackEvent("share_clicked", { type: "letter", letter_id: activeLetter.id });
                    setCopiedLetterId(activeLetter.id);
                    setTimeout(() => setCopiedLetterId(null), 2500);
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#5D4037] hover:text-[#B71C1C] transition-colors bg-white/60 hover:bg-[#FBE4E1] py-1 px-3 rounded-full border border-[#F2ECE4] active:scale-95"
                  title="Copy direct link to this letter"
                >
                  <Share2 size={12} />
                  <span className="font-mono text-[11px]">
                    {copiedLetterId === activeLetter.id ? "Copied!" : "Share Letter"}
                  </span>
                </button>

                {confirmDeleteId === activeLetter.id ? (
                  <div className="flex items-center gap-2 bg-[#FBE4E1] px-3 py-1 rounded-full border border-[#ECD9D6] text-xs animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[#5D4037] font-medium">Dissolve this letter?</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLetters(prev => prev.filter(l => l.id !== activeLetter.id));
                        setConfirmDeleteId(null);
                        setActiveLetter(null);
                      }}
                      className="text-[#B71C1C] hover:underline font-semibold"
                    >
                      Yes, delete
                    </button>
                    <span className="text-[#C4B7A7]">•</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(null);
                      }}
                      className="text-[#5D4037] hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleDeleteLetter(activeLetter.id, e)}
                    className="flex items-center gap-1 text-[#C4B7A7] hover:text-[#B71C1C] transition-colors py-1 px-2.5 rounded-full hover:bg-red-50"
                    title="softly remove letter"
                  >
                    <Trash2 size={12} />
                    <span className="text-[11px] font-mono">Dissolve</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer sign off */}
      <footer className={`w-full text-center mt-20 relative z-10 text-xs transition-colors duration-1000 ${
        isNightMode ? "text-[#D3C4B4]/40" : "text-[#5D4037]/60"
      }`} id="cozy-footer">
        <p className="font-serif italic font-light">With love, forever connected across any boundaries.</p>
        <p className="font-mono text-[10px] uppercase tracking-widest mt-2 font-medium">© Close From Far • Created with Heart</p>
      </footer>
    </div>
  );
}
