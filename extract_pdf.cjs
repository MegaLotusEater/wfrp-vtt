const fs = require('fs');
const PDFParser = require("pdf2json");

console.log("Starting PDF extraction with pdf2json...");

let pdfParser = new PDFParser(this, 1); // 1 to parse text only

pdfParser.on("pdfParser_dataError", errData => {
    console.error("Error extracting PDF:", errData.parserError);
});

pdfParser.on("pdfParser_dataReady", pdfData => {
    console.log("Parsing complete. Writing to src/lore.txt...");
    fs.writeFileSync("src/lore.txt", pdfParser.getRawTextContent());
    console.log("Successfully extracted text and saved to src/lore.txt!");
});

pdfParser.loadPDF("rulebook.pdf");
