import { useState, useEffect } from "react";
import { Home, CalendarDays, Gift, Users, User, Bell, MapPin, Clock, ChevronLeft, Check, Sparkles, Flame, ArrowRight, Star } from "lucide-react";

const COLORS = {
  orange: "#E8734A",
  peach: "#F4A261",
  cream: "#FFF8F0",
  warmWhite: "#FFFDF9",
  brown: "#8B4513",
  darkBrown: "#5C2E0E",
  terracotta: "#C65D3E",
  lightPeach: "#FDDCB5",
  blush: "#F9E4D4",
  glass: "rgba(255, 248, 240, 0.55)",
  glassBorder: "rgba(255, 255, 255, 0.4)",
  glassShadow: "0 8px 32px rgba(232, 115, 74, 0.12)",
};

// ─── MOTION STYLES (injected once) ───────────────────
const MotionStyles = () => (
  <style>{`
    @keyframes navBounce {
      0% { transform: translateY(0) scale(1); }
      40% { transform: translateY(-4px) scale(1.08); }
      70% { transform: translateY(1px) scale(1.02); }
      100% { transform: translateY(0) scale(1.05); }
    }
    @keyframes navDot {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes gentlePulse {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .nav-item { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .nav-item.active { animation: navBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .nav-dot { animation: navDot 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .fade-in { animation: fadeSlideUp 0.5s ease forwards; }
    .fade-in-delay-1 { animation: fadeSlideUp 0.5s ease 0.1s forwards; opacity: 0; }
    .fade-in-delay-2 { animation: fadeSlideUp 0.5s ease 0.2s forwards; opacity: 0; }
    .fade-in-delay-3 { animation: fadeSlideUp 0.5s ease 0.3s forwards; opacity: 0; }
    .card-hover { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .card-hover:active { transform: scale(0.97); }
  `}</style>
);

const GlassCard = ({ children, style = {}, onClick, className = "" }) => (
  <div
    onClick={onClick}
    className={`card-hover ${className}`}
    style={{
      background: COLORS.glass,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderRadius: 24,
      border: `1px solid ${COLORS.glassBorder}`,
      boxShadow: COLORS.glassShadow,
      padding: 20,
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}
  >
    {children}
  </div>
);

const PillTag = ({ label, color = COLORS.orange, filled = false }) => (
  <span
    style={{
      display: "inline-block",
      padding: "6px 16px",
      borderRadius: 50,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.3,
      background: filled ? color : `${color}18`,
      color: filled ? "#fff" : color,
      border: `1.5px solid ${color}40`,
    }}
  >
    {label}
  </span>
);

const Avatar = ({ name, size = 40, index = 0 }) => {
  const colors = ["#F4A261", "#E8734A", "#C65D3E", "#D4956B", "#E8A87C"];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${colors[index % 5]}, ${colors[(index + 2) % 5]})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size * 0.4,
        fontWeight: 700,
        border: "2.5px solid #fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        flexShrink: 0,
      }}
    >
      {name.charAt(0)}
    </div>
  );
};

const AvatarStack = ({ names, size = 36 }) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    {names.slice(0, 4).map((n, i) => (
      <div key={i} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }}>
        <Avatar name={n} size={size} index={i} />
      </div>
    ))}
    {names.length > 4 && (
      <div
        style={{
          marginLeft: -10,
          width: size,
          height: size,
          borderRadius: "50%",
          background: COLORS.lightPeach,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.orange,
          border: "2.5px solid #fff",
          zIndex: 5,
        }}
      >
        +{names.length - 4}
      </div>
    )}
  </div>
);

// ─── ONBOARDING (Timeleft style) ─────────────────────
const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);

  const cities = ["Lyon", "Marseille", "Toulouse", "Montpellier", "Rennes"];
  const ages = ["18-25", "25-35", "35-45", "45-55", "55-65", "65+"];
  const interests = [
    "Apéros", "Sport", "Culture", "Ateliers créatifs",
    "Talks", "Sorties", "Bien-être", "Gastronomie",
  ];

  const ProgressDots = () => (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 28 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: i === step ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i <= step
              ? `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.peach})`
              : COLORS.lightPeach,
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      ))}
    </div>
  );

  const steps = [
    // Welcome
    () => (
      <div style={{ textAlign: "center", padding: "40px 20px" }} className="fade-in">
        <div style={{ marginBottom: 24 }}>
          <div style={{
            width: 120, height: 120, borderRadius: "50%", margin: "0 auto",
            background: `linear-gradient(135deg, ${COLORS.peach}40, ${COLORS.orange}30)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 12px 40px ${COLORS.peach}30`,
          }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.peach}70, ${COLORS.orange}50)`,
              display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
            }}>
              <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13, color: COLORS.darkBrown }}>Les</span>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontStyle: "italic", fontSize: 15, color: COLORS.orange }}>Apéro Filles</span>
            </div>
          </div>
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: COLORS.darkBrown, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>
          Bienvenue dans ta<br />
          <span style={{ color: COLORS.orange, fontStyle: "italic" }}>bande de copines</span>
        </h1>
        <p style={{ color: "#8B7355", fontSize: 15, lineHeight: 1.6, maxWidth: 280, margin: "0 auto 32px" }}>
          + de 3 900 femmes se sont lancées.<br />
          Des apéros, des activités et surtout des rencontres qui changent tout.
        </p>
        <ProgressDots />
      </div>
    ),

    // City
    () => (
      <div style={{ padding: "30px 20px" }} className="fade-in">
        <p style={{ color: COLORS.orange, fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Etape 1/3</p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: COLORS.darkBrown, marginBottom: 8, fontWeight: 700 }}>
          Tu es dans quelle ville ?
        </h2>
        <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 28 }}>On est présentes dans 5 villes en France</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cities.map((city, idx) => (
            <GlassCard key={city} onClick={() => setSelectedCity(city)}
              className={`fade-in-delay-${Math.min(idx, 3)}`}
              style={{
                padding: "16px 20px", borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: selectedCity === city ? `linear-gradient(135deg, ${COLORS.orange}15, ${COLORS.peach}20)` : COLORS.glass,
                border: selectedCity === city ? `2px solid ${COLORS.orange}60` : `1px solid ${COLORS.glassBorder}`,
              }}>
              <span style={{ fontSize: 16, fontWeight: selectedCity === city ? 700 : 500, color: selectedCity === city ? COLORS.orange : COLORS.darkBrown }}>
                {city}
              </span>
              {selectedCity === city && (
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", background: COLORS.orange,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={14} color="#fff" strokeWidth={3} />
                </div>
              )}
            </GlassCard>
          ))}
        </div>
        <ProgressDots />
      </div>
    ),

    // Age
    () => (
      <div style={{ padding: "30px 20px" }} className="fade-in">
        <p style={{ color: COLORS.orange, fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Etape 2/3</p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: COLORS.darkBrown, marginBottom: 8, fontWeight: 700 }}>
          Tu as quel âge ?
        </h2>
        <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 28 }}>Pour te proposer des événements adaptés</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {ages.map((age) => (
            <GlassCard key={age} onClick={() => setSelectedAge(age)}
              style={{
                padding: "18px 16px", borderRadius: 16, textAlign: "center",
                background: selectedAge === age ? `linear-gradient(135deg, ${COLORS.orange}15, ${COLORS.peach}20)` : COLORS.glass,
                border: selectedAge === age ? `2px solid ${COLORS.orange}60` : `1px solid ${COLORS.glassBorder}`,
              }}>
              <span style={{ fontSize: 16, fontWeight: selectedAge === age ? 700 : 500, color: selectedAge === age ? COLORS.orange : COLORS.darkBrown }}>
                {age} ans
              </span>
            </GlassCard>
          ))}
        </div>
        <ProgressDots />
      </div>
    ),

    // Interests
    () => (
      <div style={{ padding: "30px 20px" }} className="fade-in">
        <p style={{ color: COLORS.orange, fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Etape 3/3</p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: COLORS.darkBrown, marginBottom: 8, fontWeight: 700 }}>
          Qu'est-ce qui te fait vibrer ?
        </h2>
        <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 28 }}>Choisis ce qui te parle (plusieurs choix possibles)</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {interests.map((interest) => {
            const selected = selectedInterests.includes(interest);
            return (
              <div key={interest}
                onClick={() => setSelectedInterests(selected ? selectedInterests.filter((i) => i !== interest) : [...selectedInterests, interest])}
                className="card-hover"
                style={{
                  padding: "10px 20px", borderRadius: 50, fontSize: 14,
                  fontWeight: selected ? 700 : 500, cursor: "pointer",
                  background: selected ? `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.peach})` : COLORS.glass,
                  color: selected ? "#fff" : COLORS.darkBrown,
                  border: selected ? "1.5px solid transparent" : `1.5px solid ${COLORS.glassBorder}`,
                  backdropFilter: "blur(8px)",
                  boxShadow: selected ? `0 4px 16px ${COLORS.orange}30` : "none",
                }}>
                {interest}
              </div>
            );
          })}
        </div>
        <ProgressDots />
      </div>
    ),
  ];

  const canProceed = step === 0 || (step === 1 && selectedCity) || (step === 2 && selectedAge) || (step === 3 && selectedInterests.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>{steps[step]()}</div>
      <div style={{ padding: "16px 20px 24px" }}>
        <button
          onClick={() => { if (step < 3) setStep(step + 1); else onComplete(); }}
          disabled={!canProceed}
          className="card-hover"
          style={{
            width: "100%", padding: "16px 0", borderRadius: 50, border: "none",
            background: canProceed ? `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.terracotta})` : COLORS.lightPeach,
            color: canProceed ? "#fff" : "#ccc", fontSize: 16, fontWeight: 700,
            cursor: canProceed ? "pointer" : "not-allowed",
            boxShadow: canProceed ? `0 6px 24px ${COLORS.orange}40` : "none",
            transition: "all 0.3s ease", letterSpacing: 0.5,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
          {step === 0 ? "C'est parti" : step === 3 ? "Découvrir mon univers" : "Continuer"}
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

// ─── HOME SCREEN ─────────────────────────────────────
const HomeScreen = ({ onEventClick }) => {
  const events = [
    { id: 1, title: "Apéro Galentines", category: "Apéro", date: "Jeu. 24 Avril", time: "19h30", location: "Le Comptoir, Lyon 2e", spots: 4, total: 20, price: "12€", attendees: ["Marie", "Sophie", "Léa", "Camille", "Emma", "Julie", "Lisa"], gradient: `linear-gradient(135deg, ${COLORS.peach}40, ${COLORS.orange}20)` },
    { id: 2, title: "Morning Run", category: "Sport", date: "Sam. 26 Avril", time: "9h00", location: "Parc de la Tête d'Or", spots: 12, total: 15, price: "Gratuit", attendees: ["Agathe", "Clara", "Manon", "Inès"], gradient: `linear-gradient(135deg, #E8A87C30, #F4A26120)` },
    { id: 3, title: "Atelier Céramique", category: "Atelier créatif", date: "Dim. 27 Avril", time: "14h00", location: "L'Atelier des Sens, Lyon 7e", spots: 2, total: 12, price: "35€", attendees: ["Pauline", "Charlotte", "Amandine", "Lucie", "Sarah", "Zoé", "Anaïs", "Marine", "Eva", "Juliette"], gradient: `linear-gradient(135deg, ${COLORS.terracotta}20, ${COLORS.peach}30)` },
  ];

  return (
    <div style={{ padding: "0 16px", paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 4px 16px" }} className="fade-in">
        <div>
          <p style={{ color: "#8B7355", fontSize: 13, marginBottom: 4 }}>Bonjour</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: COLORS.darkBrown, fontWeight: 700 }}>
            Marie
          </h1>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: COLORS.glass, backdropFilter: "blur(8px)",
            border: `1px solid ${COLORS.glassBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", cursor: "pointer",
          }}>
            <Bell size={20} color={COLORS.darkBrown} strokeWidth={1.8} />
            <div style={{
              position: "absolute", top: -2, right: -2, width: 18, height: 18,
              borderRadius: "50%", background: COLORS.orange, color: "#fff",
              fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center",
              justifyContent: "center", border: "2px solid #fff",
            }}>3</div>
          </div>
          <Avatar name="M" size={42} index={0} />
        </div>
      </div>

      {/* Daily Boost */}
      <GlassCard className="fade-in-delay-1" style={{
        marginBottom: 20,
        background: `linear-gradient(135deg, ${COLORS.orange}10, ${COLORS.peach}15, ${COLORS.cream})`,
        padding: "18px 20px", borderRadius: 20,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${COLORS.orange}20, ${COLORS.peach}30)`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Sparkles size={20} color={COLORS.orange} strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: COLORS.darkBrown, fontSize: 15, lineHeight: 1.5, marginBottom: 6 }}>
              "Les plus beaux souvenirs sont là : dans l'inattendue, dans les changements, dans la rencontre imprévue."
            </p>
            <p style={{ color: COLORS.orange, fontSize: 12, fontWeight: 600 }}>Vibe du jour</p>
          </div>
        </div>
      </GlassCard>

      {/* Section title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }} className="fade-in-delay-2">
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: COLORS.darkBrown, fontWeight: 700 }}>
          Événements à Lyon
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
          <span style={{ color: COLORS.orange, fontSize: 13, fontWeight: 600 }}>Voir tout</span>
          <ArrowRight size={14} color={COLORS.orange} strokeWidth={2.5} />
        </div>
      </div>

      {/* Event Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {events.map((event, idx) => (
          <GlassCard key={event.id} onClick={() => onEventClick(event)}
            className={`fade-in-delay-${Math.min(idx + 1, 3)}`}
            style={{ padding: 0, overflow: "hidden", borderRadius: 20 }}>
            <div style={{ background: event.gradient, padding: "18px 18px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <PillTag label={event.category} />
                <span style={{ fontWeight: 800, color: COLORS.orange, fontSize: 16 }}>{event.price}</span>
              </div>

              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: COLORS.darkBrown, fontWeight: 700, marginBottom: 10 }}>
                {event.title}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CalendarDays size={14} color="#8B7355" strokeWidth={1.8} />
                  <span style={{ color: "#6B5B4E", fontSize: 13, fontWeight: 500 }}>{event.date} · {event.time}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={14} color="#8B7355" strokeWidth={1.8} />
                  <span style={{ color: "#6B5B4E", fontSize: 13, fontWeight: 500 }}>{event.location}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <AvatarStack names={event.attendees} size={32} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: event.spots <= 3 ? "#E85D4A" : event.spots <= 6 ? COLORS.orange : "#4CAF50",
                  }} />
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: event.spots <= 3 ? "#E85D4A" : "#6B5B4E",
                  }}>
                    {event.spots <= 3 ? `Plus que ${event.spots} places` : `${event.spots} places restantes`}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// ─── EVENT DETAIL (Luma style) ───────────────────────
const EventDetailScreen = ({ event, onBack }) => {
  const [registered, setRegistered] = useState(false);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{
        position: "relative", height: 240,
        background: `linear-gradient(135deg, ${COLORS.peach}, ${COLORS.orange}90, ${COLORS.terracotta}70)`,
        display: "flex", alignItems: "flex-end", padding: 20,
      }}>
        <div onClick={onBack} className="card-hover" style={{
          position: "absolute", top: 16, left: 16, width: 40, height: 40,
          borderRadius: "50%", background: "rgba(255,255,255,0.25)",
          backdropFilter: "blur(10px)", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
          border: "1px solid rgba(255,255,255,0.3)",
        }}>
          <ChevronLeft size={22} color="#fff" strokeWidth={2.5} />
        </div>

        <GlassCard style={{
          position: "absolute", top: 16, right: 16, padding: "10px 16px",
          borderRadius: 16, textAlign: "center",
          background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)",
        }}>
          <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>AVR</p>
          <p style={{ color: "#fff", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>24</p>
        </GlassCard>

        <div className="fade-in">
          <PillTag label={event.category} color="#fff" filled />
          <h1 style={{
            fontFamily: "Georgia, serif", fontSize: 28, color: "#fff",
            fontWeight: 700, marginTop: 10, textShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }}>
            {event.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }} className="fade-in-delay-1">
          <GlassCard style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Clock size={14} color="#8B7355" strokeWidth={1.8} />
              <p style={{ fontSize: 12, color: "#8B7355", fontWeight: 600 }}>HEURE</p>
            </div>
            <p style={{ fontSize: 16, color: COLORS.darkBrown, fontWeight: 700 }}>{event.time}</p>
          </GlassCard>
          <GlassCard style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Star size={14} color="#8B7355" strokeWidth={1.8} />
              <p style={{ fontSize: 12, color: "#8B7355", fontWeight: 600 }}>TARIF</p>
            </div>
            <p style={{ fontSize: 16, color: COLORS.orange, fontWeight: 700 }}>{event.price}</p>
          </GlassCard>
        </div>

        <GlassCard style={{ marginBottom: 24, borderRadius: 18, padding: 16 }} className="fade-in-delay-1">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${COLORS.orange}12`, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <MapPin size={22} color={COLORS.orange} strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.darkBrown }}>{event.location}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: 13, color: COLORS.orange, fontWeight: 500 }}>Voir sur la carte</span>
                <ArrowRight size={12} color={COLORS.orange} strokeWidth={2} />
              </div>
            </div>
          </div>
        </GlassCard>

        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.darkBrown, marginBottom: 12, fontWeight: 700 }} className="fade-in-delay-2">
          À propos
        </h3>
        <p style={{ color: "#6B5B4E", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }} className="fade-in-delay-2">
          Rejoins-nous pour un moment convivial entre filles ! Au programme : bonne humeur, nouvelles rencontres et bonnes adresses lyonnaises. Que tu viennes seule ou accompagnée, tu seras accueillie les bras ouverts par notre ambassadrice.
        </p>

        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.darkBrown, marginBottom: 16, fontWeight: 700 }} className="fade-in-delay-2">
          Qui vient ?
        </h3>
        <GlassCard style={{ borderRadius: 18, padding: 16 }} className="fade-in-delay-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <AvatarStack names={event.attendees} size={38} />
            <span style={{ fontSize: 13, color: COLORS.orange, fontWeight: 600 }}>{event.attendees.length} inscrites</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {event.attendees.slice(0, 6).map((name, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px 6px 6px", borderRadius: 50,
                background: `${COLORS.peach}15`,
              }}>
                <Avatar name={name} size={26} index={i} />
                <span style={{ fontSize: 13, color: COLORS.darkBrown, fontWeight: 500 }}>{name}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {event.spots <= 5 && (
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 14,
            background: "#E85D4A08", border: "1px solid #E85D4A15",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Flame size={16} color="#E85D4A" strokeWidth={1.8} />
            <span style={{ fontSize: 13, color: "#E85D4A", fontWeight: 600 }}>
              Plus que {event.spots} places disponibles
            </span>
          </div>
        )}
      </div>

      {/* Fixed CTA */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 390,
        margin: "0 auto", padding: "12px 16px 28px",
        background: `linear-gradient(to top, ${COLORS.cream}, ${COLORS.cream}F0, transparent)`,
      }}>
        <button onClick={() => setRegistered(!registered)} className="card-hover" style={{
          width: "100%", padding: "16px 0", borderRadius: 50, border: "none",
          background: registered ? "#4CAF50" : `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.terracotta})`,
          color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
          boxShadow: `0 6px 24px ${registered ? "#4CAF5040" : COLORS.orange + "40"}`,
          transition: "all 0.3s ease", letterSpacing: 0.5,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {registered ? <><Check size={18} strokeWidth={3} /> Inscrite</> : "Je m'inscris"}
        </button>
      </div>
    </div>
  );
};

// ─── BOTTOM NAV ──────────────────────────────────────
const BottomNav = ({ active, onTabChange }) => {
  const tabs = [
    { id: "home", Icon: Home, label: "Accueil" },
    { id: "events", Icon: CalendarDays, label: "Agenda" },
    { id: "perks", Icon: Gift, label: "Bons Plans" },
    { id: "members", Icon: Users, label: "Filles" },
    { id: "profile", Icon: User, label: "Profil" },
  ];

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 390,
      margin: "0 auto", background: "rgba(255, 248, 240, 0.8)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderTop: `1px solid ${COLORS.glassBorder}`,
      display: "flex", justifyContent: "space-around",
      padding: "10px 0 26px", zIndex: 100,
    }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <div key={tab.id} onClick={() => onTabChange(tab.id)}
            className={`nav-item ${isActive ? "active" : ""}`}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, cursor: "pointer", position: "relative", padding: "2px 12px",
            }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: isActive ? `${COLORS.orange}15` : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s ease",
            }}>
              <tab.Icon
                size={22}
                color={isActive ? COLORS.orange : "#A0917E"}
                strokeWidth={isActive ? 2.2 : 1.6}
                style={{ transition: "all 0.3s ease" }}
              />
            </div>
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              color: isActive ? COLORS.orange : "#A0917E",
              transition: "all 0.3s ease",
            }}>
              {tab.label}
            </span>
            {isActive && (
              <div className="nav-dot" style={{
                position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)",
                width: 5, height: 5, borderRadius: "50%", background: COLORS.orange,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── MAIN APP ────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("onboarding");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div style={{
      maxWidth: 390, margin: "0 auto", height: "100vh",
      background: `linear-gradient(170deg, ${COLORS.cream} 0%, #FFF5EB 40%, ${COLORS.blush}40 100%)`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: "relative", overflow: "hidden",
    }}>
      <MotionStyles />

      {/* Decorative blobs */}
      <div style={{
        position: "fixed", top: -80, right: -80, width: 250, height: 250,
        borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.peach}25, transparent)`,
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: 100, left: -60, width: 200, height: 200,
        borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.orange}12, transparent)`,
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, height: "100%", overflowY: "auto" }}>
        {screen === "onboarding" && <OnboardingScreen onComplete={() => setScreen("home")} />}
        {screen === "home" && !selectedEvent && (
          <>
            <HomeScreen onEventClick={(event) => { setSelectedEvent(event); setScreen("event"); }} />
            <BottomNav active={activeTab} onTabChange={setActiveTab} />
          </>
        )}
        {screen === "event" && selectedEvent && (
          <EventDetailScreen event={selectedEvent} onBack={() => { setSelectedEvent(null); setScreen("home"); }} />
        )}
      </div>
    </div>
  );
}