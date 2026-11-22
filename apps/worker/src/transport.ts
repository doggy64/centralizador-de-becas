import {lookup} from "node:dns/promises";
import {request} from "node:https";
import ipaddr from "ipaddr.js";
import robotsParser from "robots-parser";
import {setTimeout as delay} from "node:timers/promises";
import {httpsUrl} from "./candidate";

export const agentName="BecasCatalogBot";
export function isPublic(address:string){
 if(!ipaddr.isValid(address))return false;
 const ip=ipaddr.parse(address);
 if(ip.range()!=="unicast")return false;
 if(ip.kind()==="ipv6")return (ip as ipaddr.IPv6).match(ipaddr.parse("2000::") as ipaddr.IPv6,3);
 return true;
}
type ResponseData={body:Buffer,status:number,mime:string,location?:string};
export async function pinnedGet(url:URL,max:number):Promise<ResponseData>{
 const records=await lookup(url.hostname,{all:true});
 if(!records.length||records.some(r=>!isPublic(r.address)))throw new Error("DNS fuera de rangos públicos");
 const dest=records[0];
 return new Promise((resolve,reject)=>{
  const req=request(url,{method:"GET",agent:false,family:dest.family,lookup:(_host,_options,done)=>done(null,dest.address,dest.family),headers:{"User-Agent":agentName,"Accept-Encoding":"identity"}},res=>{
   const chunks:Buffer[]=[];let length=0;
   res.on("error",reject);
   res.on("data",(chunk:Buffer)=>{length+=chunk.length;if(length>max){req.destroy(new Error("Respuesta demasiado grande"));return;}chunks.push(chunk);});
   res.on("end",()=>resolve({body:Buffer.concat(chunks),status:res.statusCode??0,mime:(res.headers["content-type"]??"").split(";")[0].trim().toLowerCase(),location:res.headers.location}));
  });
  const timer=setTimeout(()=>req.destroy(new Error("Tiempo de descarga agotado")),12000);
  req.on("error",reject);
  req.on("close",()=>clearTimeout(timer));
  req.end();
 });
}
export async function fetchOfficial(raw:string,allowed:Set<string>,get=pinnedGet,pause=delay){
 let url=new URL(raw);
 for(let hop=0;hop<4;hop++){
  httpsUrl.parse(url.href);
  if(!allowed.has(url.hostname))throw new Error("Host sin permiso de acceso");
  const robotsUrl=new URL("/robots.txt",url);
  const robots=await get(robotsUrl,256000);
  let wait=2000;
  if(robots.status===200){
   if(!["text/plain","text/robots"].includes(robots.mime))throw new Error("robots.txt ilegible");
   const rules=robotsParser(robotsUrl.href,robots.body.toString("utf8"));
   if(rules.isAllowed(url.href,agentName)===false)throw new Error("robots.txt impide el acceso");
   wait=Math.max(wait,(rules.getCrawlDelay(agentName)??0)*1000);
  }else if(robots.status!==404 && robots.status!==410)throw new Error("Política de robots no verificable");
  if(wait>60000)throw new Error("Demora de la fuente requiere planificación manual");
  await pause(wait);
  const response=await get(url,5*1024*1024);
  if([301,302,303,307,308].includes(response.status)&&response.location){url=new URL(response.location,url);continue;}
  if(response.status!==200)throw new Error("Fuente HTTP "+response.status);
  if(!["text/html","application/pdf"].includes(response.mime))throw new Error("Tipo de documento no permitido");
  return {...response,url:url.href};
 }
 throw new Error("Demasiadas redirecciones");
}

