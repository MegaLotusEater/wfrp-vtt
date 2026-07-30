import fs from 'fs';
import pdf from 'pdf-parse';

async function extractText() {
    console.log("Starting PDF extraction...");
    try {
        let dataBuffer = fs.readFileSync('rulebook.pdf');
        
        // pdf-parse extracts the text
        const data = await pdf(dataBuffer);
        
        // We'll write this out to a text file in the src folder so Vite can import it
        fs.writeFileSync('src/lore.txt', data.text);
        console.log("Successfully extracted text and saved to src/lore.txt!");
    } catch (error) {
        console.error("Error extracting PDF:", error);
    }
}

extractText();
