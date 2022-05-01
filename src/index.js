const style_sheet = require('support-style-sheet')
const message_maker = require('message-maker')

var id = 0

module.exports = i_input

var current_theme
var current_style
const default_theme = {
    props: {
        '--b': '0, 0%',
        '--r': '100%, 50%',
        '--color-white': 'var(--b), 100%',
        '--color-black': 'var(--b), 0%',
        '--color-blue': '214, var(--r)',
        '--size14': '1.4rem',
        '--size16': '1.6rem',
        '--weight200': '200',
        '--primary-color': 'var(--color-black)',
        '--primary-button-radius': '8px',
        '--size': 'var(--size14)',
        '--size-hover': 'var(--size)',
        '--current-size': 'var(--size)',
        '--bold': 'var(--weight200)',
        '--color':'var(--primary-color)',
        '--bg-color': 'var(--color-white)',
        '--width': 'unset',
        '--height': '32px',
        '--opacity': '1',
        '--padding': '8px 12px',
        '--border-width': '0px',
        '--border-style': 'solid',
        '--border-color': 'var(--primary-color)',
        '--border-opacity': '1',
        '--border': 'var(--border-width) var(--border-style) hsla(var(--border-color), var(--border-opacity))',
        '--border-radius': 'var(--primary-button-radius)',
        '--fill': 'var(--primary-color)',
        '--fill-hover': 'var(--color-white)',
        '--icon-size': 'var(--size16)',
        '--shadow-xy': '0 0',
        '--shadow-blur': '8px',
        '--shadow-color': 'var(--color-black)',
        '--shadow-opacity': '0',
        '--shadow-opacity-focus': '0.3',
    },
    style: `
        .input-field {
            background-color: pink;
        }
    `,
    classList: 'input-field'
}

i_input.docs = () => { return { opts: { value:0, min: 0, max: 100, step: 1, placeholder:'', theme: default_theme } } }

function i_input (opts, protocol) {
    const { value = 0, min = 0, max = 100, step = 1, placeholder = '', theme = {} } = opts
    var current_value = value
    let [int, dec] = split_val(step)
    const el = document.createElement('i-input')
    const shadow = el.attachShadow({mode: 'closed'})
    const input = document.createElement('input')
    current_theme = theme
    update_style(current_theme, shadow)
// ------------------------------------------------
    const myaddress = `i-input-${id++}` // unique
    const inbox = {}
    const outbox = {}
    const recipients = {}
    const names = {}
    const message_id = to => ( outbox[to] = 1 + (outbox[to]||0) )

    const {notify, address} = protocol(myaddress, listen)
    names[address] = recipients['parent'] = { name: 'parent', notify, address, make: message_maker(myaddress) }
    recipients['parent'] = { notify, address, make: message_maker(myaddress) }

    let make = message_maker(myaddress) // @TODO: replace flow with myaddress/myaddress
    notify(make({ to: address, type: 'ready' }))

    function listen (msg) {
        const { head, refs, type, data, meta } = msg // listen to msg
        inbox[head.join('/')] = msg                  // store msg
        const [from, to, msg_id] = head
        const { make } = recipients['parent']
        // todo: what happens when we receive the message
        const name = names[from].name
        if (name === 'parent' && type === 'onchange') {
            current_value = data.value
            input.value = current_value
        }
        if (type === 'help') {
            const { notify: name_notify, make: name_make, address: name_address } = recipients[name]
            name_notify(name_make({ to: name_address, type: 'help', data: { theme: current_theme }, refs: { cause: head }}))
        }
        else if (type === 'theme_update' && data.theme) {
            current_theme = JSON.parse(data.theme.replace(/\n/g, ''))
            update_style(current_theme, shadow)
        }
    }
// ------------------------------------------------
    set_attributes(el, input)
    shadow.append(input)
    input.onwheel = (e) => e.preventDefault()
    input.onblur = (e) => handle_blur(e, input) // when element loses focus
    // Safari doesn't support onfocus @TODO use select()
    input.onclick = (e) => handle_click(e, input)
    input.onfocus = (e) => handle_focus(e, input)
    input.onkeydown = (e) => handle_keydown_change(e, input)
    input.onkeyup = (e) => handle_keyup_change(e, input)
    input.onwheel = (e) => handle_wheel(e, input)
// ---------------------------------------------------------------
    function set_attributes (el, input) { // all set attributes go here
        input.type = 'number'
        input.name = myaddress
        input.value = value
        input.placeholder = placeholder
        input.min = min
        input.max = max
        input.setAttribute('aria-myaddress', 'input')
    }
    function increase (e, input, val) {
        e.preventDefault()
        let [step_i, step_d] = split_val(step)
        let [val_i, val_d] = split_val(input.value)
        var new_val_d = Number(val_d) + Number(step_d)
        var new_val_i = Number(val_i) + Number(step_i)
        const d_places = step_d > val_d ? step_d.length : val_d.length
        const d_full = Math.pow(10, d_places)
        if (new_val_d >= d_full) {
            new_val_d = new_val_d - d_full
            new_val_i = new_val_i + 1
        }
        let new_val = new_val_d === 0 ? `${new_val_i}` : `${new_val_i}.${new_val_d}`
        input.value = new_val > max ? max.toString() : new_val
        current_value = input.value
        notify( make({to: address, type: 'onchange', data: { value: current_value }}))
    }
    function decrease (e, input, val) {
        e.preventDefault()
        let [step_i, step_d] = split_val(step)
        let [val_i, val_d] = split_val(val)
        let step_len = step_d.length
        let val_len = val_d.length
        var new_val_d = Number(val_d) - Number(step_d)
        var new_val_i = Number(val_i) - Number(step_i)
        const d_places = step_d > val_d ? step_d.length : val_d.length
        const d_full = Math.pow(10, d_places)
        if (new_val_d <= 0) {
            new_val_d = new_val_d === 0 ? 0 : d_full + new_val_d
            new_val_i = new_val_i - 1
        }
        let new_val = new_val_d === 0 ? `${new_val_i}` : `${new_val_i}.${new_val_d}`
        input.value = new_val < min ? min.toString() : new_val
        current_value = input.value
        notify(make({to: address, type: 'onchange', data: { value: current_value }}))
    }
    // event handlers
    function handle_click (e, input) { e.target.select() }
    function handle_focus (e, input) {}
    function handle_blur (e, input) {
        if (input.value === '') return
        notify(make({to: address, type: 'onblur', data: { value: current_value }}))
    }
    function handle_wheel (e, input) {
        const target = e.target
        const val = input.value === '' ? 0 : input.value
        let mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel"
        if (mousewheelevt === "mousewheel") e.wheelDelta > 0 ? increase(e, input, val) : decrease(e, input, val)
        else e.deltaY > 0 ?  increase(e, input, val) : decrease(e, input, val)
    }
    function handle_keydown_change (e, input) {
        const val = input.value === '' ? 0 : input.value
        const key = e.key
        const code = e.keyCode || e.charCode   
        if (code === 13 || key === 'Enter') input.blur()
        if (code === 38 || key === 'ArrowUp') increase(e, input, val)
        if (code === 40 || key === 'ArrowDown' ) decrease(e, input, val)
    }
    function handle_keyup_change (e, input) {
        const val = input.value === '' ? 0 : input.value
        if (val < min || val > max) e.preventDefault()
        if (val > max) input.value = max
        if (val < min) input.value = min
        current_value = input.value
        notify(make({to: address, type: 'onchange', data: { value: current_value }}))
    }
    function update_style (current_theme, shadow) {
        const { style: custom_style = '', props = {}, grid = {}, classList = '' } = current_theme
        if (current_theme.classList?.length) input.setAttribute('class', current_theme.classList)
        current_style =  `
        :host(i-input) {
          ${Object.keys(default_theme.props).map(key => `${key}: ${props[key] || default_theme.props[key]};`).join('\n')}
          width: var(--width);
          max-width: 100%;
          display: grid;
        }
        input {
            --shadow-opacity: 0;
            text-align: left;
            align-items: center;
            font-size: var(--size);
            font-weight: var(--bold);
            color: hsl( var(--color) );
            background-color: hsla( var(--bg-color), var(--opacity) );
            border: var(--border);
            border-radius: var(--border-radius);
            padding: var(--padding);
            transition: font-size .3s, color .3s, background-color .3s, box-shadow .3s ease-in-out;
            outline: none;
            box-shadow: var(--shadow-xy) var(--shadow-blur) hsla( var(--shadow-color), var(--shadow-opacity));;
            -moz-appearance: textfield;
        }
        :focus {
            --shadow-opacity: var(--shadow-opacity-focus);
            font-size: var(--current-size);
        }
        input::-webkit-outer-spin-button, 
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
        }
        ${custom_style}
        `
        style_sheet(shadow, current_style)
    }

    // helpers
    function split_val (val) {
        let [i, d] = val.toString().split('.')
        // if (i or d) === undefined, make d euqal to 0
        if (i === '') i = '0'
        if (d === void 0) d = '0'
        return [i, d]
    }

// ---------------------------------------------------------------
    return el
// ---------------------------------------------------------------
}

