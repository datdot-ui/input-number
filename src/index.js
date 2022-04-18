const style_sheet = require('support-style-sheet')
const message_maker = require('message-maker')

var id = 0

module.exports = i_input

function i_input (opts, protocol) {
    const { value = 0, min = 0, max = 100, step = 1, placeholder = '', theme } = opts
    var current_value = value
    let [int, dec] = split_val(step)
    const el = document.createElement('i-input')
    const shadow = el.attachShadow({mode: 'closed'})
    const input = document.createElement('input')

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
        if (names[from].name === 'parent') {
            current_value = data.value
            input.value = current_value
        }
    }
// ------------------------------------------------
    set_attributes(el, input)
    shadow.append(input)
    // handle events go here
    input.onwheel = (e) => e.preventDefault()
    input.onblur = (e) => handle_blur(e, input) // when element loses focus
    // Safari doesn't support onfocus @TODO use select()
    input.onclick = (e) => handle_click(e, input)
    input.onfocus = (e) => handle_focus(e, input)
    input.onkeydown = (e) => handle_keydown_change(e, input)
    input.onkeyup = (e) => handle_keyup_change(e, input)
    input.onwheel = (e) => handle_wheel(e, input)
// ---------------------------------------------------------------
    // all set attributes go here
    function set_attributes (el, input) {
        input.type = 'number'
        input.name = myaddress
        input.value = value
        input.placeholder = placeholder
        input.min = min
        input.max = max
        // properties
        input.setAttribute('aria-myaddress', 'input')
        input.setAttribute('class', theme.classList)
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
        console.log('step:', step_i, step_d);
        console.log('val:', val_i, val_d);
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
        console.log('step:', step_i, step_d);
        console.log('val:', val_i, val_d);
        notify(make({to: address, type: 'onchange', data: { value: current_value }}))
    }
    // input click event
    function handle_click (e, input) {
        e.target.select()
    }
    // input focus event
    function handle_focus (e, input) {}
    // input blur event
    function handle_blur (e, input) {
        if (input.value === '') return
        notify(make({to: address, type: 'onblur', data: { value: current_value }}))
    }

    // handle scroll wheel
    function handle_wheel (e, input) {
        const target = e.target
        const val = input.value === '' ? 0 : input.value
        let mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel"
        if (mousewheelevt === "mousewheel") {
            e.wheelDelta > 0 ? increase(e, input, val) : decrease(e, input, val)
        } else {
            e.deltaY > 0 ?  increase(e, input, val) : decrease(e, input, val)
        }
    }

    // input keydown event
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

    // helpers

    function split_val (val) {
        let [i, d] = val.toString().split('.')
        // if (i or d) === undefined, make d euqal to 0
        if (i === '') i = '0'
        if (d === void 0) d = '0'
        return [i, d]
    }
    
   // insert CSS style
   const custom_style = theme ? theme.style : ''
   // set CSS variables
   if (theme && theme.props) {
       var {size, size_hover, current_size,
           weight, weight_hover, current_weight,
           color, color_hover, current_color, current_bg_color, 
           bg_color, bg_color_hover, border_color_hover,
           border_width, border_style, border_opacity, border_color, border_radius, 
           padding, width, height, opacity,
           fill, fill_hover, icon_size, current_fill,
           shadow_color, shadow_offset_xy, shadow_blur, shadow_opacity,
           shadow_color_hover, shadow_offset_xy_hover, blur_hover, shadow_opacity_hover
       } = theme.props
   }

// ---------------------------------------------------------------
    const style = `
    :host(i-input) {
        --size: ${size ? size : 'var(--size14)'};
        --size-hover: ${size_hover ? size_hover : 'var(--size)'};
        --current-size: ${current_size ? current_size : 'var(--size)'};
        --bold: ${weight ? weight : 'normal'};
        --color: ${color ? color : 'var(--primary-color)'};
        --bg-color: ${bg_color ? bg_color : 'var(--color-white)'};
        --width: ${width ? width : 'unset'};
        --height: ${height ? height : '32px'};
        --opacity: ${opacity ? opacity : '1'};
        --padding: ${padding ? padding : '8px 12px'};
        --border-width: ${border_width ? border_width : '0px'};
        --border-style: ${border_style ? border_style : 'solid'};
        --border-color: ${border_color ? border_color : 'var(--primary-color)'};
        --border-opacity: ${border_opacity ? border_opacity : '1'};
        --border: var(--border-width) var(--border-style) hsla( var(--border-color), var(--border-opacity) );
        --border-radius: ${border_radius ? border_radius : 'var(--primary-button-radius)'};
        --fill: ${fill ? fill : 'var(--primary-color)'};
        --fill-hover: ${fill_hover ? fill_hover : 'var(--color-white)'};
        --icon-size: ${icon_size ? icon_size : '16px'};
        --shadow-xy: ${shadow_offset_xy ? shadow_offset_xy : '0 0'};
        --shadow-blur: ${shadow_blur ? shadow_blur : '8px'};
        --shadow-color: ${shadow_color ? shadow_color : 'var(--color-black)'};
        --shadow-opacity: ${shadow_opacity ? shadow_opacity : '0.25'};
        ${width && 'width: var(--width)'};
        height: var(--height);
        max-width: 100%;
        display: grid;
    }
    [type="text"], [type="number"] {
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
    }
    :focus {
        --shadow-opacity: ${shadow_opacity ? shadow_opacity : '.3'};
        font-size: var(--current-size);
    }
    [type="number"] {
        -moz-appearance: textfield;
    }
    [type="number"]::-webkit-outer-spin-button, 
    [type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
    ${custom_style}
    `
// ---------------------------------------------------------------
    style_sheet(shadow, style)
    return el
// ---------------------------------------------------------------
}
