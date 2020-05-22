
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