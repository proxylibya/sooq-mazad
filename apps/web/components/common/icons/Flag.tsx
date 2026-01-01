import React from 'react';

interface FlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fallbackText?: string;
}

// خريطة أعلام البلدان مع SVG مضمنة
const flagSVGs: { [key: string]: string } = {
  LY: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#E70013"/>
    <rect y="200" width="900" height="200" fill="#000"/>
    <rect y="400" width="900" height="200" fill="#239E46"/>
    <g transform="translate(450,300)">
      <circle r="60" fill="none" stroke="#fff" stroke-width="8"/>
      <path d="M-20,-40 L20,-40 L20,40 L-20,40 Z" fill="#fff"/>
      <circle r="15" fill="#fff" transform="translate(0,-15)"/>
    </g>
  </svg>`,

  EG: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
    <g transform="translate(450,300)" fill="#C8AA6E">
      <circle r="50"/>
      <path d="M-30,-20 L30,-20 L20,20 L-20,20 Z"/>
    </g>
  </svg>`,

  SA: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#006C35"/>
    <g transform="translate(450,300)" fill="#fff">
      <text x="0" y="0" text-anchor="middle" font-size="80" font-family="Arial">لا إله إلا الله</text>
      <text x="0" y="60" text-anchor="middle" font-size="60" font-family="Arial">محمد رسول الله</text>
      <path d="M-100,80 L-80,100 L-60,80 L-40,100 L-20,80 L0,100 L20,80 L40,100 L60,80 L80,100 L100,80" stroke="#fff" stroke-width="4" fill="none"/>
    </g>
  </svg>`,

  AE: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#00732F"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
    <rect width="300" height="600" fill="#FF0000"/>
  </svg>`,

  QA: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#8D1B3D"/>
    <polygon points="300,0 900,0 900,600 300,600 450,550 300,500 450,450 300,400 450,350 300,300 450,250 300,200 450,150 300,100 450,50" fill="#fff"/>
  </svg>`,

  KW: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#007A3D"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#CE1126"/>
    <polygon points="0,0 0,600 300,400 300,200" fill="#000"/>
  </svg>`,

  BH: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#CE1126"/>
    <polygon points="300,0 900,0 900,600 300,600 400,550 300,500 400,450 300,400 400,350 300,300 400,250 300,200 400,150 300,100 400,50" fill="#fff"/>
  </svg>`,

  OM: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#fff"/>
    <rect y="200" width="900" height="200" fill="#CE1126"/>
    <rect y="400" width="900" height="200" fill="#009639"/>
    <rect width="300" height="600" fill="#CE1126"/>
    <g transform="translate(150,300)" fill="#fff">
      <circle r="80"/>
      <path d="M-40,-40 L40,-40 L40,40 L-40,40 Z"/>
    </g>
  </svg>`,

  JO: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#000"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#007A3D"/>
    <polygon points="0,0 0,600 400,300" fill="#CE1126"/>
    <g transform="translate(200,300)" fill="#fff">
      <polygon points="-20,0 -6,-18 6,-18 20,0 6,18 -6,18"/>
    </g>
  </svg>`,

  LB: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="150" fill="#ED1C24"/>
    <rect y="150" width="900" height="300" fill="#fff"/>
    <rect y="450" width="900" height="150" fill="#ED1C24"/>
    <g transform="translate(450,300)" fill="#00A651">
      <path d="M0,-80 L-30,-40 L-60,-60 L-40,-20 L-60,0 L-30,20 L0,0 L30,20 L60,0 L40,-20 L60,-60 L30,-40 Z"/>
    </g>
  </svg>`,

  SY: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
    <g transform="translate(300,300)" fill="#007A3D">
      <polygon points="-15,0 -4.5,-14 4.5,-14 15,0 4.5,14 -4.5,14"/>
    </g>
    <g transform="translate(600,300)" fill="#007A3D">
      <polygon points="-15,0 -4.5,-14 4.5,-14 15,0 4.5,14 -4.5,14"/>
    </g>
  </svg>`,

  IQ: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
    <g transform="translate(450,300)" fill="#007A3D">
      <text x="0" y="0" text-anchor="middle" font-size="60" font-family="Arial">الله أكبر</text>
    </g>
  </svg>`,

  MA: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#C1272D"/>
    <g transform="translate(450,300)" fill="#006233" stroke="#006233" stroke-width="8">
      <polygon points="0,-80 23,-25 76,-25 38,8 49,61 0,28 -49,61 -38,8 -76,-25 -23,-25"/>
    </g>
  </svg>`,

  DZ: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="450" height="600" fill="#006233"/>
    <rect x="450" width="450" height="600" fill="#fff"/>
    <g transform="translate(450,300)" fill="#D21034">
      <circle r="80" fill="none" stroke="#D21034" stroke-width="8"/>
      <polygon points="20,-40 35,-12 63,-12 42,8 49,36 20,20 -9,36 -2,8 -23,-12 5,-12"/>
    </g>
  </svg>`,

  TN: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#E70013"/>
    <circle cx="450" cy="300" r="120" fill="#fff"/>
    <g transform="translate(450,300)" fill="#E70013">
      <circle r="80" fill="none" stroke="#E70013" stroke-width="8"/>
      <polygon points="20,-40 35,-12 63,-12 42,8 49,36 20,20 -9,36 -2,8 -23,-12 5,-12"/>
    </g>
  </svg>`,

  US: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#B22234"/>
    <rect y="46" width="900" height="46" fill="#fff"/>
    <rect y="138" width="900" height="46" fill="#fff"/>
    <rect y="230" width="900" height="46" fill="#fff"/>
    <rect y="322" width="900" height="46" fill="#fff"/>
    <rect y="414" width="900" height="46" fill="#fff"/>
    <rect y="506" width="900" height="46" fill="#fff"/>
    <rect width="360" height="315" fill="#3C3B6E"/>
  </svg>`,

  GB: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#012169"/>
    <path d="M0,0 L900,600 M900,0 L0,600" stroke="#fff" stroke-width="60"/>
    <path d="M0,0 L900,600 M900,0 L0,600" stroke="#C8102E" stroke-width="40"/>
    <path d="M450,0 L450,600 M0,300 L900,300" stroke="#fff" stroke-width="100"/>
    <path d="M450,0 L450,600 M0,300 L900,300" stroke="#C8102E" stroke-width="60"/>
  </svg>`,

  DE: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#000"/>
    <rect y="200" width="900" height="200" fill="#DD0000"/>
    <rect y="400" width="900" height="200" fill="#FFCE00"/>
  </svg>`,

  FR: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="600" fill="#002395"/>
    <rect x="300" width="300" height="600" fill="#fff"/>
    <rect x="600" width="300" height="600" fill="#ED2939"/>
  </svg>`,

  IT: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="600" fill="#009246"/>
    <rect x="300" width="300" height="600" fill="#fff"/>
    <rect x="600" width="300" height="600" fill="#CE2B37"/>
  </svg>`,

  TR: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#E30A17"/>
    <g transform="translate(360,300)" fill="#fff">
      <circle r="80" fill="none" stroke="#fff" stroke-width="12"/>
      <circle r="64" fill="#E30A17"/>
      <polygon points="100,-30 115,-9 136,-9 120,5 125,26 100,15 75,26 80,5 64,-9 85,-9"/>
    </g>
  </svg>`,

  CN: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#DE2910"/>
    <g fill="#FFDE00">
      <polygon points="150,120 180,90 210,120 180,150" transform="translate(0,0)"/>
      <polygon points="300,60 315,45 330,60 315,75" transform="translate(0,0)"/>
      <polygon points="360,90 375,75 390,90 375,105" transform="translate(0,0)"/>
      <polygon points="360,150 375,135 390,150 375,165" transform="translate(0,0)"/>
      <polygon points="300,180 315,165 330,180 315,195" transform="translate(0,0)"/>
    </g>
  </svg>`,

  JP: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#fff"/>
    <circle cx="450" cy="300" r="108" fill="#BC002D"/>
  </svg>`,

  SD: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
    <polygon points="0,0 0,600 300,300" fill="#007A3D"/>
  </svg>`,

  YE: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
  </svg>`,

  PS: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#000"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#007A3D"/>
    <polygon points="0,0 0,600 400,300" fill="#CE1126"/>
  </svg>`,

  MR: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#00A651"/>
    <g transform="translate(450,250)" fill="#FFD700">
      <circle r="60" fill="none" stroke="#FFD700" stroke-width="8"/>
      <polygon points="0,-40 12,-12 40,-12 20,8 25,36 0,20 -25,36 -20,8 -40,-12 -12,-12"/>
    </g>
  </svg>`,

  SO: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#4189DD"/>
    <g transform="translate(450,300)" fill="#fff">
      <polygon points="0,-80 23,-25 76,-25 38,8 49,61 0,28 -49,61 -38,8 -76,-25 -23,-25"/>
    </g>
  </svg>`,

  DJ: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="300" fill="#6AB2DD"/>
    <rect y="300" width="900" height="300" fill="#12AD2B"/>
    <polygon points="0,0 0,600 400,300" fill="#fff"/>
    <g transform="translate(200,300)" fill="#D7141A">
      <polygon points="0,-40 12,-12 40,-12 20,8 25,36 0,20 -25,36 -20,8 -40,-12 -12,-12"/>
    </g>
  </svg>`,

  KM: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="150" fill="#FFD100"/>
    <rect y="150" width="900" height="150" fill="#fff"/>
    <rect y="300" width="900" height="150" fill="#CE1126"/>
    <rect y="450" width="900" height="150" fill="#3D5AA1"/>
    <polygon points="0,0 0,600 400,300" fill="#239E46"/>
    <g transform="translate(200,300)" fill="#fff">
      <circle r="60" fill="none" stroke="#fff" stroke-width="4"/>
      <polygon points="0,-30 8,-9 26,-9 13,3 17,21 0,12 -17,21 -13,3 -26,-9 -8,-9"/>
    </g>
  </svg>`,

  IR: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#239F40"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#DA0000"/>
    <g transform="translate(450,300)" fill="#DA0000">
      <circle r="50" fill="none" stroke="#DA0000" stroke-width="6"/>
      <text x="0" y="0" text-anchor="middle" font-size="40" font-family="Arial">الله</text>
    </g>
  </svg>`,

  AF: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="600" fill="#000"/>
    <rect x="300" width="300" height="600" fill="#D32011"/>
    <rect x="600" width="300" height="600" fill="#007A36"/>
    <g transform="translate(450,300)" fill="#FFD700">
      <circle r="40"/>
      <text x="0" y="0" text-anchor="middle" font-size="20" font-family="Arial">الله أكبر</text>
    </g>
  </svg>`,

  PK: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#01411C"/>
    <rect width="270" height="600" fill="#fff"/>
    <g transform="translate(585,300)" fill="#fff">
      <circle r="80" fill="none" stroke="#fff" stroke-width="8"/>
      <circle r="64" fill="#01411C"/>
      <polygon points="100,-30 115,-9 136,-9 120,5 125,26 100,15 75,26 80,5 64,-9 85,-9"/>
    </g>
  </svg>`,

  IN: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#FF9933"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#138808"/>
    <g transform="translate(450,300)" fill="#000080">
      <circle r="60" fill="none" stroke="#000080" stroke-width="4"/>
      <circle r="6"/>
      <g stroke="#000080" stroke-width="2">
        <line x1="0" y1="-60" x2="0" y2="-40"/>
        <line x1="0" y1="40" x2="0" y2="60"/>
        <line x1="-60" y1="0" x2="-40" y2="0"/>
        <line x1="40" y1="0" x2="60" y2="0"/>
      </g>
    </g>
  </svg>`,

  CA: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="225" height="600" fill="#FF0000"/>
    <rect x="225" width="450" height="600" fill="#fff"/>
    <rect x="675" width="225" height="600" fill="#FF0000"/>
    <g transform="translate(450,300)" fill="#FF0000">
      <path d="M0,-80 L-20,-40 L-40,-50 L-20,-20 L-30,0 L0,-10 L30,0 L20,-20 L40,-50 L20,-40 Z"/>
      <rect x="-5" y="-10" width="10" height="60"/>
    </g>
  </svg>`,

  ES: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="150" fill="#AA151B"/>
    <rect y="150" width="900" height="300" fill="#F1BF00"/>
    <rect y="450" width="900" height="150" fill="#AA151B"/>
    <g transform="translate(300,300)" fill="#AA151B">
      <rect x="-40" y="-60" width="80" height="120" fill="#F1BF00" stroke="#AA151B" stroke-width="4"/>
    </g>
  </svg>`,

  NL: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#AE1C28"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#21468B"/>
  </svg>`,

  BE: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="600" fill="#000"/>
    <rect x="300" width="300" height="600" fill="#FFD700"/>
    <rect x="600" width="300" height="600" fill="#ED2939"/>
  </svg>`,

  CH: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#DA020E"/>
    <g transform="translate(450,300)" fill="#fff">
      <rect x="-60" y="-20" width="120" height="40"/>
      <rect x="-20" y="-60" width="40" height="120"/>
    </g>
  </svg>`,

  AT: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#ED2939"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#ED2939"/>
  </svg>`,

  SE: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#006AA7"/>
    <rect x="200" width="100" height="600" fill="#FECC00"/>
    <rect y="250" width="900" height="100" fill="#FECC00"/>
  </svg>`,

  NO: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#EF2B2D"/>
    <rect x="200" width="100" height="600" fill="#fff"/>
    <rect y="250" width="900" height="100" fill="#fff"/>
    <rect x="225" width="50" height="600" fill="#002868"/>
    <rect y="275" width="900" height="50" fill="#002868"/>
  </svg>`,

  DK: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#C60C30"/>
    <rect x="200" width="100" height="600" fill="#fff"/>
    <rect y="250" width="900" height="100" fill="#fff"/>
  </svg>`,

  FI: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#fff"/>
    <rect x="200" width="100" height="600" fill="#003580"/>
    <rect y="250" width="900" height="100" fill="#003580"/>
  </svg>`,

  RU: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#fff"/>
    <rect y="200" width="900" height="200" fill="#0039A6"/>
    <rect y="400" width="900" height="200" fill="#D52B1E"/>
  </svg>`,

  KR: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#fff"/>
    <g transform="translate(450,300)">
      <circle r="80" fill="#CD2E3A"/>
      <path d="M0,-80 A80,80 0 0,1 0,80 A40,40 0 0,1 0,-80 Z" fill="#0047A0"/>
      <path d="M0,-80 A80,80 0 0,0 0,80 A40,40 0 0,0 0,-80 Z" fill="#CD2E3A"/>
      <circle r="40" fill="#0047A0"/>
    </g>
  </svg>`,

  AU: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#012169"/>
    <rect width="450" height="300" fill="#012169"/>
    <g fill="#fff">
      <polygon points="150,75 165,105 195,105 173,125 180,155 150,135 120,155 127,125 105,105 135,105"/>
      <polygon points="750,150 760,170 780,170 765,185 770,205 750,190 730,205 735,185 720,170 740,170"/>
      <polygon points="600,300 610,320 630,320 615,335 620,355 600,340 580,355 585,335 570,320 590,320"/>
      <polygon points="750,400 760,420 780,420 765,435 770,455 750,440 730,455 735,435 720,420 740,420"/>
      <polygon points="675,450 685,470 705,470 690,485 695,505 675,490 655,505 660,485 645,470 665,470"/>
    </g>
  </svg>`,

  NZ: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#012169"/>
    <rect width="450" height="300" fill="#012169"/>
    <g fill="#fff">
      <polygon points="600,150 615,180 645,180 623,200 630,230 600,210 570,230 577,200 555,180 585,180"/>
      <polygon points="750,200 760,220 780,220 765,235 770,255 750,240 730,255 735,235 720,220 740,220"/>
      <polygon points="675,300 685,320 705,320 690,335 695,355 675,340 655,355 660,335 645,320 665,320"/>
      <polygon points="750,400 760,420 780,420 765,435 770,455 750,440 730,455 735,435 720,420 740,420"/>
    </g>
  </svg>`,

  BR: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#009739"/>
    <polygon points="450,50 750,300 450,550 150,300" fill="#FEDD00"/>
    <circle cx="450" cy="300" r="120" fill="#012169"/>
    <g transform="translate(450,300)" fill="#fff">
      <text x="0" y="0" text-anchor="middle" font-size="30" font-family="Arial">ORDEM E PROGRESSO</text>
    </g>
  </svg>`,

  MX: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="600" fill="#006847"/>
    <rect x="300" width="300" height="600" fill="#fff"/>
    <rect x="600" width="300" height="600" fill="#CE1126"/>
    <g transform="translate(450,300)" fill="#8B4513">
      <circle r="60"/>
      <path d="M0,-40 L-20,-20 L-30,0 L-20,20 L0,40 L20,20 L30,0 L20,-20 Z" fill="#228B22"/>
    </g>
  </svg>`,

  AR: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#74ACDF"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#74ACDF"/>
    <g transform="translate(450,300)" fill="#F6B40E">
      <circle r="40" fill="none" stroke="#F6B40E" stroke-width="4"/>
      <g fill="#8B4513">
        <rect x="-2" y="-30" width="4" height="20"/>
        <rect x="-2" y="10" width="4" height="20"/>
      </g>
    </g>
  </svg>`,
};

// أسماء البلدان بالعربية
const countryNames: { [key: string]: string } = {
  LY: 'ليبيا',
  EG: 'مصر',
  SA: 'السعودية',
  AE: 'الإمارات العربية المتحدة',
  QA: 'قطر',
  KW: 'الكويت',
  BH: 'البحرين',
  OM: 'عُمان',
  JO: 'الأردن',
  LB: 'لبنان',
  SY: 'سوريا',
  IQ: 'العراق',
  MA: 'المغرب',
  DZ: 'الجزائر',
  TN: 'تونس',
  SD: 'السودان',
  YE: 'اليمن',
  PS: 'فلسطين',
  MR: 'موريتانيا',
  SO: 'الصومال',
  DJ: 'جيبوتي',
  KM: 'جزر القمر',
  IR: 'إيران',
  AF: 'أفغانستان',
  PK: 'باكستان',
  IN: 'الهند',
  TR: 'تركيا',
  US: 'الولايات المتحدة الأمريكية',
  CA: 'كندا',
  GB: 'المملكة المتحدة',
  DE: 'ألمانيا',
  FR: 'فرنسا',
  IT: 'إيطاليا',
  ES: 'إسبانيا',
  NL: 'هولندا',
  BE: 'بلجيكا',
  CH: 'سويسرا',
  AT: 'النمسا',
  SE: 'السويد',
  NO: 'النرويج',
  DK: 'الدنمارك',
  FI: 'فنلندا',
  RU: 'روسيا',
  CN: 'الصين',
  JP: 'اليابان',
  KR: 'كوريا الجنوبية',
  AU: 'أستراليا',
  NZ: 'نيوزيلندا',
  BR: 'البرازيل',
  MX: 'المكسيك',
  AR: 'الأرجنتين',
};

const Flag: React.FC<FlagProps> = ({ countryCode, size = 'md', className = '', fallbackText }) => {
  // تحديد الأحجام
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6',
  };

  const flagSVG = flagSVGs[countryCode.toUpperCase()];
  const countryName = countryNames[countryCode.toUpperCase()];
  const displayText = fallbackText || countryCode.toUpperCase();

  // إذا كان لدينا SVG مخصص، استخدمه (فوري بدون تأخير)
  if (flagSVG) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} inline-block overflow-hidden rounded-sm border border-gray-200`}
        title={countryName}
      >
        <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: flagSVG }} />
      </div>
    );
  }

  // النظام الاحتياطي - نص مع خلفية ملونة (فوري بدون تأخير)
  return (
    <div
      className={`${sizeClasses[size]} ${className} inline-flex items-center justify-center rounded-sm border border-gray-200 bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white`}
      title={countryName}
    >
      {displayText}
    </div>
  );
};

export default Flag;
