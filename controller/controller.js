const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

exports.getHome = (req, res) => {
    res.render('editor', { lastCode: '' });
};

exports.getCollabFields = (req, res)=>{
    res.render('collabFields');
};

exports.createRoom = (req, res) =>{

    const randomId = crypto.randomUUID();
    res.render('collabEditor', {id: randomId});
};

exports.joinRoom = (req, res) =>{

    const roomId = req.body.roomId; 
    res.render('collabEditor', {id: roomId});
};

exports.postCode = (req, res) => {

    let receivedCode = req.body.code;
    const language = req.body.lang;

    console.log('Language Recieved: ', language);

    if (language === 'Java') {


        const uniqueId = crypto.randomUUID();
        const dir = path.join(os.tmpdir(), `java_exec_${uniqueId}`);

        fs.mkdirSync(dir);

        const classNameMatch = receivedCode.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)/);

        let className;
        if (classNameMatch) {
            className = classNameMatch[1];
        }
        else {
            className = 'Main';
        }

        const javaFile = path.join(dir, `${className}.java`);

        fs.writeFileSync(javaFile, receivedCode);

        console.log(receivedCode);
        let ansArr = [];
        let err = [];

        const javaProcess = exec(`javac ${javaFile} && java ${className}`, { cwd : dir});

        const timeout = setTimeout(() => {
            javaProcess.kill('SIGKILL'); // Forcefully kill the process
            console.log('Process killed due to timeout');
            ansArr.push('Execution timed out. Code took too long to execute. There might be infinite loop or stackoverflow.Or you might be taking user input.');
        }, 5000);

        javaProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            let output = `<pre>${data}</pre>`;
                ansArr.push(output);
        });
        
        javaProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            let java_execInd = data.indexOf('java_exec_');
                    console.log('java_exec_', java_execInd);

                    let fError = java_execInd >= 0 ? data.substring(java_execInd+10) : data;

                    let errorDetails = fError ? `<pre>${fError.trim()}</pre>` : "Error occurred. There might be infinite loop in code. Or try to run again.";
                    ansArr.push(errorDetails);
        });
        
        javaProcess.on('exit', (code) => {
            clearTimeout(timeout);
            console.log(`Process exited with code ${code}`);
            // Proceed to delete the directory here

            res.status(200).json({
                message: ansArr
            });
            
            setTimeout(()=>{

                fs.rmSync(dir, {recursive: true});

            }, 100);
            
        });

            // if (error) {

            //     console.log('above', error);

            //     if (error.killed) {
            //         console.log(error);

            //         err.push('Execution timed out. Code took too long to execute. There might be infinite loop or stackoverflow.');
            //         res.status(200).json({
            //             message: err
            //         });
            //         fs.rmSync(dir, {recursive: true});
            //     }
            //     else {
            //         let java_execInd = stderr.indexOf('java_exec_');
            //         console.log('java_exec_', java_execInd);

            //         let fError = java_execInd >= 0 ? stderr.substring(java_execInd+10) : stderr;

            //         let errorDetails = fError ? `<pre>${fError.trim()}</pre>` : "Error occurred. There might be infinite loop in code. Or try to run again.";
            //         err.push(errorDetails);

            //         res.status(200).json({
            //             message: err
            //         });
            //         fs.rmSync(dir, {recursive: true});
            //     }
            // }
            // else {
            //     console.log(stdout);

            //     let output = `<pre>${stdout}</pre>`;
            //     ansArr.push(output);

            //     res.status(200).json({
            //         message: ansArr
            //     });

            //     fs.rmSync(dir, {recursive: true});

            // }

        
    }
    else if (language === 'JavaScript') {

        let output = [];

        const runCodeWithTimeout = (code, timeout) => {

            const jsFile = 'javaScriptCodeFile.js';
            fs.writeFileSync(jsFile, code);

            return new Promise((resolve, reject) => {
                exec(`node ${jsFile}`, { timeout }, (error, stdout, stderr) => {
                    if (error) {

                        const sanitizeError = (errorOutput) => {
                            // Example regex to remove file paths (adjust as necessary)
                            return errorOutput.replace(/\/[^ ]+\.[a-z]+/g, '[file path removed]');
                        };
                        let res = `<pre>${sanitizeError(stderr)}</pre>`;
                        console.log('Error in std', stderr.message);
                        reject(res);
                        fs.unlink(jsFile, (err) => {
                            if (err) {
                                console.log('Error in deleting JsCode file', err);
                            }
                        });
                        return;
                    }
                    let res = `<pre>${stdout}</pre>`;
                    resolve(res);
                    fs.unlink(jsFile, (err) => {
                        if (err) {
                            console.log('Error in deleting JsCode file', err);
                        }
                    });
                });
            });
        };

        runCodeWithTimeout(receivedCode, 4000) // 4-second timeout
            .then(result => {

                output.push(result);
                res.status(200).json({
                    message: output
                });
                console.log('Result:', result);
            })
            .catch(err => {
                //console.error('Error:', err);
                output.push(err);
                res.status(200).json({
                    message: output
                });
            });
    }
};