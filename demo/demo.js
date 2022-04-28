const head = require('head')()
const bel = require('bel')
const csjs = require('csjs-inject')
// datdot-ui dependences
const input_number = require('..')
const message_maker = require('message-maker')

var id = 0
var count = 0

function demo () {
// ---------------------------------------------------------------
    const myaddress = `demo-${id++}`
    const inbox = {}
    const outbox = {}
    let recipients = {}
    const message_id = to => ( outbox[to] = 1 + (outbox[to]||0) )

    function make_protocol (name) {
        return function protocol (address, notify) {
            recipients[name] = { address, notify, make: message_maker(myaddress) }
            return { notify: listen, address: myaddress }
        }
    }
    function listen (msg) {
        const { head, refs, type, data, meta } = msg // receive msg
        const [from, to, msg_id] = head
        inbox[head.join('/')] = msg                  // store msg
        if (type === 'onblur') console.log({ input: data.value })
        if (type === 'onkeyup') console.log({ input: data.value })
        if (type === 'help') { console.log({data})}
        if (type === 'theme_update') {}
    }
// ---------------------------------------------------------------
    console.log(input_number.docs())
    const name_1 = `input-${count++}`
    const input_1 = input_number({
        value: 15, 
        step: 1,
        placeholder: 'type the number', 
        theme: {
            props: {
                '--border-width': '2px',
                '--border-color': 'var(--color-blue)',
                '--border-style': 'dashed',
                '--shadow-color': 'var(--color-blue)',
                '--shadow-opacity': '.65',
                '--shadow-xy': '4px 4px',
            },
            style: `
                .input-field {
                    background-color: pink;
                }
            `,
            classList: 'input-field'
        }
    }, make_protocol(name_1))

    const { notify: name_notify, make: name_make, address: name_address } = recipients[name_1]
    name_notify(name_make({ to: name_address, type: 'help' }))
 // ---------------------------------------------------------------
    const name_2 = `input-${count++}`
    const input_2 = input_number({
        value: 10,
        step: 1.25,
        placeholder: 'Type the number',
        theme: {
            props: {
    
            }
        }
    }, make_protocol(name_2))
    
    
    const content = bel`
        <div class=${css.content}>
            <section> <h2>Input 1</h2> ${input_1} </section>
            <section> <h2>Input 1</h2> ${input_2} </section>
        </div>`
    const container = bel`<div class="${css.container}">${content}</div>`
    const app = bel`<div class="${css.wrap}" data-state="debug"> ${container}</div>`
    return app
}

// ---------------------------------------------------------------
const css = csjs`
:root {
    --b: 0, 0%;
    --r: 100%, 50%;
    --color-white: var(--b), 100%;
    --color-black: var(--b), 0%;
    --color-dark: 223, 13%, 20%;
    --color-deep-black: 222, 18%, 11%;
    --color-blue: 214, var(--r);
    --color-red: 358, 99%, 53%;
    --color-amaranth-pink: 331, 86%, 78%;
    --color-persian-rose: 323, 100%, 56%;
    --color-orange: 35, 100%, 58%;
    --color-deep-saffron: 31, 100%, 56%;
    --color-ultra-red: 348, 96%, 71%;
    --color-flame: 15, 80%, 50%;
    --color-verdigris: 180, 54%, 43%;
    --color-maya-blue: 205, 96%, 72%;
    --color-slate-blue: 248, 56%, 59%;
    --color-blue-jeans: 204, 96%, 61%;
    --color-dodger-blue: 213, 90%, 59%;
    --color-light-green: 127, 86%, 77%;
    --color-lime-green: 127, 100%, 40%;
    --color-slimy-green: 108, 100%, 28%;
    --color-maximum-blue-green: 180, 54%, 51%;
    --color-green: 136, 81%, 34%;
    --color-light-green: 97, 86%, 77%;
    --color-lincoln-green: 97, 100%, 18%;
    --color-yellow: 44, 100%, 55%;
    --color-chrome-yellow: 39, var(--r);
    --color-bright-yellow-crayola: 35, 100%, 58%;
    --color-green-yellow-crayola: 51, 100%, 83%;
    --color-purple: 283, var(--r);
    --color-medium-purple: 269, 100%, 70%;
    --color-grey33: var(--b), 20%;
    --color-grey66: var(--b), 40%;
    --color-grey70: var(--b), 44%;
    --color-grey88: var(--b), 53%;
    --color-greyA2: var(--b), 64%;
    --color-greyC3: var(--b), 76%;
    --color-greyCB: var(--b), 80%;
    --color-greyD8: var(--b), 85%;
    --color-greyD9: var(--b), 85%;
    --color-greyE2: var(--b), 89%;
    --color-greyEB: var(--b), 92%;
    --color-greyED: var(--b), 93%;
    --color-greyEF: var(--b), 94%;
    --color-greyF2: var(--b), 95%;
    --transparent: transparent;
    --define-font: *---------------------------------------------*;
    --snippet-font: Segoe UI Mono, Monospace, Cascadia Mono, Courier New, ui-monospace, Liberation Mono, Menlo, Monaco, Consolas;
    --size12: 1.2rem;
    --size14: 1.4rem;
    --size16: 1.6rem;
    --size18: 1.8rem;
    --size20: 2rem;
    --size22: 2.2rem;
    --size24: 2.4rem;
    --size26: 2.6rem;
    --size28: 2.8rem;
    --size30: 3rem;
    --size32: 3.2rem;
    --size36: 3.6rem;
    --size40: 4rem;
    --weight100: 100;
    --weight300: 300;
    --weight400: 400;
    --weight600: 600;
    --weight800: 800;
    --define-primary: *---------------------------------------------*;
    --primary-color: var(--color-black);
    --primary-bg-color: var(--color-greyF2);
    --primary-font: Arial, sens-serif;
    --primary-size: var(--size16);
    --primary-input-radius: 8px;
    --primary-button-radius: 8px;
}
html {
    font-size: 62.5%;
    height: 100%;
}
*, *:before, *:after {
    box-sizing: border-box;
}
input {
    outline: none;
}
body {
    margin: 0;
    padding: 0;
    -webkit-text-size-adjust:100%;
    font-family: var(--primary-font);
    font-size: var(--primary-size);
    background-color: hsl( var(--primary-bg-color) );
    height: 100%;
    overflow: hidden;
}
.wrap {
    display: grid;
}
.content {}
[data-state="view"] {
    height: 100%;
}
[data-state="view"] i-log {
    display: none;
}
[data-state="debug"] {
    grid-template-rows: auto;
    grid-template-columns: 62% auto;
    height: 100%;
}
[data-state="debug"] i-log {
    position: fixed;
    top: 0;
    right: 0;
    width: 40%;
    height: 100%;
}
.container {
    display: grid;
    grid-template-rows: min-content;
    grid-template-columns: 90%;
    justify-content: center;
    align-items: start;
    background-color: var(--color-white);
    height: 100%;
    overflow: hidden auto;
}
/*
.col2 {
    display: grid;
    grid-template-columns: 1fr 30px;
    align-items: center;
    grid-column-gap: 2px;
}
.col2 i-input {
    grid-column-start: 1;
}
.col2 span {
    grid-column-start: 2;
    justify-self: center;
}
*/
@media (max-width: 768px) {
    [data-state="debug"] {
        grid-template-rows: 65% 35%;
        grid-template-columns: auto;
    }
    [data-state="debug"] i-log {
        position: inherit;
        width: 100%;
    }
    .container {
        grid-template-rows: 80px auto;
    }
}
`
// ---------------------------------------------------------------
document.body.append(demo())
// ---------------------------------------------------------------
