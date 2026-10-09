import { cn } from "@/lib/utils";
import type { CityKey } from "@/lib/types";
import { PHOTOS } from "@/data/photos";

type ArtKey = CityKey | "japan";

/**
 * Original illustrated covers (no licensing issues, never broken).
 * Drop your own photos into /public/photos and list them in data/photos.ts to use them instead.
 */
export function CityArt({ city, className, label, photoKey }: { city: ArtKey; className?: string; label?: string; photoKey?: string }) {
  const photo = (photoKey && PHOTOS[photoKey]) || PHOTOS[city];
  return (
    <div className={cn("relative overflow-hidden bg-blush", className)} role="img" aria-label={label ?? `${city} illustration`}>
      <Art city={city} />
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}

function Art({ city }: { city: ArtKey }) {
  const common = { viewBox: "0 0 400 240", preserveAspectRatio: "xMidYMid slice", className: "absolute inset-0 size-full", "aria-hidden": true } as const;
  if (city === "kyoto") return <KyotoArt {...common} />;
  if (city === "tokyo") return <TokyoArt {...common} />;
  if (city === "osaka") return <OsakaArt {...common} />;
  return <JapanArt {...common} />;
}

type SvgProps = React.SVGProps<SVGSVGElement>;

function Grain({ id }: { id: string }) {
  return (
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
  );
}

function JapanArt(p: SvgProps) {
  return (
    <svg {...p}>
      <defs>
        <linearGradient id="jp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4DDE1" />
          <stop offset="0.55" stopColor="#F7E8E2" />
          <stop offset="1" stopColor="#FAF8F4" />
        </linearGradient>
        <linearGradient id="jp-mtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7E8F9C" />
          <stop offset="1" stopColor="#B9C2C4" />
        </linearGradient>
        <Grain id="jp-grain" />
      </defs>
      <rect width="400" height="240" fill="url(#jp-sky)" />
      <circle cx="290" cy="92" r="46" fill="#E8A5B4" opacity="0.9" />
      <path d="M40 200 L170 78 Q200 58 230 78 L360 200 Z" fill="url(#jp-mtn)" />
      <path d="M170 78 Q200 58 230 78 L214 92 L204 84 L194 96 L184 86 Z" fill="#FAF8F4" />
      <path d="M0 196 Q100 176 200 192 T400 186 V240 H0 Z" fill="#879D7B" opacity="0.55" />
      <path d="M0 214 Q120 198 230 212 T400 208 V240 H0 Z" fill="#879D7B" opacity="0.8" />
      <g stroke="#242424" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.75">
        <path d="M-10 30 Q60 40 110 70 Q140 88 150 112" />
        <path d="M60 42 Q72 22 92 18" />
        <path d="M108 68 Q126 52 146 54" />
      </g>
      <g fill="#E8A5B4">
        {[[92, 18], [146, 54], [150, 112], [70, 38], [124, 80], [40, 34]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} rx="4.2" ry="6.5" cy="-6" transform={`rotate(${r})`} />
            ))}
            <circle r="2.2" fill="#C8A76A" />
          </g>
        ))}
      </g>
      <rect width="400" height="240" filter="url(#jp-grain)" />
    </svg>
  );
}

function OsakaArt(p: SvgProps) {
  return (
    <svg {...p}>
      <defs>
        <linearGradient id="os-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B2F3A" />
          <stop offset="0.5" stopColor="#B8707F" />
          <stop offset="1" stopColor="#E9B98A" />
        </linearGradient>
        <linearGradient id="os-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B2F3A" />
          <stop offset="1" stopColor="#242424" />
        </linearGradient>
        <Grain id="os-grain" />
      </defs>
      <rect width="400" height="240" fill="url(#os-sky)" />
      <circle cx="96" cy="118" r="34" fill="#F4DDE1" opacity="0.85" />
      {/* castle silhouette */}
      <g fill="#2A2228">
        <rect x="60" y="150" width="72" height="22" />
        <path d="M52 152 L140 152 L128 140 L64 140 Z" />
        <rect x="70" y="124" width="52" height="16" />
        <path d="M62 126 L130 126 L118 114 L74 114 Z" />
        <rect x="80" y="100" width="32" height="14" />
        <path d="M72 102 L120 102 L108 90 L84 90 Z" />
      </g>
      {/* neon street */}
      <g>
        {[
          [190, 70, 22, 102, "#E8A5B4"],
          [220, 92, 30, 80, "#C8A76A"],
          [258, 60, 18, 112, "#F4DDE1"],
          [284, 84, 34, 88, "#879D7B"],
          [326, 66, 22, 106, "#E8A5B4"],
          [356, 96, 40, 76, "#C8A76A"],
        ].map(([x, y, w, h, c], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width={w as number} height={h as number} fill="#2A2228" />
            {Array.from({ length: Math.floor((h as number) / 14) }).map((_, j) => (
              <rect key={j} x={(x as number) + 4} y={(y as number) + 6 + j * 14} width={(w as number) - 8} height="5" rx="2" fill={c as string} opacity={0.55 + ((i + j) % 3) * 0.15} />
            ))}
          </g>
        ))}
      </g>
      <rect y="172" width="400" height="68" fill="url(#os-water)" />
      <g opacity="0.6">
        {[[200, 186, "#E8A5B4"], [262, 196, "#F4DDE1"], [300, 184, "#879D7B"], [340, 202, "#E8A5B4"], [372, 190, "#C8A76A"], [96, 194, "#F4DDE1"]].map(([x, y, c], i) => (
          <rect key={i} x={x as number} y={y as number} width="18" height="2.4" rx="1.2" fill={c as string} />
        ))}
      </g>
      {/* bridge */}
      <path d="M150 176 Q260 150 400 176" stroke="#1E181D" strokeWidth="6" fill="none" />
      <rect width="400" height="240" filter="url(#os-grain)" />
    </svg>
  );
}

function KyotoArt(p: SvgProps) {
  return (
    <svg {...p}>
      <defs>
        <linearGradient id="ky-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9EDE1" />
          <stop offset="0.6" stopColor="#F4DDE1" />
          <stop offset="1" stopColor="#FAF8F4" />
        </linearGradient>
        <linearGradient id="ky-torii" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D2553F" />
          <stop offset="1" stopColor="#A63C2C" />
        </linearGradient>
        <Grain id="ky-grain" />
      </defs>
      <rect width="400" height="240" fill="url(#ky-sky)" />
      <path d="M0 150 Q80 110 160 136 T320 120 T400 130 V240 H0 Z" fill="#879D7B" opacity="0.45" />
      {/* pagoda */}
      <g fill="#3A3330">
        <rect x="310" y="54" width="3" height="20" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <path d={`M${286 - i * 3} ${78 + i * 22} L${338 + i * 3} ${78 + i * 22} L${326 + i * 2} ${70 + i * 22} L${298 - i * 2} ${70 + i * 22} Z`} />
            <rect x={300 - i} y={78 + i * 22} width={24 + i * 2} height="14" />
          </g>
        ))}
      </g>
      {/* torii tunnel */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const s = 1 - i * 0.13;
        const x = 120 - i * 2;
        const w = 150 * s;
        const h = 150 * s;
        const left = x - w / 2 + 40;
        const top = 236 - h;
        return (
          <g key={i} opacity={1 - i * 0.1}>
            <rect x={left - 8 * s} y={top} width={w + 16 * s} height={10 * s} rx={4 * s} fill="#2B2422" />
            <rect x={left - 4 * s} y={top + 10 * s} width={w + 8 * s} height={8 * s} fill="url(#ky-torii)" />
            <rect x={left + 10 * s} y={top + 30 * s} width={w - 20 * s} height={7 * s} fill="url(#ky-torii)" />
            <rect x={left + 14 * s} y={top + 10 * s} width={10 * s} height={h} fill="url(#ky-torii)" />
            <rect x={left + w - 24 * s} y={top + 10 * s} width={10 * s} height={h} fill="url(#ky-torii)" />
          </g>
        );
      }).reverse()}
      {/* maple leaves */}
      <g fill="#C8A76A" opacity="0.85">
        {[[40, 40, 0], [366, 34, 30], [250, 30, -20], [20, 120, 50]].map(([x, y, r], i) => (
          <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M0 -10 L3 -3 L10 -4 L5 2 L8 9 L0 5 L-8 9 L-5 2 L-10 -4 L-3 -3 Z" />
        ))}
      </g>
      <rect width="400" height="240" filter="url(#ky-grain)" />
    </svg>
  );
}

function TokyoArt(p: SvgProps) {
  return (
    <svg {...p}>
      <defs>
        <linearGradient id="tk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#242424" />
          <stop offset="0.55" stopColor="#5A4450" />
          <stop offset="1" stopColor="#E8A5B4" />
        </linearGradient>
        <Grain id="tk-grain" />
      </defs>
      <rect width="400" height="240" fill="url(#tk-sky)" />
      <circle cx="318" cy="56" r="18" fill="#FAF8F4" opacity="0.9" />
      <circle cx="326" cy="50" r="16" fill="#3A2F35" opacity="0.6" />
      {[[30, 30], [80, 50], [150, 22], [210, 44], [260, 18], [370, 90], [120, 80]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="#FAF8F4" opacity="0.7" />
      ))}
      {/* lattice tower */}
      <g stroke="#E8A5B4" strokeWidth="1.4" fill="none" opacity="0.95">
        <path d="M200 40 L184 200 M200 40 L216 200" />
        <path d="M196 70 L204 70 M192 100 L208 100 M189 130 L211 130 M186 160 L214 160" />
        <path d="M196 70 L208 100 L189 130 L214 160 M204 70 L192 100 L211 130 L186 160" opacity="0.6" />
        <ellipse cx="200" cy="96" rx="12" ry="4" fill="#E8A5B4" fillOpacity="0.4" />
      </g>
      <line x1="200" y1="20" x2="200" y2="40" stroke="#E8A5B4" strokeWidth="1.4" />
      {/* skyline */}
      <g fill="#1C1A1B">
        <path d="M0 240 V170 H24 V150 H46 V176 H70 V132 H96 V160 H118 V140 H140 V182 H160 V158 H178 V240 Z" />
        <path d="M222 240 V150 H246 V120 H270 V168 H292 V140 H320 V110 H338 V162 H360 V146 H384 V176 H400 V240 Z" />
      </g>
      <g fill="#C8A76A" opacity="0.8">
        {Array.from({ length: 36 }).map((_, i) => {
          const x = [8, 30, 52, 76, 100, 124, 146, 166, 230, 252, 276, 298, 326, 344, 366, 388][i % 16];
          const y = 180 + Math.floor(i / 16) * 16 + ((i * 7) % 3) * 4;
          return <rect key={i} x={x} y={y} width="4" height="5" opacity={(i * 13) % 5 === 0 ? 0.3 : 0.85} />;
        })}
      </g>
      <rect width="400" height="240" filter="url(#tk-grain)" />
    </svg>
  );
}
