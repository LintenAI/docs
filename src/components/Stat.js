import {usePluginData} from '@docusaurus/useGlobalData';

// A Linten figure fetched at build time by plugins/linten-stats.js, e.g.
// <Stat id="stars" /> renders "59.8k". The markdown copy gets the same value.
export default function Stat({id}) {
  const stats = usePluginData('linten-stats') || {};
  return stats[id] ?? null;
}
