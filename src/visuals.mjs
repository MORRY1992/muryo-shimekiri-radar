// Original, dependency-free line drawings. Decorative SVG never replaces a text label.
const paths={
 calendar:'<rect x="4" y="6" width="24" height="23" rx="4"/><path d="M4 13h24M10 3v6M22 3v6m-11 9h3m4 0h3m-10 5h3"/>',
 clock:'<circle cx="16" cy="17" r="11"/><path d="M16 10v8l5 3M12 2h8M25 5l3 3"/>',
 gift:'<rect x="4" y="12" width="24" height="7" rx="2"/><path d="M7 19v10h18V19M16 12v17M16 12c-13 0-11-13-5-8 3 2 5 8 5 8Zm0 0c13 0 11-13 5-8-3 2-5 8-5 8Z"/>',
 ticket:'<path d="M3 8h26v6a3 3 0 0 0 0 6v6H3v-6a3 3 0 0 0 0-6V8Z"/><path d="M21 8v4m0 4v3m0 4v3M8 14h7m-7 5h5"/>',
 food:'<path d="M7 13h17v8a8 8 0 0 1-8 8h-1a8 8 0 0 1-8-8v-8Zm17 1h2a4 4 0 0 1 0 8h-2M11 9c-4-4 4-4 0-8m6 8c-4-4 4-4 0-8M4 29h24"/>',
 home:'<path d="m3 15 13-12 13 12M7 12v17h18V12M13 29V18h6v11"/><path d="m23 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
 travel:'<path d="m3 20 10-3 8-13c3-3 6-1 4 2l-6 12 8 7-2 2-10-4-5 5-3-1 3-7-7 2Z"/>',
 star:'<path d="m16 3 4 8 9 1-7 7 2 10-8-5-8 5 2-10-7-7 9-1 4-8Z"/>',
 screen:'<rect x="3" y="5" width="26" height="20" rx="3"/><path d="M11 30h10m-5-5v5M7 10h9m-9 5h5m9 0 3 3-3 3"/>',
 shop:'<path d="M4 12h24L25 4H7l-3 8Zm0 0v3c0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0v-3M6 19v10h20V19M13 29v-9h7v9"/>',
 paw:'<ellipse cx="16" cy="23" rx="8" ry="6"/><ellipse cx="5" cy="14" rx="3" ry="4"/><ellipse cx="12" cy="8" rx="3" ry="4"/><ellipse cx="21" cy="8" rx="3" ry="4"/><ellipse cx="28" cy="15" rx="3" ry="4"/>',
 check:'<path d="m7 16 6 6L26 8"/><path d="M28 18v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h13"/>',
 search:'<circle cx="14" cy="14" r="9"/><path d="m21 21 8 8"/>',
 bookmark:'<path d="M8 3h16v27l-8-5-8 5V3Z"/>',
 arrow:'<path d="M4 16h23M18 7l9 9-9 9"/>',
 radar:'<circle cx="16" cy="16" r="14"/><circle cx="16" cy="16" r="8"/><path d="m16 16 10-10M2 16h4m20 0h4M16 2v4m0 20v4"/><circle cx="23" cy="9" r="3" fill="currentColor" stroke="none"/>'
};
export function icon(name,cls=''){return `<svg class="icon ${cls}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]||paths.gift}</svg>`;}
export const categoryIcons={'食品・飲料':'food','日用品・生活用品':'home','旅行・鉄道・観光':'travel','キャラクター・エンタメ':'star','家電・デジタル':'screen','コンビニ・スーパー':'shop','ペット用品':'paw','その他':'gift'};
export const heroArt=`<svg class="hero-art" viewBox="0 0 350 230" fill="none" aria-hidden="true" focusable="false"><circle cx="176" cy="118" r="95" stroke="#b7bab1" stroke-dasharray="3 7"/><circle cx="176" cy="118" r="70" stroke="#d6d8cc"/><path d="M36 173h39m-20-20v39m234-154v20m-10-10h20" stroke="#e46d50" stroke-width="3"/><g transform="rotate(-12 150 115)"><rect x="73" y="49" width="155" height="143" rx="12" fill="#faf8f0" stroke="#23352f" stroke-width="2"/><path d="M73 86h155" stroke="#23352f" stroke-width="2"/><path d="M111 39v25m77-25v25" stroke="#23352f" stroke-width="7" stroke-linecap="round"/><path d="M97 106h28m15 0h28m15 0h21m-107 24h28m15 0h28m15 0h21m-107 24h28m15 0h28" stroke="#d6d8cc" stroke-width="7" stroke-linecap="round"/><circle cx="156" cy="130" r="19" fill="#ee765c"/><path d="m146 130 7 7 14-15" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g><g transform="rotate(13 236 160)"><path d="M185 132h115v21a10 10 0 0 0 0 20v21H185v-21a10 10 0 0 0 0-20v-21Z" fill="#e2e9b8" stroke="#23352f" stroke-width="2"/><path d="M270 132v62" stroke="#7b8862" stroke-dasharray="3 4"/><path d="M210 155h40m-40 13h27" stroke="#73805f" stroke-width="4" stroke-linecap="round"/></g><path d="m60 60 4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Z" fill="#e2e9b8" stroke="#23352f" stroke-width="1.5"/><circle cx="271" cy="53" r="7" fill="#ee765c"/></svg>`;
