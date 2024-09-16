const path = require('path');
const { exec } = require('child_process');
const vm = require('vm');
const fs = require('fs');

exports.getHome = (req, res)=>{
    res.render('editor', { lastCode: '' });
};

exports.postCode = (req, res)=>{

    let receivedCode = req.body.code;
    const language = req.body.lang;

    console.log('Language Recieved: ', language);

    if (language === 'Java') {

        let clsInd = receivedCode.indexOf('class');
        let className = '';
        let flag = false;

        for (let i = clsInd + 5; i < receivedCode.length; i++) {
            if (className !== '' && flag === true) {
                break;
            }
            else if (receivedCode[i] === ' ' || receivedCode[i] === '{') {
                flag = true;
            }
            else {
                className += receivedCode[i];
                flag = false;
            }
        }

        let filename = className;
        let initFinalname = filename + '.java';

        fs.writeFileSync(initFinalname, receivedCode);

        exec(`javac ${initFinalname} && java ${filename}`, (error, stdout, stderr) => {
            if (error) {
                console.log(stderr);
                return;
            }
            console.log(stdout);

            res.status(200).json({
                message: 'Code Recieved Successfully'
            });

            fs.unlink(initFinalname, (err) => {
                if (err) {
                    console.log('Error deleting file', err);
                }
            });

            fs.unlink((filename + '.class'), (err) => {
                if (err) {
                    console.log('Error deleting file', err);
                }
            });
        });
    }
    else if (language === 'JavaScript') {

        const sandbox = {
            console: console
        };

        try {
            vm.createContext(sandbox);

            const script = new vm.Script(receivedCode);

            const output = script.runInContext(sandbox);

            res.status(200).json({
                message: 'Code executed succesfully',
                result: output
            });
        }
        catch (err) {
            next(new Error(err));
        }
    }
};