const protocol_maker = require('protocol-maker')

var id = 0
const sheet = new CSSStyleSheet()
const default_opts = { 
	name: 'i-input-number',
    value: 0,
    min: 0,
    max: 100,
    step: 1,
    placeholder: '',
	theme: get_theme()
}
sheet.replaceSync(default_opts.theme)

module.exports = input_number

input_number.help = () => { return { opts: default_opts } }

function input_number (opts, parent_wire) {
    const {
        name = default_opts.name, 
        value = default_opts.value, 
        min = default_opts.min, 
        max = default_opts.max, 
        step = default_opts.step, 
        placeholder = default_opts.placeholder, 
        theme = `` } = opts

    const current_state =  { opts: { name, value, min, max, step, placeholder, sheets: [default_opts.theme, theme] } }
        
    // protocol
    const initial_contacts = { 'parent': parent_wire }
    const contacts = protocol_maker('input-number', listen, initial_contacts)
    function listen (msg) {
        const { head, refs, type, data, meta } = msg // listen to msg
        const [from, to, msg_id] = head
        const $parents = contacts.by_name['parent']
        // todo: what happens when we receive the message
        const name = contacts.by_address[from].name
        if (type === 'help') {
            const $from = contacts.by_address[from]
            $from.notify($from.make({ to: $from.address, type: 'help', data: { state: get_current_state() }, refs: { cause: head }}))
        }
        else if (type === 'update') handle_update(data)
    }

    // make input number
    const el = document.createElement('i-input-number')
    const shadow = el.attachShadow({mode: 'closed'})
    const input = document.createElement('input')

    // set attributes
    input.type = 'number'
    input.name = name
    input.value = value
    input.placeholder = placeholder
    input.min = min
    input.max = max
    input.setAttribute('aria-myaddress', 'input')

    shadow.append(input)
    
		const custom_theme = new CSSStyleSheet()
		custom_theme.replaceSync(theme)
		shadow.adoptedStyleSheets = [sheet, custom_theme]

    // add event listeners
    input.onwheel = (e) => e.preventDefault()
    input.onblur = (e) => handle_blur(e, input) // when element loses focus
    // Safari doesn't support onfocus @TODO use select()
    input.onclick = (e) => handle_click(e, input)
    input.onfocus = (e) => handle_focus(e, input)
    input.onkeydown = (e) => handle_keydown_change(e, input)
    input.onkeyup = (e) => handle_keyup_change(e, input)
    input.onwheel = (e) => handle_wheel(e, input)

		return el

    // event handlers
    function handle_click (e, input) { e.target.select() }
    function handle_focus (e, input) {}
    function handle_blur (e, input) {
        if (input.value === '') return
				current_state.opts.value = input.value
        const $parent = contacts.by_name['parent']
        $parent.notify($parent.make({to: $parent.address, type: 'onblur', data: { value: current_state.opts.value }}))
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
        current_state.opts.value = input.value
        const $parent = contacts.by_name['parent']
        $parent.notify($parent.make({to: $parent.address, type: 'onchange', data: { value: current_state.opts.value }}))
    }
		function handle_update (data) {
			const { value, min, max, placeholder, sheets } = data
			if (value) {
				current_state.opts.value = data.value
				input.value = current_state.opts.value
			}
			if (sheets) {
				const new_sheets = sheets.map(sheet => {
					if (typeof sheet === 'string') {
						current_state.opts.sheets.push(sheet)
						const new_sheet = new CSSStyleSheet()
						new_sheet.replaceSync(sheet)
						return new_sheet
						} 
						if (typeof sheet === 'number') return shadow.adoptedStyleSheets[sheet]
				})
				shadow.adoptedStyleSheets = new_sheets
			}
		}

   // helpers
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
        current_state.opts.value = input.value
        const $parent = contacts.by_name['parent']
        $parent.notify($parent.make({to: $parent.address, type: 'onchange', data: { value: current_state.opts.value }}))
    }
    function decrease (e, input, val) {
        e.preventDefault()
        let [step_i, step_d] = split_val(step)
        let [val_i, val_d] = split_val(val)
        var new_val_d = Number(val_d) - Number(step_d)
        var new_val_i = Number(val_i) - Number(step_i)
				console.log('STEP', step_i, step_d, 'VALUE', val_i, val_d, 'NEW', new_val_d, new_val_i)
        const d_places = step_d > val_d ? step_d.length : val_d.length
        const d_full = Math.pow(10, d_places)
        if (new_val_d < 0) {
            new_val_d = new_val_d === 0 ? 0 : d_full + new_val_d
            new_val_i = new_val_i - 1
        }
        let new_val = new_val_d === 0 ? `${new_val_i}` : `${new_val_i}.${new_val_d}`
        input.value = new_val < min ? min.toString() : new_val
        current_state.opts.value = input.value
        const $parent = contacts.by_name['parent']
        $parent.notify($parent.make({to: $parent.address, type: 'onchange', data: { value: current_state.opts.value }}))
    }
    function split_val (val) {
        let [i, d] = val.toString().split('.')
        // if (i or d) === undefined, make d euqal to 0
        if (i === '') i = '0'
        if (d === void 0) d = '0'
        return [i, d]
    }

		// get current state
		function get_current_state () {
			return  {
				opts: current_state.opts,
				contacts
			}
		}
}

function get_theme () {
	return `
	:host(i-input-number) {
		--b: 0, 0%;
		--r: 100%; 50%;
		--color-white: var(--b); 100%;
		--color-black: var(--b); 0%;
		--color-blue: 214; var(--r);
		--size14: 1.4rem;
		--size16: 1.6rem;
		--weight200: 200;
		--weight800: 800;
		--primary-color: var(--color-black);
		--primary-button-radius: 8px;
		--primary-bg-color: var(--color-white);
		--size: var(--size14);
		--size-hover: var(--size);
		--current-size: var(--size);
		--bold: var(--weight200);
		--color:var(--primary-color);
		--bg-color: var(--primary-bg-color);
		--primary-color-hover: var(--color-white);
		--width: unset;
		--height: 32px;
		--opacity: 1;
		--padding: 8px 12px;
		--border-width: 1px;
		--border-style: solid;
		--border-color: var(--primary-color);
		--border-opacity: 1;
		--border-radius: var(--primary-button-radius);
		--border: var(--border-width) var(--border-style) hsla(var(--border-color), var(--border-opacity));
		--fill: var(--primary-color);
		--fill-hover: var(--color-white);
		--icon-size: var(--size16);
		--shadow-xy: 0 0;
		--shadow-blur: 8px;
		--shadow-color: var(--primary-color-hover);
		--shadow-opacity: 0;
		--shadow-opacity-focus: 0.3;
		--padding: 8px 12px;
		--size: var(--primary-size);
		--bold: var(--weight800);
		--color: var(--primary-color);
		--opacity: 1;
		--shadow-opacity: 0;
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
		padding: var(--padding);
		transition: font-size .3s, color .3s, background-color .3s, box-shadow .3s ease-in-out;
		outline: none;
		box-shadow: var(--shadow-xy) var(--shadow-blur) hsla( var(--shadow-color), var(--shadow-opacity));;
		-moz-appearance: textfield;
		border: var(--border);
		border-radius: var(--border-radius);
	}
	:focus {
			--shadow-opacity: var(--shadow-opacity-focus);
			font-size: var(--current-size);
	}
	input::-webkit-outer-spin-button, 
	input::-webkit-inner-spin-button {
			-webkit-appearance: none;
	}`
}