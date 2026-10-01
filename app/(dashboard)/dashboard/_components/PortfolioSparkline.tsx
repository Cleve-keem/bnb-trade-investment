export default function PortfolioSparkline() {
  return (
    <div className="absolute w-1/2 right-0 md:w-full max-w-120 lg:block -z-1">
      <svg
        viewBox="0 0 380 130"
        className="h-32.5 w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="portfolio-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0b90b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f0b90b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area */}
        <path
          d="
            M0 105
            L12 91
            L24 96
            L36 81
            L48 86
            L60 74
            L72 78
            L84 66
            L96 73
            L108 59
            L120 65
            L132 51
            L144 62
            L156 54
            L168 69
            L180 61
            L192 75
            L204 64
            L216 71
            L228 58
            L240 43
            L252 49
            L264 35
            L276 44
            L288 30
            L300 38
            L312 28
            L324 34
            L336 22
            L348 28
            L360 12
            L380 5
            L380 130
            L0 130
            Z
          "
          fill="url(#portfolio-gradient)"
        />

        {/* Line */}
        <path
          d="
            M0 105
            L12 91
            L24 96
            L36 81
            L48 86
            L60 74
            L72 78
            L84 66
            L96 73
            L108 59
            L120 65
            L132 51
            L144 62
            L156 54
            L168 69
            L180 61
            L192 75
            L204 64
            L216 71
            L228 58
            L240 43
            L252 49
            L264 35
            L276 44
            L288 30
            L300 38
            L312 28
            L324 34
            L336 22
            L348 28
            L360 12
            L380 5
          "
          fill="none"
          stroke="#f0b90b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End point */}
        <circle cx="380" cy="5" r="4" fill="#f0b90b" />

        <circle cx="380" cy="5" r="9" fill="#f0b90b" opacity="0.12" />
      </svg>
    </div>
  );
}
