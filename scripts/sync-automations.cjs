/**
 * Copies the automation library's catalogue into the site:
 *
 *   node scripts/sync-automations.cjs                    from ../n8n-workflows
 *   node scripts/sync-automations.cjs /path/to/library   from somewhere else
 *
 * The site is a static export, so the catalogue is read at build time from
 * src/lib/automations.generated.json. Run this after the library changes and
 * commit the result. Nothing on the site about a workflow is typed by hand:
 * names, steps, diagrams and the tested behaviours all come from that file.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const library = path.resolve(process.argv[2] || path.join(root, "..", "n8n-workflows"));
const source = path.join(library, "catalog.json");
if (!fs.existsSync(source)) {
  console.error(`No catalog.json in ${library}. Run "npm run build" there first.`);
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(source, "utf8"));
if (!catalog.tested || catalog.tested.failed !== 0) {
  console.error("The library's last test run is missing or has failures. The site only publishes a passing run.");
  process.exit(1);
}

// The site has no use for the env var names, and they are a third of the file.
const workflows = catalog.workflows.map(({ env, ...w }) => w);
const out = { ...catalog, workflows };
fs.writeFileSync(path.join(root, "src/lib/automations.generated.json"), JSON.stringify(out) + "\n");
console.log(`synced ${workflows.length} workflows (${catalog.tested.passed} tested behaviours, n8n ${catalog.tested.n8n})`);
