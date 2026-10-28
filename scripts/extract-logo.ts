// Extract the full Rumbela logo with transparent background
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const imagePath = '/home/z/my-project/upload/photo_6269233281324750500_y.jpg';
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  const prompt = "Keep the entire logo composition exactly as is - the green sprout mascot character, the orange house background with blue chimney and pillar, the stacked books on the right, the colorful 'Rumbela' bubble text with the leaf decoration on the letter R, and the blue 'Rumah belajar Anak' tagline below. Only REMOVE the white/solid background, making it fully transparent. Do NOT modify, recolor, or redesign any element of the logo. Preserve all colors, shapes, positions, and design details exactly as they are in the original.";

  const zai = await ZAI.create();
  const response = await zai.images.generations.edit({
    prompt,
    images: [{ url: dataUrl }],
    size: '1024x1024',
  });

  const base64 = response?.data?.[0]?.base64;
  if (!base64) {
    console.error('No image data returned');
    console.log('Full response:', JSON.stringify(response, null, 2));
    return;
  }

  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync('/home/z/my-project/public/rumbela/logo-full.png', buffer);
  console.log('Logo saved!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
