"""Draws the example car pictures in public/cars/ (side views in several colours, plus front, rear and
interior views for one car). They are placeholders: the owner replaces them with real photos."""
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'cars')

SHAPES = {
 'sedan': ("M60 300 L95 262 Q120 236 160 232 L250 200 Q300 182 360 182 L470 184 Q520 186 560 214 L610 248 L700 262 Q745 270 748 300 L748 330 L60 330 Z",
           "M185 238 L265 206 Q300 194 345 194 L345 238 Z M360 194 L455 196 Q500 198 535 230 L540 238 L360 238 Z"),
 'hatch': ("M70 300 L105 260 Q130 236 170 232 L260 196 Q300 180 360 180 L520 182 Q585 186 615 235 L660 262 Q700 272 702 300 L702 330 L70 330 Z",
           "M195 236 L275 204 Q305 192 350 192 L350 236 Z M365 192 L505 194 Q560 198 585 236 L365 236 Z"),
 'suv':   ("M60 300 L80 245 Q92 214 130 210 L230 180 Q270 160 340 160 L560 160 Q620 162 640 210 L700 236 Q745 250 748 290 L748 330 L60 330 Z",
           "M150 226 L240 194 Q275 176 330 176 L330 226 Z M345 176 L540 176 Q590 178 610 226 L345 226 Z"),
 'van':   ("M60 305 L70 230 Q80 175 140 160 L250 150 L640 150 Q700 152 712 210 L740 260 Q750 280 748 305 L748 330 L60 330 Z",
           "M110 230 L120 190 Q130 170 160 168 L250 166 L250 230 Z M265 166 L470 166 L470 230 L265 230 Z"),
}
COLORS = {  # name: (body, background)
 'red': ('#c0392b', '#fde8e4'), 'white': ('#eef0f3', '#e8f0fb'), 'silver': ('#a8b0bb', '#eef2f7'), 'black': ('#1f2937', '#e9edf3'),
 'blue': ('#1f4fa0', '#e6eefc'), 'grey': ('#55606e', '#eef2f7'), 'green': ('#0f5132', '#e3f5ea'), 'orange': ('#f59e0b', '#fff4dc'),
}
LABEL = '<text x="400" y="560" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#64748b">{}</text>'

def frame(bg, inner, label):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{bg}"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfdbfe"/><stop offset="1" stop-color="#475569"/></linearGradient></defs>
<rect width="800" height="600" fill="url(#bg)"/><rect y="420" width="800" height="180" fill="#e2e8f0"/>
{inner}
{LABEL.format(label)}
</svg>'''

def side(shape, color, bg):
    body, win = SHAPES[shape]
    inner = f'''<ellipse cx="404" cy="428" rx="330" ry="22" fill="#0f172a" opacity="0.18"/>
<g transform="translate(0,90)">
<path d="{body}" fill="{color}" stroke="#0f172a" stroke-opacity="0.35" stroke-width="3"/>
<path d="{win}" fill="url(#glass)" opacity="0.9"/>
<rect x="64" y="292" width="34" height="12" rx="4" fill="#fde68a"/><rect x="712" y="290" width="32" height="12" rx="4" fill="#ef4444"/>
<line x1="80" y1="312" x2="740" y2="312" stroke="#0f172a" stroke-opacity="0.2" stroke-width="3"/>
<g fill="#111827"><circle cx="210" cy="330" r="52"/><circle cx="600" cy="330" r="52"/></g>
<g fill="#9ca3af"><circle cx="210" cy="330" r="26"/><circle cx="600" cy="330" r="26"/></g>
<g fill="#4b5563"><circle cx="210" cy="330" r="8"/><circle cx="600" cy="330" r="8"/></g></g>'''
    return frame(bg, inner, "Photo d'exemple · Sample photo")

def front(color, bg):
    inner = f'''<ellipse cx="400" cy="440" rx="250" ry="20" fill="#0f172a" opacity="0.2"/>
<rect x="185" y="380" width="60" height="70" rx="12" fill="#111827"/><rect x="555" y="380" width="60" height="70" rx="12" fill="#111827"/>
<path d="M170 400 L180 300 Q190 260 240 250 L560 250 Q610 260 620 300 L630 400 Q630 420 610 420 L190 420 Q170 420 170 400 Z" fill="{color}" stroke="#0f172a" stroke-opacity="0.35" stroke-width="3"/>
<path d="M245 250 L280 175 Q290 160 310 160 L490 160 Q510 160 520 175 L555 250 Z" fill="{color}" stroke="#0f172a" stroke-opacity="0.3" stroke-width="3"/>
<path d="M262 245 L292 182 L508 182 L538 245 Z" fill="url(#glass)"/>
<rect x="150" y="235" width="40" height="22" rx="6" fill="{color}" stroke="#0f172a" stroke-opacity="0.3"/><rect x="610" y="235" width="40" height="22" rx="6" fill="{color}" stroke="#0f172a" stroke-opacity="0.3"/>
<path d="M195 300 L280 296 L272 330 L198 332 Z" fill="#fef3c7" stroke="#0f172a" stroke-opacity="0.3"/><path d="M605 300 L520 296 L528 330 L602 332 Z" fill="#fef3c7" stroke="#0f172a" stroke-opacity="0.3"/>
<rect x="310" y="315" width="180" height="50" rx="10" fill="#1f2937"/><g stroke="#4b5563" stroke-width="3"><line x1="320" y1="330" x2="480" y2="330"/><line x1="320" y1="345" x2="480" y2="345"/></g>
<circle cx="400" cy="338" r="14" fill="#cbd5e1"/><rect x="345" y="380" width="110" height="26" rx="4" fill="#f8fafc" stroke="#94a3b8"/>
<text x="400" y="399" text-anchor="middle" font-family="Arial" font-size="15" fill="#334155">00123 119 31</text>'''
    return frame(bg, inner, "Vue avant · Front view (exemple)")

def rear(color, bg):
    inner = f'''<ellipse cx="400" cy="440" rx="250" ry="20" fill="#0f172a" opacity="0.2"/>
<rect x="185" y="380" width="60" height="70" rx="12" fill="#111827"/><rect x="555" y="380" width="60" height="70" rx="12" fill="#111827"/>
<path d="M170 400 L178 290 Q186 255 240 248 L560 248 Q614 255 622 290 L630 400 Q630 420 610 420 L190 420 Q170 420 170 400 Z" fill="{color}" stroke="#0f172a" stroke-opacity="0.35" stroke-width="3"/>
<path d="M245 248 L285 178 Q295 165 315 165 L485 165 Q505 165 515 178 L555 248 Z" fill="{color}" stroke="#0f172a" stroke-opacity="0.3" stroke-width="3"/>
<path d="M268 242 L298 186 L502 186 L532 242 Z" fill="url(#glass)"/>
<path d="M190 285 L270 280 L268 320 L192 322 Z" fill="#ef4444" stroke="#7f1d1d" stroke-opacity="0.5"/><path d="M610 285 L530 280 L532 320 L608 322 Z" fill="#ef4444" stroke="#7f1d1d" stroke-opacity="0.5"/>
<rect x="335" y="330" width="130" height="30" rx="4" fill="#f8fafc" stroke="#94a3b8"/><text x="400" y="351" text-anchor="middle" font-family="Arial" font-size="16" fill="#334155">00123 119 31</text>
<rect x="210" y="395" width="380" height="14" rx="6" fill="#0f172a" opacity="0.25"/>'''
    return frame(bg, inner, "Vue arrière · Rear view (exemple)")

def interior(bg):
    inner = '''<rect y="0" width="800" height="600" fill="#1e293b"/>
<path d="M0 120 Q400 40 800 120 L800 200 L0 200 Z" fill="url(#glass)" opacity="0.8"/>
<path d="M0 230 Q400 170 800 230 L800 330 L0 330 Z" fill="#0f172a"/>
<rect x="330" y="235" width="140" height="70" rx="10" fill="#0b1220" stroke="#38bdf8" stroke-opacity="0.6"/><text x="400" y="278" text-anchor="middle" font-family="Arial" font-size="18" fill="#7dd3fc">GPS · Radio</text>
<circle cx="200" cy="330" r="95" fill="none" stroke="#111827" stroke-width="26"/><circle cx="200" cy="330" r="30" fill="#111827"/>
<rect x="110" y="440" width="190" height="160" rx="30" fill="#334155"/><rect x="500" y="440" width="190" height="160" rx="30" fill="#334155"/>
<rect x="380" y="380" width="40" height="120" rx="12" fill="#0f172a"/><circle cx="400" cy="380" r="18" fill="#475569"/>'''
    return frame('#1e293b', inner, "Intérieur · Interior (exemple)").replace('fill="#64748b">Intérieur', 'fill="#cbd5e1">Intérieur')

for shape in SHAPES:
    for name, (body, bg) in COLORS.items():
        open(os.path.join(OUT, f'{shape}-{name}.svg'), 'w').write(side(shape, body, bg))
open(os.path.join(OUT, 'symbol-front.svg'), 'w').write(front('#c0392b', '#fde8e4'))
open(os.path.join(OUT, 'symbol-rear.svg'), 'w').write(rear('#c0392b', '#fde8e4'))
open(os.path.join(OUT, 'symbol-interior.svg'), 'w').write(interior('#1e293b'))
print('done')
