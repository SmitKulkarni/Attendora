---
name: Academic Governance System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#00190e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00301e'
  on-tertiary-container: '#00a472'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  title-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  data-tabular:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system serves enterprise academic governance, institutional registrars, faculty leadership, and compliance officers. The visual language conveys institutional authority, absolute precision, audit-grade accountability, and calm clarity across dense data surfaces. 

Drawing from a **Corporate / Modern** aesthetic with refined editorial precision, the visual expression eliminates frivolous ornament in favor of strict typographic rhythm, crisp hairline delimiters, and deliberate data prioritization. 

Key principles:
- **Institutional Weight:** Confident, structured geometry anchored in deep academic navies rather than generic SaaS grays.
- **Audit-Grade Readability:** Dense tabular layouts designed for instant comprehension and rapid compliance scanning.
- **Unambiguous State Semantics:** Tri-tiered compliance thresholds (Eligible, Conditional, Defaulter) communicated consistently across all metrics, badges, and summaries.

## Colors

The palette establishes an authoritative hierarchy between operational chrome, data surfaces, and compliance states.

### Core Swatches
- **Primary (Deep Academic Navy):** `#0F172A` (Background headers, primary text, prominent institutional badges) and `#1E293B` (Surface sidebars, elevated panels, card titles).
- **Secondary (Trust Royal Blue):** `#2563EB` (Interactive links, active navigation tabs, primary call-to-action fills) and `#1D4ED8` (Interactive hover/pressed states).
- **Neutral (Slate Architecture):** `#F8FAFC` (Canvas foundation), `#F1F5F9` (Table zebra striping and inset panels), `#E2E8F0` (Hairline rules and grid boundaries), and `#64748B` (Secondary metadata, column labels, subtle timestamps).

### Academic Compliance Indicators
Compliance values require strict threshold mapping:
- **Compliant (>=75% Attendance):** `#10B981` (Surface fill: `#ECFDF5`, Border: `#A7F3D0`, Deep tone: `#065F46`). Indicates complete eligibility for examinations and degree conferrals.
- **Warning Threshold (70.0% â€“ 74.9% Attendance):** `#F59E0B` (Surface fill: `#FFFBEB`, Border: `#FDE68A`, Deep tone: `#92400E`). Indicates imminent academic probation or attendance remediation requirement.
- **Critical Defaulter (<70.0% Attendance):** `#EF4444` (Surface fill: `#FEF2F2`, Border: `#FECACA`, Deep tone: `#991B1B`). Explicit bar from examination registries, requiring immediate escalation.

## Typography

Inter serves as the primary and sole typographic workhorse. Its neutral grotesque geometry and open apertures offer high legibility across dense data tables, micro-badges, and high-altitude administrative metrics.

### Typographic Governance
- **Numerical Tables:** Ensure all tabular numbers use the open-type font feature setting `'tnum' 1` and `'cv05' 1` (lowercase l with tail) to prevent vertical jitter across rows and columns during comparative scans.
- **Section Headers & Metric Units:** High-density metric figures must pair bold display sizes with small uppercase tracking labels (`label-sm` with uppercase transforms) for administrative distinction.
- **Weight Restraint:** Limit weights strictly to `400` (Regular) for descriptions and readouts, `500` (Medium) for tabular data cells, `600` (Semi-bold) for column keys and interactive states, and `700` (Bold) strictly for high-level metrics and view anchors.

## Layout & Spacing

The architecture operates on an 8pt modular grid (with 4pt micro-steps for compact data components). 

### Layout Architecture
- **Desktop (HLŽ
NŠŠˆL‹XÛÛ[[ˆ›ZYÜšYØÚÙYÚ][ˆHX^[][HÝXÝ\˜[Ø[˜\ÈÚYÙˆMŒˆÝ[™\™Ý]\œÈ\™H
K\™[X
KÚ]Ìœ
œ™[X
HYÙHœ˜[YHX\™Ú[œË‚‹H
Š•X›]
ÍŽ8 $ÈLÎ\
NŠŠˆXÛÛ[[ˆ^[Ý]ˆÝ]\œÈØØ[HÝÛˆÈMœ
\™[X
NÈÚYX˜\ˆ˜]šYØ][ÛˆY˜][ÈÈHÛÛ\ÙY˜Z[

HÈ™\Ù\™HX[\ˆšY]ÜÜÚY‚‹H
Š“[Øš[H
ÍŽ
NŠŠˆXÛÛ[[ˆ^[Ý]Ú]LœÝ]\œÈ[™MœYÙHX\™Ú[œËˆÛÛ\^ÛÛ\X[˜ÙHX]šXÙ\È™Y›ÝÈ[È™\XØ[HÝXÚÙYXØY[ZXÈ]Y]Ø\™Ë‚‚ˆÈÈÈ[œÚ]HY\œÂ‹H
Š”Ý[™\™^[Ý]ŠŠˆY˜][Mœ
\™[X
H›ÝËØÛÛ[[ˆØ\È›Üˆ[˜[]XÜÈ\Ú›Ø\™È[™ÛÛ™šYÝ\˜][Ûˆ[™[Ë‚‹H
ŠÛÛ\XÝX[\ˆ[ÙNŠŠˆ
\™[X
H™\XØ[›ÝÈY[™È[ˆ™YÚ\ÝšY\È[™YÙ\ˆšY]ÜÈÈX^[Z^™H›ÝÈØ\XÚ]HX›Ý™HH›Û‚‚ˆÈÈ[]˜][Ûˆ	ˆ\‚•ÈÝ\ÝZ[ˆ[œÝ]][Û˜[]]Üš]H[™X^[Z^™H[™›Ü›X][Û˜[[œÚ]K\È\ÚYÛˆÞ\Ý[HZ[š[Z^™\ÈX]žH›ÜYÚYÝÜËˆ\\È[œÝXY\ÝX›\ÚY›ÝYÚ
ŠÛ˜[^Y\œÊŠˆÛÛXš[™YÚ]
ŠœÝXKÝËXÛÛ˜\ÝZ\›[™HÝ][™\ÊŠ‹‚‚ˆÈÈÈ[]˜][ÛˆØØ[B‹H
Š˜\ÙH]™[
Ø[˜\ÊNŠŠˆ\™HÑŽQØˆÝ\Ù\ÈHœ›ØY\ˆ\XØ][ÛˆÚ[™ÝÈ[™[˜XÝ]™H[™[šY[Ë‚‹H
Š“^Y\ˆH
Ø\™	ˆÛÛ[›ØÚÜÊNŠŠˆ\™HÑ‘‘‘‘‘˜Ý\™˜XÙH›Ü™\™YžHHÜš\Ü\ÛÛYZ\›[™HÙˆÑL‘NŒˆ^Y\ˆHÝ\™˜XÙ\ÈÛÛ™^HÝXš[]H[™™[HÛˆ›Ü™\ˆ›Ý[™\šY\È˜]\ˆ[ˆØ\ÝÚYÝÜË‚‹H
Š“^Y\ˆˆ
Ý™\™Y›ÝÜË[œÙ]Y]šXÜÈ	ˆš[\ˆÚ[™\ÊNŠŠˆ˜XÚÙÜ›Ý[™ÑŒQQŽX™\ÝYÚ][ˆ^Y\ˆHØ\™ÈÈY™™\™[X]Hš[\™YÙX\˜ÚÛÛ›ÛÈÜˆY]šXÈÜ›Ý\[™ÜË‚‹H
Š“^Y\ˆÈ
^XÝ]]™HÝ™\›^\È	ˆÛÛ^Y[\ÊNŠŠˆ\™HÑ‘‘‘‘‘˜Ý\™˜XÙHÚ]H\›Ü™\ˆÙˆÐÐ‘QLX[˜ÚÜ™YžH[ˆ[XšY[Y™\ÙYÚYÝÎˆœL\™Ø˜JMKŒË‹ŒJKœLœ™Ø˜JMKŒË‹ŒJX‚‹H
Š“^Y\ˆ
[Ù[È	ˆ]Y]™\ÛÛ][Ûˆ˜]Ù\œÊNŠŠˆ˜XÚÙ›ÜÝ™\›^HÌŒMÌX]	HÜXÚ]H
˜XÚÙ›ÜX›\‹\ÛX
KØ\Ý[™È[ˆ[XšY[[]˜][ÛˆÙˆŒ\M\™Ø˜JMKŒË‹ŒJKLMœ™Ø˜JMKŒË‹Œ
X‚‚ˆÈÈÚ\\Â‚•H\ÚYÛˆÞ\Ý[H[\Þ\È
Š”ÛÙ
]™[JJŠˆÙ[ÛY]žKˆ‚‹H
ŠÛÛZ[™\œÈ	ˆ]H[™[ÎŠŠˆš^YÈŒ\™[X

HÜˆŒÍÍ\™[X
œ
HÛÜ›™\œËˆ\ÈXZ[Z[œÈ[ˆ\˜Ú]XÝ\˜[ØÝ[Y[[ZÙH]X[]H]™\Ù\™\ÈX^[][H^[™X[\Ý]H›Üˆ^[œÚ]™H]HÜšYË‚‹H
Š’[\˜XÝ]™H›Ü›H[[Y[È	ˆ]ÛœÎŠŠˆÙ]ÝšXÝHÈŒ\™[X

H›Ü™\ˆ˜Y]\ÈÈ›Ú™XÝ[˜Ý[Û˜[][]\šX[ˆšYÛÜ‹‚‹H
ŠÛÛ\X[˜ÙHÝ]\È[ÎŠŠˆÙ]ÈÛÛ\]H›Ý[™Y[˜Ø\Ý[][Ûˆ
[Ú\KNNN\
HÈÜ™X]H[ˆ[[YYX]HÚ\H\Ý[˜Ý[Ûˆ™]ÙY[ˆÝXÝ\˜[ÛÛ[›ØÚÜÈ[™ÛÛ\X[˜ÙHÝ]\ÈX\šÙ\œË‚‚ˆÈÈÛÛ\Û™[Â‚ˆÈÈÈ]ÛœÂ‹H
Š”š[X\žNŠŠˆ˜XÚÙÜ›Ý[™ÌMŒÑP˜^Ñ‘‘‘‘‘˜Œ\™[H˜Y]\Ë™\XØ[Y[™ÈÜš^›Û[Y[™ÈMœˆÝ™\ˆÝ]HÚYÈÈÌQQˆ›ØÝ\ÈÝ]H™\Ù[ÈHœÙ™œÙ]š[™È[ˆÌMŒÑP˜‚‹H
Š”ÙXÛÛ™\žH
YZ[š\Ý˜]]™JNŠŠˆ˜XÚÙÜ›Ý[™Ñ‘‘‘‘‘˜\›Ü™\ˆÐÐ‘QLX^ÌQLŽLÐ˜ˆÝ™\ˆÝ]HÚYÈ˜XÚÙÜ›Ý[™ÈÑŽQØ[™›Ü™\ˆÈÎMLÐŽ‚‹H
Š‘\ÝXÝ]™KÑ^[Ú[ÛŽŠŠˆ˜XÚÙÜ›Ý[™ÑQ^Ñ‘‘‘‘‘˜ˆÝ™\ˆÝ]HÑÌŒ˜‚‚ˆÈÈÈÛÛ\X[˜ÙH˜YÙH[Â‹H™[™\™Y[ˆHš^YZYÚÙˆŒœÚ][˜Y]\È
NNN\
KÜš^›Û[Y[™Ë˜XÚÚ[™È\\˜Ø\ÙHX™[\ÛXÙZYÚ‚ˆH
ŠÛÛ\X[
MÍIJNŠŠˆ˜XÚÙÜ›Ý[™ÑPÑ‘X^ÌQ˜›Ü™\ˆ\ÛÛYÐMÑŒÑˆ™XÙYYžH[ˆÜ[Û˜[œÛÛY[Y\˜[Ý‚ˆH
Š•Ø\›š[™È
ÌŒ	H8 $ÈÍŽIJNŠŠˆ˜XÚÙÜ›Ý[™Ñ‘‘‘P˜^ÎLX›Ü™\ˆ\ÛÛYÑ‘MŽX‚ˆH
Š‘Y˜][\ˆ
ÌŒ	JNŠŠˆ˜XÚÙÜ›Ý[™Ñ‘QŒ‘Œ˜^ÎNLPŒP˜›Ü™\ˆ\ÛÛYÑ‘PÐPÐX‚‚ˆÈÈÈYÚPÛÛ˜\ÝXØY[ZXÈ]HX›\Â‹H
Š’XY\ŽŠŠˆ˜XÚÙÜ›Ý[™ÑŽQØ›Ü™\‹X›ÝÛHœÛÛYÑL‘NŒ\ÙÜ˜\HX™[[Y[ˆ\\˜Ø\ÙHÍÍ˜‚‹H
Š‘]H›ÝÜÎŠŠˆ˜XÚÙÜ›Ý[™Ñ‘‘‘‘‘˜›Ü™\‹X›ÝÛH\ÛÛYÑŒQQŽXˆ[\›˜][™È›ÝÈ™Xœ˜HÜ[Ûˆ[ˆÑŽQØˆÝ™\ˆÝ]HYÚYÚÈ[›ÝÈ[ˆÑŒQQŽX‚‹H
Š‘Y˜][ÛÛ[[ˆ[YÛ›Y[ÎŠŠˆ^YX[YÛ™YÈÝY[™YÚ\Ý˜][ÛˆQÈ[Û›ÜÜXÙNÈ][™[˜ÙH\˜Ù[YÙ\ÈšYÚX[YÛ™Y\Ú[™ÈX[\ˆšYÝ\™\È
›Û]˜\šX[[[Y\šXÎˆX[\‹[[\Ø
K‚‚ˆÈÈÈ^XÝ]]™HÝ]\ÝXÈØ\™Â‹HÝXÝ\™Y[œÚYH^Y\ˆHÚ]HÛÛZ[™\œÈÚ]\ÑL‘NŒ›Ü™\ˆ[™Œ[\›˜[Y[™Ë‚‹HÛÛœÚ\ÝÈÙŽ‚ˆKˆÜ›ÝÎˆ^YXœ›ÝÈØ]YÛÜžHX™[[ˆX™[[Y
ÍÍ˜
HZ\™YÚ]HZXÜ›ÈÝ]\ÈXÛÛ‹‚ˆ‹ˆZYH›ÝÎˆ\™ÙH^XÝ]]™HšYÝ\™H[ˆ\Ü^K[Ø
ÌŒMÌX
K‚ˆËˆ›ÝÛH›ÝÎˆÛÛ^X[˜\šX[˜ÙHX\šÙ\ˆ
K™Ë‹ŠÌ‹	HœÈ™]š[Ý\È\›HˆÜˆŒMÝY[È]š\ÚÈŠHÝ[Y[ˆÛÜœ™\ÜÛ™[™ÈÛÛ\X[˜ÙHÛ™\Ë‚‚ˆÈÈÈ[œ]šY[Â‹HÚ]H˜XÚÙÜ›Ý[™\ÛÛYÐÐ‘QLX›Ü™\‹™\XØ[[™LœÜš^›Û[Y[™Ë›ÙK[Y\ÙÜ˜\K‚‹HXÝ]™H›ØÝ\ÈÝ]Nˆ›Ü™\ˆÛÛÜˆ˜[œÚ][ÛœÈÈÌMŒÑP˜Ú][ˆ[XšY[ÛÝÈ
›Þ\ÚYÝÎˆÜ™Ø˜JÍËNKŒÍKŒMJX
K‚‚ˆÈÈÈÙ[XÝ[ÛˆÛÛ›ÛÈ
ÚXÚØ›Þ\È	ˆ˜Y[ÜÊB‹HÜš\ÜMœÜ]X\™H
ÜˆÚ\˜ÛJHÚ]\ÐÐ‘QLX›Ü™\‹‚‹HÚXÚÙYÝ]Hš[ÈÚ]ÌMŒÑP˜ÛÛZ[š[™ÈHÛÛYÚ]HÚXÚÛX\šÈÜˆÙ[\ˆ\ˆ[™]\›Z[˜]HÝ]H™X]\™\ÈHÛÛYÚ]H˜\ˆ›Üˆ˜]Ú\™YÚ\ÝžHÙ[XÝ[ÛœË