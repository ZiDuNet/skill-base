import path from 'node:path';
import { pruneMissingSkillInstalls } from './installs.js';

export function buildTargetInstalls(skillId, options) {
  if (options?.dir) {
    return [
      {
        installPath: path.resolve(options.dir, skillId),
        version: '',
        installedAt: '',
        ide: '',
        isGlobal: false
      }
    ];
  }

  return pruneMissingSkillInstalls(skillId);
}

export function resolveImplicitSelectedInstalls(installs, options) {
  if (options?.dir) {
    return installs;
  }

  if (installs.length === 1) {
    return installs;
  }

  return null;
}
