/*! Drum.JS - v0.1dev - 2014-01-09
 * http://mb.aquarius.uberspace.de/drum.js
 *
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Licensed under the MIT license */

class DrumIcon {

	svgelem (tagName) {
		return document.createElementNS("http://www.w3.org/2000/svg", tagName);
	};

	svgcanvas (width, height) {
		var svg = this.svgelem("svg");
		svg.setAttribute("width", width);
		svg.setAttribute("height", height);

		var g = this.svgelem("g");
		svg.appendChild(g);

		return svg;
	};
	container (className) {
		var container = document.createElement("div");
		container.setAttribute("class", className);
		var inner = document.createElement("div");
		container.appendChild(inner);
		return container;
	};
	path (settings) {
		var p = this.svgelem("path");
		var styles = {
			"fill" : "none",
			"stroke" : settings.dail_stroke_color,
			"stroke-width" : settings.dail_stroke_width + "px",
			"stroke-linecap" : "butt",
			"stroke-linejoin" : "miter",
			"stroke-opacity": "1"
		};
		var style = "";
		for (var i in styles) {
			p.setAttribute(i, styles[i]);
		}
		return p;
	};
	up (settings) {
		var width = settings.dail_w;
		var height = settings.dail_h;

		var svg = this.svgcanvas(width, height);
		var p = this.path(settings); 

		p.setAttribute("d", "m0," + (height + settings.dail_stroke_width) + "l" + (width/2) + ",-" + height + "l" + (width/2) + "," + height);
		svg.querySelector("g").appendChild(p);

		var cont = this.container("dial up");
		cont.querySelector("div").appendChild(svg);
		return cont;
	}
	down (settings) {
		var width = settings.dail_w;
		var height = settings.dail_h;

		var svg = this.svgcanvas(width, height);
		var p = this.path(settings); 

		p.setAttribute("d", "m0,-" + settings.dail_stroke_width + "l" + (width/2) + "," + height + "l" + (width/2) + ",-" + height);
		svg.querySelector("g").appendChild(p);

		var cont = this.container("dial down");
		cont.querySelector("div").appendChild(svg);
		return cont;
	}
}

class DataModel {
	constructor (data, i) {
		this.data = data;
		this.index = i;
	}
	getText () {
		return this.data[this.index];
	}
}

class PanelModel {
	constructor(index, data_index, settings){
		this.index = index;
		this.data_index = data_index;
		this.settings = settings;
		
		this.dataModel = new DataModel(settings.data, data_index);
	}
	init () {
		this.angle = this.settings.theta * this.index;
		this.elem = document.createElement('figure');
		this.elem.classList.add('a' + this.angle*100);
		this.elem.style.opacity = 0.5;
		this.elem.style.setProperty(
			this.settings.transformProp, 
			this.settings.rotateFn + '(' + -this.angle + 'deg) translateZ(' + this.settings.radius + 'px)',
		);
		this.setText();
	};
	
	getText () {
		return this.data[this.index];
	}

	setText () {
		this.elem.textContent = this.dataModel.getText();
	}

	update (data_index) {
		if (this.dataModel.index != this.data_index) {
			this.dataModel.index = this.data_index;
			this.setText();
		}
	};

}
class Drum {
	constructor (element, options, transformProp) {
		this.DrumIcon = new DrumIcon;

		this.HTMLselect = element;
		this.settings = Object.assign({
			panelCount : 16,
			rotateFn : 'rotateX',
			interactive: true,
			dail_w: 20,
			dail_h: 5,
			dail_stroke_color: '#999999',
			dail_stroke_width: 1
		}, options || {});

		this.settings.transformProp = transformProp;
		this.settings.rotation = 0;
		this.settings.distance = 0;
		this.settings.last_angle = 0;
		this.settings.theta = 360 / this.settings.panelCount;

		//this.settings.initselect = this.HTMLselect.selectedIndex;
		this.settings.initselect = 0;
		this.settings.data = [];
		this.settings.mapping = [];
		for (var i=0; i<this.HTMLselect.children.length; i++) {
			this.settings.data.push(this.HTMLselect.children[i].textContent);
		}

		this.HTMLselect.style.display = 'none';

		this.wrapper = document.createElement( "div" );
		this.wrapper.classList.add("drum-wrapper");
		
		if (this.settings.id)
			this.wrapper.setAttribute('id', settings.id);
		else if (this.HTMLselect.id)
			this.wrapper.setAttribute('id', 'drum_' + this.HTMLselect.id);
		else if (this.HTMLselect.getAttribute('name'))
			this.wrapper.setAttribute('id', 'drum_' + this.HTMLselect.getAttribute('name'));

		this.HTMLselect.parentNode.insertBefore(this.wrapper, this.HTMLselect.nextSibling);

		var inner = document.createElement("div");
		inner.classList.add("inner");
		this.wrapper.appendChild(inner);

		var container = document.createElement( "div" );
 		container.classList.add("container");		
		inner.appendChild(container);

		this.drum = document.createElement( "div" );
		this.drum.classList.add("drum");
		container.appendChild(this.drum);

		if (this.settings.interactive === true) {
			this.dialUp = this.DrumIcon.up(this.settings);
			this.wrapper.appendChild(this.dialUp);

			this.dialDown = this.DrumIcon.down(this.settings);
			this.wrapper.appendChild(this.dialDown);

			this.wrapper.addEventListener('mouseenter',function() {
				this.querySelector(".up").style.display='block';
				this.querySelector(".down").style.display='block';
			});
			this.wrapper.addEventListener('mouseexit',function() {
				this.querySelector(".up").style.display='none';
				this.querySelector(".down").style.display='none';
			});
		}

		this.settings.radius = Math.round( ( this.drum.offsetHeight / 2 ) / Math.tan( Math.PI / this.settings.panelCount ) );
		var c = 0;
		for (var i=0; i < this.settings.panelCount; i++) {
			if (this.settings.data.length == i) break;
			var j = c;
			if (c >= (this.settings.panelCount / 2)) {
				j = this.settings.data.length - (this.settings.panelCount - c);
			}
			c++;

			var panel = new PanelModel(i, j, this.settings);
			panel.init();
			this.settings.mapping.push(panel);

			this.drum.appendChild(panel.elem);
		}

		this.setIndex(this.settings.initselect);
		this.events();
	}

	getNearest (deg) {
		deg = deg || this.settings.rotation;
		var th = (this.settings.theta / 2);
		var n = 360;
		var angle = ((deg + th) % n + n) % n;
		angle = angle - angle % this.settings.theta;
		var l = (this.settings.data.length - 1) * this.settings.theta;
		if (angle > l) {
			if (deg > 0) return l;
			else return 0;
		}
		return angle;
	}

	getSelected () {
		var nearest = this.getNearest();
		for (var i in this.settings.mapping) {
			if (this.settings.mapping[i].angle == nearest) {
				return this.settings.mapping[i];
			}
		}
	}

	update (selected) {
		var c, list = [], pc = this.settings.panelCount, ph = this.settings.panelCount / 2, l = this.settings.data.length;
		var i = selected.index; 
		var j = selected.dataModel.index;
		for (var k=j-ph; k<=j+ph-1; k++) {
			c = k;
			if (k < 0) c = l+k;
			if (k > l-1) c = k-l;
			list.push(c);
		}
		var t = list.slice(ph-i); 
		list = t.concat(list.slice(0, pc - t.length));
		for (var i=0; i<this.settings.mapping.length; i++) {
			this.settings.mapping[i].update(list[i]);
		}
	}

	transform () {
		this.drum.style.setProperty(this.settings.transformProp, 'translateZ(-' + this.settings.radius + 'px) ' + this.settings.rotateFn + '(' + this.settings.rotation + 'deg)');

		var selected = this.getSelected();
		if (selected) {
			var data = selected.dataModel;

			var last_index = this.HTMLselect.selectedIndex;
			this.HTMLselect.selectedIndex = data.index;

			if (last_index != data.index && this.settings.onChange) 
				this.settings.onChange(HTMLselect);

			selected.elem.style.opacity= 1;

			var hiddenFigures = this.drum.querySelectorAll("figure, .hidden");
			var searched = "a" + (selected.angle*100);
			for (var i = 0 ; hiddenFigures.lenght; i++) {
				if (!hiddenFigures[i].classList.contains(searched)) {
					hiddenFigures[i].style.opacity=0.5;
				}
			}
			if (selected.angle != this.settings.last_angle && [0,90,180,270].indexOf(selected.angle) >= 0) {
				this.settings.last_angle = selected.angle;
				this.update(selected);
			}
		}
	}

	setIndex (dataindex) {
		var page = Math.floor(dataindex / this.settings.panelCount);
		var index = dataindex - (page * this.settings.panelCount);
		var selected = new PanelModel(index, dataindex, this.settings);
		this.update(selected);
		this.settings.rotation = index * this.settings.theta;
		this.transform();
	}
	getIndex () {
		return this.getSelected().dataModel.index;
	}
	panStart(e) {
		this.settings.distance = 0;		
	}
	panUpPanDown(e) {
		this.settings.rotation += Math.round(e.deltaY - this.settings.distance) * -1;
		this.transform();
		this.settings.distance = e.deltaY;
	}
	panEnd(e) {
		this.settings.rotation = this.getNearest();
		this.transform();
	}
	dialUpClick(e) {
		var deg = this.settings.rotation + this.settings.theta + 1;
		this.settings.rotation = this.getNearest(deg);
		this.transform();
	}
	dialDownClick(e) {
		var deg = this.settings.rotation - this.settings.theta - 1;
		this.settings.rotation = this.getNearest(deg);
		this.transform();
	}
	events() {
		if (typeof(Hammer) != "undefined") {
			this.settings.touch = new Hammer(this.wrapper, { domEvents: true, } );
			this.settings.touch.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN });
			this.settings.touch.on("panstart", e => this.panStart (e) );
			this.settings.touch.on("panup pandown", e => this.panUpPanDown(e));
			this.settings.touch.on("panend", e => this.panEnd(e));
		}
		if (this.settings.interactive) {
			this.dialUp.addEventListener('click', e => this.dialUpClick(e));
			this.dialDown.addEventListener('click', e => this.dialDownClick(e));
		}
	}
}
class WawaRoll extends HTMLElement {
	constructor() {
		super();
				var transformProp = 'transform';
				var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
				for(var i = 0; i < prefixes.length; i++) {
					if(document.createElement('div').style[prefixes[i]] !== undefined) {
						transformProp = prefixes[i];
						break;
					}
				}
				if (transformProp) {
					var element = self;
							var drum = new Drum	(this,{ panelCount: this.children.length, dail_w: 21, dail_h: 10, dail_stroke_color: '#888', dail_stroke_width: 3 },
							transformProp
							);
				}
	}
}

document.addEventListener('DOMContentLoaded', function (e) {
	customElements.define('wawa-roll', WawaRoll /*,{ extends: 'select' } */);
});
