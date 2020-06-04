
///////////////////////////////////////////////////////////////////////////////
// Subset of HoloComp UI Library necessary to implement square toggle boxes. //
// Library developed by Narayana Adisasmito-Smith. (C) 2019                  //
///////////////////////////////////////////////////////////////////////////////

function Base(s = {}) {
	let base = document.createElement('div');
	base.style.background = 'transparent';
	base.style.position = 'absolute';
	base.style.display = 'inline-block';
	base.style.width = (s.width || 0).toString() + 'px';
	base.style.height = (s.height || 0).toString() + 'px';
	base.style.left = (s.x || 0).toString() + 'px';
	base.style.top = (s.y || 0).toString() + 'px';
	return base;
}
class SubComponent {
	constructor(parent = document.body, settings = {}, instance = {}) {
		// heirarchy
		this.parent = parent;
		this.subComps = [];
		if (parent['subComps']) {
			this.parent.subComps.push(this);
		}
		// instance
		this._x = parseFloat(instance.x) || 0;
		this._y = parseFloat(instance.y) || 0;
		this._w = parseFloat(instance.w) || 25;
		this._h = parseFloat(instance.h) || 25;
		this._filter = '';
		// inheritance
		this.settings = {
			anchor: 'top left',
			color: '#fca558',
			glowColor: '#f07d18',
			shadowSpread: 2,
			borderWidth: 2,
			standardWidth: 25
		}
		if (!parent['subComps']) {
			for (let property in settings) {
				this.settings[property] = settings[property];
			}
		} else {
			for (let property in parent.settings) {
				this.settings[property] = parent.settings[property];
			}
			for (let property in settings) {
				this.settings[property] = settings[property];
			}
		}
		// body
		this.container = new Base({
			x: this._x,
			y: this._y,
			width: this._w,
			height: this._h
		});
		if (!parent['subComps']) {
			this.parent.appendChild(this.container);
		} else {
			this.parent.container.appendChild(this.container);
		}
	}

	_updateFilter() {
		this._filter = 'drop-shadow(0 0 ' + (this.settings.shadowSpread || 2) + 'px ' + (this.settings.glowColor + 'ff') + ')' +
						' drop-shadow(0 0 ' + (Math.ceil(this.settings.shadowSpread/2) || 1) + 'px ' + (this.settings.glowColor + '88') + ')';
	}

	get x() {
		return this._x;
	}
	set x(nx) {
		this._x = parseFloat(nx) || this._x;
		this.container.style.left = this._x.toString() + 'px';
	}
	get y() {
		return this._y;
	}
	set y(ny) {
		this._y = parseFloat(ny) || this._y;
		this.container.style.top = this._y.toString() + 'px';
	}
	get width() {
		return this._w;
	}
	set width(nw) {
		this._w = parseFloat(nw) || this._w;
		this.container.style.width = this._w.toString() + 'px';
	}
	get height() {
		return this._h;
	}
	set height(nh) {
		this._h = parseFloat(nh) || this._h;
		this.container.style.height = this._h.toString() + 'px';
	}

	setPos(nx, ny) {
		this.x = nx;
		this.y = ny;
	}
	setSize(nw, nh) {
		this.width = nw;
		this.height = nh;
	}
	setColors(nc, ng) {
		this.settings.color = nc;
		this.settings.glowColor = ng;
	}
	setAnchor(na) {
		// do stuff
	}
}

class Selector extends SubComponent {
	constructor(parent, settings, instance) {
		super(parent, settings, instance);
		super.height = super.width;
		this.container.style.transform = 'translate(-50%, -50%)';
	}

	get width() {
		return super.width;
	}
	set width(nw) {
		super.width = super.height = nw;
	}
	get height() {
		return super.width;
	}
	set height(nh) {
		this.width = nh;
	}
}
class SquareSelector extends Selector {
	constructor(parent, settings, instance) {
		super(parent, settings, instance);
		this.border = new Base({
			width: super.width,
			height: super.width
		});
		this.container.appendChild(this.border);
		this._refresh();
	}

	_refresh() {
		this._updateFilter();
		this.border.style.border = this.settings.borderWidth + 'px solid ' + this.settings.color;
		this.border.style.filter = this._filter;
	}

	get width() {
		return super.width; // modifying getter/setter reqs restatement of the other
	}
	set width(nw) {
		super.width = nw;
		this.border.style.width = this.border.style.height = this.width + 'px';
	}

	setColors(nc, ng) {
		super.setColors(nc, ng);
		this._refresh();
	}
}
class SquareMarker extends SquareSelector {
	constructor(parent, settings, instance) {
		super(parent, settings, instance);
		this._refresh();
	}

	_refresh() {
		super._refresh();
		this.border.style.background = this.settings.color;
	}
}

class TextLabel extends SubComponent {
	constructor(parent, settings, instance) {
		super(parent, settings, instance);
		this._text = '';
		this.textArea = new Base({width: super.width, height: super.height});
		let ts = this.textArea.style;
		// ts.background = '#33333322';
		ts.whiteSpace = 'pre';
		// ts.overflow = 'hidden';
		this.container.appendChild(this.textArea);
		this._refresh();
	}

	_refresh() {
		this._updateFilter();
		let ts = this.textArea.style;
		ts.color = this.settings.color;
		ts.filter = this._filter;
		ts.font = this.settings.fontSize + 'px ' + this.settings.fontFamily;
	}

	get text() {
		return this._text;
	}
	set text(str) {
		this._text = str.toString() || this._text;
		this.textArea.innerHTML = this._text;
	}
}

////////////////////////////

class ToggleBox extends SubComponent {
	constructor(parent, settings, instance) {
		super(parent, settings, instance);
		this.container.style.transform = 'translate(0%, -50%)';
	}
}
class SquareToggleBox extends ToggleBox {
	constructor(parent, settings, instance, onMod = function(){}) {
		super(parent, settings, instance);
		this._checked = instance.checked;
		this._onMod = onMod;
		this.border = new SquareSelector(this, undefined, {x: 0.5*super.height, y: 0.5*super.height, w: super.height});
		this.fill = new SquareMarker(this, undefined, {x: 0.5*super.height, y: 0.5*super.height, w: 0.5*super.height});
		this.fill.container.style.opacity = this._checked ? 1 : 0;
		this.label = new TextLabel(this, {fontSize: 0.9*super.height}, {x: 2*super.height, y: 0.5*super.height, w: super.width-1.5*super.height, h: super.height});
		this.label.container.style.transform = 'translate(0%, -50%)';

		let self = this;
		this.border.container.onclick = this.fill.container.onclick = function() {
			self._checked = !self._checked;
			self.fill.container.style.opacity = self._checked ? 1 : 0;
			self._onMod(self._checked);
		};
	}
}

////////////////////////////

function cleanStyleNum(v) {
	v = v.toString();
	return parseFloat(v) + (v.slice(-1)=='%' ? '%' : 'px');
}
function CircleForm(r = 50, x = 0, y = 0) {
	let e = document.createElement('div');
	// e.style.background = '#66666688';
	e.style.borderRadius = '50%';
	e.style.position = 'absolute';
	e.style.display = 'inline-block';
	e.style.transform = 'translate(-50%, -50%)';
	e.style.left = cleanStyleNum(x);
	e.style.top = cleanStyleNum(y);
	r = (typeof r == 'string' && r.slice(-1)=='%') ? r : cleanStyleNum(2*r);
	e.style.width = e.style.height = r;
	return e;
}
class ColorWheel {
	//// Known Bugs:
		// Stopping sv drag on singularity fails to prevent coersion if sv is then modified twice before hue is modified. (single sv mod will not cause coersion)
		// Setting (hsv) value of 99%<v<100% is interpretted as v=0%. No consequences except brief flicker of max brightness when approaching pure black.
	constructor(color, settings = {}, onUpdate = ()=>{}) {
		// data
		this._color = tinycolor(color);
		this._hue = this._color.toHsv().h; // need to explicitly save hue to prevent color coersion at singularities (ex black,white would coerce hue to 0deg (red))
		this._hueDrag = this._svDrag = false;
		this.settings = { x: 50, y: 50, r: 50, centerColor: '#000' }; // default setting
		for (let prop in settings) this.settings[prop] = settings[prop]; // overwrite settings
		this.onUpdate = onUpdate;
		// base elems
		let colorWheel = new CircleForm(this.settings.r, this.settings.x, this.settings.y);		// base container; color ring visualizer
		let centerFill = new CircleForm('80%', '50%', '50%');									// bg color of center
		let hueSlider = new CircleForm('15%', '50%', '50%');									// hue selector on color ring
		let svPicker = new CircleForm('50%', '50%', '50%');										// saturation/luminance visualizer
		let svSlider = new CircleForm('15%', '50%', '50%');										// saturation/luminance selector
		// static formatting
		let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox')>-1; // firefox doesn't support conic gradients, but all other major browsers do
		if (isFirefox) {colorWheel.style.background = 'url(colorwheel.png)'; colorWheel.style.backgroundSize = '100%'}
		else {colorWheel.style.background = 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'}
		centerFill.style.background = this.settings.centerColor;
		hueSlider.style.border = '2px solid #fff';
		svPicker.style.borderRadius = 0;
		svPicker.style.backgroundImage = 'url(assets/sv-map.png)';
		svPicker.style.backgroundSize = '100%';
		svPicker.style.border = svSlider.style.border = '1px solid #fff';
		// init
		document.body.appendChild( this.colorWheel = colorWheel );
		this.colorWheel.appendChild( this.centerFill = centerFill );
		this.colorWheel.appendChild( this.hueSlider = hueSlider );
		this.colorWheel.appendChild( this.svPicker = svPicker );
		this.svPicker.appendChild( this.svSlider = svSlider );
		this._update();
		// attach hooks
		this.colorWheel.addEventListener('mousedown', e => {
			if (e.target != this.colorWheel && e.target != this.hueSlider) return;
			this._hueDrag = true;
			this._setHue( this._angleTo(e.clientX, e.clientY) );
		});
		this.svPicker.addEventListener('mousedown', e => {
			this._svDrag = true;
			this._setSV( e.clientX, e.clientY );
			// prevent color coersion if we previously stopped dragging on a singularity
			let computedColor = this._color.toHsv();
			if (computedColor.s > 0.01 && computedColor.v > 0.01) {
				this._hue = computedColor.h;
			}
		});
		window.addEventListener('mouseup', e => {
			if (this._svDrag) { // restore hue in case we hit a singularity during the dragging
				let color = this._color.toHsv();
				color.h = this._hue;
				this.color = color;
			}
			this._hueDrag = this._svDrag = false;
		});
		window.addEventListener('mousemove', e => {
			if (this._hueDrag) {
				this._setHue( this._angleTo(e.clientX, e.clientY) );
			} else if (this._svDrag) {
				this._setSV( e.clientX, e.clientY );
			}
		});
	}

	_update() {
		// dynamic formatting
		let colorObj = this._color.toHsv(),
				hue = this._hue,
				saturation = colorObj.s*100,
				value = colorObj.v*100;
		let trueColor = tinycolor({h:hue, s:saturation, v:value});
		let theta = (hue-90 + 360) % 360;
		this.hueSlider.style.backgroundColor = this.svPicker.style.backgroundColor = 'hsl(' + hue + ', 100%, 50%)';
		this.hueSlider.style.transform = 'rotate(' + theta + 'deg) translate(' + (0.9*this.settings.r) + 'px) rotate(' + (-theta) + 'deg) translate(-50%, -50%)';
		this.svSlider.style.backgroundColor = trueColor.toHexString();	// need to style using hex, since CSS doesn't take HSV colors
		this.svSlider.style.left = (saturation)+'%';
		this.svSlider.style.top = (100-value)+'%';
		// user-specified actions
		this.onUpdate(trueColor);
	}
	_angleTo(x, y) {
		let a = Math.atan( (this.settings.y - y)  /  (this.settings.x - x)  ) * (180 / Math.PI);
		a = ((this.settings.x - x) < 0) ? a + 90 : a + 90 + 180;	// compensate for negative angles from Math.atan
		return a;
	}
	_setHue(h) {
		// save visual h,s values in case we stopped at a singularity
		let svx = this.svSlider.style.left;
		let svy = this.svSlider.style.top;
		// modify hue
		this._hue = h;
		let color = this._color.toHsv();
		color.h = h;
		this.color = color;
		this._update();
		// restore visual h,s values
		this.svSlider.style.left = svx;
		this.svSlider.style.top = svy;
	}
	_setSV(cx, cy) {
		let r = this.settings.r,
			x = Math.max( 0, Math.min(r, cx-(this.settings.x-0.5*r)) ),
			y = Math.max( 0, Math.min(r, cy-(this.settings.y-0.5*r)) );
		let color = this._color.toHsv();
				color.s = x/r;
				color.v = 1 - y/r;
		this.color = color;
		this._update();
		// enforce visual h,s values in case we're near a singularity
		this.svSlider.style.left = (100*color.s)+'%';
		this.svSlider.style.top = (100*(1-color.v))+'%';
	}

	get x() {
		return this.settings.x;
	}
	set x(nx) {
		this.settings.x = parseFloat(nx) || this.settings.x;
		this.colorWheel.style.left = cleanStyleNum(this.settings.x);
	}
	get y() {
		return this.settings.y;
	}
	set y(ny) {
		this.settings.y = parseFloat(ny) || this.settings.y;
		this.colorWheel.style.top = cleanStyleNum(this.settings.y);
	}
	get r() {
		return this.settings.r;
	}
	set r(nr) {
		this.settings.r = parseFloat(nr) || this.settings.r;
		this.colorWheel.style.width = this.colorWheel.style.height = cleanStyleNum(2*this.settings.r);
		this._update();
	}
	get color() {
		return this._color.toString();
	}
	set color(newColor) {
		let color = tinycolor(newColor);
		this._color = (color.isValid()) ? color : this._color;
	}
	formatColor(format) {
		return this._color.toString(format);
	}
	formatColorObj(format) {
		switch (format) {
			case 'hex':
				return this._color.toHex();
				break;
			case 'rgb':
				return this._color.toRgb();
				break;
			case 'hsl':
				return this._color.toHsl();
				break;
			case 'hsv':
				return this._color.toHsv();
				break;
			default:
				console.error('Can only format color object as hex, rgb, hsl, or hsv.');
		}
	}
}