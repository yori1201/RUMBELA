// Generate animated frames for mascot Bela
// We'll create 4 variations: slight body movement + blinking eyes + waving leaves
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function generateFrame(prompt: string, outputPath: string) {
  const imagePath = '/home/z/my-project/public/rumbela/mascot-base.png';
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64Image}`;

  const zai = await ZAI.create();
  const response = await zai.images.generations.edit({
    prompt,
    images: [{ url: dataUrl }],
    size: '1024x1024',
  });

  const base64 = response?.data?.[0]?.base64;
  if (!base64) {
    console.error('No image data for:', outputPath);
    return;
  }

  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Saved: ${outputPath}`);
}

async function main() {
  const basePrompt = "Keep this exact green sprout mascot character with the same design, colors, and all details (yellow pencil in right hand, blue book in left hand, two green leaves on top, big eyes, pink blush, happy smile). Keep transparent background. ONLY make this small change: ";

  // Frame 1: Idle pose - body slightly raised, leaves pointing up
  await generateFrame(
    `${basePrompt} make the character's body position slightly higher/up, leaves pointing straight up, eyes wide open looking forward, big smile. Slight upward float motion.`,
    '/home/z/my-project/public/rumbela/frame-1.png'
  );

  // Frame 2: Blink + lean right - body slightly tilted right, eyes half-closed (blinking)
  await generateFrame(
    `${basePrompt} make the character tilt slightly to the right, with eyes half-closed in a blink (eyelids halfway down), leaves slightly curved to the right. Subtle sway motion.`,
    '/home/z/my-project/public/rumbela/frame-2.png'
  );

  // Frame 3: Lean left + leaves wave - body tilted left, leaves spread out
  await generateFrame(
    `${basePrompt} make the character tilt slightly to the left, with eyes wide open again, leaves spread outward like waving hello. Subtle sway to opposite side.`,
    '/home/z/my-project/public/rumbela/frame-3.png'
  );

  // Frame 4: Excited bounce - body slightly lower/squished, mouth wider
  await generateFrame(
    `${basePrompt} make the character's body position slightly lower (squished bounce pose), eyes wide open and sparkling, mouth open wider in excitement, leaves pointing straight up. Anticipation bounce.`,
    '/home/z/my-project/public/rumbela/frame-4.png'
  );

  console.log('\nAll 4 frames generated!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
