const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Clean Homepage View
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/cgupta/Documents/Jarvis/clean_homepage.png' });
  console.log('Saved clean_homepage.png');

  // 2. Add user's custom trajectory
  const addBtn = await page.locator('button:has-text("Add a new trajectory")');
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);

    const titleInput = page.locator('input[placeholder*="AI Agents"]');
    await titleInput.fill('Autonomous AI Agent Engine');

    const saveBtn = page.locator('button:has-text("Save Trajectory")');
    await saveBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/Users/cgupta/Documents/Jarvis/user_trajectory_added.png' });
    console.log('Saved user_trajectory_added.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
