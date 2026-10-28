"""
Remove white background from PNG images programmatically.
Converts near-white pixels to transparent, preserving the mascot.
"""
from PIL import Image, ImageEnhance
import os

def remove_white_background(input_path, output_path, threshold=235, feather=2):
    """
    Remove white/near-white background from image, making it transparent.
    Uses a threshold to determine what counts as 'white'.
    Adds feathering to edges for smoother result.
    """
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Create alpha channel based on whiteness
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # If pixel is near-white, make it transparent
            if r >= threshold and g >= threshold and b >= threshold:
                # Calculate alpha based on how white the pixel is
                whiteness = (r + g + b) / 3
                if whiteness >= threshold:
                    # Fully white → transparent
                    pixels[x, y] = (r, g, b, 0)
                else:
                    # Partially white → semi-transparent
                    alpha = int(255 * (1 - (whiteness - 200) / (threshold - 200)))
                    pixels[x, y] = (r, g, b, max(0, min(255, alpha)))
            # Edge feathering - check if neighbors are white
            elif feather > 0 and (r > 200 or g > 200 or b > 200):
                # Check if any 4-neighbors are white (likely edge)
                neighbors_white = 0
                neighbors_total = 0
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        nr, ng, nb, _ = pixels[nx, ny]
                        neighbors_total += 1
                        if nr >= threshold and ng >= threshold and nb >= threshold:
                            neighbors_white += 1
                if neighbors_white >= 2 and neighbors_total > 0:
                    # Edge pixel - reduce alpha based on white neighbor count
                    alpha_factor = 1 - (neighbors_white / neighbors_total) * 0.7
                    pixels[x, y] = (r, g, b, int(255 * alpha_factor))

    img.save(output_path, "PNG")
    print(f"Saved: {output_path} ({os.path.getsize(output_path)} bytes)")


def trim_to_content(input_path, output_path, padding=10):
    """Trim transparent borders to fit content, with optional padding."""
    img = Image.open(input_path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        # Add padding
        left = max(0, bbox[0] - padding)
        top = max(0, bbox[1] - padding)
        right = min(img.width, bbox[2] + padding)
        bottom = min(img.height, bbox[3] + padding)
        img = img.crop((left, top, right, bottom))
    img.save(output_path, "PNG")
    print(f"Trimmed: {output_path} ({img.size})")


if __name__ == "__main__":
    base_dir = "/home/z/my-project/public/rumbela"

    # Process mascot
    mascot_in = os.path.join(base_dir, "mascot-bela.png")
    mascot_tmp = os.path.join(base_dir, "mascot-bela-tmp.png")
    mascot_out = os.path.join(base_dir, "mascot-bela.png")
    print("Processing mascot...")
    remove_white_background(mascot_in, mascot_tmp, threshold=235, feather=2)
    trim_to_content(mascot_tmp, mascot_out, padding=15)
    os.remove(mascot_tmp)

    # Process full logo (less aggressive threshold - keep light colors like the white book pages)
    logo_in = os.path.join(base_dir, "logo-full.png")
    logo_tmp = os.path.join(base_dir, "logo-full-tmp.png")
    logo_out = os.path.join(base_dir, "logo-full.png")
    print("\nProcessing logo...")
    # Higher threshold for logo - only remove pure white background, keep light elements
    remove_white_background(logo_in, logo_tmp, threshold=245, feather=1)
    trim_to_content(logo_tmp, logo_out, padding=5)
    os.remove(logo_tmp)

    print("\nDone!")
