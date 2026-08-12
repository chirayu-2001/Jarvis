const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);

  // 1. Open Add Trajectory Modal
  const addBtn = await page.locator('button:has-text("Add a new trajectory")');
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(500);

    // Click Custom Category button
    const customBtn = await page.locator('button:has-text("Custom Category")');
    if (await customBtn.count() > 0) {
      await customBtn.click();
      await page.waitForTimeout(300);

      // Fill in custom category input
      const customInput = page.locator('input[placeholder*="Startup, Gaming"]');
      if (await customInput.count() > 0) {
        await customInput.fill('Gaming & Esports');
      }
    }

    await page.screenshot({ path: '/Users/cgupta/Documents/Jarvis/custom_category_modal.png' });
    console.log('Saved custom_category_modal.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
