/*!
 * wawa-roll
 * 
 * class & vanilla version of
 * 
 * Drum.JS - v0.1dev - 2014-01-09
 * http://mb.aquarius.uberspace.de/drum.js
 *
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Licensed under the MIT license */

class WawaRoll extends HTMLElement {

	constructor () {
		super();
		/* INNER CLASS ******************************************************************/
		this.Arrow = class {
			svgelem (tagName) {
				return document.createElementNS("http://www.w3.org/2000/svg", tagName);
			};
			svgcanvas (width, height) {
				let svg = this.svgelem("svg");
				svg.setAttribute("width", width);
				svg.setAttribute("height", height);
				let g = this.svgelem("g");
				svg.appendChild(g);
				return svg;
			};
			container (className) {
				let container = document.createElement("div");
				container.setAttribute("class", className);
				let inner = document.createElement("div");
				container.appendChild(inner);
				return container;
			};
			path (settings) {
				let p = this.svgelem("path");
				let styles = {
					"fill" : "none",
					"stroke" : settings.dail_stroke_color,
					"stroke-width" : settings.dail_stroke_width + "px",
					"stroke-linecap" : "butt",
					"stroke-linejoin" : "miter",
					"stroke-opacity": "1"
				};
				let style = "";
				for (let i in styles) {
					p.setAttribute(i, styles[i]);
				}
				return p;
			};
			up (settings) {
				let width = settings.dail_w;
				let height = settings.dail_h;

				let svg = this.svgcanvas(width, height);
				let p = this.path(settings); 

				p.setAttribute("d", "m0," + (height + settings.dail_stroke_width) + "l" + (width/2) + ",-" + height + "l" + (width/2) + "," + height);
				svg.querySelector("g").appendChild(p);

				let cont = this.container("dial up");
				cont.querySelector("div").appendChild(svg);
				return cont;
			}
			down (settings) {
				let width = settings.dail_w;
				let height = settings.dail_h;

				let svg = this.svgcanvas(width, height);
				let p = this.path(settings); 

				p.setAttribute("d", "m0,-" + settings.dail_stroke_width + "l" + (width/2) + "," + height + "l" + (width/2) + ",-" + height);
				svg.querySelector("g").appendChild(p);

				let cont = this.container("dial down");
				cont.querySelector("div").appendChild(svg);
				return cont;
			}
		}
		/* INNER CLASS ******************************************************************/

		/* INNER CLASS ******************************************************************/
		this.PanelModel = class {
			constructor(index, data_index, settings){
				/* INNER CLASS ******************************************************************/
				this.DataModel = class {
					constructor (data, i) {
						this.data = data;
						this.index = i;
					}
					getHTML () {
						return this.data[this.index];
					}
				}
				/* INNER CLASS ******************************************************************/

				this.index = index;
				this.data_index = data_index;
				this.settings = settings;
				this.dataModel = new this.DataModel(settings.data, data_index);
			}

			init () {
				this.angle = this.settings.theta * this.index;
				this.elem = document.createElement('figure');
// 				this.elem.classList.add('a' + this.angle*100);
				this.elem.style.opacity = 0.5;
				this.elem.style.setProperty(
					this.settings.transformProp, 
					this.settings.rotateFn + '(' + -this.angle + 'deg) translateZ(' + this.settings.radius + 'px)',
				);
				this.setHTML();
			};
			getHTML (index=null) {
				if (!index) {
					return this.data[this.index];
				} else {
					return this.data[index];
				}
			}
			setHTML () {
				this.elem.innerHTML = this.dataModel.getHTML();
			}
			update (data_index) {
				if (this.dataModel.index != this.data_index) {
					this.dataModel.index = this.data_index;
					this.setHTML();
				}
			};
		}
		/* INNER CLASS ******************************************************************/

		this.captionElement = null;
		this.size = null;
		this.arrow = null;
		this.settings = {};
		this.wrapper = null;
		this.drum = null;
		this.arrowUp = null;
		this.arrowDown = null;
		this.loaded = false;
		this.fn = {}; 
		this.fn.random = (function () { return Math.round(Math.random()*1000+1);});

	}
	
	connectedCallback() {
		this.loaded = false;
		this.size = this.children.length;
		let options = {};
		let transformProp ='transform';
		let prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
		for(let i = 0; i < prefixes.length; i++) {
			if(document.createElement('div').style[prefixes[i]] !== undefined) {
				transformProp = prefixes[i];
				break;
			}
		}
		this.arrow = new this.Arrow;

		this.settings = Object.assign({
			panelCount : this.size,
			rotateFn : 'rotateX',
			interactive: true,
			dail_w: 20,
			dail_h: 10,
			dail_stroke_color: '#999999',
			dail_stroke_width: 3,
		}, options || {});

		this.settings.transformProp = transformProp;
		this.settings.rotation = 0;
		this.settings.distance = 0;
		this.settings.last_angle = 0;
		this.settings.theta = 360.0 / this.settings.panelCount;

		//this.settings.initselect = this.selectedIndex;
		this.settings.initselect = 0;
		this.settings.data = [];
		this.settings.mapping = [];
		for (let i=0; i<this.children.length; i++) {
//			this.settings.data.push(this.children[i].textContent);
			this.settings.data.push(this.children[i].outerHTML);
		}

		this.style.display = 'none';

		this.wrapper = document.createElement( "div" );
		this.wrapper.classList.add("drum-wrapper");
		
		if (this.settings.id)
			this.wrapper.setAttribute('id', settings.id);
		else if (this.id)
			this.wrapper.setAttribute('id', 'drum_' + this.id);
		else if (this.getAttribute('name'))
			this.wrapper.setAttribute('id', 'drum_' + this.getAttribute('name'));

		this.parentNode.insertBefore(this.wrapper, this.nextSibling);

		let inner = document.createElement("div");
		inner.classList.add("inner");
		this.wrapper.appendChild(inner);

		let container = document.createElement( "div" );
 		container.classList.add("container");		
		inner.appendChild(container);

		this.drum = document.createElement( "div" );
		this.drum.classList.add("drum");
		container.appendChild(this.drum);
		
		console.log(this.drum.offsetWidth);

		if (this.settings.interactive === true) {
			this.arrowUp = this.arrow.up(this.settings);
			this.wrapper.appendChild(this.arrowUp);

			this.arrowDown = this.arrow.down(this.settings);
			this.wrapper.appendChild(this.arrowDown);
		}

		this.settings.radius = Math.round( ( this.drum.offsetHeight / 2 ) / Math.tan( Math.PI / this.settings.panelCount ) );
		let c = 0;
		for (let i=0; i < this.settings.panelCount; i++) {
			if (this.settings.data.length == i) break;
			let j = c;
			if (c >= (this.settings.panelCount / 2)) {
				j = this.settings.data.length - (this.settings.panelCount - c);
			}
			c++;

			let panel = new this.PanelModel(i, j, this.settings);
			panel.init();
			this.settings.mapping.push(panel);

			this.drum.appendChild(panel.elem);
		}

		this.setIndex(this.settings.initselect);
		this.events();
		this.loaded = true;
	}

	getNearest (deg) {
		deg = deg || this.settings.rotation;
		let th = (this.settings.theta / 4 );
		let n = 360;
		let angle = ((deg + th) % n + n) % n;
		angle = angle - angle % this.settings.theta;
		let l = (this.settings.data.length - 1) * this.settings.theta;
		if (angle > l) {
			if (deg > 0) return l;
			else return 0;
		}
		return angle;
	}

	getSelected () {
		let nearest = this.getNearest();
		for (let i in this.settings.mapping) {
			if (this.settings.mapping[i].angle == nearest) {
				return this.settings.mapping[i];
			}
		}
	}

	getText(index=null) {
		if (index>=0 && index<this.settings.data.length) return this.settings.data[index].replace(/<[^>]+>/g, '');
		return null;
	}

	update (selected) {
		let c, list = [], pc = this.settings.panelCount, ph = this.settings.panelCount / 2, l = this.settings.data.length;
		let i = selected.index;
		let j = selected.dataModel.index;
		for (let k=j-ph; k<=j+ph-1; k++) {
			c = k;
			if (k < 0) c = l+k;
			if (k > l-1) c = k-l;
			list.push(c);
		}
		let t = list.slice(ph-i); 
		list = t.concat(list.slice(0, pc - t.length));
		for (let i=0; i<this.settings.mapping.length; i++) {
			this.settings.mapping[i].update(list[i]);
		}
	}

	transform () {
		this.drum.style.setProperty(this.settings.transformProp, 'translateZ(-' + this.settings.radius + 'px) ' + this.settings.rotateFn + '(' + this.settings.rotation + 'deg)');

		let selected = this.getSelected();
		if (selected) {
			let data = selected.dataModel;

			let last_index = this.selectedIndex;
			this.selectedIndex = data.index;

//			if (last_index != data.index && this.settings.onChange) 
//				this.settings.onChange(this);
				

			selected.elem.style.opacity= 1;
			//selected.elem.style.backgroundColor = 'rgb(160,180,200)';

			let hiddenFigures = this.drum.querySelectorAll("figure, .hidden");
			let searched = "a" + (selected.angle*100);
			for (let i = 0 ; i<hiddenFigures.length; i++) {
				if (!hiddenFigures[i].classList.contains(searched)) {
					hiddenFigures[i].style.opacity=0.5;
//					hiddenFigures[i].style.backgroundColor = 'inherit';
				}
			}
			if (selected.angle != this.settings.last_angle && [0,90,180,270].indexOf(selected.angle) >= 0) {
				this.settings.last_angle = selected.angle;
				this.update(selected);
			}
			if (this.loaded && last_index != data.index) {
				let event = new Event('indexchanged');
				this.dispatchEvent(event);
			} 
		}
	}

	setCaption(caption=null) {
		if (this.wrapper && caption) {
			if (!this.captionElement) {
				this.captionElement = document.createElement("div");
				this.captionElement.classList.add('drum-caption');
				this.parentElement.insertBefore(this.captionElement,this);
			}
			this.captionElement.textContent = caption;
		} else {
			if (this.captionElement) {
				this.parentElement.removeChild(this.captionElement);
				this.captionElement = null;
			}
		}
	}

	get caption () {
		if (this.captionElement) {
			return this.captionElement.textContent;
		} else {
			return null;
		}
	}

	set caption (caption=null) {
		this.setCaption(caption);
	}

	static get observedAttributes() {
		return ['caption'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name=='caption') {
			this.setCaption(newValue);
		}
	}
	setIndex (dataindex) {
		let page = Math.floor(dataindex / this.settings.panelCount);
		let index = dataindex - (page * this.settings.panelCount);
		let selected = new this.PanelModel(index, dataindex, this.settings);
		this.update(selected);
		this.settings.rotation = index * this.settings.theta;
		this.transform();
	}
	getIndex () {
		return this.getSelected().dataModel.index;
	}
	
	get index() {
		return this.getIndex();
	}
	
	get item() {
		return this.getSelected().dataModel;
	}
	
	set index(index) {
		this.setIndex(index);
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

	wheelUpWheelDown(e) {
		let deg = 0.0;
		if (e.deltaY<0) {
			this.arrowUpClick(e);
		} else if (e.deltaY>0) {
			this.arrowDownClick(e);
		}
	}

	arrowUpClick(e) {
		let deg = this.settings.rotation - this.settings.theta - 0.25;
		this.settings.rotation = this.getNearest(deg);
		this.transform();
	}

	arrowDownClick(e) {
		let deg = this.settings.rotation + this.settings.theta + 0.25;
		this.settings.rotation = this.getNearest(deg);
		this.transform();
	}

	mouseEnter(e) {
		//e.target.querySelector(".up").style.display='block';
		//e.target.querySelector(".down").style.display='block';
		e.target.querySelector(".up").classList.add('active');
		e.target.querySelector(".down").classList.add('active');
	}

	mouseLeave(e) {
		//e.target.querySelector(".up").style.display='none';
		//e.target.querySelector(".down").style.display='none';
		//e.target.querySelector(".up").style.display='block';
		//e.target.querySelector(".down").style.display='block';
		e.target.querySelector(".up").classList.remove('active');
		e.target.querySelector(".down").classList.remove('active');
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
			this.arrowUp.addEventListener('click', e => this.arrowUpClick(e));
			this.arrowDown.addEventListener('click', e => this.arrowDownClick(e));

			this.wrapper.addEventListener('mouseenter',e => this.mouseEnter(e));
			this.wrapper.addEventListener('mouseleave',e => this.mouseLeave(e));
			this.wrapper.addEventListener('wheel', e=> this.wheelUpWheelDown(e), {passive:true});
		}
	}
}

document.addEventListener('DOMContentLoaded', function (e) {
	customElements.define('wawa-roll', WawaRoll, { extends: 'select' } );
});
