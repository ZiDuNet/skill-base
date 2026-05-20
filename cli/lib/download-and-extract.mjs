import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import extract from 'extract-zip';
import { createClient } from './api.js';
import { lang } from './i18n.js';

const M = {
  noVersion: {
    zh: (id) => `Skill ${id} 没有可用版本`,
    en: (id) => `Skill ${id} has no available version`
  }
};

function pickFn(obj, arg) {
  const fn = obj[lang] || obj.en;
  return typeof fn === 'function' ? fn(arg) : '';
}

export async function downloadAndExtract(skillId, version, targetDir) {
  const client = createClient();

  const skillInfo = await client.get(`/skills/${encodeURIComponent(skillId)}`);

  const actualVersion = version === 'latest' ? skillInfo.latest_version : version;

  if (!actualVersion) {
    throw new Error(pickFn(M.noVersion, skillId));
  }

  const response = await client.download(
    `/skills/${encodeURIComponent(skillId)}/versions/${encodeURIComponent(actualVersion)}/download`
  );

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const tmpZip = path.join(os.tmpdir(), `skb-${skillId}-${actualVersion}-${Date.now()}.zip`);
  fs.writeFileSync(tmpZip, buffer);

  fs.mkdirSync(targetDir, { recursive: true });

  await extract(tmpZip, { dir: path.resolve(targetDir) });

  try {
    fs.unlinkSync(tmpZip);
  } catch {
    // ignore
  }

  return { skillId, version: actualVersion, targetDir };
}
