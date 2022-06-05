# datdot-ui-input-number
DatDot UI component

Opts
---

`{ name = 'input-number', value = 0, min = 0, max = 100, step = 1, placeholder = '', theme = default_theme }`


Incoming message types
---
- `help` requests info on current state
- `update`

Outgoing message types
---

**parent**
- `help` sends info on current state 
- `onchange` updates any of the data sent `{ value, min, max, placeholder, sheets }`
- `onblur`