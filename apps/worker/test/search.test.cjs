const { analyze } = require("../dist/search-candidate");
const { parseDocument } = require("../dist/search-document");
const source = { host: "becas.example.org", title: "Universidad" };
const url = "https://" + source.host + "/beca";
const html =
  '<main><h1>Beca Medicina 2099</h1><p>Maestría para estudiar en Bolivia.</p><p>Beneficio: matrícula</p><p>Requisito: diploma</p><p>Cierre: 15 de julio de 2099</p><a href="/apply">Postular</a></main>';
const main = parseDocument(Buffer.from(html), url, "text/html");
test("destino boliviano no acredita nacionalidad elegible", () => {
  const { candidate, reason } = analyze(
    "maestría para Bolivia",
    source,
    main,
    [],
  );
  expect(candidate.deadlineDay).toBe("2099-07-15");
  expect(reason).toContain("Elegibilidad para Bolivia sin confirmar");
});
test("una fecha diferente en un anexo bloquea publicación", () => {
  const annex = {
    url: url + ".pdf",
    title: "Bases",
    blocks: [{ text: "Fecha límite: 2099-07-17", page: 4 }],
    links: [],
  };
  const { candidate, reason } = analyze("medicina", source, main, [annex]);
  expect(candidate.deadlineDay).toBeUndefined();
  expect(reason).toContain("ambiguo");
});
