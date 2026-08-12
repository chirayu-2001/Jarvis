const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Go to homepage first
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);

  // 2. Click on the trajectory card
  const card = await page.locator('.interest-card').first();
  if (await card.count() > 0) {
    await card.click();
    await page.waitForTimeout(1000);
  } else {
    // Navigate directly to known trajectory ID
    await page.goto('http://localhost:3000/trajectory/ac997b07-6deb-4e82-8fa8-f3781b987c91');
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: '/Users/cgupta/Documents/Jarvis/trajectory_detail_page.png', fullPage: true });
  console.log('Saved trajectory_detail_page.png');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
