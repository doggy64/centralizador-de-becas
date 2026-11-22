import { z } from "zod";
export const key = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(150);
export const httpsUrl = z.string().max(2048).url().refine(value => {
 const u = new URL(value);
 return u.protocol === "https:" && !u.username && !u.password && !u.port;
}, "URL HTTPS institucional requerida");
const line = z.string().trim().min(1).max(2000);
const proof = z.object({sourceUrl:httpsUrl, excerpt:line.nullable(), pageNumber:z.number().int().positive().nullable()}).strict().refine(x=>x.excerpt!==null || x.pageNumber!==null,"Falta fragmento o página");
const item = z.object({label:line,required:z.boolean().nullable(),evidence:proof}).strict();
const date = z.string().date();
const country = z.string().regex(/^[A-Z]{2}$/);
export const candidateSchema = z.object({
 institution:z.object({key,name:line,websiteUrl:httpsUrl.nullable()}).strict(),
 program:z.object({key,name:line}).strict(), editionKey:line.max(100), slug:key,
 title:line,summary:line,sourceUrl:httpsUrl,evidence:proof,
 levels:z.array(z.string().min(1)).max(30).default([]),areas:z.array(key).max(60).default([]),countries:z.array(country).max(100).default([]),
 modality:z.enum(["ON_SITE","ONLINE","HYBRID","UNKNOWN"]).default("UNKNOWN"),coverage:z.enum(["FULL","PARTIAL","UNKNOWN"]).default("UNKNOWN"),
 startDate:date.nullish(),deadlineDay:date.nullish(),deadlineAt:z.string().datetime({offset:true}).nullish(),
 timeZone:z.string().max(100).refine(v=>{try {new Intl.DateTimeFormat("en",{timeZone:v});return true;}catch{return false;}}).nullish(),
 originalDeadlineText:line.nullish(),
 requirements:z.array(item).max(100).default([]),documents:z.array(item).max(100).default([]),
 benefits:z.array(z.object({description:line,amount:z.number().nonnegative().nullable(),currency:z.string().regex(/^[A-Z]{3}$/).nullable(),evidence:proof}).strict()).max(100).default([]),
 channels:z.array(z.object({type:z.enum(["FORM_URL","PORTAL_URL","EMAIL"]),purpose:z.enum(["APPLY","CONTACT"]),target:line,evidence:proof}).strict().refine(c=>c.type==="EMAIL"?z.string().email().safeParse(c.target).success:httpsUrl.safeParse(c.target).success)).max(30).default([]),
}).strict().superRefine((v,ctx)=>{
 if(v.deadlineDay && v.deadlineAt)ctx.addIssue({code:"custom",message:"El cierre debe tener una sola precisión"});
 if(v.deadlineDay && v.startDate && v.deadlineDay<v.startDate)ctx.addIssue({code:"custom",message:"Cierre anterior a apertura"});
 if(v.deadlineDay && !v.originalDeadlineText)ctx.addIssue({code:"custom",message:"Falta texto original del plazo"});
 if(v.evidence.sourceUrl!==v.sourceUrl)ctx.addIssue({code:"custom",message:"Evidencia principal de otra página"});
});
export type Candidate = z.infer<typeof candidateSchema>;
export type Proof = Candidate["evidence"];
