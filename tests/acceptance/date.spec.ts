import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from './helpers';

async function setup(page: import('@playwright/test').Page) {
  await openGame(page); await reset(page, 123);
  await page.evaluate(() => {
    const key = 'shiny-memory.save.v1';
    const envelope = JSON.parse(localStorage.getItem(key)!);
    const s = envelope.state;
    s.phase = 'plan'; s.locationId = 'home'; s.clock.absoluteMinutes = 6 * 1440 + 8 * 60;
    s.pendingDialogueId = undefined; s.dialogueNodeId = undefined; s.dialogueChainId = undefined;
    s.storyChains = {}; s.jobs = []; s.money = 3000; s.flags.forced_rest = false;
    s.idols.mano.status = 'recruited'; s.idols.mano.stats.trust = { rank: 'E', exp: 10, maxRank: 'S' };
    s.idols.hiori.status = 'recruited'; s.selectedIdolId = 'hiori';
    s.actors.mano.scheduleOverrides = [];
    localStorage.setItem(key, JSON.stringify(envelope));
  });
  await page.reload();
}
async function book(page: import('@playwright/test').Page, fromMinute = '840') {
  await page.getByRole('button', { name: '电话：约会预约' }).click();
  await expect(page.getByRole('dialog', { name: '电话约会预约' })).toBeVisible();
  await page.getByLabel('约会时间').selectOption(fromMinute);
  await page.screenshot({ path: 'test-results/date-phone-fixture.png', fullPage: true });
  await page.getByRole('button', { name: '确认预约 · 支付 ¥1000' }).click();
  expect((await getState(page)).money).toBe(2000);
  await expect(page.getByRole('button', { name: '确认预约 · 支付 ¥1000' })).toBeDisabled();
  await page.getByRole('button', { name: '关闭电话' }).click();
}
test('phone booking, focus-independent choices, mid-dialogue reload and completion', async ({ page }) => {
  const errors = watchConsole(page);
  await setup(page); await book(page);
  await page.reload();
  expect((await getState(page)).dateAppointment?.status).toBe('scheduled');
  await jumpTo(page, 7, 840, 'park');
  await expect(page.getByRole('button', { name: /^开始约会/ })).toBeVisible();
  await page.getByRole('button', { name: /^开始约会/ }).click();
  expect((await getState(page)).dateAppointment?.status).toBe('inProgress');
  await page.getByRole('button', { name: /测试：合适选择/ }).click();
  expect((await getState(page)).flags['fixture.date.choiceApplied']).toBe(true);
  expect((await getState(page)).idols.mano.stats.trust.exp).toBe(30);
  await page.reload();
  expect((await getState(page)).idols.mano.stats.trust.exp).toBe(30);
  await page.getByRole('button', { name: '继续', exact: true }).click();
  const done = await getState(page);
  expect(done.dateAppointment?.status).toBe('completed');
  expect(done.clock.absoluteMinutes).toBe(6 * 1440 + 900);
  expect(done.idols.mano.stats.trust.exp).toBe(30);
  await expect(page.getByRole('button', { name: /^开始约会/ })).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('missed appointments settle once on sleep, debug jump and reload without rank loss', async ({ page }) => {
  const errors = watchConsole(page);
  await setup(page); await book(page);
  await jumpTo(page, 7, 870, 'park');
  let s = await getState(page);
  expect(s.dateAppointment?.status).toBe('missed');
  expect(s.idols.mano.stats.trust).toMatchObject({ rank: 'E', exp: 0 });
  expect(s.money).toBe(2000);
  await page.reload();
  s = await getState(page);
  expect(s.log.filter(l => l.text.includes('错过了约会'))).toHaveLength(1);
  await jumpTo(page, 8, 8 * 60, 'home');
  expect((await getState(page)).dateAppointment).toBeUndefined();
  expect((await getState(page)).actors.mano.scheduleOverrides).toEqual([]);
  expect((await getState(page)).idols.mano.stats.trust.exp).toBe(0);
  await setup(page); await book(page, '1200');
  await jumpTo(page, 7, 20 * 60, 'home');
  expect((await getState(page)).dateAppointment?.status).toBe('scheduled');
  await page.evaluate(() => window.__SHINY_MEMORY__!.dispatch({ type: 'activity', activityId: 'sleep' }));
  const slept = await getState(page);
  expect(slept.clock.absoluteMinutes).toBe(7 * 1440 + 8 * 60);
  expect(slept.idols.mano.stats.trust).toMatchObject({ rank: 'E', exp: 0 });
  expect(slept.log.filter(l => l.text.includes('错过了约会'))).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('an expired loaded reservation durably settles before any further player command', async ({ page }) => {
  await setup(page); await book(page);
  await page.evaluate(() => {
    const key = 'shiny-memory.save.v1';
    const envelope = JSON.parse(localStorage.getItem(key)!);
    envelope.state.clock.absoluteMinutes = 6 * 1440 + 870;
    localStorage.setItem(key, JSON.stringify(envelope));
  });
  await page.reload();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('shiny-memory.save.v1')!).state);
  expect(saved.dateAppointment.status).toBe('missed');
  expect(saved.idols.mano.stats.trust.exp).toBe(0);
  await page.reload();
  expect((await getState(page)).log.filter(l => l.text.includes('错过了约会'))).toHaveLength(1);
});
