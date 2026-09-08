import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { EMAIL_KINDS } from '../lib/email/templates';

for(const width of [720,390]) for(const kind of EMAIL_KINDS){
  test(`email ${kind} at ${width}px`,async({page})=>{
    test.skip(process.env.E2E_EMAIL_PREVIEW!=='true','Requires local generated email preview on port 3044');
    await page.setViewportSize({width,height:1100});
    await page.goto(`http://127.0.0.1:3044/${kind}.html`);
    await expect(page.getByRole('heading',{level:1})).toBeVisible();
    await expect(page.getByRole('img',{name:'umbra',exact:true})).toBeVisible();
    expect(await page.evaluate(()=>Array.from(document.images).every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
    await page.screenshot({path:`.impeccable/review/emails/${kind}-${width}.png`,fullPage:true});
  });
}
