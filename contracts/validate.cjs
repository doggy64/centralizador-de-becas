const Parser = require("@apidevtools/swagger-parser");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const spec = await Parser.validate(path.join(__dirname, "openapi.yaml"));
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  const fixtures = [
    ["/api/v1/scholarships", "scholarships-list"],
    ["/api/v1/scholarships/{slug}", "scholarship-detail"],
    ["/api/v1/catalogs/filters", "filters"],
  ];
  for (const [route, file] of fixtures) {
    const schema = spec.paths[route].get.responses["200"].content["application/json"].schema;
    const body = JSON.parse(await readFile(path.join(__dirname, "fixtures", file + ".json"), "utf8"));
    try {
      const validate = ajv.compile(schema);
      if (!validate(body)) throw new Error(ajv.errorsText(validate.errors));
      console.log(file + " OK");
    } catch (error) {
      process.exitCode = 1;
      console.error(file + ": " + error.message);
    }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
