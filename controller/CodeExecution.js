const path = require('path');
const { exec } = require('child_process');
const fs = require('fs').promises;
const crypto = require('crypto');
const os = require('os');


async function executeJavaCode(receivedCode) {


    const uniqueId = crypto.randomUUID();
    const dir = path.join(os.tmpdir(), `java_exec_${uniqueId}`);

    try {
        await fs.mkdir(dir);

        const classNameMatch = receivedCode.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)/);
        const className = classNameMatch ? classNameMatch[1] : 'Main';
        const javaCollabFile = path.join(dir, `${className}.java`);

        await fs.writeFile(javaCollabFile, receivedCode);
        console.log(receivedCode);

        let ansArr = [];

        return new Promise((resolve) => {
            exec(`javac ${javaCollabFile} && java ${className}`, { cwd: dir, timeout: 5000 }, async (error, stdout, stderr) => {
                try {
                    if (error) {
                        if (error.killed) {
                            console.log(error);
                            ansArr.push('Execution timed out. Code took too long to execute. There might be infinite loop or stackoverflow. Or you might be taking user input.');
                        } else {
                            let java_execInd = stderr.indexOf('java_exec_');

                            let fError = java_execInd >= 0 ? stderr.substring(java_execInd + 10) : stderr;

                            let errorDetails = fError ? `<pre>${fError.trim()}</pre>` : "Error occurred. There might be an infinite loop in code. Or try to run again.";
                            ansArr.push(errorDetails);
                        }
                    } else {
                        let output = `<pre>${stdout}</pre>`;
                        ansArr.push(output);
                    }
                } finally {
                    // Clean up the directory regardless of success or failure
                    setTimeout(()=>{
                        fs.rm(dir, { recursive: true });
                    }, 100)
                    resolve(ansArr);
                }
            });
        });
    } catch (error) {
        console.error('Error executing Java code:', error);
        // Ensure directory is cleaned up if an error occurs before exec
        await fs.rmdir(dir, { recursive: true }).catch(() => {});
        throw error;
    }
}

// function executeJavaCode(receivedCode) {

//     return new Promise((resolve, reject) => {

//         const uniqueId = crypto.randomUUID();
//         const dir = path.join(os.tmpdir(), `java_exec_${uniqueId}`);

//         fs.mkdirSync(dir);

//         const classNameMatch = receivedCode.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)/);

//         let className;

//         if (classNameMatch) {
//             className = classNameMatch[1];
//         }
//         else {
//             className = 'Main';
//         }

//         const javaCollabFile = path.join(dir, `${className}.java`);

//         fs.writeFileSync(javaCollabFile, receivedCode);

//         console.log(receivedCode);
//         let ansArr = [];
//         let err = [];

//         exec(`javac ${javaCollabFile} && java ${className}`, { cwd: dir, timeout: 5000 }, (error, stdout, stderr) => {

//             if (error) {

//                 console.log('above', error);

//                 if (error.killed) {
//                     console.log(error);
//                     err.push('Execution timed out. Code took too long to execute. There might be infinite loop or stackoverflow.');

//                     fs.rmSync(dir, {recursive: true});

//                     return resolve(err);
//                 }
//                 else {
//                     let errorDetails = stderr ? `<pre>${stderr.trim()}</pre>` : "Error occurred. There might be infinite loop in code. Or try to run again.";
//                     err.push(errorDetails);

//                     fs.rmSync(dir, {recursive: true});

//                     return resolve(err);
//                 }
//             }
//             else {
//                 console.log(stdout);

//                 let output = `<pre>${stdout}</pre>`;
//                 ansArr.push(output);

//                 fs.rmSync(dir, {recursive: true});

//                 return resolve(ansArr);
//             }
//         });
//     });
// };

// function cleanJSFiles(jsFile) {
//     fs.unlink(jsFile, (err) => {
//         if (err) {
//             console.log('Error in deleting JsCode file', err);
//         }
//     });
// }

// function executeJSCode(receivedCode) {

//     return new Promise((resolve, reject) => {

//         const jsFile = 'javaScriptCodeFile.js';
//         fs.writeFileSync(jsFile, receivedCode);

//         let output = [];

//         exec(`node ${jsFile}`, { timeout: 5000 }, (error, stdout, stderr) => {

//             if (error) {

//                 if (error.killed) {

//                     console.log(error);
//                     output.push('Execution timed out. Code took too long to execute. There might be infinite loop or stackoverflow.');

//                     cleanJSFiles(jsFile);

//                     return reject(output);
//                 }

//                 let res = `<pre>${stderr}</pre>`;

//                 console.log('Error in std', error.message);

//                 output.push(res);

//                 cleanJSFiles(jsFile);

//                 return reject(output);
//             }
//             else {

//                 let res = `<pre>${stdout}</pre>`;

//                 output.push(res);

//                 cleanJSFiles(jsFile);

//                 return resolve(output);
//             }
//         });
//     });
// };

function executeCode(receivedcode, lang) {

    if (lang === 'Java') {

        return executeJavaCode(receivedcode);
    }
    // else if (lang === 'JavaScript') {

    //     return executeJSCode(receivedcode);
    // }
};

module.exports = executeCode;