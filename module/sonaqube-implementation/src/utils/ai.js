import ollama from "ollama";
import fs from 'node:fs';

const fix_error = async (err, content, line) => {
    let prompt = `
    You are given a code file content, an error message, and a line number where the issue was identified. Please fix the code, making sure to maintain the formatting of the rest of the file, and provide the fixed file content in the correct format.
    
    Error/Suggestion: ${err}
    
    Optional Line Number(Update lines around this lines only): ${line}
    
    Full Code all the content below:
    ${content}
    `

    try {
        const { response } = await ollama.generate({ model: "agent-BASS", format: 'json', prompt });

        return JSON.parse(response);
    } catch (error) {
        console.log(error);
    }
}

/**
 * 
 * @param {object} errors  in following format:
 * [{
        "message": "The `readFileAsync` function does not return a promise, making it incomplete for async handling.",
        "path": './data/main.js',
        "line": 22
    }]
 * @returns 
 */
export const getChangesData = async (errors) => {
    return await Promise.all(errors.map(async (err) => {
        const { error, line, path } = err;
        const content = fs.readFileSync(path, 'utf-8');
        try {
            const response = await fix_error(error, JSON.stringify(content), line);
            return { path, content: response.code };
        } catch (error) {
            console.log(error);
        }
    }));
}
