import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { java } from "@codemirror/lang-java";

const showingOutput = document.querySelector('.showingOutput');
const runButton = document.querySelector('.runButton');

let editor;

const state = EditorState.create({
    doc: 'Write your code...',
    extensions: [
        basicSetup,
        javascript(),
        java(),
        oneDark,
    ]
});

editor = new EditorView({
    state,
    parent: document.querySelector('#code')
});

const submitCode = () => {

    console.log('clicked submit btn');
    const lang = document.querySelector('#lang').value;
    const code = editor.state.doc.toString();

    document.getElementById('btn').disabled = true;

    showingOutput.innerHTML = '';
    showingOutput.insertAdjacentHTML('beforeend', `<div>Your code is being executed...</div>`);

    try {


        fetch('http://localhost:3000/submitCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lang: lang,
                code: code
            })
        })
            .then(res => res.json())
            .then(resData => {

                console.log('In fetch url', resData.message);

                showingOutput.innerHTML = '';
                
                resData.message.forEach(element => {
                    showingOutput.insertAdjacentHTML('beforeend', `<div>${element}</div>`);
                });
            })
    }
    catch (err) {
        console.log(err);
    }
    finally {
        document.getElementById('btn').disabled = false;
    }
};

runButton.addEventListener('click', submitCode);