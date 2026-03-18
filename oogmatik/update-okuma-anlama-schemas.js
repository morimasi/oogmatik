const fs = require('fs');

const schemas = {
  '5N1K': `{ type: "OBJECT", properties: { title: { type: "STRING" }, content: { type: "STRING" }, questions: { type: "ARRAY", items: { type: "STRING" } }, hasImage: { type: "BOOLEAN" } }, required: ["title", "content", "questions"] }`,
  'ANA_DUSUNCE': `{ type: "OBJECT", properties: { question: { type: "STRING" }, paragraf: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["question", "paragraf", "options"] }`,
  'CIKARIM_YAPMA': `{ type: "OBJECT", properties: { metin: { type: "STRING" }, questions: { type: "ARRAY", items: { type: "OBJECT", properties: { soru: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["soru", "options"] } } }, required: ["metin", "questions"] }`,
  'METIN_KARSILASTIRMA': `{ type: "OBJECT", properties: { metin1: { type: "STRING" }, metin2: { type: "STRING" }, format: { type: "STRING" }, boyut: { type: "STRING" } }, required: ["metin1", "metin2", "format", "boyut"] }`,
  'OLAY_SIRALAMA': `{ type: "OBJECT", properties: { shuffled: { type: "ARRAY", items: { type: "STRING" } }, correct: { type: "ARRAY", items: { type: "STRING" } } }, required: ["shuffled", "correct"] }`,
  'BASLIK_BULMA': `{ type: "OBJECT", properties: { paragraf: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["paragraf", "options"] }`,
  'SIIR_INCELEME': `{ type: "OBJECT", properties: { siir: { type: "STRING" }, sorular: { type: "ARRAY", items: { type: "STRING" } } }, required: ["siir", "sorular"] }`,
  'KARAKTER_ANALIZI': `{ type: "OBJECT", properties: { karakterler: { type: "ARRAY", items: { type: "OBJECT", properties: { ad: { type: "STRING" }, ozellikler: { type: "ARRAY", items: { type: "STRING" } } }, required: ["ad", "ozellikler"] } }, format: { type: "STRING" } }, required: ["karakterler", "format"] }`,
  'SOZ_SANATLARI': `{ type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "OBJECT", properties: { cumle: { type: "STRING" }, sanat: { type: "STRING" } }, required: ["cumle", "sanat"] } } }, required: ["cumleler"] }`,
  'OKUDUGUNU_CIZ': `{ type: "OBJECT", properties: { yonerge: { type: "STRING" }, alanBoyutu: { type: "STRING" }, cizgiSayisi: { type: "NUMBER" } }, required: ["yonerge", "alanBoyutu", "cizgiSayisi"] }`
};

let content = fs.readFileSync('D:\\bbma\\bursadisleksi\\oogmatik\\src\\modules\\super-turkce\\features\\activity-formats\\okuma-anlama\\formats.ts', 'utf8');

for (const [id, schema] of Object.entries(schemas)) {
    const regex = new RegExp(\`(id:\\s*'\${id}',\\s*category:[^}]+?settings:[^\\n]+\\n\\s*\\],)\`, 's');
    content = content.replace(regex, \`$1\\n        schema: \${schema},\`);
}

fs.writeFileSync('D:\\bbma\\bursadisleksi\\oogmatik\\src\\modules\\super-turkce\\features\\activity-formats\\okuma-anlama\\formats.ts', content, 'utf8');
