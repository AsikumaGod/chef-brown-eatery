/**
 * CreatorBadge.jsx
 * Fixed bottom-left watermark — Backend Nyame branding.
 * Clicking opens WhatsApp chat with Richard.
 */

export default function CreatorBadge() {
  return (
    <>
      <style>{`
        .creator-badge {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 7px;
          text-decoration: none;
          background: rgba(5, 5, 8, 0.82);
          border: 1px solid rgba(0, 102, 255, 0.25);
          border-radius: 10px;
          padding: 7px 12px 7px 8px;
          backdrop-filter: blur(10px);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .creator-badge:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 24px rgba(0, 102, 255, 0.25);
          border-color: rgba(0, 102, 255, 0.5);
        }
        .creator-badge__label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.68rem;
          font-weight: 400;
          color: rgba(255,255,255,0.45);
          white-space: nowrap;
        }
        .creator-badge__logo {
          height: 28px;
          width: auto;
          display: block;
        }
      `}</style>

      <a
        className="creator-badge"
        href="https://wa.me/233500930862"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Made by Backend Nyame — chat on WhatsApp"
      >
        <span className="creator-badge__label">Made by</span>

        {/* Inline Backend Nyame logo SVG */}
        <svg
          className="creator-badge__logo"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 480 110"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="badgeBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#00CFFF"/>
              <stop offset="100%" stopColor="#0066FF"/>
            </linearGradient>
            <filter id="badgeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Icon: terminal block */}
          <rect x="18" y="18" width="74" height="74" rx="10"
                fill="#050508" fillOpacity="0.9"
                stroke="url(#badgeBlue)" strokeWidth="1.5"/>

          {/* Window dots */}
          <circle cx="33" cy="33" r="3" fill="#0066FF" opacity="0.8"/>
          <circle cx="44" cy="33" r="3" fill="#1a1a2e"/>
          <circle cx="55" cy="33" r="3" fill="#1a1a2e"/>

          {/* Separator */}
          <line x1="22" y1="41" x2="88" y2="41"
                stroke="#0066FF" strokeWidth="0.6" opacity="0.3"/>

          {/* Prompt > */}
          <text x="26" y="60"
                fontFamily="'Courier New', Courier, monospace"
                fontSize="13" fontWeight="700"
                fill="url(#badgeBlue)"
                filter="url(#badgeGlow)">&#62;</text>

          {/* BN initials */}
          <text x="40" y="60"
                fontFamily="'Courier New', Courier, monospace"
                fontSize="13" fontWeight="400"
                fill="#ffffff" opacity="0.9">BN</text>

          {/* Cursor underscore */}
          <rect x="62" y="52" width="8" height="2"
                fill="url(#badgeBlue)" rx="1" opacity="0.9"/>

          {/* Faint second line */}
          <text x="26" y="76"
                fontFamily="'Courier New', Courier, monospace"
                fontSize="10"
                fill="#0066FF" opacity="0.25">init --dev</text>

          {/* BACKEND label */}
          <text x="112" y="52"
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="22" fontWeight="200"
                fill="#ffffff" opacity="0.6"
                letterSpacing="4">BACKEND</text>

          {/* NYAME label */}
          <text x="110" y="82"
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="30" fontWeight="700"
                fill="url(#badgeBlue)"
                letterSpacing="2">NYAME</text>

          {/* Underline accent */}
          <rect x="110" y="88" width="148" height="2" rx="1"
                fill="url(#badgeBlue)" opacity="0.7"/>

          {/* Dev tag */}
          <rect x="272" y="68" width="34" height="16" rx="4"
                fill="#0066FF" opacity="0.15"
                stroke="#0066FF" strokeWidth="0.8" strokeOpacity="0.4"/>
          <text x="278" y="80"
                fontFamily="'Courier New', Courier, monospace"
                fontSize="9"
                fill="#00CFFF" opacity="0.8">dev</text>
        </svg>
      </a>
    </>
  );
}
