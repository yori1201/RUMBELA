// Extract the mascot character with transparent background
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const imagePath = '/home/z/my-project/upload/photo_6269233281324750500_y.jpg';
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  const prompt = "Extract ONLY the green sprout mascot character (the cute green bean sprout character with big eyes, red cheeks, two green leaves on top of head, holding a yellow pencil, lying on an open white book). Remove ALL other elements: the orange house background, blue chimney, blue pillar, stacked books on the right, the colorful 'Rumbela' bubble text, the 'Rumah belajar Anak' tagline, and all yellow line decorations. Place ONLY the mascot character centered on a fully transparent background. Keep the mascot's design, colors, and all details exactly identical - do not modify the character at all.";

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
  fs.writeFileSync('/home/z/my-project/public/rumbela/mascot-bela.png', buffer);
  console.log('Mascot saved!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
