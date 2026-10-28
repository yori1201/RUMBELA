"""
Step 1: Remove black background from mascot image.
The new mascot has a solid black background which is easy to remove
by checking pixel brightness.
"""
from PIL import Image
import os

def remove_black_background(input_path, output_path, threshold=30):
    """Remove black/near-black pixels by making them transparent."""
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Calculate brightness
            brightness = (r + g + b) / 3
            if brightness <= threshold:
                # Black - make transparent
                pixels[x, y] = (r, g, b, 0)
            elif brightness <= threshold + 30:
                # Near-black edge - feather alpha
                alpha_factor = (brightness - threshold) / 30
                pixels[x, y] = (r, g, b, int(255 * alpha_factor))
    img.save(output_path, "PNG")
    print(f"Saved: {output_path} ({os.path.getsize(output_path)} bytes)")


def trim_to_content(input_path, output_path, padding=20):
    """Trim transparent borders to fit content tightly."""
    img = Image.open(input_path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        left = max(0, bbox[0] - padding)
        top = max(0, bbox[1] - padding)
        right = min(img.width, bbox[2] + padding)
        bottom = min(img.height, bbox[3] + padding)
        img = img.crop((left, top, right, bottom))
    img.save(output_path, "PNG")
    print(f"Trimmed: {output_path} ({img.size})")


if __name__ == "__main__":
    base = "/home/z/my-project/public/rumbela"
    src = "/home/z/my-project/upload/MASKOT RUMBELA BG.png"
    
    # Step 1: remove black bg
    tmp = os.path.join(base, "mascot-clean-tmp.png")
    remove_black_background(src, tmp, threshold=25)
    
    # Step 2: trim to content
    final = os.path.join(base, "mascot-base.png")
    trim_to_content(tmp, final, padding=20)
    os.remove(tmp)
    
    # Verify alpha
    img = Image.open(final)
    pixels = img.load()
    w, h = img.size
    print(f"\nVerification - corners (should be transparent):")
    for name, x, y in [("TL",0,0), ("TR",w-1,0), ("BL",0,h-1), ("BR",w-1,h-1)]:
        print(f"  {name}: {pixels[x,y]}")
    print(f"Center: {pixels[w//2, h//2]}")
