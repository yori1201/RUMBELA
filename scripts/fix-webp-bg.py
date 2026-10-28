"""
Post-process animated WebP: remove white background that was added during image-edit generation.
Apply the same black-bg removal logic but for white background.
"""
from PIL import Image
import os

def make_white_transparent_in_webp(input_path, output_path, threshold=245):
    """For each frame in animated WebP, make near-white pixels transparent."""
    img = Image.open(input_path)
    n_frames = getattr(img, 'n_frames', 1)
    loop = img.info.get('loop', 0)
    durations = []
    frames = []
    
    for i in range(n_frames):
        img.seek(i)
        duration = img.info.get('duration', 400)
        durations.append(duration)
        # Convert to RGBA for processing
        frame = img.convert("RGBA")
        pixels = frame.load()
        w, h = frame.size
        
        for y in range(h):
            for x in range(w):
                r, g, b, a = pixels[x, y]
                # Check if pixel is near-white
                if r >= threshold and g >= threshold and b >= threshold:
                    # Calculate whiteness
                    whiteness = (r + g + b) / 3
                    if whiteness >= threshold:
                        # Make fully transparent
                        pixels[x, y] = (r, g, b, 0)
                    elif whiteness >= threshold - 20:
                        # Feather edge
                        alpha_factor = (whiteness - (threshold - 20)) / 20
                        alpha_factor = 1 - alpha_factor  # invert: more white = less alpha
                        pixels[x, y] = (r, g, b, int(255 * alpha_factor))
        frames.append(frame)
    
    # Save optimized WebP with transparency
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=loop,
        disposal=2,
        lossless=False,
        quality=85,
        method=6
    )
    print(f"Saved transparent WebP: {output_path}")
    print(f"  Size: {os.path.getsize(output_path)/1024:.1f} KB")
    print(f"  Frames: {len(frames)}")
    
    # Verify
    test = Image.open(output_path)
    test.seek(0)
    pixels = test.load()
    w, h = test.size
    print(f"  Corner alpha (should be 0): {pixels[0,0]}")


if __name__ == "__main__":
    inp = "/home/z/my-project/public/rumbela/mascot-bela-animated.webp"
    out = inp  # overwrite
    
    print("Processing WebP to remove white background...")
    make_white_transparent_in_webp(inp, out, threshold=240)
    
    # Also process GIF
    print("\nProcessing GIF to remove white background...")
    gif_in = "/home/z/my-project/public/rumbela/mascot-bela-animated.gif"
    gif_out = gif_in
    
    img = Image.open(gif_in)
    n_frames = getattr(img, 'n_frames', 1)
    loop = img.info.get('loop', 0)
    durations = []
    gif_frames = []
    
    for i in range(n_frames):
        img.seek(i)
        duration = img.info.get('duration', 400)
        durations.append(duration)
        frame = img.convert("RGBA")
        pixels = frame.load()
        w, h = frame.size
        for y in range(h):
            for x in range(w):
                r, g, b, a = pixels[x, y]
                if r >= 240 and g >= 240 and b >= 240:
                    whiteness = (r + g + b) / 3
                    if whiteness >= 240:
                        pixels[x, y] = (r, g, b, 0)
                    elif whiteness >= 220:
                        alpha_factor = (whiteness - 220) / 20
                        alpha_factor = 1 - alpha_factor
                        pixels[x, y] = (r, g, b, int(255 * alpha_factor))
        # Convert to P with transparency
        p_frame = frame.quantize(colors=255, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
        # Find transparent index (corner pixel is now transparent)
        corner_rgba = frame.getpixel((0, 0))
        if len(corner_rgba) == 4 and corner_rgba[3] == 0:
            target = (corner_rgba[0], corner_rgba[1], corner_rgba[2])
            palette = p_frame.getpalette()
            t_idx = 0
            for j in range(0, len(palette) - 2, 3):
                if (palette[j], palette[j+1], palette[j+2]) == target:
                    t_idx = j // 3
                    break
            p_frame.info['transparency'] = t_idx
        gif_frames.append(p_frame)
    
    gif_frames[0].save(
        gif_out,
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        loop=loop,
        disposal=2,
        optimize=False
    )
    print(f"Saved transparent GIF: {gif_out}")
    print(f"  Size: {os.path.getsize(gif_out)/1024:.1f} KB")
