#!/usr/bin/env python3
"""
Simple icon generator for the Real-Time Voice Translator extension.
Creates placeholder icons with "RT" text.
"""

def create_svg_icon(size):
    """Create an SVG icon with the given size."""
    svg_content = f'''<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#45a049;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="{size}" height="{size}" fill="url(#grad)" rx="4" ry="4"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
        fill="white" font-family="Arial, sans-serif" 
        font-size="{int(size * 0.35)}" font-weight="bold">RT</text>
</svg>'''
    return svg_content

# Generate icons
for size in [16, 48, 128]:
    svg_content = create_svg_icon(size)
    filename = f'icon-{size}.svg'
    with open(filename, 'w') as f:
        f.write(svg_content)
    print(f"Created {filename}")

print("\nNote: These are SVG icons. For a Chrome extension, you may need to convert them to PNG.")
print("You can use an online converter or install a tool like ImageMagick to convert them.")