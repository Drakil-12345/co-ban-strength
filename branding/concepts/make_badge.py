from pathlib import Path
import re

base = Path('branding/concepts')
word = (base / 'outline-wordmark.svg').read_text(encoding='utf-8')
inner = re.search(r'<title>.*?</title>(.*)</svg>', word, re.S).group(1)
inner = re.sub(r'<path d="M35 173[^>]*/>', '', inner)
inner = re.sub(r'<path d="M399 173[^>]*/>', '', inner)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 250"><title>CƠ BẢN badge lockup</title><rect width="760" height="250" rx="28" fill="#fffaf2"/><g transform="translate(24 35)"><rect width="180" height="180" rx="42" fill="#181c2b"/><path d="M136 26c-19-14-40-21-64-21C30 5 5 42 5 90s25 85 67 85c24 0 45-8 64-22l-20-27c-13 10-27 15-44 15-25 0-42-19-42-51s17-51 42-51c17 0 31 5 44 15l20-28Z" fill="#fffaf2"/><path d="M57 73h58v28H57z" fill="#ef5a13"/><circle cx="141" cy="39" r="13" fill="#117c75"/></g><g transform="translate(238 32) scale(.88)">{inner}</g><path d="M238 190h278" stroke="#ef5a13" stroke-width="10"/><path d="M516 190h45" stroke="#117c75" stroke-width="10"/></svg>'''
(base / 'middle-badge-lockup.svg').write_text(svg, encoding='utf-8')
