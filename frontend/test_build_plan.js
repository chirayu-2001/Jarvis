const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Go to trajectory detail page
  await page.goto('http://localhost:3000/trajectory/ac997b07-6deb-4e82-8fa8-f3781b987c91');
  await page.waitForTimeout(1000);

  // 2. Type goal and click Build Plan
  const goalInput = page.locator('input[placeholder*="Build AI Skill Upgrade MVP"]');
  if (await goalInput.count() > 0) {
    await goalInput.fill('Master RAG architectures and build an LLM orchestration prototype');
  }

  const buildBtn = page.locator('button:has-text("Build Plan")');
  if (await buildBtn.count() > 0) {
    await buildBtn.click();
    await page.waitForTimeout(3500); // Allow AI plan generation
  }

  await page.screenshot({ path: '/Users/cgupta/Documents/Jarvis/build_plan_result.png', fullPage: true });
  console.log('Saved build_plan_result.png');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
