"""
Optimize animated WebP size: resize to 512x512, lossy compression.
"""
from PIL import Image

input_path = "/home/z/my-project/public/rumbela/mascot-bela-animated.webp"
output_path = input_path  # overwrite

# Open, resize, re-save with lossy compression
img = Image.open(input_path)
print(f"Original size: {img.size}, mode: {img.mode}")

# Get all frames
frames = []
durations = []
for frame in img.iter_frames() if hasattr(img, 'iter_frames') else []:
    frames.append(frame)
    durations.append(frame.info.get('duration', 400))

# PIL WebP animated - use seek approach
frames = []
durations = []
loop = img.info.get('loop', 0)
try:
    i = 0
    while True:
        img.seek(i)
        # Convert to RGBA and resize to 512
        frame = img.convert("RGBA").resize((512, 512), Image.LANCZOS)
        frames.append(frame)
        durations.append(img.info.get('duration', 400))
        i += 1
except EOFError:
    pass

print(f"Found {len(frames)} frames, durations: {durations}")

# Save optimized WebP with quality 80 (good balance)
frames[0].save(
    output_path,
    save_all=True,
    append_images=frames[1:],
    duration=durations,
    loop=loop,
    disposal=2,
    lossless=False,
    quality=85,
    method=6  # max compression effort
)

import os
print(f"Optimized WebP: {os.path.getsize(output_path)} bytes ({os.path.getsize(output_path)/1024:.1f} KB)")
