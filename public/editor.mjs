import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { java } from "@codemirror/lang-java";


const ws = new WebSocket('ws://localhost:3000');

const showingOutput = document.querySelector('.showingOutput');
const roomId = document.querySelector('.roomId').textContent;

let isLocalChange = true;
let editor;
let debounceTimeout;

const state = EditorState.create({
    doc: 'Write code...',
    extensions: [
        basicSetup,
        javascript(),
        java(),
        oneDark,
        EditorView.updateListener.of((update) => {
            if (update.docChanged && isLocalChange) {
                clearTimeout(debounceTimeout);   //It cancels previous timeouts. When the user is typing quickly, multiple updates can be triggered in rapid succession. Without clearTimeout, each keystroke would set a new timeout. This means that if the user types quickly, multiple timeouts could stack up, leading to the function being called multiple times after the delay, which is not the desired behavior. 

                debounceTimeout = setTimeout(() => {
                    const changedCode = update.state.doc.toString();
                    console.log(changedCode);

                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'edit', roomId: roomId, changedCode: changedCode }));
                    }
                }, 75); // Adjust as needed
            }
        })
    ]
});

editor = new EditorView({
    state,
    parent: document.querySelector('#code')
});

// Resize function to handle window resizing
function resizeEditor() {
    const parent = document.getElementById('parent');
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    editor.dom.style.width = `${width}px`;
    editor.dom.style.height = `${height}px`;
}

// Call resize on window resize
window.addEventListener('resize', resizeEditor);
resizeEditor(); // Initial size set

// Function to send messages
// function sendMessage(data) {
//     const message = JSON.stringify(data);
//     if (ws.readyState === WebSocket.OPEN) {
//         ws.send(message);
//     } else {
//         messageQueue.push(message); // Queue the message if not open
//     }
// }

// WebSocket Event Handlers
ws.onopen = () => {

    ws.send(JSON.stringify({type: 'registration', roomId: roomId}));
    console.log('Client connected');
    
};

ws.onmessage = (event) => {

    const data = JSON.parse(event.data);

    if (data.type === 'output') {

        showingOutput.innerHTML = '';

        data.result.forEach(element => {
            showingOutput.insertAdjacentHTML('beforeend', `<div>${element}</div>`);
        });

    }
    else if(data.type === 'edit'){

        const receivedCode = data.code;

        console.log(receivedCode);

        if (editor.state.doc.toString() !== receivedCode) {

            isLocalChange = false; // Prevent local updates

            editor.dispatch({
                changes: { from: 0, to: editor.state.doc.length, insert: receivedCode }
            });

            isLocalChange = true; // Allow local updates again
        }
    }

};

ws.onerror = (error) => {
    console.error('WebSocket error observed:', error);
};

ws.onclose = () => {
    console.log('client disconnected client side');
};

const submitCode = ()=>{

    const lang = document.querySelector('#lang').value;
    const code = editor.state.doc.toString();

    showingOutput.innerHTML = '';
    showingOutput.insertAdjacentHTML('beforeend', `<div>Your code is being executed...</div>`);

    console.log('submit clicked');
    ws.send(JSON.stringify({type: 'submitCode', lang: lang, code: code, roomId: roomId}));
}

document.querySelector('#btn').addEventListener('click', submitCode);
