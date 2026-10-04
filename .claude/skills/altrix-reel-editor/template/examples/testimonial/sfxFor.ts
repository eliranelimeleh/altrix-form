import {ClipData} from './ClipEngine';

export const sfxFor = (d: Omit<ClipData, 'sfx'>, extra: [number, string, number?][] = []): [number, string, number?][] => {
  const out: [number, string, number?][] = [...extra];
  for (const j of d.joins) out.push([j - 0.05, 'swish', 0.22]);
  for (const e of d.events) {
    if (e.type === 'money') out.push([e.at, 'cash', 0.42], [e.at + 0.25, 'coins', 0.3]);
    if (e.type === 'focus') out.push([e.at, 'hud', 0.3]);
    if (e.type === 'scan') out.push([e.at, 'hud', 0.22]);
    if (e.type === 'quote' || e.type === 'stat' || e.type === 'phone' || e.type === 'shield') out.push([e.at, 'whoosh', 0.3]);
    if (e.type === 'stat') out.push([e.at + 1.3, 'ding', 0.35]);
    if (e.type === 'phone') out.push([e.tapAt, 'click', 0.5], [e.tapAt + 0.05, 'ping', 0.3]);
    if (e.type === 'stamp') out.push([e.at, 'boom', 0.3]);
  }
  out.push([d.len - 0.1, 'whoosh', 0.3]);
  return out;
};
