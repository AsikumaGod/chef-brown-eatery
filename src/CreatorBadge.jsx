/**
 * CreatorBadge.jsx
 * Inline footer element — visible only when user scrolls to the bottom.
 * Clicking opens WhatsApp chat with Richard (Backend Nyame).
 */

export default function CreatorBadge() {
  return (
    <>
      <style>{`
        .creator-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          text-decoration: none;
          background: rgba(5, 5, 8, 0.6);
          border: 1px solid rgba(0, 102, 255, 0.22);
          border-radius: 10px;
          padding: 7px 14px 7px 10px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .creator-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 102, 255, 0.2);
          border-color: rgba(0, 102, 255, 0.45);
        }
        .creator-badge__label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 400;
          color: rgba(255,255,255,0.4);
          white-space: nowrap;
        }
        .creator-badge__logo {
          height: 26px;
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

          <rect x="18" y="18" width="74" height="74" rx="10"
                fill="#050508" fillOpacity="0.9"
                stroke="url(#badgeBlue)" strokeWidth="1.5"/>
          <circle cx="33" cy="33" r="3" fill="#0066FF" opacity="0.8"/>
          <circle cx="44" cy="33" r="3" fill="#1a1a2e"/>
          <circle cx="55" cy="33" r="3" fill="#1a1a2e"/>
          <line x1="22" y1="41" x2="88" y2="41"
                stroke="#0066FF" strokeWidth="0.6" opacity="0.3"/>
          <text x="26" y="60"
                fontFamily="'Courier New', Courier, monospace"
                fontSize="13" fontWeight="700"
                fill="url(#badgeBlue)"
                filter="url(#badgeGlow)">&#62;</text>
          <text x="40" y="60"
                fontFamily="'Courier New', Courier, monospace"
                fontSize="13" fontWeight="400"
                fill="#ffffff" opacity="0.9">BN</text>
          <rect x="62" y="52" width="8" height="2"
                fill="url(#badgeBlue)" rx="1" opacity="0.9"/>
          <text x="26" y="76"
                fontFamily="'Courier New', Courier, monospace"
                fontSize="10"
                fill="#0066FF" opacity="0.25">init --dev</text>
          <text x="112" y="52"
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="22" fontWeight="200"
                fill="#ffffff" opacity="0.6"
                letterSpacing="4">BACKEND</text>
          <text x="110" y="82"
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="30" fontWeight="700"
                fill="url(#badgeBlue)"
                letterSpacing="2">NYAME</text>
          <rect x="110" y="88" width="148" height="2" rx="1"
                fill="url(#badgeBlue)" opacity="0.7"/>
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
