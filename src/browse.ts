#!/usr/bin/env bun
/**
 * super-aidlc browse -- lightweight headless Chromium CLI for QA testing.
 * Built on playwright-core. Self-contained, no gstack dependency.
 *
 * Usage:
 *   super-aidlc-browse goto https://example.com
 *   super-aidlc-browse snapshot -i
 *   super-aidlc-browse click @e3
 *   super-aidlc-browse screenshot /tmp/shot.png
 */

import { chromium, type Browser, type Page, type BrowserContext } from "playwright-core";
import { existsSync } from "fs";
import { join } from "path";

// State file for persistent browser across commands
const STATE_DIR = join(process.env.HOME || "/tmp", ".aidlc");
const STATE_FILE = join(STATE_DIR, "browse-state.json");

interface BrowseState {
  wsEndpoint?: string;
  pid?: number;
}

// Find Chromium binary
function findChromium(): string | null {
  const candidates = [
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    // Playwright bundled
    join(process.env.HOME || "", ".cache/ms-playwright/chromium-*/chrome-mac/Chromium.app/Contents/MacOS/Chromium"),
    // Linux
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ];

  for (const c of candidates) {
    // Handle glob patterns
    if (c.includes("*")) {
      const { globSync } = require("fs");
      try {
        const matches = globSync(c);
        if (matches.length > 0) return matches[0];
      } catch {
        continue;
      }
    }
    if (existsSync(c)) return c;
  }
  return null;
}

let browser: Browser | null = null;
let page: Page | null = null;
let elementRefs: Map<string, string> = new Map(); // @e1 -> selector
let snapshotBaseline: string | null = null;

async function ensureBrowser(): Promise<Page> {
  if (page) return page;

  const executablePath = findChromium();
  if (!executablePath) {
    console.error(
      "No Chromium found. Install Chrome, Chromium, or run:\n  npx playwright install chromium"
    );
    process.exit(1);
  }

  browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  });

  page = await context.newPage();
  return page;
}

async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
}

// --- Commands ---

async function cmdGoto(url: string): Promise<void> {
  const p = await ensureBrowser();
  await p.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  console.log(`Navigated to: ${p.url()}`);
  elementRefs.clear();
  snapshotBaseline = null;
}

async function cmdSnapshot(flags: string[]): Promise<void> {
  const p = await ensureBrowser();
  const interactiveOnly = flags.includes("-i");
  const showDiff = flags.includes("-D");
  const annotate = flags.includes("-a");
  const outputPath =
    flags.includes("-o") ? flags[flags.indexOf("-o") + 1] : "/tmp/aidlc-annotated.png";

  // Build accessibility tree using ariaSnapshot (modern Playwright API)
  const locator = interactiveOnly
    ? p.locator("button, a, input, select, textarea, [role='button'], [role='link'], [tabindex]")
    : p.locator("body");

  let output: string;
  try {
    output = await locator.first().ariaSnapshot();
  } catch {
    // Fallback: get all interactive elements manually
    const elements = await p.evaluate((interactiveOnly: boolean) => {
      const selector = interactiveOnly
        ? "button, a, input, select, textarea, [role='button'], [role='link']"
        : "h1, h2, h3, p, button, a, input, select, textarea, img, [role]";
      const els = document.querySelectorAll(selector);
      return Array.from(els).map((el, i) => {
        const tag = el.tagName.toLowerCase();
        const role = el.getAttribute("role") || tag;
        const name = el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 50) || "";
        const type = el.getAttribute("type") || "";
        const placeholder = el.getAttribute("placeholder") || "";
        return `@e${i + 1} [${role}]${type ? ` type="${type}"` : ""} "${name || placeholder}"`;
      });
    }, interactiveOnly);
    output = elements.join("\n");
  }

  // Build @ref map from output
  elementRefs.clear();
  let refCounter = 1;
  for (const line of output.split("\n")) {
    const nameMatch = line.match(/"([^"]+)"/);
    if (nameMatch) {
      elementRefs.set(`@e${refCounter}`, nameMatch[1]);
      refCounter++;
    }
  }

  if (showDiff && snapshotBaseline) {
    const oldLines = snapshotBaseline.split("\n");
    const newLines = output.split("\n");
    const added = newLines.filter((l) => !oldLines.includes(l));
    const removed = oldLines.filter((l) => !newLines.includes(l));
    if (added.length === 0 && removed.length === 0) {
      console.log("(no changes)");
    } else {
      for (const r of removed) console.log(`- ${r}`);
      for (const a of added) console.log(`+ ${a}`);
    }
  } else {
    console.log(output);
  }

  snapshotBaseline = output;

  if (annotate) {
    await p.screenshot({ path: outputPath, fullPage: true });
    console.log(`Annotated screenshot: ${outputPath}`);
  }
}

async function cmdClick(selector: string): Promise<void> {
  const p = await ensureBrowser();
  const target = resolveSelector(selector);
  await p.click(target, { timeout: 5000 });
  console.log(`Clicked: ${selector}`);
}

async function cmdFill(selector: string, value: string): Promise<void> {
  const p = await ensureBrowser();
  const target = resolveSelector(selector);
  await p.fill(target, value, { timeout: 5000 });
  console.log(`Filled: ${selector} = "${value}"`);
}

async function cmdScreenshot(args: string[]): Promise<void> {
  const p = await ensureBrowser();
  const path = args[0] || "/tmp/aidlc-screenshot.png";
  const fullPage = !args.includes("--viewport");
  await p.screenshot({ path, fullPage });
  console.log(`Screenshot: ${path}`);
}

async function cmdText(): Promise<void> {
  const p = await ensureBrowser();
  const text = await p.innerText("body");
  console.log(text.slice(0, 5000));
}

async function cmdUrl(): Promise<void> {
  const p = await ensureBrowser();
  console.log(p.url());
}

async function cmdConsole(flags: string[]): Promise<void> {
  const p = await ensureBrowser();
  const errorsOnly = flags.includes("--errors");

  // Collect console messages for 2 seconds
  const messages: string[] = [];
  const handler = (msg: any) => {
    const type = msg.type();
    if (errorsOnly && type !== "error" && type !== "warning") return;
    messages.push(`[${type}] ${msg.text()}`);
  };
  p.on("console", handler);

  // Check for existing errors via page evaluation
  const jsErrors = await p.evaluate(() => {
    const errs: string[] = [];
    // Check for unhandled errors stored on window
    if ((window as any).__aidlc_errors) {
      errs.push(...(window as any).__aidlc_errors);
    }
    return errs;
  });

  for (const e of jsErrors) {
    messages.push(`[error] ${e}`);
  }

  if (messages.length === 0) {
    console.log(errorsOnly ? "No console errors." : "No console messages.");
  } else {
    for (const m of messages) console.log(m);
  }

  p.removeListener("console", handler);
}

async function cmdNetwork(): Promise<void> {
  const p = await ensureBrowser();
  // Check for failed requests by evaluating performance entries
  const failed = await p.evaluate(() => {
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return entries
      .filter((e) => e.responseStatus && e.responseStatus >= 400)
      .map((e) => `${e.responseStatus} ${e.name}`)
      .slice(0, 20);
  });

  if (failed.length === 0) {
    console.log("No failed network requests.");
  } else {
    for (const f of failed) console.log(f);
  }
}

async function cmdIs(prop: string, selector: string): Promise<void> {
  const p = await ensureBrowser();
  const target = resolveSelector(selector);

  let result = false;
  switch (prop) {
    case "visible":
      result = await p.isVisible(target);
      break;
    case "hidden":
      result = await p.isHidden(target);
      break;
    case "enabled":
      result = await p.isEnabled(target);
      break;
    case "disabled":
      result = await p.isDisabled(target);
      break;
    case "checked":
      result = await p.isChecked(target);
      break;
    case "editable":
      result = await p.isEditable(target);
      break;
    default:
      console.error(`Unknown property: ${prop}`);
      process.exit(1);
  }
  console.log(result);
}

async function cmdViewport(size: string): Promise<void> {
  const p = await ensureBrowser();
  const [w, h] = size.split("x").map(Number);
  await p.setViewportSize({ width: w, height: h });
  console.log(`Viewport: ${w}x${h}`);
}

async function cmdResponsive(prefix: string): Promise<void> {
  const p = await ensureBrowser();
  const sizes = [
    { name: "mobile", w: 375, h: 812 },
    { name: "tablet", w: 768, h: 1024 },
    { name: "desktop", w: 1280, h: 720 },
  ];
  for (const { name, w, h } of sizes) {
    await p.setViewportSize({ width: w, height: h });
    await p.waitForTimeout(500);
    const path = `${prefix}-${name}.png`;
    await p.screenshot({ path, fullPage: false });
    console.log(`${name} (${w}x${h}): ${path}`);
  }
  // Reset to desktop
  await p.setViewportSize({ width: 1280, height: 720 });
}

async function cmdJs(expr: string): Promise<void> {
  const p = await ensureBrowser();
  const result = await p.evaluate(expr);
  console.log(String(result));
}

async function cmdWait(target: string): Promise<void> {
  const p = await ensureBrowser();
  if (target === "--networkidle") {
    await p.waitForLoadState("networkidle");
  } else if (target === "--load") {
    await p.waitForLoadState("load");
  } else {
    await p.waitForSelector(resolveSelector(target), { timeout: 15000 });
  }
  console.log(`Wait complete: ${target}`);
}

// --- Helpers ---

function resolveSelector(input: string): string {
  // @e3 -> look up by accessible name
  if (input.startsWith("@e")) {
    const name = elementRefs.get(input);
    if (name) {
      return `text="${name}"`;
    }
    // Fallback: try nth interactive element
    const idx = parseInt(input.slice(2)) - 1;
    return `:nth-match(:is(button, a, input, select, textarea), ${idx + 1})`;
  }
  // CSS selector or text selector
  return input;
}

// --- Main ---

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd) {
    console.log(`super-aidlc-browse -- headless Chromium for QA testing

Commands:
  goto <url>              Navigate to URL
  snapshot [-i] [-D] [-a] Accessibility tree (@e refs)
  click <sel|@ref>        Click element
  fill <sel|@ref> <value> Fill input
  screenshot [path]       Save screenshot
  text                    Get page text
  url                     Get current URL
  console [--errors]      Console messages
  network                 Failed requests
  is <prop> <sel>         State check (visible|hidden|enabled|disabled|checked)
  viewport <WxH>          Set viewport size
  responsive <prefix>     Screenshots at mobile/tablet/desktop
  js <expr>               Run JavaScript
  wait <sel|--networkidle|--load>  Wait for element or state
  stop                    Close browser`);
    return;
  }

  try {
    switch (cmd) {
      case "goto":
        await cmdGoto(args[1]);
        break;
      case "snapshot":
        await cmdSnapshot(args.slice(1));
        break;
      case "click":
        await cmdClick(args[1]);
        break;
      case "fill":
        await cmdFill(args[1], args[2]);
        break;
      case "screenshot":
        await cmdScreenshot(args.slice(1));
        break;
      case "text":
        await cmdText();
        break;
      case "url":
        await cmdUrl();
        break;
      case "console":
        await cmdConsole(args.slice(1));
        break;
      case "network":
        await cmdNetwork();
        break;
      case "is":
        await cmdIs(args[1], args[2]);
        break;
      case "viewport":
        await cmdViewport(args[1]);
        break;
      case "responsive":
        await cmdResponsive(args[1] || "/tmp/aidlc-responsive");
        break;
      case "js":
        await cmdJs(args.slice(1).join(" "));
        break;
      case "wait":
        await cmdWait(args[1]);
        break;
      case "stop":
        await closeBrowser();
        console.log("Browser closed.");
        break;
      default:
        console.error(`Unknown command: ${cmd}`);
        process.exit(1);
    }
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    await closeBrowser();
    process.exit(1);
  }

  // Always close browser after command (each invocation is stateless)
  await closeBrowser();
}

main();
