import fs from 'node:fs/promises';
import {validateCampaigns,statusOf} from '../src/core.mjs';
const items=JSON.parse(await fs.readFile('data/campaigns.json','utf8'));
validateCampaigns(items);
const config=JSON.parse(await fs.readFile('data/site.json','utf8'));
if(config.ads.enabled&&!config.ads.siteSpecificCode)throw Error('Adsterra site-specific code required');
if(config.ads.enabled)throw Error('Ad integration requires a dedicated reviewed release; this version is ad-free');
const counts={};for(const c of items){const s=statusOf(c);counts[s]=(counts[s]||0)+1;}
console.log(JSON.stringify({valid:true,total:items.length,effectiveStatus:counts,adsEnabled:config.ads.enabled}));
