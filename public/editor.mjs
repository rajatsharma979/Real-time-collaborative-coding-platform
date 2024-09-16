import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import {java} from "@codemirror/lang-java";
// import {cpp} from "@codemirror/lang-cpp";
// import {python} from "@codemirror/lang-python";
// import { EditorState } from "@codemirror/state";


let editor = new EditorView({

        state: EditorState.create({
        doc: 'Write your code hear',
        extensions: [basicSetup, java(), javascript(), oneDark]
    }),
    parent: document.querySelector('#code')
});

const submitCode = ()=> {

    const code = editor.state.doc.toString();
    const lang = document.querySelector('#lang').value;

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
        .then(res=>{
            return res.json();
        })
        .then(resData => {
            console.log('In fetch url', resData);
        })
        .catch(err => {
            console.log(err);
        })
};

document.querySelector('#btn').addEventListener('click', submitCode);

