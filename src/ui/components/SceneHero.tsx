import type { CSSProperties } from 'react';
import type { HeroView } from '../../core/types';

type SceneHeroProps = {
  hero: HeroView;
};

function OfficeScene() {
  return (
    <>
      <path fill="url(#hero-room)" d="M0 0h900v340H0Z" />
      <path fill="url(#hero-floor)" d="M0 340h900v110H0Z" />
      <path
        d="M0 380h900M0 420h900m180-80-60 110m200-110-20 110m200-110 20 110m200-110 60 110"
        stroke="#c3d5dd"
        opacity=".45"
      />
      <rect x="320" y="36" width="525" height="245" fill="#b7c7cc" />
      <rect x="330" y="46" width="505" height="225" fill="url(#hero-sky)" />
      <g fill="#dae6e8">
        <path d="M340 200h90v71h-90ZM445 160h80v111h-80ZM540 185h110v86H540ZM690 150h130v121H690Z" />
      </g>
      <g fill="#aecbd5" opacity=".65">
        <rect x="350" y="220" width="15" height="24" />
        <rect x="380" y="220" width="15" height="24" />
        <rect x="450" y="220" width="15" height="24" />
        <rect x="490" y="220" width="15" height="24" />
        <rect x="550" y="220" width="15" height="24" />
        <rect x="590" y="220" width="15" height="24" />
        <rect x="620" y="220" width="15" height="24" />
        <rect x="710" y="220" width="15" height="24" />
        <rect x="750" y="220" width="15" height="24" />
        <rect x="790" y="220" width="15" height="24" />
      </g>
      <path d="M500 42v234m170-234v234M330 158h505" stroke="#edf0ea" strokeWidth="10" />
      <path d="M320 30h45v270l-30-15-15 20Zm480 0h45v275l-20-20-25 10Z" fill="#ebf1eb" opacity=".85" />
      <path d="m350 278 440 0 110 172H250Z" fill="#fff8df" opacity=".35" />
      <rect x="36" y="45" width="220" height="135" rx="2" fill="#dccbac" stroke="#b29b7d" strokeWidth="5" />
      <g fill="#fffaf0">
        <rect x="53" y="65" width="74" height="46" transform="rotate(-3 53 65)" />
        <rect x="143" y="63" width="94" height="55" transform="rotate(3 143 63)" />
        <rect x="70" y="127" width="100" height="35" />
      </g>
      <rect x="45" y="243" width="220" height="90" rx="10" fill="#b5d1c9" />
      <rect x="30" y="294" width="250" height="40" rx="9" fill="#a2bfb7" />
      <path d="M50 334v17m210-17v17" stroke="#798d87" strokeWidth="7" />
      <path d="M318 326h250l24 17H295Z" fill="#c9ac81" />
      <path d="M314 343v64m260-64v64" stroke="#ac997c" strokeWidth="7" />
      <rect x="394" y="253" width="95" height="65" rx="3" fill="#738993" />
      <rect x="399" y="258" width="85" height="54" fill="#c2e2f1" />
      <path d="M440 318v9m-20 0h40" stroke="#72848d" strokeWidth="4" />
      <rect x="49" y="193" width="155" height="30" rx="2" fill="#fbfbf4" />
      <text x="126" y="214" textAnchor="middle" fill="#73aebc" fontSize="17" fontWeight="bold" letterSpacing="2">
        283 Production
      </text>
      <path d="M770 322h45l-7 55h-31Z" fill="#dcc7ae" />
      <path d="M793 332v-81m0 50-24-31m24 12 26-28" stroke="#80a485" strokeWidth="4" />
      <g fill="#a2c29b">
        <ellipse cx="781" cy="276" rx="9" ry="24" transform="rotate(-40 781 276)" />
        <ellipse cx="808" cy="263" rx="10" ry="25" transform="rotate(38 808 263)" />
        <ellipse cx="794" cy="246" rx="11" ry="26" />
      </g>
    </>
  );
}

function PracticeScene() {
  return (
    <>
      <rect width="900" height="450" fill="#eef8fc" />
      <rect y="340" width="900" height="110" fill="#e2d3b9" />
      <rect x="70" y="55" width="500" height="250" rx="4" fill="#cfe7f1" stroke="#a8cbd9" strokeWidth="6" />
      <rect x="85" y="70" width="470" height="220" fill="#e6f4f8" />
      <path d="M85 185h470M250 70v220M390 70v220" stroke="#f8fcfd" strokeWidth="7" />
      <rect x="610" y="60" width="220" height="250" fill="#f7fcfd" stroke="#c6dfe8" strokeWidth="5" />
      <rect x="635" y="86" width="170" height="115" fill="#d8edf5" />
      <path d="M650 170h140M650 150h100" stroke="#a9cddd" strokeWidth="5" />
      <rect x="610" y="310" width="240" height="12" rx="6" fill="#b4a184" />
      <rect x="55" y="310" width="500" height="12" rx="6" fill="#b4a184" />
      <rect x="70" y="326" width="220" height="24" rx="7" fill="#d7c3a5" />
      <path d="M90 350v55m180-55v55" stroke="#8fa39e" strokeWidth="7" />
      <rect x="350" y="350" width="72" height="60" rx="5" fill="#6d7d84" />
      <circle cx="386" cy="380" r="18" fill="#42535a" />
      <path d="m440 405 20-50h44l20 50" fill="none" stroke="#849da3" strokeWidth="5" />
      <circle cx="462" cy="336" r="12" fill="#f5ca58" opacity=".85" />
    </>
  );
}

function StudioScene() {
  return (
    <>
      <rect width="900" height="450" fill="#e8f2f6" />
      <rect y="345" width="900" height="105" fill="#d9c7ad" />
      <g fill="#c8dbe3" stroke="#b7ced8" strokeWidth="4">
        <rect x="20" y="35" width="120" height="280" />
        <rect x="150" y="35" width="120" height="280" />
        <rect x="610" y="35" width="120" height="280" />
        <rect x="740" y="35" width="120" height="280" />
      </g>
      <rect x="300" y="45" width="270" height="230" fill="#d5eaf2" stroke="#abcbd8" strokeWidth="6" />
      <rect x="315" y="60" width="240" height="200" fill="#eaf7fb" />
      <path d="M315 160h240M435 60v200" stroke="#f8fcfd" strokeWidth="6" />
      <rect x="330" y="285" width="210" height="95" rx="5" fill="#6f828b" />
      <rect x="345" y="300" width="180" height="60" fill="#9fbac5" />
      <circle cx="435" cy="330" r="18" fill="#d8eef6" />
      <path d="M360 390h150v18H360Z" fill="#5d7078" />
      <path d="M590 330h200l-25 90H615Z" fill="#bda98e" />
      <path d="M690 330v-95m-32 30 32-30 32 30" stroke="#5f8f9e" strokeWidth="7" />
      <rect x="676" y="225" width="28" height="42" rx="12" fill="#547984" />
      <path d="M676 245h28" stroke="#d5eef6" strokeWidth="3" />
      <rect x="40" y="335" width="220" height="28" rx="7" fill="#c7b493" />
      <path d="M65 363v55m170-55v55" stroke="#8a9b98" strokeWidth="7" />
    </>
  );
}

function HomeScene() {
  return (
    <>
      <rect width="900" height="450" fill="#fdf7f1" />
      <rect y="340" width="900" height="110" fill="#e4d4bb" />
      <rect x="470" y="50" width="360" height="230" fill="#d9eaf1" stroke="#bfd3db" strokeWidth="6" />
      <rect x="484" y="64" width="332" height="202" fill="#eef9fd" />
      <path d="M484 155h332M650 64v202" stroke="#fbfdfd" strokeWidth="7" />
      <rect x="60" y="80" width="260" height="180" rx="8" fill="#f6e8dc" />
      <rect x="80" y="100" width="220" height="140" rx="5" fill="#fffaf3" />
      <g fill="#efd8c4">
        <rect x="98" y="118" width="70" height="50" />
        <rect x="180" y="130" width="100" height="34" />
        <rect x="98" y="190" width="150" height="30" />
      </g>
      <path d="M55 330h330l18 55H38Z" fill="#d8c2a5" />
      <path d="M70 385v45m300-45v45" stroke="#9d8a74" strokeWidth="7" />
      <rect x="420" y="300" width="290" height="80" rx="18" fill="#c5dce3" />
      <rect x="440" y="326" width="250" height="52" rx="12" fill="#e7f2f5" />
      <path d="M780 300V170m0 70-35-40m35 18 40-40" stroke="#84a58e" strokeWidth="5" />
      <g fill="#9fc19b">
        <ellipse cx="754" cy="196" rx="10" ry="27" transform="rotate(-35 754 196)" />
        <ellipse cx="795" cy="180" rx="11" ry="29" transform="rotate(38 795 180)" />
        <ellipse cx="779" cy="160" rx="12" ry="30" />
      </g>
    </>
  );
}

function StationScene() {
  return (
    <>
      <rect width="900" height="450" fill="url(#hero-sky)" />
      <g fill="#c4dce7" opacity=".8">
        <rect x="20" y="110" width="110" height="210" />
        <rect x="150" y="80" width="150" height="240" />
        <rect x="330" y="130" width="90" height="190" />
        <rect x="620" y="70" width="130" height="250" />
        <rect x="770" y="120" width="120" height="200" />
      </g>
      <g fill="#9fc3d4" opacity=".45">
        <rect x="45" y="140" width="18" height="24" />
        <rect x="80" y="140" width="18" height="24" />
        <rect x="185" y="120" width="22" height="28" />
        <rect x="230" y="120" width="22" height="28" />
        <rect x="650" y="105" width="20" height="26" />
        <rect x="700" y="105" width="20" height="26" />
      </g>
      <rect y="320" width="900" height="130" fill="#dce4e7" />
      <rect y="320" width="900" height="14" fill="#b9cbd3" />
      <path d="M0 345h900M0 400h900" stroke="#f8fbfc" strokeWidth="8" opacity=".8" />
      <rect x="420" y="210" width="380" height="110" rx="12" fill="#f7fbfd" stroke="#b7ced9" strokeWidth="5" />
      <g fill="#9bbfcb">
        <rect x="440" y="230" width="60" height="40" rx="3" />
        <rect x="515" y="230" width="60" height="40" rx="3" />
        <rect x="590" y="230" width="60" height="40" rx="3" />
        <rect x="665" y="230" width="60" height="40" rx="3" />
      </g>
      <rect x="420" y="285" width="380" height="8" fill="#7fa6b5" />
      <rect x="390" y="150" width="120" height="70" rx="6" fill="#ffffff" opacity=".8" />
      <text x="450" y="180" textAnchor="middle" fill="#4e91ad" fontSize="15" letterSpacing="3">
        STATION
      </text>
      <text x="450" y="200" textAnchor="middle" fill="#86a8bb" fontSize="10" letterSpacing="2">
        283 LINE
      </text>
      <path d="M60 450v-80h240v80" fill="#c2d6de" />
      <path d="M80 370h200v60H80Z" fill="#8fb5c2" opacity=".5" />
    </>
  );
}

function HeroBackdrop({ locationId }: { locationId: string }) {
  return (
    <svg
      className="hero-backdrop"
      viewBox="0 0 900 450"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-sky" x2="0" y2="1">
          <stop stopColor="#94d5f5" />
          <stop offset="1" stopColor="#eefaff" />
        </linearGradient>
        <linearGradient id="hero-room" x2="0" y2="1">
          <stop stopColor="#f6fbfd" />
          <stop offset="1" stopColor="#fcfefe" />
        </linearGradient>
        <linearGradient id="hero-floor" x2="0" y2="1">
          <stop stopColor="#ddd1b7" />
          <stop offset="1" stopColor="#f5e5c9" />
        </linearGradient>
      </defs>
      {locationId === 'practice_room' ? (
        <PracticeScene />
      ) : locationId === 'studio' ? (
        <StudioScene />
      ) : locationId === 'home' ? (
        <HomeScene />
      ) : locationId === 'station' ? (
        <StationScene />
      ) : (
        <OfficeScene />
      )}
    </svg>
  );
}

export function SceneHero({ hero }: SceneHeroProps) {
  return (
    <section
      className={`scene-hero hero-${hero.locationId}`}
      style={
        hero.color
          ? ({ '--hero-color': hero.color } as CSSProperties)
          : undefined
      }
      aria-label={`${hero.locationName}场景`}
    >
      <HeroBackdrop locationId={hero.locationId} />
      <div className="hero-shade" />
      <div className="hero-caption">
        <span>283 PRODUCTION</span>
        <h2>{hero.locationName}</h2>
      </div>
      {hero.unit ? (
        <div className="hero-unit">
          illumination <strong>STARS</strong>
        </div>
      ) : null}
      {hero.portrait ? (
        <img
          className="hero-portrait"
          src={hero.portrait}
          alt={hero.idolName ? `${hero.idolName}立绘` : '偶像立绘'}
          draggable={false}
        />
      ) : null}
      {hero.quote && hero.idolName ? (
        <div className="hero-dialogue">
          <span>{hero.idolName}</span>
          <p>{hero.quote}</p>
          <i aria-hidden="true">◇</i>
        </div>
      ) : null}
    </section>
  );
}
