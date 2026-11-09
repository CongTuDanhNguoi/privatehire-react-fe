// =============================================================
// Tải toàn bộ ảnh/icon mà code xuất từ Figma đang trỏ tới, rồi đổi
// đường dẫn trong code sang file trên máy (public/figma-assets/...).
//
//   npm run figma-assets
//
// Link ảnh tạm của Figma chỉ sống 7 ngày, nên chạy lệnh này NGAY sau khi
// giải nén project. Chạy lại nhiều lần cũng không sao (file đã tải thì bỏ qua).
// =============================================================
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "public", "figma-assets");
// Bắt mọi dòng dạng: const <tên> = "https://www.figma.com/api/mcp/asset/<id>";
const PREFIX_RE = /const (\w+) = "https:\/\/www\.figma\.com\/api\/mcp\/asset\/([0-9a-f-]+)";/g;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) yield full;
  }
}

async function exists(file) {
  try {
    return (await stat(file)).size > 0;
  } catch {
    return false;
  }
}

let downloaded = 0;
let failed = 0;

for await (const file of walk(SRC)) {
  let code = await readFile(file, "utf8");
  const prefixes = [...code.matchAll(PREFIX_RE)];
  if (prefixes.length === 0) continue;

  for (const [line, varName, id] of prefixes) {
    const remote = `https://www.figma.com/api/mcp/asset/${id}`;
    const fileRe = new RegExp(`\\$\\{${varName}\\}/([A-Za-z0-9._-]+)`, "g");
    const names = [...new Set([...code.matchAll(fileRe)].map((m) => m[1]))];
    await mkdir(path.join(OUT, id), { recursive: true });

    let allOk = true;
    for (const name of names) {
      const target = path.join(OUT, id, name);
      if (await exists(target)) continue;
      try {
        const res = await fetch(`${remote}/${name}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await writeFile(target, Buffer.from(await res.arrayBuffer()));
        downloaded++;
      } catch (err) {
        allOk = false;
        failed++;
        console.error(`✗ ${path.relative(ROOT, file)} -> ${name}: ${err.message}`);
      }
    }

    if (allOk) {
      code = code.replace(line, `const ${varName} = "/figma-assets/${id}";`);
      console.log(`✓ ${path.relative(ROOT, file)} [${varName}] (${names.length} assets)`);
    }
  }
  await writeFile(file, code);
}

console.log(`\nDone: ${downloaded} file(s) downloaded, ${failed} failed.`);
if (failed) {
  console.log("Nếu link đã hết hạn (quá 7 ngày), nhờ Claude xuất lại màn đó từ Figma.");
  process.exitCode = 1;
}
