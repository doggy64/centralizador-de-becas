const {execFileSync}=require("node:child_process");
const {extractPdf,extractHtml,discover}=require("../dist/extract");
const {isPublic,fetchOfficial}=require("../dist/transport");
const host="scholarships.example.org";
const page="https://"+host+"/one";
const allowed=new Set([host]);
const body=Buffer.from('<main><h1>Maestría</h1><p>Plazo por confirmar</p><a href="/call">Ficha</a><a rel="next" href="/two">Más</a></main>');
const doc={status:200,mime:"text/html",body,url:page};
test("HTML extrae texto, páginas y enlaces relativos",async()=>{
 expect(extractHtml(body,page)).toMatchObject({title:"Maestría",summary:"Plazo por confirmar",next:"https://"+host+"/two"});
 const get=jest.fn(async url=>({...doc,url}));
 const links=await discover({source:{findMany:async()=>[{host}]}},page,get);
 expect(links).toContain("https://"+host+"/call");
 expect(get).toHaveBeenCalledTimes(2);
});
test.each(["127.0.0.1","10.0.0.1","169.254.169.254","::1","::ffff:127.0.0.1","fc00::1","192.0.2.1"])("clasifica destino reservado %s",ip=>expect(isPublic(ip)).toBe(false));
test.each([403,429])("audita respuestas sin reintentar bloqueo HTTP %i",async status=>{
 const get=jest.fn().mockResolvedValueOnce({status:404}).mockResolvedValueOnce({status});
 await expect(fetchOfficial(page,allowed,get,async()=>{})).rejects.toThrow(String(status));
});
test("verifica robots y vuelve a validar host tras redirección",async()=>{
 const deny=async()=>({status:200,mime:"text/plain",body:Buffer.from("User-agent: *\nDisallow: /")});
 await expect(fetchOfficial(page,allowed,deny)).rejects.toThrow("robots");
 const redirect=jest.fn().mockResolvedValueOnce({status:404}).mockResolvedValueOnce({status:302,location:"https://other.example.org/"});
 await expect(fetchOfficial(page,allowed,redirect,async()=>{})).rejects.toThrow("Host");
 expect(redirect).toHaveBeenCalledTimes(2);
});
test("PDF digital conserva número de página y omite páginas sin texto",()=>{
 const py=process.env.PYTHON_BIN||"python";
 const make=text=>execFileSync(py,["-c","import pymupdf,sys;d=pymupdf.open();d.new_page();p=d.new_page();p.insert_text((50,50),sys.argv[1]);sys.stdout.buffer.write(d.tobytes())",text]);
 expect(extractPdf(make("Beca digital"))).toEqual([{pageNumber:2,text:"Beca digital"}]);
 expect(extractPdf(make(""))).toEqual([]);
 expect(()=>extractPdf(Buffer.from("PDF corrupto"))).toThrow();
});
