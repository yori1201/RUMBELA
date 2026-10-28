"""
Step 3: Combine frames into animated WebP (better transparency than GIF).
"""
from PIL import Image
import os

def make_animated_webp(frame_paths, output_path, durations=None, loop=0):
    """Combine frames into animated WebP with full alpha transparency."""
    if durations is None:
        durations = [200] * len(frame_paths)
    
    # Open and trim each frame
    frames = []
    for path in frame_paths:
        img = Image.open(path).convert("RGBA")
        bbox = img.getbbox()
        if bbox:
            pad = 5
            left = max(0, bbox[0] - pad)
            top = max(0, bbox[1] - pad)
            right = min(img.width, bbox[2] + pad)
            bottom = min(img.height, bbox[3] + pad)
            img = img.crop((left, top, right, bottom))
        frames.append(img)
    
    # Normalize to largest canvas, centered
    max_w = max(f.width for f in frames)
    max_h = max(f.height for f in frames)
    
    normalized = []
    for f in frames:
        canvas = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))
        offset = ((max_w - f.width) // 2, (max_h - f.height) // 2)
        canvas.paste(f, offset, f)
        normalized.append(canvas)
    
    # Save as animated WebP (lossless, full transparency)
    normalized[0].save(
        output_path,
        save_all=True,
        append_images=normalized[1:],
        duration=durations,
        loop=loop,
        disposal=2,  # restore to bg (transparency)
        lossless=True,
        quality=100
    )
    print(f"Saved WebP: {output_path}")
    print(f"  Size: {os.path.getsize(output_path)} bytes")
    print(f"  Frames: {len(normalized)}")
    print(f"  Dimensions: {max_w}x{max_h}")
    return output_path


def make_animated_gif(frame_paths, output_path, durations=None, loop=0):
    """Combine frames into animated GIF with transparency (palette-based)."""
    if durations is None:
        durations = [200] * len(frame_paths)
    
    frames = []
    for path in frame_paths:
        img = Image.open(path).convert("RGBA")
        bbox = img.getbbox()
        if bbox:
            pad = 5
            left = max(0, bbox[0] - pad)
            top = max(0, bbox[1] - pad)
            right = min(img.width, bbox[2] + pad)
            bottom = min(img.height, bbox[3] + pad)
            img = img.crop((left, top, right, bottom))
        frames.append(img)
    
    max_w = max(f.width for f in frames)
    max_h = max(f.height for f in frames)
    
    normalized = []
    for f in frames:
        canvas = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))
        offset = ((max_w - f.width) // 2, (max_h - f.height) // 2)
        canvas.paste(f, offset, f)
        normalized.append(canvas)
    
    # Convert each RGBA frame to P (palette) with transparency
    gif_frames = []
    for img in normalized:
        # Use adaptive palette quantization
        p_img = img.quantize(colors=255, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
        # Find transparent color (top-left corner is fully transparent)
        transparent_pixel = img.getpixel((0, 0))
        if len(transparent_pixel) == 4 and transparent_pixel[3] == 0:
            # The transparent color value
            target_color = (transparent_pixel[0], transparent_pixel[1], transparent_pixel[2])
            palette = p_img.getpalette()
            transparent_index = 0
            for i in range(0, len(palette) - 2, 3):
                r, g, b = palette[i], palette[i+1], palette[i+2]
                if (r, g, b) == target_color:
                    transparent_index = i // 3
                    break
            p_img.info['transparency'] = transparent_index
        gif_frames.append(p_img)
    
    gif_frames[0].save(
        output_path,
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        loop=loop,
        disposal=2,
        optimize=False
    )
    print(f"Saved GIF: {output_path} ({os.path.getsize(output_path)} bytes)")


if __name__ == "__main__":
    base = "/home/z/my-project/public/rumbela"
    
    # 6-frame natural breathing loop:
    # idle -> blink -> idle -> wave -> idle -> bounce
    frame_paths = [
        os.path.join(base, "frame-1.png"),
        os.path.join(base, "frame-2.png"),
        os.path.join(base, "frame-1.png"),
        os.path.join(base, "frame-3.png"),
        os.path.join(base, "frame-1.png"),
        os.path.join(base, "frame-4.png"),
    ]
    
    durations = [400, 200, 400, 200, 400, 250]
    
    # Primary: WebP (best transparency + quality)
    webp_out = os.path.join(base, "mascot-bela-animated.webp")
    make_animated_webp(frame_paths, webp_out, durations=durations, loop=0)
    
    # Fallback: GIF (universal support)
    gif_out = os.path.join(base, "mascot-bela-animated.gif")
    make_animated_gif(frame_paths, gif_out, durations=durations, loop=0)
    
    print(f"\n✅ Animated mascot ready!")
