// Existing media/unit only. No search, campaign or private-input pages.
export const PILOT = Object.freeze({origin:'https://muryo-shimekiri-radar.pages.dev',path:'/guide/',publisherId:3526726,siteId:6169269,adUnitId:32050649,src:'https://bauval.org/14/cbbdf4a52930238b4b112ecaea3ddd26'});
export function eligible(config,context){
 return config?.enabled===true && identityMatches(config.media) && config?.scope==='/guide/' && config?.deliveryHostsVerified===true && config?.categoryVerified===true && config?.mobileCloseVerified===true && context.origin===PILOT.origin && context.path===PILOT.path && context.dnt!=='1' && context.gpc!==true && context.optedOut!==true && context.automated!==true;
}
export function identityMatches(ads){
 return ads?.provider==='Adsterra' && ads.status==='approved' && ads.publisherId===PILOT.publisherId && ads.siteId===PILOT.siteId && ads.adUnitId===PILOT.adUnitId && ads.format==='Social Bar' && ads.acquiredCode===`<script data-cfasync="false" src="${PILOT.src}"></script>`;
}
export function startPilot(doc,nav,loc,storage,config){
 let optedOut;try{optedOut=storage.getItem('radar-ad-pilot-stop')==='1';}catch{return false;}
 if(!eligible(config,{origin:loc.origin,path:loc.pathname,dnt:nav.doNotTrack,gpc:nav.globalPrivacyControl,optedOut,automated:nav.webdriver}))return false;
 const box=doc.querySelector('[data-ad-pilot]'),stop=doc.querySelector('[data-ad-pilot-stop]');
 if(!box||!stop||doc.querySelector('script[data-radar-adsterra]'))return false;
 stop.addEventListener('click',()=>{try{storage.setItem('radar-ad-pilot-stop','1');}catch{return;}loc.reload();});
 const script=doc.createElement('script');script.src=PILOT.src;script.setAttribute('data-cfasync','false');script.setAttribute('data-radar-adsterra','1');script.async=true;box.append(script);return true;
}
