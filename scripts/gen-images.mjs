// Generates brand-styled SVG mockups for Kabaprints into public/images
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
mkdirSync(OUT, { recursive: true });

const C = {
  blue: "#1E6FA9", blueDark: "#14507E", blueMid: "#2E88C7", blueLight: "#9CC6E4", bluePale: "#E9F2F9",
  coral: "#E4795B", coralDark: "#C8603F", coralLight: "#F3B39C", coralPale: "#FBEDE7",
  silver: "#96A1A6", silverDark: "#5F6C72", silverLight: "#D8DDE0",
  ink: "#101A24", cream: "#F8F6F2", white: "#FFFFFF",
  glass: "#BBD9EE", gold: "#E3B24C", goldDark: "#B98A2E", wood: "#8A6242", woodDark: "#5E4128",
};

const BGS = {
  blue: ["#EAF3FA", "#CCE2F3"],
  coral: ["#FDEFE9", "#F7D8CA"],
  cream: ["#F9F7F3", "#EBE6DE"],
  silver: ["#F2F4F5", "#DEE3E5"],
  ink: ["#1B2A38", "#0E1822"],
};

function writeCard(name, body, { w = 400, h = 300, bg = "blue", defs = "", meta = "" } = {}) {
  const [c1, c2] = BGS[bg];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${meta || name}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#0B1620" flood-opacity="0.22"/></filter>
  <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F5F6"/><stop offset="0.5" stop-color="#C7D0D4"/><stop offset="1" stop-color="#9AA6AC"/></linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
  ${defs}
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<g fill="none" stroke="#FFFFFF" stroke-opacity="0.35">
  <circle cx="${w - 40}" cy="46" r="70" stroke-width="2"/>
  <circle cx="42" cy="${h - 40}" r="54" stroke-width="2"/>
</g>
${body}
</svg>`;
  writeFileSync(join(OUT, name), svg);
}

const ground = (cy = 258, rx = 110) =>
  `<ellipse cx="200" cy="${cy}" rx="${rx}" ry="13" fill="#0B1620" opacity="0.10"/>`;

const shapes = {
  shirt: (m, a, d) => `${ground(256, 108)}
<g filter="url(#sh)"><path d="M140 55 L95 95 L120 135 L140 120 L140 250 L260 250 L260 120 L280 135 L305 95 L260 55 L235 55 Q200 95 165 55 Z" fill="${m}"/></g>
<path d="M165 55 Q200 82 235 55" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
<rect x="158" y="104" width="84" height="92" rx="7" fill="${a}" opacity="0.92"/>
<circle cx="200" cy="140" r="17" fill="#FFFFFF" opacity="0.95"/>
<rect x="176" y="166" width="48" height="7" rx="3.5" fill="#FFFFFF" opacity="0.95"/>
<rect x="184" y="178" width="32" height="5" rx="2.5" fill="#FFFFFF" opacity="0.75"/>`,

  bulkShirts: (m, a, d) => `${ground(256, 130)}
<g transform="translate(6,86) scale(0.52)" opacity="0.9">${shapes.shirt(C.silverLight, C.silver, C.silverDark)}</g>
<g transform="translate(212,86) scale(0.52)" opacity="0.9">${shapes.shirt(C.silverLight, C.silver, C.silverDark)}</g>
<g transform="translate(84,58) scale(0.64)">${shapes.shirt(m, a, d)}</g>`,

  hoodie: (m, a, d) => `${ground(258, 112)}
<g filter="url(#sh)"><path d="M142 62 L100 92 L86 192 L126 202 L142 172 L142 252 L258 252 L258 172 L274 202 L314 192 L300 92 L258 62 L240 72 L200 104 L160 72 Z" fill="${m}"/></g>
<path d="M152 74 Q152 30 200 30 Q248 30 248 74 L248 100 Q200 124 152 100 Z" fill="${d}"/>
<path d="M192 110 L188 154" stroke="${a}" stroke-width="6" stroke-linecap="round"/>
<path d="M208 110 L212 154" stroke="${a}" stroke-width="6" stroke-linecap="round"/>
<path d="M164 196 L236 196 L246 238 L154 238 Z" fill="${d}" opacity="0.35"/>
<rect x="160" y="120" width="80" height="64" rx="7" fill="${a}" opacity="0.9"/>
<circle cx="200" cy="152" r="15" fill="#FFFFFF" opacity="0.95"/>`,

  cap: (m, a, d) => `${ground(250, 122)}
<g filter="url(#sh)">
  <path d="M118 194 A82 76 0 0 1 282 194 Z" fill="${m}"/>
  <path d="M282 194 C332 191 362 200 364 214 C366 227 330 233 266 220 C256 214 260 199 282 194 Z" fill="${d}"/>
</g>
<path d="M200 118 L200 194" stroke="${d}" stroke-width="3" opacity="0.55"/>
<path d="M159 130 L159 194" stroke="${d}" stroke-width="3" opacity="0.35"/>
<path d="M241 130 L241 194" stroke="${d}" stroke-width="3" opacity="0.35"/>
<circle cx="200" cy="121" r="7" fill="${a}"/>
<circle cx="200" cy="163" r="25" fill="${a}"/>
<text x="200" y="171" font-family="sans-serif" font-size="22" font-weight="700" fill="#FFFFFF" text-anchor="middle">K</text>`,

  pillow: (m, a, d) => `${ground(254, 120)}
<g filter="url(#sh)"><path d="M95 92 Q95 68 120 73 L280 83 Q305 87 300 110 L292 232 Q288 253 265 249 L112 236 Q92 232 96 211 Z" fill="${m}"/></g>
<path d="M104 96 Q104 82 122 86 L276 96 Q294 99 290 116 L283 226 Q280 241 262 238 L118 226 Q104 223 107 208 Z" fill="none" stroke="${d}" stroke-width="3" stroke-dasharray="9 7" opacity="0.7"/>
<circle cx="198" cy="160" r="52" fill="${a}" opacity="0.94"/>
<circle cx="198" cy="146" r="17" fill="#FFFFFF" opacity="0.95"/>
<rect x="174" y="172" width="48" height="7" rx="3.5" fill="#FFFFFF" opacity="0.95"/>
<rect x="182" y="184" width="32" height="5" rx="2.5" fill="#FFFFFF" opacity="0.75"/>`,

  nylon: (m, a, d) => `${ground(256, 116)}
<path d="M168 98 C160 54 196 46 200 88" fill="none" stroke="${m}" stroke-width="11" stroke-linecap="round"/>
<path d="M232 98 C240 54 204 46 200 88" fill="none" stroke="${m}" stroke-width="11" stroke-linecap="round"/>
<g filter="url(#sh)"><path d="M138 96 C162 82 178 94 200 86 C222 78 240 92 262 98 L276 254 L124 254 Z" fill="${m}"/></g>
<path d="M154 118 L148 240" stroke="#FFFFFF" stroke-width="9" opacity="0.28" stroke-linecap="round"/>
<rect x="156" y="140" width="88" height="74" rx="6" fill="${a}" opacity="0.92"/>
<circle cx="200" cy="166" r="15" fill="#FFFFFF" opacity="0.95"/>
<rect x="176" y="190" width="48" height="7" rx="3.5" fill="#FFFFFF" opacity="0.95"/>`,

  tote: (m, a, d) => `${ground(256, 120)}
<path d="M158 122 C158 62 242 62 242 122" fill="none" stroke="${m}" stroke-width="15" stroke-linecap="round"/>
<g filter="url(#sh)"><path d="M128 112 L272 112 L282 254 L118 254 Z" fill="${m}"/></g>
<rect x="126" y="112" width="148" height="11" fill="${d}" opacity="0.5"/>
<rect x="156" y="148" width="88" height="78" rx="7" fill="${a}" opacity="0.93"/>
<circle cx="200" cy="176" r="16" fill="#FFFFFF" opacity="0.95"/>
<rect x="176" y="202" width="48" height="7" rx="3.5" fill="#FFFFFF" opacity="0.95"/>`,

  uniform: (m, a, d) => `${ground(256, 108)}
<g filter="url(#sh)"><path d="M142 58 L96 94 L122 134 L142 120 L142 250 L258 250 L258 120 L278 134 L304 94 L258 58 L236 52 L200 80 L164 52 Z" fill="${m}"/></g>
<path d="M164 52 L200 80 L174 96 L150 64 Z" fill="${d}"/>
<path d="M236 52 L200 80 L226 96 L250 64 Z" fill="${d}"/>
<rect x="194" y="80" width="12" height="56" fill="${d}" opacity="0.65"/>
<circle cx="200" cy="98" r="4" fill="#FFFFFF"/><circle cx="200" cy="116" r="4" fill="#FFFFFF"/>
<circle cx="234" cy="140" r="14" fill="${a}"/>
<text x="234" y="146" font-family="sans-serif" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">K</text>`,

  flyer: (m, a) => `${ground(266, 130)}
<g transform="rotate(-7 186 176)" opacity="0.85"><rect x="96" y="66" width="176" height="216" rx="5" fill="#FFFFFF" stroke="#DDE3E6" stroke-width="2"/></g>
<g filter="url(#sh)"><rect x="132" y="54" width="176" height="220" rx="5" fill="#FFFFFF"/></g>
<rect x="132" y="54" width="176" height="52" fill="${m}"/>
<rect x="148" y="70" width="96" height="9" rx="4.5" fill="#FFFFFF" opacity="0.95"/>
<rect x="148" y="86" width="66" height="7" rx="3.5" fill="#FFFFFF" opacity="0.7"/>
<rect x="150" y="122" width="140" height="66" rx="4" fill="${a}" opacity="0.88"/>
<circle cx="220" cy="155" r="16" fill="#FFFFFF" opacity="0.9"/>
<g fill="#C9D2D8">
  <rect x="150" y="202" width="140" height="7" rx="3.5"/><rect x="150" y="216" width="140" height="7" rx="3.5"/>
  <rect x="150" y="230" width="112" height="7" rx="3.5"/>
</g>
<rect x="132" y="250" width="176" height="24" fill="${m}"/>
<rect x="168" y="258" width="104" height="7" rx="3.5" fill="#FFFFFF" opacity="0.9"/>`,

  sticker: (m, a, d) => `${ground(252, 110)}
<g filter="url(#sh)">
  <circle cx="200" cy="150" r="94" fill="${m}"/>
  <circle cx="200" cy="150" r="82" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="4 7" opacity="0.85"/>
  <circle cx="200" cy="150" r="70" fill="none" stroke="${a}" stroke-width="5"/>
</g>
<text x="200" y="140" font-family="sans-serif" font-size="30" font-weight="800" fill="#FFFFFF" text-anchor="middle">LOGO</text>
<text x="200" y="170" font-family="sans-serif" font-size="15" letter-spacing="3" fill="#FFFFFF" text-anchor="middle">STICKER</text>
<text x="200" y="192" font-family="sans-serif" font-size="12" letter-spacing="2" fill="#FFFFFF" opacity="0.8" text-anchor="middle">PEEL &amp; STICK</text>
<path d="M268 210 L322 232 L288 266 Z" fill="#FFFFFF" opacity="0.95"/>
<path d="M268 210 L322 232 L288 266 Z" fill="none" stroke="#0B1620" stroke-opacity="0.12" stroke-width="2"/>`,

  cards: (m, a, d, ornate = false) => `${ground(264, 130)}
<g transform="rotate(-6 200 140)"><rect x="88" y="86" width="222" height="138" rx="9" fill="${m}"/></g>
<g filter="url(#sh)"><rect x="112" y="128" width="222" height="138" rx="9" fill="#FFFFFF"/></g>
<rect x="112" y="128" width="222" height="138" rx="9" fill="none" stroke="#E4E8EA" stroke-width="2"/>
${ornate ? `<path d="M132 150 L186 150 M132 150 L132 176 M310 244 L256 244 M310 244 L310 218" stroke="${a}" stroke-width="3" fill="none"/>
<circle cx="223" cy="180" r="19" fill="none" stroke="${a}" stroke-width="3"/><path d="M214 180 L232 180" stroke="${a}" stroke-width="3"/>
<rect x="164" y="214" width="118" height="7" rx="3.5" fill="#C9D2D8"/><rect x="178" y="230" width="90" height="6" rx="3" fill="#DCE2E5"/>`
: `<circle cx="152" cy="164" r="18" fill="${a}"/><text x="152" y="171" font-family="sans-serif" font-size="19" font-weight="800" fill="#FFFFFF" text-anchor="middle">K</text>
<rect x="182" y="152" width="112" height="10" rx="5" fill="${C.ink}"/>
<rect x="182" y="170" width="76" height="7" rx="3.5" fill="${C.silver}"/>
<rect x="138" y="200" width="150" height="7" rx="3.5" fill="#C9D2D8"/>
<rect x="152" y="216" width="122" height="6" rx="3" fill="#DCE2E5"/>`}
<rect x="112" y="246" width="222" height="8" fill="${m}"/><rect x="112" y="246" width="74" height="8" fill="${a}"/>`,

  rollup: (m, a, d) => `${ground(258, 130)}
<rect x="197" y="70" width="6" height="172" fill="${C.silverDark}" opacity="0.8"/>
<g filter="url(#sh)"><rect x="130" y="52" width="140" height="184" rx="5" fill="#FFFFFF" stroke="#E2E6E8" stroke-width="2"/></g>
<rect x="130" y="52" width="140" height="46" fill="${m}"/>
<rect x="146" y="66" width="80" height="8" rx="4" fill="#FFFFFF" opacity="0.95"/>
<rect x="146" y="80" width="54" height="6" rx="3" fill="#FFFFFF" opacity="0.7"/>
<circle cx="200" cy="134" r="26" fill="${a}" opacity="0.9"/>
<path d="M191 134 L198 142 L211 124" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#C9D2D8"><rect x="148" y="176" width="104" height="7" rx="3.5"/><rect x="148" y="190" width="104" height="7" rx="3.5"/><rect x="162" y="204" width="76" height="7" rx="3.5"/></g>
<rect x="130" y="222" width="140" height="14" fill="${m}"/>
<rect x="118" y="240" width="164" height="16" rx="8" fill="${d}"/>`,

  poster: (m, a, d) => `${ground(266, 120)}
<g filter="url(#sh)"><rect x="122" y="46" width="156" height="212" rx="3" fill="#FFFFFF"/></g>
<circle cx="200" cy="104" r="34" fill="${a}" opacity="0.9"/>
<text x="200" y="112" font-family="sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle">50%</text>
<g fill="${C.ink}"><rect x="144" y="152" width="112" height="12" rx="6"/><rect x="158" y="172" width="84" height="8" rx="4"/></g>
<g fill="#C9D2D8"><rect x="150" y="196" width="100" height="6" rx="3"/><rect x="150" y="208" width="100" height="6" rx="3"/><rect x="166" y="220" width="68" height="6" rx="3"/></g>
<rect x="122" y="234" width="156" height="24" fill="${m}"/>
<rect x="176" y="241" width="48" height="8" rx="4" fill="#FFFFFF" opacity="0.9"/>
<rect x="108" y="38" width="46" height="18" rx="2" fill="#FFFFFF" opacity="0.75" transform="rotate(-45 131 47)"/>
<rect x="246" y="38" width="46" height="18" rx="2" fill="#FFFFFF" opacity="0.75" transform="rotate(45 269 47)"/>`,

  backdrop: (m, a, d) => `${ground(262, 140)}
<path d="M96 226 L74 258 M304 226 L326 258" stroke="${d}" stroke-width="9" stroke-linecap="round"/>
<g filter="url(#sh)"><rect x="56" y="52" width="288" height="176" rx="7" fill="${m}"/></g>
<g opacity="0.55">${[0,1,2,3].map(r=>[0,1,2,3,4,5].map(c=>`<circle cx="${86+c*46}" cy="${76+r*42}" r="9" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>`).join("")).join("")}</g>
<rect x="92" y="104" width="216" height="70" rx="7" fill="#FFFFFF" opacity="0.95"/>
<text x="200" y="140" font-family="sans-serif" font-size="27" font-weight="800" fill="${m}" text-anchor="middle">KABAPRINTS</text>
<text x="200" y="163" font-family="sans-serif" font-size="13" letter-spacing="4" fill="${a}" text-anchor="middle">EVENT BACKDROP</text>
<rect x="56" y="212" width="288" height="16" fill="${a}" opacity="0.9"/>`,

  van: (m, a, d) => `${ground(240, 150)}
<g filter="url(#sh)">
  <rect x="48" y="86" width="214" height="124" rx="10" fill="${m}"/>
  <path d="M258 118 L302 118 L338 156 L350 164 Q356 168 356 178 L356 200 Q356 210 346 210 L258 210 Z" fill="${m}"/>
</g>
<path d="M274 128 L304 128 L332 158 L274 158 Z" fill="${C.glass}"/>
<rect x="340" y="168" width="14" height="8" rx="3" fill="${C.gold}"/>
<rect x="64" y="112" width="182" height="58" rx="8" fill="#FFFFFF" opacity="0.96"/>
<text x="155" y="142" font-family="sans-serif" font-size="24" font-weight="800" fill="${m}" text-anchor="middle">KABAPRINTS</text>
<text x="155" y="162" font-family="sans-serif" font-size="13" letter-spacing="2" fill="${a}" text-anchor="middle">0803 296 1171</text>
<rect x="48" y="186" width="214" height="14" fill="${a}"/>
<rect x="48" y="200" width="214" height="10" fill="${d}" opacity="0.6"/>
<circle cx="112" cy="210" r="27" fill="#1B2731"/><circle cx="112" cy="210" r="13" fill="#8C979E"/>
<circle cx="306" cy="210" r="27" fill="#1B2731"/><circle cx="306" cy="210" r="13" fill="#8C979E"/>`,

  car: (m, a, d) => `${ground(236, 145)}
<g filter="url(#sh)"><path d="M56 194 L58 166 Q60 152 76 148 L118 140 L154 112 Q166 102 186 102 L266 102 Q288 102 302 116 L330 144 L348 152 Q360 157 360 172 L360 190 Q360 200 350 200 L66 200 Q56 200 56 194 Z" fill="${m}"/></g>
<path d="M126 140 L164 112 Q172 106 186 106 L258 106 Q276 106 288 118 L312 140 Z" fill="${C.glass}"/>
<rect x="222" y="106" width="6" height="34" fill="${m}"/>
<path d="M74 176 C134 162 244 192 348 168" stroke="${a}" stroke-width="11" fill="none" stroke-linecap="round"/>
<rect x="344" y="156" width="14" height="9" rx="4" fill="${C.gold}"/>
<circle cx="120" cy="200" r="27" fill="#1B2731"/><circle cx="120" cy="200" r="13" fill="#8C979E"/>
<circle cx="300" cy="200" r="27" fill="#1B2731"/><circle cx="300" cy="200" r="13" fill="#8C979E"/>`,

  bus: (m, a, d) => `${ground(238, 150)}
<g filter="url(#sh)"><path d="M44 176 L44 106 Q44 88 62 88 L286 88 Q312 88 328 108 L352 152 L356 174 Q358 186 346 186 L50 186 Q44 186 44 178 Z" fill="${m}"/></g>
<rect x="62" y="102" width="248" height="44" rx="7" fill="${C.glass}"/>
<rect x="140" y="102" width="7" height="44" fill="${m}"/><rect x="222" y="102" width="7" height="44" fill="${m}"/>
<rect x="44" y="156" width="312" height="14" fill="${a}"/>
<text x="200" y="182" font-family="sans-serif" font-size="14" font-weight="700" letter-spacing="2" fill="#FFFFFF" text-anchor="middle">BRANDED FOR BUSINESS</text>
<circle cx="112" cy="188" r="25" fill="#1B2731"/><circle cx="112" cy="188" r="12" fill="#8C979E"/>
<circle cx="288" cy="188" r="25" fill="#1B2731"/><circle cx="288" cy="188" r="12" fill="#8C979E"/>`,

  keke: (m, a, d) => `${ground(238, 130)}
<g filter="url(#sh)">
  <path d="M112 92 Q112 78 128 78 L250 78 Q266 78 266 94 L266 118 L112 118 Z" fill="${d}"/>
  <path d="M104 118 L272 118 L280 192 Q282 204 270 204 L108 204 Q96 204 98 192 L104 118 Z" fill="${m}"/>
</g>
<path d="M132 128 L246 128 L250 176 L128 176 Z" fill="${C.glass}" opacity="0.9"/>
<path d="M266 124 L284 146 L284 176 L266 176 Z" fill="${C.glass}"/>
<rect x="98" y="182" width="178" height="12" fill="${a}"/>
<text x="190" y="193" font-family="sans-serif" font-size="9" font-weight="700" letter-spacing="1.5" fill="#FFFFFF" text-anchor="middle">KEKE BRANDING</text>
<circle cx="128" cy="206" r="26" fill="#1B2731"/><circle cx="128" cy="206" r="12" fill="#8C979E"/>
<circle cx="264" cy="206" r="23" fill="#1B2731"/><circle cx="264" cy="206" r="11" fill="#8C979E"/>`,
};

Object.assign(shapes, {
  frame: (m, a, d) => `${ground(254, 126)}
<g filter="url(#sh)">
  <rect x="96" y="42" width="208" height="168" rx="5" fill="${C.woodDark}"/>
  <rect x="106" y="52" width="188" height="148" rx="3" fill="${m}"/>
  <rect x="118" y="64" width="164" height="124" fill="#FFFFFF"/>
</g>
<rect x="124" y="70" width="152" height="112" fill="#DCEEFB"/>
<circle cx="242" cy="100" r="18" fill="${C.gold}"/>
<path d="M124 170 L166 126 L196 158 L224 132 L276 178 L276 182 L124 182 Z" fill="${C.blue}" opacity="0.85"/>
<g filter="url(#sh)"><rect x="146" y="220" width="108" height="32" rx="6" fill="url(#metal)"/></g>
<rect x="160" y="229" width="80" height="6" rx="3" fill="#6C767C"/>
<rect x="172" y="241" width="56" height="5" rx="2.5" fill="#8B949A"/>`,

  trophy: (m, a, d) => `${ground(254, 110)}
<path d="M154 70 C118 70 112 114 148 122" fill="none" stroke="${C.gold}" stroke-width="9" stroke-linecap="round"/>
<path d="M246 70 C282 70 288 114 252 122" fill="none" stroke="${C.gold}" stroke-width="9" stroke-linecap="round"/>
<g filter="url(#sh)"><path d="M156 60 L244 60 L236 110 Q200 152 164 110 Z" fill="${C.gold}"/></g>
<path d="M156 60 L244 60 L241 84 L159 84 Z" fill="${C.goldDark}" opacity="0.5"/>
<path d="M200 88 L206 101 L220 103 L210 113 L213 127 L200 120 L187 127 L190 113 L180 103 L194 101 Z" fill="#FFFFFF" opacity="0.9"/>
<rect x="192" y="150" width="16" height="30" fill="${C.goldDark}"/>
<g filter="url(#sh)"><path d="M164 180 L236 180 L246 212 L154 212 Z" fill="${C.woodDark}"/></g>
<rect x="166" y="186" width="68" height="18" rx="4" fill="url(#metal)"/>
<rect x="176" y="192" width="48" height="6" rx="3" fill="#6C767C"/>`,

  plaque: (m, a, d) => `${ground(256, 116)}
<path d="M178 244 L178 288 L200 272 L222 288 L222 244 Z" fill="${a}"/>
<g filter="url(#sh)"><path d="M124 44 L276 44 Q288 44 288 56 L288 244 Q288 254 278 254 L122 254 Q112 254 112 244 L112 56 Q112 44 124 44 Z" fill="${C.wood}"/></g>
<path d="M124 44 L276 44 Q288 44 288 56 L288 74 L112 74 L112 56 Q112 44 124 44 Z" fill="${C.woodDark}" opacity="0.55"/>
<g filter="url(#sh)"><rect x="136" y="92" width="128" height="112" rx="7" fill="url(#metal)"/></g>
<circle cx="200" cy="122" r="15" fill="${C.woodDark}" opacity="0.55"/>
<path d="M200 114 L203 120 L210 121 L205 126 L206 133 L200 130 L194 133 L195 126 L190 121 L197 120 Z" fill="#FFFFFF" opacity="0.9"/>
<g fill="#6C767C"><rect x="154" y="150" width="92" height="8" rx="4"/><rect x="164" y="166" width="72" height="7" rx="3.5"/><rect x="176" y="181" width="48" height="6" rx="3"/></g>`,

  nameTag: (m, a, d) => `${ground(248, 110)}
<rect x="192" y="64" width="16" height="34" rx="6" fill="${C.silverDark}"/>
<rect x="176" y="56" width="48" height="16" rx="8" fill="${C.silverDark}"/>
<g filter="url(#sh)"><rect x="116" y="96" width="168" height="96" rx="12" fill="#F4F6F7" stroke="${m}" stroke-width="5"/></g>
<circle cx="152" cy="134" r="19" fill="${a}"/>
<text x="152" y="141" font-family="sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">K</text>
<g fill="${C.ink}"><rect x="184" y="120" width="82" height="11" rx="5.5"/><rect x="184" y="139" width="58" height="8" rx="4"/></g>
<rect x="140" y="166" width="120" height="7" rx="3.5" fill="#C9D2D8"/>
<rect x="116" y="212" width="168" height="10" rx="5" fill="${m}" opacity="0.9"/>`,

  sign: (m, a, d) => `${ground(258, 140)}
<rect x="86" y="196" width="16" height="62" rx="4" fill="${C.silverDark}"/>
<rect x="298" y="196" width="16" height="62" rx="4" fill="${C.silverDark}"/>
<g filter="url(#sh)"><rect x="54" y="66" width="292" height="130" rx="12" fill="${m}"/></g>
<rect x="68" y="80" width="264" height="102" rx="7" fill="none" stroke="${a}" stroke-width="4"/>
<text x="200" y="126" font-family="sans-serif" font-size="34" font-weight="800" letter-spacing="4" fill="#FFFFFF" text-anchor="middle">YOUR SHOP</text>
<text x="200" y="156" font-family="sans-serif" font-size="15" letter-spacing="5" fill="#FFFFFF" opacity="0.85" text-anchor="middle">SALES &amp; SERVICES</text>
<g><circle cx="96" cy="56" r="9" fill="${C.gold}"/><circle cx="200" cy="56" r="9" fill="${C.gold}"/><circle cx="304" cy="56" r="9" fill="${C.gold}"/></g>`,

  letters3d: (m, a, d) => `${ground(240, 130)}
<rect x="72" y="52" width="256" height="150" rx="10" fill="#FFFFFF" opacity="0.65"/>
<g font-family="sans-serif" font-weight="800" font-size="96" text-anchor="middle">
  <text x="206" y="166" fill="${d}">3D</text>
  <text x="200" y="160" fill="${m}">3D</text>
</g>
<rect x="112" y="188" width="176" height="12" rx="6" fill="${a}"/>
<rect x="140" y="212" width="120" height="8" rx="4" fill="${C.silverDark}" opacity="0.7"/>`,

  lightBox: (m, a, d) => `${ground(248, 126)}
<ellipse cx="200" cy="150" rx="150" ry="96" fill="url(#glow)"/>
<g filter="url(#sh)"><rect x="100" y="80" width="200" height="132" rx="12" fill="#FFFFFF" stroke="${C.silverLight}" stroke-width="3"/></g>
<rect x="114" y="94" width="172" height="104" rx="8" fill="${m}" opacity="0.10"/>
<text x="200" y="144" font-family="sans-serif" font-size="38" font-weight="800" letter-spacing="6" fill="${m}" text-anchor="middle">OPEN</text>
<text x="200" y="176" font-family="sans-serif" font-size="14" letter-spacing="4" fill="${a}" text-anchor="middle">SHOP LIGHT BOX</text>
<rect x="88" y="112" width="14" height="68" rx="5" fill="${C.silverDark}"/>
<rect x="298" y="112" width="14" height="68" rx="5" fill="${C.silverDark}"/>
<path d="M116 62 L104 44 M200 56 L200 36 M284 62 L296 44" stroke="${C.gold}" stroke-width="5" stroke-linecap="round" opacity="0.75"/>`,

  book: (m, a, d, txt = "EXERCISE BOOK") => `${ground(262, 118)}
<rect x="126" y="52" width="164" height="212" rx="5" fill="#EDEFF1"/>
<g filter="url(#sh)"><rect x="112" y="42" width="168" height="214" rx="5" fill="${m}"/></g>
<g fill="${C.silverDark}">${[56,84,112,140,168,196,224].map(y=>`<rect x="94" y="${y}" width="30" height="10" rx="5"/>`).join("")}</g>
<rect x="136" y="66" width="124" height="82" rx="5" fill="#FFFFFF"/>
<g fill="${C.ink}"><rect x="152" y="84" width="92" height="9" rx="4.5"/><rect x="152" y="102" width="72" height="7" rx="3.5"/></g>
<g fill="#C9D2D8"><rect x="152" y="120" width="92" height="6" rx="3"/></g>
<text x="198" y="188" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="#FFFFFF" text-anchor="middle">${txt}</text>
<rect x="140" y="204" width="112" height="7" rx="3.5" fill="#FFFFFF" opacity="0.7"/>
<rect x="112" y="232" width="168" height="10" fill="${a}" opacity="0.9"/>`,

  mug: (m, a, d) => `${ground(252, 118)}
<path d="M256 128 C302 130 308 198 256 202" fill="none" stroke="#FFFFFF" stroke-width="17" stroke-linecap="round"/>
<path d="M256 128 C302 130 308 198 256 202" fill="none" stroke="${C.silverLight}" stroke-width="3" stroke-linecap="round"/>
<g filter="url(#sh)"><rect x="144" y="92" width="112" height="130" rx="12" fill="#FFFFFF" stroke="${C.silverLight}" stroke-width="2"/></g>
<ellipse cx="200" cy="94" rx="56" ry="11" fill="#EDEFEE"/>
<rect x="162" y="118" width="76" height="80" rx="8" fill="${m}" opacity="0.95"/>
<circle cx="200" cy="146" r="15" fill="#FFFFFF" opacity="0.95"/>
<rect x="176" y="170" width="48" height="7" rx="3.5" fill="#FFFFFF" opacity="0.95"/>`,

  pen: (m, a, d) => `${ground(250, 130)}
<g transform="rotate(-38 200 150)" filter="url(#sh)">
  <rect x="118" y="128" width="184" height="26" rx="13" fill="${m}"/>
  <rect x="118" y="128" width="70" height="26" rx="13" fill="${d}"/>
  <rect x="180" y="128" width="14" height="26" fill="${a}"/>
  <path d="M302 132 L332 141 L302 150 Z" fill="${C.silverLight}"/>
  <rect x="140" y="120" width="52" height="10" rx="5" fill="${C.silverDark}"/>
</g>
<text x="200" y="240" font-family="sans-serif" font-size="14" letter-spacing="3" fill="${C.silverDark}" text-anchor="middle">BRANDED PEN</text>`,

  box: (m, a, d) => `${ground(256, 132)}
<g filter="url(#sh)">
  <path d="M120 120 L200 88 L280 120 L280 220 L200 252 L120 220 Z" fill="${m}"/>
  <path d="M120 120 L200 152 L280 120 L200 88 Z" fill="#FFFFFF" opacity="0.28"/>
  <path d="M200 152 L200 252" stroke="${d}" stroke-width="3" opacity="0.6"/>
</g>
<path d="M160 104 L240 136 L240 156 L160 124 Z" fill="${a}" opacity="0.9"/>
<rect x="146" y="172" width="60" height="40" rx="4" fill="#FFFFFF" opacity="0.95"/>
<rect x="154" y="182" width="44" height="6" rx="3" fill="${C.ink}"/><rect x="154" y="194" width="30" height="5" rx="2.5" fill="${C.silver}"/>`,
});

// ---------- card exports ----------
const cards = [
  ["tshirt", "shirt", "blue", C.blue, C.coral, C.blueDark],
  ["hoodie", "hoodie", "silver", C.silverDark, C.coral, "#3F4B52"],
  ["cap", "cap", "cream", C.blue, C.coral, C.blueDark],
  ["pillow", "pillow", "coral", C.coralLight, C.blue, C.coralDark],
  ["nylon", "nylon", "blue", C.blue, C.coral, C.blueDark],
  ["shopping-bag", "tote", "cream", C.coral, C.blue, C.coralDark],
  ["uniform", "uniform", "silver", C.blue, C.coral, C.blueDark],
  ["bulk-shirts", "bulkShirts", "blue", C.blue, C.coral, C.blueDark],
  ["flyers", "flyer", "blue", C.blue, C.coral, C.blueDark],
  ["stickers", "sticker", "coral", C.coral, C.blue, C.coralDark],
  ["wedding-cards", "cards", "coral", C.coralDark, C.gold, C.blueDark],
  ["rollup-banners", "rollup", "silver", C.blue, C.coral, C.blueDark],
  ["posters", "poster", "blue", C.blue, C.coral, C.blueDark],
  ["backdrops", "backdrop", "ink", C.ink, C.coral, "#000000"],
  ["vehicle-branding", "van", "blue", C.blue, C.coral, C.blueDark],
  ["car-stickers", "car", "cream", C.coral, C.blue, C.coralDark],
  ["bus-branding", "bus", "blue", C.blue, C.coral, C.blueDark],
  ["keke-branding", "keke", "silver", C.blue, C.coral, C.blueDark],
  ["picture-framing", "frame", "cream", C.wood, C.gold, C.woodDark],
  ["awards", "trophy", "blue", C.blue, C.coral, C.blueDark],
  ["plaques", "plaque", "cream", C.wood, C.coral, C.woodDark],
  ["name-tags", "nameTag", "silver", C.blue, C.coral, C.blueDark],
  ["business-cards", "cards", "blue", C.blue, C.coral, C.blueDark],
  ["jotters", "book", "blue", C.blue, C.coral, C.blueDark],
  ["exercise-books", "book", "coral", C.coral, C.blue, C.coralDark],
  ["shop-signs", "sign", "blue", C.blue, C.gold, C.blueDark],
  ["letters-3d", "letters3d", "cream", C.blue, C.coral, C.blueDark],
  ["light-boxes", "lightBox", "ink", C.blue, C.gold, C.blueDark],
  ["branded-mugs", "mug", "cream", C.blue, C.coral, C.blueDark],
  ["branded-pens", "pen", "silver", C.blue, C.coral, C.blueDark],
  ["packaging", "box", "cream", C.coral, C.blue, C.coralDark],
];

for (const [name, shape, bg, m, a, d] of cards) {
  let extra;
  if (shape === "cards") extra = name === "wedding-cards";
  if (shape === "book") extra = name === "jotters" ? "JOTTER" : "EXERCISE BOOK";
  writeCard(`${name}.svg`, shapes[shape](m, a, d, extra), { bg, meta: name.replace(/-/g, " ") });
}

// plain (before) versions for before/after
const plain = { m: "#F1F3F4", a: "#DFE3E6", d: "#C7CDD1" };
writeCard("before-shirt.svg", shapes.shirt(plain.m, plain.a, plain.d), { bg: "silver", meta: "plain t-shirt" });
writeCard("after-shirt.svg", shapes.shirt(C.blue, C.coral, C.blueDark), { bg: "blue", meta: "printed t-shirt" });
writeCard("before-bag.svg", shapes.tote(plain.m, plain.a, plain.d), { bg: "silver", meta: "plain tote bag" });
writeCard("after-bag.svg", shapes.tote(C.coral, C.blue, C.coralDark), { bg: "coral", meta: "printed tote bag" });
writeCard("before-van.svg", shapes.van(plain.m, "#DFE3E6", "#C7CDD1"), { bg: "silver", meta: "plain van" });
writeCard("after-van.svg", shapes.van(C.blue, C.coral, C.blueDark), { bg: "blue", meta: "branded van" });
writeCard("before-sign.svg", shapes.lightBox("#E7EAEC", "#DFE3E6", "#C7CDD1"), { bg: "silver", meta: "plain light box" });
writeCard("after-sign.svg", shapes.lightBox(C.blue, C.gold, C.blueDark), { bg: "ink", meta: "illuminated light box" });

// service card images
const svc = [
  ["svc-transfer", "shirt", "blue", C.blue, C.coral, C.blueDark],
  ["svc-screen", "tote", "cream", C.coral, C.blue, C.coralDark],
  ["svc-banners", "flyer", "blue", C.blue, C.coral, C.blueDark],
  ["svc-van", "van", "silver", C.blue, C.coral, C.blueDark],
  ["svc-engraving", "trophy", "cream", C.blue, C.gold, C.blueDark],
  ["svc-signage", "lightBox", "ink", C.blue, C.gold, C.blueDark],
  ["svc-others", "mug", "coral", C.coral, C.blue, C.coralDark],
];
for (const [name, shape, bg, m, a, d] of svc) {
  writeCard(`${name}.svg`, shapes[shape](m, a, d), { bg, meta: name });
}

// ---------- hero images (1200x800, product on the right) ----------
function hero(name, shape, bg1, bg2, deco = C.coral) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" role="img" aria-label="${name}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0B1620" flood-opacity="0.25"/></filter>
  <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F5F6"/><stop offset="0.5" stop-color="#C7D0D4"/><stop offset="1" stop-color="#9AA6AC"/></linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1200" height="800" fill="url(#bg)"/>
<g fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2">
  <circle cx="150" cy="640" r="130"/><circle cx="1090" cy="130" r="230"/><circle cx="980" cy="720" r="90"/>
</g>
<circle cx="130" cy="150" r="52" fill="${deco}" opacity="0.9"/>
<rect x="90" y="700" width="180" height="16" rx="8" fill="${deco}" opacity="0.85"/>
<g transform="translate(520,120) scale(1.95)">${shape}</g>
</svg>`;
  writeFileSync(join(OUT, name), svg);
}

hero("hero-transfer.svg", shapes.shirt(C.blue, C.coral, C.blueDark), "#0F3E60", "#1E6FA9", C.coral);
hero("hero-screen.svg", shapes.tote(C.coral, C.blue, C.coralDark), "#7A3A26", "#E4795B", C.blue);
hero("hero-banners.svg", shapes.rollup(C.blue, C.coral, C.blueDark), "#0F3E60", "#2E88C7", C.coral);
hero("hero-van.svg", shapes.van(C.blue, C.coral, C.blueDark), "#12212E", "#27485F", C.coral);
hero("hero-signage.svg", shapes.sign(C.blue, C.gold, C.blueDark), "#14507E", "#1E6FA9", C.gold);

console.log("Generated images in", OUT);
