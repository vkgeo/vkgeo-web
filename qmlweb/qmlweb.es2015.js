;(function(global) {
const QmlWeb = {};

global.QmlWeb = QmlWeb;

let objectIds = 0;

class QObject {
  constructor(parent) {
    this.$parent = parent;
    if (parent && parent.$tidyupList) {
      parent.$tidyupList.push(this);
    }

    // List of things to tidy up when deleting this object.
    this.$tidyupList = [];
    this.$properties = {};
    this.$signals = [];

    this.objectId = objectIds++;
  }

  $delete() {
    if (this.$Component) {
      this.$Component.destruction();
    }

    while (this.$tidyupList.length > 0) {
      const item = this.$tidyupList[0];
      if (item.$delete) {
        // It's a QObject
        item.$delete();
      } else {
        // It must be a signal
        item.disconnect(this);
      }
    }

    for (const i in this.$properties) {
      const prop = this.$properties[i];
      while (prop.$tidyupList.length > 0) {
        prop.$tidyupList[0].disconnect(prop);
      }
    }

    if (this.$parent && this.$parent.$tidyupList) {
      const index = this.$parent.$tidyupList.indexOf(this);
      this.$parent.$tidyupList.splice(index, 1);
    }

    // must do this:
    // 1) parent will be notified and erase object from it's children.
    // 2) DOM node will be removed.
    this.parent = undefined;

    // Disconnect any slots connected to any of our signals. Do this after
    // clearing the parent, as that relies on parentChanged being handled.
    for (const i in this.$signals) {
      this.$signals[i].disconnect();
    }
  }

  // must have a `destroy` method
  // http://doc.qt.io/qt-5/qtqml-javascript-dynamicobjectcreation.html
  destroy() {
    this.$delete();
  }

  $toString(...args) {
    return `${this.constructor.name}(${args.join(", ")})`;
  }
}

QmlWeb.QObject = QObject;

class JSItemModel {
  constructor() {
    this.roleNames = [];

    const Signal = QmlWeb.Signal;
    this.dataChanged = Signal.signal([{ type: "int", name: "startIndex" }, { type: "int", name: "endIndex" }]);
    this.rowsInserted = Signal.signal([{ type: "int", name: "startIndex" }, { type: "int", name: "endIndex" }]);
    this.rowsMoved = Signal.signal([{ type: "int", name: "sourceStartIndex" }, { type: "int", name: "sourceEndIndex" }, { type: "int", name: "destinationIndex" }]);
    this.rowsRemoved = Signal.signal([{ type: "int", name: "startIndex" }, { type: "int", name: "endIndex" }]);
    this.modelReset = Signal.signal();
  }

  setRoleNames(names) {
    this.roleNames = names;
  }
}

QmlWeb.JSItemModel = JSItemModel;

class QColor {
  constructor(...args) {
    this.$changed = new QmlWeb.Signal();
    this.$r = this.$g = this.$b = 0;
    this.$a = 1;
    const val = args[0];
    if (args.length >= 3) {
      this.$r = args[0];
      this.$g = args[1];
      this.$b = args[2];
      if (args.length >= 4) {
        this.$a = args[3];
      }
    } else if (val instanceof QColor) {
      // Copy constructor
      this.$a = val.a;
      this.$r = val.r;
      this.$g = val.g;
      this.$b = val.b;
    } else if (typeof val === "string") {
      const lval = val.toLowerCase();
      if (QColor.colormap[lval]) {
        const rgb = QColor.colormap[lval];
        this.$r = rgb[0] / 255;
        this.$g = rgb[1] / 255;
        this.$b = rgb[2] / 255;
      } else if (lval === "transparent") {
        this.$a = 0;
      } else if (lval[0] === "#") {
        const hex = lval.substr(1);
        if (hex.length === 3) {
          this.$r = parseInt(hex[0], 16) / 15;
          this.$g = parseInt(hex[1], 16) / 15;
          this.$b = parseInt(hex[2], 16) / 15;
        } else {
          const rgb = hex.match(/.{2}/g).map(x => parseInt(x, 16));
          if (rgb.length === 4) {
            this.$a = rgb.shift() / 255;
          }
          this.$r = rgb[0] / 255;
          this.$g = rgb[1] / 255;
          this.$b = rgb[2] / 255;
        }
      } else {
        throw new Error(`Can not convert ${val} to color`);
      }
    } else if (typeof val !== "undefined") {
      throw new Error(`Can not assign ${typeof val} to QColor`);
    }
  }
  toString() {
    if (this.$string) return this.$string;
    const argb = [this.$a, this.$r, this.$g, this.$b].map(x => (Math.round(x * 255) + 0x100).toString(16).substr(-2));
    if (argb[0] === "ff") {
      argb.shift(); // We don't need alpha if it's ff
    }
    this.$string = `#${argb.join("")}`;
    return `#${argb.join("")}`;
  }
  get $css() {
    if (this.$cssValue) return this.$cssValue;
    if (this.$a === 1) {
      this.$cssValue = this.toString();
    } else if (this.$a === 0) {
      this.$cssValue = "transparent";
    } else {
      const intr = Math.round(this.$r * 255);
      const intg = Math.round(this.$g * 255);
      const intb = Math.round(this.$b * 255);
      this.$cssValue = `rgba(${intr},${intg},${intb},${this.$a})`;
    }
    return this.$cssValue;
  }
  get r() {
    return this.$r;
  }
  get g() {
    return this.$g;
  }
  get b() {
    return this.$b;
  }
  get a() {
    return this.$a;
  }
  set r(r) {
    this.$r = r;
    this.$string = this.$cssValue = null;
    this.$changed.execute();
  }
  set g(g) {
    this.$g = g;
    this.$string = this.$cssValue = null;
    this.$changed.execute();
  }
  set b(b) {
    this.$b = b;
    this.$string = this.$cssValue = null;
    this.$changed.execute();
  }
  set a(a) {
    this.$a = a;
    this.$string = this.$cssValue = null;
    this.$changed.execute();
  }
  get hsvHue() {
    const v = this.hsvValue;
    const m = Math.min(this.$r, this.$g, this.$b);
    if (v === m) return -1;
    if (v === this.$r) return ((this.$g - this.$b) / (v - m) + 1) % 1 / 6;
    if (v === this.$g) return ((this.$b - this.$r) / (v - m) + 2) / 6;
    if (v === this.$b) return ((this.$r - this.$g) / (v - m) + 4) / 6;
    throw new Error();
  }
  get hsvSaturation() {
    const v = this.hsvValue;
    if (v === 0) return 0;
    return 1 - Math.min(this.$r, this.$g, this.$b) / v;
  }
  get hsvValue() {
    return Math.max(this.$r, this.$g, this.$b);
  }
  get hslHue() {
    return this.hsvHue;
  }
  get hslSaturation() {
    const max = Math.max(this.$r, this.$g, this.$b);
    const min = Math.min(this.$r, this.$g, this.$b);
    if (max === min) return 0;
    return (max - min) / (1 - Math.abs(1 - max - min));
  }
  get hslLightness() {
    const max = Math.max(this.$r, this.$g, this.$b);
    const min = Math.min(this.$r, this.$g, this.$b);
    return (max + min) / 2;
  }
  set hsvHue(h) {
    const rgb = QColor.$hsv(h, this.hsvSaturation, this.hsvValue);
    this.$r = rgb[0];
    this.$g = rgb[1];
    this.$b = rgb[2];
    this.$string = this.$cssValue = null;
    this.$changed.execute();
  }
  set hsvSaturation(s) {
    const rgb = QColor.$hsv(this.hsvHue, s, this.hsvValue);
    this.$r = rgb[0];
    this.$g = rgb[1];
    this.$b = rgb[2];
    this.$string = this.$cssValue = null;
    this.$changed.execute();
  }
  set hsvValue(v) {
    const rgb = QColor.$hsv(this.hsvHue, this.hsvSaturation, v);
    this.$r = rgb[0];
    this.$g = rgb[1];
    this.$b = rgb[2];
    this.$string = this.$cssValue = null;
    this.$changed.execute();
  }
  set hslHue(h) {
    const rgb = QColor.$hsl(h, this.hslSaturation, this.hslLightness);
    this.$r = rgb[0];
    this.$g = rgb[1];
    this.$b = rgb[2];
    this.$string = this.$cssValue = null;
    this.$changed.execute();
  }
  set hslSaturation(s) {
    const rgb = QColor.$hsl(this.hslHue, s, this.hslLightness);
    this.$r = rgb[0];
    this.$g = rgb[1];
    this.$b = rgb[2];
    this.$string = this.$cssValue = null;
    this.$changed.execute();
  }
  set hslLightness(l) {
    const rgb = QColor.$hsl(this.hslHue, this.hslSaturation, l);
    this.$r = rgb[0];
    this.$g = rgb[1];
    this.$b = rgb[2];
    this.$string = this.$cssValue = null;
    this.$changed.execute();
  }

  static $hsv(h, s, v) {
    const c = v * s;
    const m = v - c;
    return QColor.$hcma(h, c, m);
  }
  static $hsl(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const m = l - c / 2;
    return QColor.$hcma(h, c, m);
  }
  static $hcma(h, c, m) {
    const hh = h > 0 ? h * 6 % 6 : 0;
    const x = c * (1 - Math.abs(hh % 2 - 1));
    let rgb;
    switch (Math.floor(hh)) {
      case 0:
        rgb = [c, x, 0];
        break;
      case 1:
        rgb = [x, c, 0];
        break;
      case 2:
        rgb = [0, c, x];
        break;
      case 3:
        rgb = [0, x, c];
        break;
      case 4:
        rgb = [x, 0, c];
        break;
      case 5:
        rgb = [c, 0, x];
        break;
    }
    return rgb.map(y => Math.min(1, y + m));
  }

  static darker(baseColor, factor = 2) {
    const color = baseColor instanceof QColor ? baseColor : new QColor(baseColor);
    const v = color.hsvValue / factor;
    // Undocumented in Qt, but this matches the observed Qt behaviour
    const s = color.hsvSaturation - Math.max(0, v - 1);
    return QColor.hsva(color.hsvHue, Math.max(0, s), Math.min(1, v), color.a);
  }
  static lighter(baseColor, factor = 1.5) {
    const color = baseColor instanceof QColor ? baseColor : new QColor(baseColor);
    const v = color.hsvValue * factor;
    // Undocumented in Qt, but this matches the observed Qt behaviour
    const s = color.hsvSaturation - Math.max(0, v - 1);
    return QColor.hsva(color.hsvHue, Math.max(0, s), Math.min(1, v), color.a);
  }
  static equal(lhs, rhs) {
    const a = lhs instanceof QColor ? lhs : new QColor(lhs);
    const b = rhs instanceof QColor ? rhs : new QColor(rhs);
    return a.toString() === b.toString();
  }

}

QColor.rgba = (r, g, b, a = 1) => new QColor(r, g, b, a);

QColor.hsva = (h, s, v, a = 1) => new QColor(...QColor.$hsv(h, s, v), a);

QColor.hsla = (h, s, l, a = 1) => new QColor(...QColor.$hsl(h, s, l), a);

QColor.colormap = { // https://www.w3.org/TR/SVG/types.html#ColorKeywords
  aliceblue: [240, 248, 255],
  antiquewhite: [250, 235, 215],
  aqua: [0, 255, 255],
  aquamarine: [127, 255, 212],
  azure: [240, 255, 255],
  beige: [245, 245, 220],
  bisque: [255, 228, 196],
  black: [0, 0, 0],
  blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255],
  blueviolet: [138, 43, 226],
  brown: [165, 42, 42],
  burlywood: [222, 184, 135],
  cadetblue: [95, 158, 160],
  chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30],
  coral: [255, 127, 80],
  cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220],
  crimson: [220, 20, 60],
  cyan: [0, 255, 255],
  darkblue: [0, 0, 139],
  darkcyan: [0, 139, 139],
  darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169],
  darkgreen: [0, 100, 0],
  darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107],
  darkmagenta: [139, 0, 139],
  darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0],
  darkorchid: [153, 50, 204],
  darkred: [139, 0, 0],
  darksalmon: [233, 150, 122],
  darkseagreen: [143, 188, 143],
  darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211],
  deeppink: [255, 20, 147],
  deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34],
  floralwhite: [255, 250, 240],
  forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255],
  gainsboro: [220, 220, 220],
  ghostwhite: [248, 248, 255],
  gold: [255, 215, 0],
  goldenrod: [218, 165, 32],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  green: [0, 128, 0],
  greenyellow: [173, 255, 47],
  honeydew: [240, 255, 240],
  hotpink: [255, 105, 180],
  indianred: [205, 92, 92],
  indigo: [75, 0, 130],
  ivory: [255, 255, 240],
  khaki: [240, 230, 140],
  lavender: [230, 230, 250],
  lavenderblush: [255, 240, 245],
  lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205],
  lightblue: [173, 216, 230],
  lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255],
  lightgoldenrodyellow: [250, 250, 210],
  lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122],
  lightseagreen: [32, 178, 170],
  lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153],
  lightslategrey: [119, 136, 153],
  lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224],
  lime: [0, 255, 0],
  limegreen: [50, 205, 50],
  linen: [250, 240, 230],
  magenta: [255, 0, 255],
  maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170],
  mediumblue: [0, 0, 205],
  mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219],
  mediumseagreen: [60, 179, 113],
  mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154],
  mediumturquoise: [72, 209, 204],
  mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181],
  navajowhite: [255, 222, 173],
  navy: [0, 0, 128],
  oldlace: [253, 245, 230],
  olive: [128, 128, 0],
  olivedrab: [107, 142, 35],
  orange: [255, 165, 0],
  orangered: [255, 69, 0],
  orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170],
  palegreen: [152, 251, 152],
  paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147],
  papayawhip: [255, 239, 213],
  peachpuff: [255, 218, 185],
  peru: [205, 133, 63],
  pink: [255, 192, 203],
  plum: [221, 160, 221],
  powderblue: [176, 224, 230],
  purple: [128, 0, 128],
  red: [255, 0, 0],
  rosybrown: [188, 143, 143],
  royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19],
  salmon: [250, 128, 114],
  sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87],
  seashell: [255, 245, 238],
  sienna: [160, 82, 45],
  silver: [192, 192, 192],
  skyblue: [135, 206, 235],
  slateblue: [106, 90, 205],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  snow: [255, 250, 250],
  springgreen: [0, 255, 127],
  steelblue: [70, 130, 180],
  tan: [210, 180, 140],
  teal: [0, 128, 128],
  thistle: [216, 191, 216],
  tomato: [255, 99, 71],
  turquoise: [64, 224, 208],
  violet: [238, 130, 238],
  wheat: [245, 222, 179],
  white: [255, 255, 255],
  whitesmoke: [245, 245, 245],
  yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50]
};
QColor.nonNullableType = true;
QColor.requireConstructor = true;
QmlWeb.QColor = QColor;

class QFont extends QmlWeb.QObject {
  constructor(parent) {
    super(parent);
    this.Font = QFont.Font;

    const Font = this.Font;

    QmlWeb.createProperties(this, {
      bold: "bool",
      capitalization: { type: "enum", initialValue: Font.MixedCase },
      family: { type: "string", initialValue: "sans-serif" },
      italic: "bool",
      letterSpacing: "real",
      pixelSize: { type: "int", initialValue: 13 },
      pointSize: { type: "real", initialValue: 10 },
      strikeout: "bool",
      underline: "bool",
      weight: { type: "enum", initialValue: Font.Normal },
      wordSpacing: "real"
    });

    this.$sizeLock = false;

    this.boldChanged.connect(this, this.$onBoldChanged);
    this.capitalizationChanged.connect(this, this.$onCapitalizationChanged);
    this.familyChanged.connect(this, this.$onFamilyChanged);
    this.italicChanged.connect(this, this.$onItalicChanged);
    this.letterSpacingChanged.connect(this, this.$onLetterSpacingChanged);
    this.pixelSizeChanged.connect(this, this.$onPixelSizeChanged);
    this.pointSizeChanged.connect(this, this.$onPointSizeChanged);
    this.strikeoutChanged.connect(this, this.$onStrikeoutChanged);
    this.underlineChanged.connect(this, this.$onUnderlineChanged);
    this.weightChanged.connect(this, this.$onWidthChanged);
    this.wordSpacingChanged.connect(this, this.$onWordSpacingChanged);
  }
  $onBoldChanged(newVal) {
    const Font = this.Font;
    this.weight = newVal ? Font.Bold : Font.Normal;
  }
  $onCapitalizationChanged(newVal) {
    const style = this.$parent.dom.firstChild.style;
    style.fontVariant = newVal === this.Font.SmallCaps ? "small-caps" : "none";
    style.textTransform = this.$capitalizationToTextTransform(newVal);
  }
  $onFamilyChanged(newVal) {
    const style = this.$parent.dom.firstChild.style;
    style.fontFamily = newVal;
  }
  $onItalicChanged(newVal) {
    const style = this.$parent.dom.firstChild.style;
    style.fontStyle = newVal ? "italic" : "normal";
  }
  $onLetterSpacingChanged(newVal) {
    const style = this.$parent.dom.firstChild.style;
    style.letterSpacing = newVal !== undefined ? `${newVal}px` : "";
  }
  $onPixelSizeChanged(newVal) {
    if (!this.$sizeLock) {
      this.pointSize = newVal * 0.75;
    }
    const val = `${newVal}px`;
    this.$parent.dom.style.fontSize = val;
    this.$parent.dom.firstChild.style.fontSize = val;
  }
  $onPointSizeChanged(newVal) {
    this.$sizeLock = true;
    this.pixelSize = Math.round(newVal / 0.75);
    this.$sizeLock = false;
  }
  $onStrikeoutChanged(newVal) {
    const style = this.$parent.dom.firstChild.style;
    style.textDecoration = newVal ? "line-through" : this.$parent.font.underline ? "underline" : "none";
  }
  $onUnderlineChanged(newVal) {
    const style = this.$parent.dom.firstChild.style;
    style.textDecoration = this.$parent.font.strikeout ? "line-through" : newVal ? "underline" : "none";
  }
  $onWidthChanged(newVal) {
    const style = this.$parent.dom.firstChild.style;
    style.fontWeight = this.$weightToCss(newVal);
  }
  $onWordSpacingChanged(newVal) {
    const style = this.$parent.dom.firstChild.style;
    style.wordSpacing = newVal !== undefined ? `${newVal}px` : "";
  }

  $weightToCss(weight) {
    const Font = this.Font;
    switch (weight) {
      case Font.Thin:
        return "100";
      case Font.ExtraLight:
        return "200";
      case Font.Light:
        return "300";
      case Font.Normal:
        return "400";
      case Font.Medium:
        return "500";
      case Font.DemiBold:
        return "600";
      case Font.Bold:
        return "700";
      case Font.ExtraBold:
        return "800";
      case Font.Black:
        return "900";
    }
    return "normal";
  }
  $capitalizationToTextTransform(capitalization) {
    const Font = this.Font;
    switch (capitalization) {
      case Font.AllUppercase:
        return "uppercase";
      case Font.AllLowercase:
        return "lowercase";
      case Font.Capitalize:
        return "capitalize";
    }
    return "none";
  }

}

QFont.Font = {
  // Capitalization
  MixedCase: 0,
  AllUppercase: 1,
  AllLowercase: 2,
  SmallCaps: 3,
  Capitalize: 4,
  // Weight
  Thin: 0,
  ExtraLight: 12,
  Light: 25,
  Normal: 50,
  Medium: 57,
  DemiBold: 63,
  Bold: 75,
  ExtraBold: 81,
  Black: 87
};
QFont.requireParent = true;
QmlWeb.QFont = QFont;
global.Font = QFont.Font; // HACK

class QMatrix4x4 extends QmlWeb.QObject {
  constructor(...args) {
    super();
    let data = args;
    if (args.length === 0) {
      data = [];
      for (let row = 1; row <= 4; row++) {
        for (let col = 1; col <= 4; col++) {
          data.push(col === row ? 1 : 0);
        }
      }
    } else if (args.length === 1 && args[0] instanceof QMatrix4x4) {
      data = [];
      for (let row = 1; row <= 4; row++) {
        for (let col = 1; col <= 4; col++) {
          const name = `m${row}${col}`;
          data.push(args[0][name]);
        }
      }
    } else if (args.length !== 16) {
      throw new Error("Invalid arguments");
    }
    for (let row = 1; row <= 4; row++) {
      for (let col = 1; col <= 4; col++) {
        const name = `m${row}${col}`;
        const value = data[4 * (row - 1) + col - 1];
        QmlWeb.createProperty("real", this, name, { initialValue: value });
      }
    }
  }
  toString() {
    return super.$toString(this.m11, this.m12, this.m13, this.m14, this.m21, this.m22, this.m23, this.m24, this.m31, this.m32, this.m33, this.m34, this.m41, this.m42, this.m43, this.m44);
  }
  times(a) {
    if (a instanceof QmlWeb.QMatrix4x4) {
      const t = this;
      return new QmlWeb.QMatrix4x4(t.m11 * a.m11 + t.m12 * a.m21 + t.m13 * a.m31 + t.m14 * a.m41, t.m11 * a.m12 + t.m12 * a.m22 + t.m13 * a.m32 + t.m14 * a.m42, t.m11 * a.m13 + t.m12 * a.m23 + t.m13 * a.m33 + t.m14 * a.m43, t.m11 * a.m14 + t.m12 * a.m24 + t.m13 * a.m34 + t.m14 * a.m44, t.m21 * a.m11 + t.m22 * a.m21 + t.m23 * a.m31 + t.m24 * a.m41, t.m21 * a.m12 + t.m22 * a.m22 + t.m23 * a.m32 + t.m24 * a.m42, t.m21 * a.m13 + t.m22 * a.m23 + t.m23 * a.m33 + t.m24 * a.m43, t.m21 * a.m14 + t.m22 * a.m24 + t.m23 * a.m34 + t.m24 * a.m44, t.m31 * a.m11 + t.m32 * a.m21 + t.m33 * a.m31 + t.m34 * a.m41, t.m31 * a.m12 + t.m32 * a.m22 + t.m33 * a.m32 + t.m34 * a.m42, t.m31 * a.m13 + t.m32 * a.m23 + t.m33 * a.m33 + t.m34 * a.m43, t.m31 * a.m14 + t.m32 * a.m24 + t.m33 * a.m34 + t.m34 * a.m44, t.m41 * a.m11 + t.m42 * a.m21 + t.m43 * a.m31 + t.m44 * a.m41, t.m41 * a.m12 + t.m42 * a.m22 + t.m43 * a.m32 + t.m44 * a.m42, t.m41 * a.m13 + t.m42 * a.m23 + t.m43 * a.m33 + t.m44 * a.m43, t.m41 * a.m14 + t.m42 * a.m24 + t.m43 * a.m34 + t.m44 * a.m44);
    }
    if (a instanceof QmlWeb.QVector4D) {
      const t = this;
      return new QmlWeb.QVector4D(t.m11 * a.x + t.m12 * a.y + t.m13 * a.z + t.m14 * a.w, t.m21 * a.x + t.m22 * a.y + t.m23 * a.z + t.m24 * a.w, t.m31 * a.x + t.m32 * a.y + t.m33 * a.z + t.m34 * a.w, t.m41 * a.x + t.m42 * a.y + t.m43 * a.z + t.m44 * a.w);
    }
    if (a instanceof QmlWeb.QVector3D) {
      const v = this.times(new QmlWeb.QVector4D(a.x, a.y, a.z, 1));
      return new QmlWeb.QVector3D(v.x / v.w, v.y / v.w, v.z / v.w);
    }
    return new QMatrix4x4(this.m11 * a, this.m12 * a, this.m13 * a, this.m14 * a, this.m21 * a, this.m22 * a, this.m23 * a, this.m24 * a, this.m31 * a, this.m32 * a, this.m33 * a, this.m34 * a, this.m41 * a, this.m42 * a, this.m43 * a, this.m44 * a);
  }
  plus(other) {
    const a = other instanceof QMatrix4x4 ? other : new QMatrix4x4();
    return new QMatrix4x4(this.m11 + a.m11, this.m12 + a.m12, this.m13 + a.m13, this.m14 + a.m14, this.m21 + a.m21, this.m22 + a.m22, this.m23 + a.m23, this.m24 + a.m24, this.m31 + a.m31, this.m32 + a.m32, this.m33 + a.m33, this.m34 + a.m34, this.m41 + a.m41, this.m42 + a.m42, this.m43 + a.m43, this.m44 + a.m44);
  }
  minus(other) {
    const a = other instanceof QMatrix4x4 ? other : new QMatrix4x4();
    return new QMatrix4x4(this.m11 - a.m11, this.m12 - a.m12, this.m13 - a.m13, this.m14 - a.m14, this.m21 - a.m21, this.m22 - a.m22, this.m23 - a.m23, this.m24 - a.m24, this.m31 - a.m31, this.m32 - a.m32, this.m33 - a.m33, this.m34 - a.m34, this.m41 - a.m41, this.m42 - a.m42, this.m43 - a.m43, this.m44 - a.m44);
  }
  row(i) {
    const row = i + 1;
    const arr = [1, 2, 3, 4].map(col => this[`m${row}${col}`]);
    return new QmlWeb.QVector4D(...arr);
  }
  column(i) {
    const col = i + 1;
    const arr = [1, 2, 3, 4].map(row => this[`m${row}${col}`]);
    return new QmlWeb.QVector4D(...arr);
  }
  determinant() {
    // Laplace expansion
    const t = this;
    const s0 = t.m11 * t.m22 - t.m12 * t.m21;
    const c5 = t.m33 * t.m44 - t.m34 * t.m43;
    const s1 = t.m11 * t.m23 - t.m13 * t.m21;
    const c4 = t.m32 * t.m44 - t.m34 * t.m42;
    const s2 = t.m11 * t.m24 - t.m14 * t.m21;
    const c3 = t.m32 * t.m43 - t.m33 * t.m42;
    const s3 = t.m12 * t.m23 - t.m13 * t.m22;
    const c2 = t.m31 * t.m44 - t.m34 * t.m41;
    const s4 = t.m12 * t.m24 - t.m14 * t.m22;
    const c1 = t.m31 * t.m43 - t.m33 * t.m41;
    const s5 = t.m13 * t.m24 - t.m14 * t.m23;
    const c0 = t.m31 * t.m42 - t.m32 * t.m41;
    return s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0;
  }
  inverted() {
    // Laplace expansion
    const t = this;
    const s0 = t.m11 * t.m22 - t.m12 * t.m21;
    const c5 = t.m33 * t.m44 - t.m34 * t.m43;
    const s1 = t.m11 * t.m23 - t.m13 * t.m21;
    const c4 = t.m32 * t.m44 - t.m34 * t.m42;
    const s2 = t.m11 * t.m24 - t.m14 * t.m21;
    const c3 = t.m32 * t.m43 - t.m33 * t.m42;
    const s3 = t.m12 * t.m23 - t.m13 * t.m22;
    const c2 = t.m31 * t.m44 - t.m34 * t.m41;
    const s4 = t.m12 * t.m24 - t.m14 * t.m22;
    const c1 = t.m31 * t.m43 - t.m33 * t.m41;
    const s5 = t.m13 * t.m24 - t.m14 * t.m23;
    const c0 = t.m31 * t.m42 - t.m32 * t.m41;
    const det = s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0;
    const adj = [+t.m22 * c5 - t.m23 * c4 + t.m24 * c3, -t.m12 * c5 + t.m13 * c4 - t.m14 * c3, +t.m42 * s5 - t.m43 * s4 + t.m44 * s3, -t.m32 * s5 + t.m33 * s4 - t.m34 * s3, -t.m21 * c5 + t.m23 * c2 - t.m24 * c1, +t.m11 * c5 - t.m13 * c2 + t.m14 * c1, -t.m41 * s5 + t.m43 * s2 - t.m44 * s1, +t.m31 * s5 - t.m33 * s2 + t.m34 * s1, +t.m21 * c4 - t.m22 * c2 + t.m24 * c0, -t.m11 * c4 + t.m12 * c2 - t.m14 * c0, +t.m41 * s4 - t.m42 * s2 + t.m44 * s0, -t.m31 * s4 + t.m32 * s2 - t.m34 * s0, -t.m21 * c3 + t.m22 * c1 - t.m23 * c0, +t.m11 * c3 - t.m12 * c1 + t.m13 * c0, -t.m41 * s3 + t.m42 * s1 - t.m43 * s0, +t.m31 * s3 - t.m32 * s1 + t.m33 * s0];
    return new QMatrix4x4(...adj.map(x => x / det));
  }
  transposed() {
    return new QMatrix4x4(this.m11, this.m21, this.m31, this.m41, this.m12, this.m22, this.m32, this.m42, this.m13, this.m23, this.m33, this.m43, this.m14, this.m24, this.m34, this.m44);
  }
  fuzzyEquals(a, epsilon = 0.00001) {
    for (let row = 1; row <= 4; row++) {
      for (let col = 1; col <= 4; col++) {
        const name = `m${row}${col}`;
        if (Math.abs(this[name] - a[name]) > epsilon) {
          return false;
        }
      }
    }
    return true;
  }

}

QMatrix4x4.nonNullableType = true;
QMatrix4x4.requireConstructor = true;
QmlWeb.QMatrix4x4 = QMatrix4x4;

class QPointF extends QmlWeb.QObject {
  constructor(...args) {
    super();
    let data = args;
    if (args.length === 0) {
      data = [0, 0];
    } else if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split(",").map(x => parseFloat(x.trim()));
      if (data.length !== 2) throw new Error("point expected");
    } else if (args.length === 1 && args[0] instanceof QPointF) {
      data = [args[0].x, args[0].y];
    } else if (args.length !== 2) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(this, {
      x: { type: "real", initialValue: data[0] },
      y: { type: "real", initialValue: data[1] }
    });
  }
  toString() {
    return super.$toString(this.x, this.y);
  }

}

QPointF.nonNullableType = true;
QPointF.requireConstructor = true;
QmlWeb.QPointF = QPointF;

class QQuaternion extends QmlWeb.QObject {
  constructor(...args) {
    super();
    let data = args;
    if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split(",").map(x => parseFloat(x.trim()));
      if (data.length !== 4) data = [];
    } else if (args.length === 1 && args[0] instanceof QQuaternion) {
      data = [args[0].scalar, args[0].x, args[0].y, args[0].z];
    }
    if (data.length === 0) {
      data = [1, 0, 0, 0];
    } else if (data.length !== 4) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(this, {
      scalar: { type: "real", initialValue: data[0] },
      x: { type: "real", initialValue: data[1] },
      y: { type: "real", initialValue: data[2] },
      z: { type: "real", initialValue: data[3] }
    });
  }
  toString() {
    return super.$toString(this.scalar, this.x, this.y, this.z);
  }

}

QQuaternion.nonNullableType = true;
QQuaternion.requireConstructor = true;
QmlWeb.QQuaternion = QQuaternion;

class QRectF extends QmlWeb.QObject {
  constructor(...args) {
    super();
    let data = args;
    if (args.length === 0) {
      data = [0, 0, 0, 0];
    } else if (args.length === 1 && typeof args[0] === "string") {
      const mask = /^\s*[-\d.]+\s*,\s*[-\d.]+\s*,\s*[-\d.]+\s*x\s*[-\d.]+\s*$/;
      if (!args[0].match(mask)) throw new Error("rect expected");
      data = args[0].replace("x", ",").split(",").map(x => parseFloat(x.trim()));
    } else if (args.length === 1 && args[0] instanceof QRectF) {
      data = [args[0].x, args[0].y, args[0].z, args[0].width];
    } else if (args.length !== 4) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(this, {
      x: { type: "real", initialValue: data[0] },
      y: { type: "real", initialValue: data[1] },
      width: { type: "real", initialValue: data[2] },
      height: { type: "real", initialValue: data[3] }
    });
  }
  toString() {
    return super.$toString(this.x, this.y, this.width, this.height);
  }

}

QRectF.nonNullableType = true;
QRectF.requireConstructor = true;
QmlWeb.QRectF = QRectF;

class QSizeF extends QmlWeb.QObject {
  constructor(...args) {
    super();
    let data = args;
    if (args.length === 0) {
      data = [-1, -1];
    } else if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split("x").map(x => parseFloat(x.trim()));
      if (data.length !== 2) throw new Error("size expected");
    } else if (args.length === 1 && args[0] instanceof QSizeF) {
      data = [args[0].width, args[0].height];
    } else if (args.length !== 2) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(this, {
      width: { type: "real", initialValue: data[0] },
      height: { type: "real", initialValue: data[1] }
    });
  }
  toString() {
    return super.$toString(this.width, this.height);
  }

}

QSizeF.nonNullableType = true;
QSizeF.requireConstructor = true;
QmlWeb.QSizeF = QSizeF;

class QVector2D extends QmlWeb.QObject {
  constructor(...args) {
    super();
    let data = args;
    if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split(",").map(x => parseFloat(x.trim()));
      if (data.length !== 2) data = [];
    } else if (args.length === 1 && args[0] instanceof QVector2D) {
      data = [args[0].x, args[0].y];
    }
    if (data.length === 0) {
      data = [0, 0];
    } else if (data.length !== 2) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(this, {
      x: { type: "real", initialValue: data[0] },
      y: { type: "real", initialValue: data[1] }
    });
  }
  toString() {
    return super.$toString(this.x, this.y);
  }
  dotProduct(a) {
    if (a instanceof QVector2D) {
      return a.x * this.x + a.y * this.y;
    }
    return 0;
  }
  times(a) {
    if (a instanceof QVector2D) {
      return new QVector2D(this.x * a.x, this.y * a.y);
    }
    return new QVector2D(this.x * a, this.y * a);
  }
  plus(a) {
    if (a instanceof QVector2D) {
      return new QVector2D(this.x + a.x, this.y + a.y);
    }
    return new QVector2D(this.x, this.y);
  }
  minus(a) {
    if (a instanceof QVector2D) {
      return new QVector2D(this.x - a.x, this.y - a.y);
    }
    return new QVector2D(this.x, this.y);
  }
  normalized() {
    const length = this.length();
    return this.times(1 / (length === 0 ? 1 : length));
  }
  length() {
    return Math.sqrt(this.dotProduct(this));
  }
  toVector3d() {
    return new QmlWeb.QVector3D(this.x, this.y, 0);
  }
  toVector4d() {
    return new QmlWeb.QVector4D(this.x, this.y, 0, 0);
  }
  fuzzyEquals(a, epsilon = 0.00001) {
    return [this.x - a.x, this.y - a.y].every(delta => Math.abs(delta) <= epsilon);
  }

}

QVector2D.nonNullableType = true;
QVector2D.requireConstructor = true;
QmlWeb.QVector2D = QVector2D;

class QVector3D extends QmlWeb.QObject {
  constructor(...args) {
    super();
    let data = args;
    if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split(",").map(x => parseFloat(x.trim()));
      if (data.length !== 3) data = [];
    } else if (args.length === 1 && args[0] instanceof QVector3D) {
      data = [args[0].x, args[0].y, args[0].z];
    }
    if (data.length === 0) {
      data = [0, 0, 0];
    } else if (data.length !== 3) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(this, {
      x: { type: "real", initialValue: data[0] },
      y: { type: "real", initialValue: data[1] },
      z: { type: "real", initialValue: data[2] }
    });
  }
  toString() {
    return super.$toString(this.x, this.y, this.z);
  }
  crossProduct(a) {
    if (a instanceof QVector3D) {
      return new QVector3D(this.y * a.z - this.z * a.y, this.z * a.x - this.x * a.z, this.x * a.y - this.y * a.x);
    }
    return new QVector3D();
  }
  dotProduct(a) {
    if (a instanceof QVector3D) {
      return a.x * this.x + a.y * this.y + a.z * this.z;
    }
    return 0;
  }
  times(a) {
    if (a instanceof QmlWeb.QMatrix4x4) {
      const v = new QmlWeb.QVector4D(this.x, this.y, this.z, 1).times(a);
      return new QVector3D(v.x / v.w, v.y / v.w, v.z / v.w);
    }
    if (a instanceof QVector3D) {
      return new QVector3D(this.x * a.x, this.y * a.y, this.z * a.z);
    }
    return new QVector3D(this.x * a, this.y * a, this.z * a);
  }
  plus(a) {
    if (a instanceof QVector3D) {
      return new QVector3D(this.x + a.x, this.y + a.y, this.z + a.z);
    }
    return new QVector3D(this.x, this.y, this.z);
  }
  minus(a) {
    if (a instanceof QVector3D) {
      return new QVector3D(this.x - a.x, this.y - a.y, this.z - a.z);
    }
    return new QVector3D(this.x, this.y, this.z);
  }
  normalized() {
    const length = this.length();
    return this.times(1 / (length === 0 ? 1 : length));
  }
  length() {
    return Math.sqrt(this.dotProduct(this));
  }
  toVector2d() {
    return new QmlWeb.QVector2D(this.x, this.y);
  }
  toVector4d() {
    return new QmlWeb.QVector4D(this.x, this.y, this.z, 0);
  }
  fuzzyEquals(a, epsilon = 0.00001) {
    return [this.x - a.x, this.y - a.y, this.z - a.z].every(delta => Math.abs(delta) <= epsilon);
  }

}

QVector3D.nonNullableType = true;
QVector3D.requireConstructor = true;
QmlWeb.QVector3D = QVector3D;

class QVector4D extends QmlWeb.QObject {
  constructor(...args) {
    super();
    let data = args;
    if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split(",").map(x => parseFloat(x.trim()));
      if (data.length !== 4) data = [];
    } else if (args.length === 1 && args[0] instanceof QVector4D) {
      data = [args[0].x, args[0].y, args[0].z, args[0].w];
    }
    if (data.length === 0) {
      data = [0, 0, 0, 0];
    } else if (data.length !== 4) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(this, {
      x: { type: "real", initialValue: data[0] },
      y: { type: "real", initialValue: data[1] },
      z: { type: "real", initialValue: data[2] },
      w: { type: "real", initialValue: data[3] }
    });
  }
  toString() {
    return super.$toString(this.x, this.y, this.z, this.w);
  }
  dotProduct(a) {
    if (a instanceof QVector4D) {
      return a.x * this.x + a.y * this.y + a.z * this.z + a.w * this.w;
    }
    return 0;
  }
  times(a) {
    if (a instanceof QmlWeb.QMatrix4x4) {
      const t = this;
      return new QVector4D(t.x * a.m11 + t.y * a.m21 + t.z * a.m31 + t.w * a.m41, t.x * a.m12 + t.y * a.m22 + t.z * a.m32 + t.w * a.m42, t.x * a.m13 + t.y * a.m23 + t.z * a.m33 + t.w * a.m43, t.x * a.m14 + t.y * a.m24 + t.z * a.m34 + t.w * a.m44);
    }
    if (a instanceof QVector4D) {
      const t = this;
      return new QVector4D(t.x * a.x, t.y * a.y, t.z * a.z, t.w * a.w);
    }
    return new QVector4D(this.x * a, this.y * a, this.z * a, this.w * a);
  }
  plus(a) {
    if (a instanceof QVector4D) {
      const t = this;
      return new QVector4D(t.x + a.x, t.y + a.y, t.z + a.z, t.w + a.w);
    }
    return new QVector4D(this.x, this.y, this.z, this.w);
  }
  minus(a) {
    if (a instanceof QVector4D) {
      const t = this;
      return new QVector4D(t.x - a.x, t.y - a.y, t.z - a.z, t.w - a.w);
    }
    return new QVector4D(this.x, this.y, this.z, this.w);
  }
  normalized() {
    const length = this.length();
    return this.times(1 / (length === 0 ? 1 : length));
  }
  length() {
    return Math.sqrt(this.dotProduct(this));
  }
  toVector2d() {
    return new QmlWeb.QVector2D(this.x, this.y);
  }
  toVector3d() {
    return new QmlWeb.QVector3D(this.x, this.y, this.z);
  }
  fuzzyEquals(a, epsilon = 0.00001) {
    return [this.x - a.x, this.y - a.y, this.z - a.z, this.w - a.w].every(delta => Math.abs(delta) <= epsilon);
  }

}

QVector4D.nonNullableType = true;
QVector4D.requireConstructor = true;
QmlWeb.QVector4D = QVector4D;

class Signal {

  constructor(params = [], options = {}) {
    this.connectedSlots = [];
    this.signal = null;

    this.obj = options.obj;
    this.options = options;

    this.signal = (...args) => this.execute(...args);
    this.signal.parameters = params;
    this.signal.connect = this.connect.bind(this);
    this.signal.disconnect = this.disconnect.bind(this);
    this.signal.isConnected = this.isConnected.bind(this);

    // TODO Fix Keys that don't have an obj for the signal
    if (this.obj && this.obj.$signals !== undefined) {
      this.obj.$signals.push(this.signal);
    }
  }
  execute(...args) {
    QmlWeb.QMLProperty.pushEvalStack();
    for (const i in this.connectedSlots) {
      const desc = this.connectedSlots[i];
      if (desc.type & Signal.QueuedConnection) {
        Signal.$addQueued(desc, args);
      } else {
        Signal.$execute(desc, args);
      }
    }
    QmlWeb.QMLProperty.popEvalStack();
  }
  connect(...args) {
    let type = Signal.AutoConnection;
    if (typeof args[args.length - 1] === "number") {
      type = args.pop();
    }
    if (type & Signal.UniqueConnection) {
      if (this.isConnected(...args)) {
        return;
      }
    }
    if (args.length === 1) {
      this.connectedSlots.push({ thisObj: global, slot: args[0], type });
    } else if (typeof args[1] === "string" || args[1] instanceof String) {
      if (args[0].$tidyupList && args[0] !== this.obj) {
        args[0].$tidyupList.push(this.signal);
      }
      const slot = args[0][args[1]];
      this.connectedSlots.push({ thisObj: args[0], slot, type });
    } else {
      if (args[0].$tidyupList && (!this.obj || args[0] !== this.obj && args[0] !== this.obj.$parent)) {
        args[0].$tidyupList.push(this.signal);
      }
      this.connectedSlots.push({ thisObj: args[0], slot: args[1], type });
    }

    // Notify object of connect
    if (this.options.obj && this.options.obj.$connectNotify) {
      this.options.obj.$connectNotify(this.options);
    }
  }
  disconnect(...args) {
    // type meaning:
    //  1 = function, 2 = string
    //  3 = object with string method,  4 = object with function
    // No args means disconnect everything connected to this signal
    const callType = args.length === 1 ? args[0] instanceof Function ? 1 : 2 : typeof args[1] === "string" || args[1] instanceof String ? 3 : 4;
    for (let i = 0; i < this.connectedSlots.length; i++) {
      const { slot, thisObj } = this.connectedSlots[i];
      if (args.length === 0 || callType === 1 && slot === args[0] || callType === 2 && thisObj === args[0] || callType === 3 && thisObj === args[0] && slot === args[0][args[1]] || thisObj === args[0] && slot === args[1]) {
        if (thisObj) {
          const index = thisObj.$tidyupList.indexOf(this.signal);
          if (index >= 0) {
            thisObj.$tidyupList.splice(index, 1);
          }
        }
        this.connectedSlots.splice(i, 1);
        // We have removed an item from the list so the indexes shifted one
        // backwards
        i--;
      }
    }

    // Notify object of disconnect
    if (this.options.obj && this.options.obj.$disconnectNotify) {
      this.options.obj.$disconnectNotify(this.options);
    }
  }
  isConnected(...args) {
    const callType = args.length === 1 ? 1 : typeof args[1] === "string" || args[1] instanceof String ? 2 : 3;
    for (const i in this.connectedSlots) {
      const { slot, thisObj } = this.connectedSlots[i];
      if (callType === 1 && slot === args[0] || callType === 2 && thisObj === args[0] && slot === args[0][args[1]] || thisObj === args[0] && slot === args[1]) {
        return true;
      }
    }
    return false;
  }
  static signal(...args) {
    return new Signal(...args).signal;
  }

  static $execute(desc, args) {
    try {
      desc.slot.apply(desc.thisObj, args);
    } catch (err) {
      console.error("Signal slot error:", err.message, err, desc.slot ? Function.prototype.toString.call(desc.slot) : "desc.slot is undefined!");
    }
  }

  static $addQueued(desc, args) {
    if (Signal.$queued.length === 0) {
      if (global.setImmediate) {
        global.setImmediate(Signal.$executeQueued);
      } else {
        global.setTimeout(Signal.$executeQueued, 0);
      }
    }
    Signal.$queued.push([desc, args]);
  }
  static $executeQueued() {
    // New queued signals should be executed on next tick of the event loop
    const queued = Signal.$queued;
    Signal.$queued = [];

    QmlWeb.QMLProperty.pushEvalStack();
    for (const i in queued) {
      Signal.$execute(...queued[i]);
    }
    QmlWeb.QMLProperty.popEvalStack();
  }

}

Signal.$queued = [];
Signal.AutoConnection = 0;
Signal.DirectConnection = 1;
Signal.QueuedConnection = 2;
Signal.UniqueConnection = 128;
QmlWeb.Signal = Signal;

const Qt = {
  openUrlExternally: url => {
    const page = window.open(url, "_blank");
    page.focus();
  },
  // Load file, parse and construct as Component (.qml)
  createComponent: name => {
    const engine = QmlWeb.engine;

    let file = engine.$resolvePath(name);

    // If "name" was a full URL, "file" will be equivalent to name and this
    // will try and load the Component from the full URL, otherwise, this
    // doubles as checking for the file in the current directory.
    let tree = engine.loadComponent(file);

    // If the Component is not found, and it is not a URL, look for "name" in
    // this context's importSearchPaths
    if (!tree) {
      const nameIsUrl = engine.$parseURI(name) !== undefined;
      if (!nameIsUrl) {
        const moreDirs = engine.importSearchPaths(QmlWeb.executionContext.importContextId);
        for (let i = 0; i < moreDirs.length; i++) {
          file = `${moreDirs[i]}${name}`;
          tree = engine.loadComponent(file);
          if (tree) break;
        }
      }
    }

    if (!tree) {
      return undefined;
    }

    const QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
    const component = new QMLComponent({
      object: tree,
      context: QmlWeb.executionContext
    });
    component.$basePath = engine.extractBasePath(file);
    component.$imports = tree.$imports;
    component.$file = file; // just for debugging

    engine.loadImports(tree.$imports, component.$basePath, component.importContextId);

    return component;
  },

  createQmlObject: (src, parent, file) => {
    const tree = QmlWeb.parseQML(src, file);

    // Create and initialize objects

    const QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
    const component = new QMLComponent({
      object: tree,
      parent,
      context: QmlWeb.executionContext
    });

    const engine = QmlWeb.engine;
    engine.loadImports(tree.$imports, undefined, component.importContextId);

    const resolvedFile = file || Qt.resolvedUrl("createQmlObject_function");
    component.$basePath = engine.extractBasePath(resolvedFile);
    component.$imports = tree.$imports; // for later use
    // not just for debugging, but for basepath too, see above
    component.$file = resolvedFile;

    const obj = component.createObject(parent);

    const QMLOperationState = QmlWeb.QMLOperationState;
    if (engine.operationState !== QMLOperationState.Init && engine.operationState !== QMLOperationState.Idle) {
      // We don't call those on first creation, as they will be called
      // by the regular creation-procedures at the right time.
      engine.$initializePropertyBindings();

      engine.callCompletedSignals();
    }

    return obj;
  },

  // Returns url resolved relative to the URL of the caller.
  // http://doc.qt.io/qt-5/qml-qtqml-qt.html#resolvedUrl-method
  resolvedUrl: url => QmlWeb.qmlUrl(url),

  // Basic QML types constructors
  point: (...args) => new QmlWeb.QPointF(...args),
  rect: (...args) => new QmlWeb.QRectF(...args),
  size: (...args) => new QmlWeb.QSizeF(...args),
  vector2d: (...args) => new QmlWeb.QVector2D(...args),
  vector3d: (...args) => new QmlWeb.QVector3D(...args),
  vector4d: (...args) => new QmlWeb.QVector4D(...args),
  quaternion: (...args) => new QmlWeb.QQuaternion(...args),
  matrix4x4: (...args) => new QmlWeb.QMatrix4x4(...args),

  // Colors
  rgba: (...args) => QmlWeb.QColor.rgba(...args),
  hsla: (...args) => QmlWeb.QColor.hsla(...args),
  hsva: (...args) => QmlWeb.QColor.hsva(...args),
  colorEqual: (...args) => QmlWeb.QColor.equal(...args),
  darker: (...args) => QmlWeb.QColor.darker(...args),
  lighter: (...args) => QmlWeb.QColor.lighter(...args),

  include(path) {
    const engine = QmlWeb.engine;

    const uri = engine.$resolvePath(path);

    /* Handle recursive includes */
    if (QmlWeb.executionContext.$qmlJsIncludes === undefined) {
      QmlWeb.executionContext.$qmlJsIncludes = [];
    }

    if (QmlWeb.executionContext.$qmlJsIncludes.indexOf(uri) >= 0) {
      return;
    }

    QmlWeb.executionContext.$qmlJsIncludes.push(uri);

    const js = engine.loadJS(uri);

    if (!js) {
      console.error("Unable to load JavaScript module:", uri, path);
      return;
    }

    QmlWeb.importJavascriptInContext(js, QmlWeb.executionContext);
  },

  platform: {
    os: "qmlweb"
  },

  // Buttons masks
  LeftButton: 1,
  RightButton: 2,
  MiddleButton: 4,
  // Modifiers masks
  NoModifier: 0,
  ShiftModifier: 1,
  ControlModifier: 2,
  AltModifier: 4,
  MetaModifier: 8,
  KeypadModifier: 16, // Note: Not available in web
  // Layout directions
  LeftToRight: 0,
  RightToLeft: 1,
  // Orientations
  Vertical: 0,
  Horizontal: 1,
  // Keys
  Key_Escape: 27,
  Key_Tab: 9,
  Key_Backtab: 245,
  Key_Backspace: 8,
  Key_Return: 13,
  Key_Enter: 13,
  Key_Insert: 45,
  Key_Delete: 46,
  Key_Pause: 19,
  Key_Print: 42,
  Key_SysReq: 0,
  Key_Clear: 12,
  Key_Home: 36,
  Key_End: 35,
  Key_Left: 37,
  Key_Up: 38,
  Key_Right: 39,
  Key_Down: 40,
  Key_PageUp: 33,
  Key_PageDown: 34,
  Key_Shift: 16,
  Key_Control: 17,
  Key_Meta: 91,
  Key_Alt: 18,
  Key_AltGr: 0,
  Key_CapsLock: 20,
  Key_NumLock: 144,
  Key_ScrollLock: 145,
  Key_F1: 112, Key_F2: 113, Key_F3: 114, Key_F4: 115, Key_F5: 116, Key_F6: 117,
  Key_F7: 118, Key_F8: 119, Key_F9: 120, Key_F10: 121, Key_F11: 122,
  Key_F12: 123, Key_F13: 124, Key_F14: 125, Key_F15: 126, Key_F16: 127,
  Key_F17: 128, Key_F18: 129, Key_F19: 130, Key_F20: 131, Key_F21: 132,
  Key_F22: 133, Key_F23: 134, Key_F24: 135,
  Key_F25: 0, Key_F26: 0, Key_F27: 0, Key_F28: 0, Key_F29: 0, Key_F30: 0,
  Key_F31: 0, Key_F32: 0, Key_F33: 0, Key_F34: 0, Key_F35: 0,
  Key_Super_L: 0,
  Key_Super_R: 0,
  Key_Menu: 0,
  Key_Hyper_L: 0,
  Key_Hyper_R: 0,
  Key_Help: 6,
  Key_Direction_L: 0,
  Key_Direction_R: 0,
  Key_Space: 32,
  Key_Any: 32,
  Key_Exclam: 161,
  Key_QuoteDbl: 162,
  Key_NumberSign: 163,
  Key_Dollar: 164,
  Key_Percent: 165,
  Key_Ampersant: 166,
  Key_Apostrophe: 222,
  Key_ParenLeft: 168,
  Key_ParenRight: 169,
  Key_Asterisk: 170,
  Key_Plus: 171,
  Key_Comma: 188,
  Key_Minus: 173,
  Key_Period: 190,
  Key_Slash: 191,
  Key_0: 48, Key_1: 49, Key_2: 50, Key_3: 51, Key_4: 52,
  Key_5: 53, Key_6: 54, Key_7: 55, Key_8: 56, Key_9: 57,
  Key_Colon: 58,
  Key_Semicolon: 59,
  Key_Less: 60,
  Key_Equal: 61,
  Key_Greater: 62,
  Key_Question: 63,
  Key_At: 64,
  Key_A: 65, Key_B: 66, Key_C: 67, Key_D: 68, Key_E: 69, Key_F: 70, Key_G: 71,
  Key_H: 72, Key_I: 73, Key_J: 74, Key_K: 75, Key_L: 76, Key_M: 77, Key_N: 78,
  Key_O: 79, Key_P: 80, Key_Q: 81, Key_R: 82, Key_S: 83, Key_T: 84, Key_U: 85,
  Key_V: 86, Key_W: 87, Key_X: 88, Key_Y: 89, Key_Z: 90,
  Key_BracketLeft: 219,
  Key_Backslash: 220,
  Key_BracketRight: 221,
  Key_AsciiCircum: 160,
  Key_Underscore: 167,
  Key_QuoteLeft: 0,
  Key_BraceLeft: 174,
  Key_Bar: 172,
  Key_BraceRight: 175,
  Key_AsciiTilde: 176,
  Key_Back: 0,
  Key_Forward: 0,
  Key_Stop: 0,
  Key_VolumeDown: 182,
  Key_VolumeUp: 183,
  Key_VolumeMute: 181,
  Key_multiply: 106,
  Key_add: 107,
  Key_substract: 109,
  Key_divide: 111,
  Key_News: 0,
  Key_OfficeHome: 0,
  Key_Option: 0,
  Key_Paste: 0,
  Key_Phone: 0,
  Key_Calendar: 0,
  Key_Reply: 0,
  Key_Reload: 0,
  Key_RotateWindows: 0,
  Key_RotationPB: 0,
  Key_RotationKB: 0,
  Key_Save: 0,
  Key_Send: 0,
  Key_Spell: 0,
  Key_SplitScreen: 0,
  Key_Support: 0,
  Key_TaskPane: 0,
  Key_Terminal: 0,
  Key_Tools: 0,
  Key_Travel: 0,
  Key_Video: 0,
  Key_Word: 0,
  Key_Xfer: 0,
  Key_ZoomIn: 0,
  Key_ZoomOut: 0,
  Key_Away: 0,
  Key_Messenger: 0,
  Key_WebCam: 0,
  Key_MailForward: 0,
  Key_Pictures: 0,
  Key_Music: 0,
  Key_Battery: 0,
  Key_Bluetooth: 0,
  Key_WLAN: 0,
  Key_UWB: 0,
  Key_AudioForward: 0,
  Key_AudioRepeat: 0,
  Key_AudioRandomPlay: 0,
  Key_Subtitle: 0,
  Key_AudioCycleTrack: 0,
  Key_Time: 0,
  Key_Hibernate: 0,
  Key_View: 0,
  Key_TopMenu: 0,
  Key_PowerDown: 0,
  Key_Suspend: 0,
  Key_ContrastAdjust: 0,
  Key_MediaLast: 0,
  Key_unknown: -1,
  Key_Call: 0,
  Key_Camera: 0,
  Key_CameraFocus: 0,
  Key_Context1: 0,
  Key_Context2: 0,
  Key_Context3: 0,
  Key_Context4: 0,
  Key_Flip: 0,
  Key_Hangup: 0,
  Key_No: 0,
  Key_Select: 93,
  Key_Yes: 0,
  Key_ToggleCallHangup: 0,
  Key_VoiceDial: 0,
  Key_LastNumberRedial: 0,
  Key_Execute: 43,
  Key_Printer: 42,
  Key_Play: 250,
  Key_Sleep: 95,
  Key_Zoom: 251,
  Key_Cancel: 3,
  // Align
  AlignLeft: 0x0001,
  AlignRight: 0x0002,
  AlignHCenter: 0x0004,
  AlignJustify: 0x0008,
  AlignTop: 0x0020,
  AlignBottom: 0x0040,
  AlignVCenter: 0x0080,
  AlignCenter: 0x0084,
  AlignBaseline: 0x0100,
  AlignAbsolute: 0x0010,
  AlignLeading: 0x0001,
  AlignTrailing: 0x0002,
  AlignHorizontal_Mask: 0x001f,
  AlignVertical_Mask: 0x01e0,
  // Screen
  PrimaryOrientation: 0,
  PortraitOrientation: 1,
  LandscapeOrientation: 2,
  InvertedPortraitOrientation: 4,
  InvertedLandscapeOrientation: 8,
  // CursorShape
  ArrowCursor: 0,
  UpArrowCursor: 1,
  CrossCursor: 2,
  WaitCursor: 3,
  IBeamCursor: 4,
  SizeVerCursor: 5,
  SizeHorCursor: 6,
  SizeBDiagCursor: 7,
  SizeFDiagCursor: 8,
  SizeAllCursor: 9,
  BlankCursor: 10,
  SplitVCursor: 11,
  SplitHCursor: 12,
  PointingHandCursor: 13,
  ForbiddenCursor: 14,
  WhatsThisCursor: 15,
  BusyCursor: 16,
  OpenHandCursor: 17,
  ClosedHandCursor: 18,
  DragCopyCursor: 19,
  DragMoveCursor: 20,
  DragLinkCursor: 21,
  LastCursor: 21, //DragLinkCursor,
  BitmapCursor: 24,
  CustomCursor: 25,
  // ScrollBar Policy
  ScrollBarAsNeeded: 0,
  ScrollBarAlwaysOff: 1,
  ScrollBarAlwaysOn: 2
};

QmlWeb.Qt = Qt;

class QMLBinding {
  /**
   * Create QML binding.
   * @param {Variant} val Sourcecode or function representing the binding
   * @param {Array} tree Parser tree of the binding
   * @return {Object} Object representing the binding
   */
  constructor(val, tree) {
    // this.isFunction states whether the binding is a simple js statement or a
    // function containing a return statement. We decide this on whether it is a
    // code block or not. If it is, we require a return statement. If it is a
    // code block it could though also be a object definition, so we need to
    // check that as well (it is, if the content is labels).
    this.isFunction = tree && tree[0] === "block" && tree[1][0] && tree[1][0][0] !== "label";
    this.src = val;
    this.compiled = false;
  }

  toJSON() {
    return {
      src: this.src,
      deps: JSON.stringify(this.deps),
      tree: JSON.stringify(this.tree)
    };
  }

  eval(object, context, basePath) {
    QmlWeb.executionContext = context;
    if (basePath) {
      QmlWeb.engine.$basePath = basePath;
    }
    // .call is needed for `this` support
    return this.impl.call(object, object, context);
  }

  /**
  * Compile binding. Afterwards you may call binding.eval to evaluate.
  */
  compile() {
    this.src = this.src.trim();
    this.impl = QMLBinding.bindSrc(this.src, this.isFunction);
    this.compiled = true;
  }

  static bindSrc(src, isFunction) {
    return new Function("__executionObject", "__executionContext", `
      with(QmlWeb) with(__executionContext) with(__executionObject) {
        ${isFunction ? "" : "return"} ${src}
      }
    `);
  }
}

QmlWeb.QMLBinding = QMLBinding;

function QMLBoolean(val) {
  return !!val;
}
QMLBoolean.plainType = true;
QmlWeb.qmlBoolean = QMLBoolean;

// There can only be one running QMLEngine.
// This variable points to the currently running engine.
QmlWeb.engine = null;

QmlWeb.useShadowDom = true;

const geometryProperties = ["width", "height", "fill", "x", "y", "left", "right", "top", "bottom"];

// QML engine. EXPORTED.
class QMLEngine {
  constructor(element) {
    //----------Public Members----------

    this.fps = 60;
    // Math.floor, causes bugs to timing?
    this.$interval = Math.floor(1000 / this.fps);
    this.dom = element || document.body;

    // Target for the DOM children
    this.domTarget = this.dom;
    if (QmlWeb.useShadowDom && this.dom.attachShadow) {
      this.domTarget = this.dom.attachShadow({ mode: "open" });
    }

    // Cached component trees (post-QmlWeb.convertToEngine)
    this.components = {};

    // Cached parsed JS files (post-QmlWeb.jsparse)
    this.js = {};

    // List of Component.completed signals
    this.completedSignals = [];

    // Current operation state of the engine (Idle, init, etc.)
    this.operationState = 1;

    // List of properties whose values are bindings. For internal use only.
    this.bindedProperties = [];

    // List of operations to perform later after init. For internal use only.
    this.pendingOperations = [];

    // Root object of the engine
    this.rootObject = null;

    // Base path of qml engine (used for resource loading)
    this.$basePath = "";

    // Module import paths overrides
    this.userAddedModulePaths = {};

    // Stores data for setImportPathList(), importPathList(), and addImportPath
    this.userAddedImportPaths = [];

    //----------Private Members---------

    // Ticker resource id and ticker callbacks
    this._tickers = [];
    this._lastTick = Date.now();

    // Callbacks for stopping or starting the engine
    this._whenStop = [];
    this._whenStart = [];

    // Keyboard management
    this.$initKeyboard();

    //----------Construct----------

    // No QML stuff should stand out the root element
    this.dom.style.overflow = "hidden";

    // Needed to make absolute positioning work
    if (!this.dom.style.position) {
      const style = window.getComputedStyle(this.dom);
      if (style.getPropertyValue("position") === "static") {
        this.dom.style.position = "relative";
        this.dom.style.top = "0";
        this.dom.style.left = "0";
      }
    }

    window.addEventListener("resize", () => this.updateGeometry());
  }

  //---------- Public Methods ----------

  updateGeometry() {
    // we have to call `this.implicitHeight =` and `this.implicitWidth =`
    // each time the root element changes it's geometry
    // to reposition child elements of qml scene
    let width;
    let height;
    if (this.dom === document.body) {
      width = window.innerWidth;
      height = window.innerHeight;
    } else {
      const style = window.getComputedStyle(this.dom);
      width = parseFloat(style.getPropertyValue("width"));
      height = parseFloat(style.getPropertyValue("height"));
    }
    if (width) {
      this.rootObject.width = width;
    }
    if (height) {
      this.rootObject.height = height;
    }
  }

  // Start the engine
  start() {
    QmlWeb.engine = this;
    const QMLOperationState = QmlWeb.QMLOperationState;
    if (this.operationState !== QMLOperationState.Running) {
      this.operationState = QMLOperationState.Running;
      this._tickerId = setInterval(this._tick.bind(this), this.$interval);
      this._whenStart.forEach(callback => callback());
    }
  }

  // Stop the engine
  stop() {
    const QMLOperationState = QmlWeb.QMLOperationState;
    if (this.operationState === QMLOperationState.Running) {
      clearInterval(this._tickerId);
      this.operationState = QMLOperationState.Idle;
      this._whenStop.forEach(callback => callback());
    }
  }

  // eslint-disable-next-line max-len
  /** from http://docs.closure-library.googlecode.com/git/local_closure_goog_uri_uri.js.source.html
   *
   * Removes dot segments in given path component, as described in
   * RFC 3986, section 5.2.4.
   *
   * @param {string} path A non-empty path component.
   * @return {string} Path component with removed dot segments.
   */
  removeDotSegments(path) {
    // path.startsWith("/") is not supported in some browsers
    let leadingSlash = path && path[0] === "/";
    const segments = path.split("/");
    const out = [];

    for (let pos = 0; pos < segments.length;) {
      const segment = segments[pos++];

      if (segment === ".") {
        if (leadingSlash && pos === segments.length) {
          out.push("");
        }
      } else if (segment === "..") {
        if (out.length > 1 || out.length === 1 && out[0] !== "") {
          out.pop();
        }
        if (leadingSlash && pos === segments.length) {
          out.push("");
        }
      } else {
        out.push(segment);
        leadingSlash = true;
      }
    }

    return out.join("/");
  }

  extractBasePath(file) {
    // work both in url ("/") and windows ("\", from file://d:\test\) notation
    const basePath = file.split(/[/\\]/);
    basePath[basePath.length - 1] = "";
    return basePath.join("/");
  }

  extractFileName(file) {
    return file.split(/[/\\]/).pop();
  }

  // Load file, parse and construct (.qml or .qml.js)
  loadFile(file, parentComponent = null) {
    // Create an anchor element to get the absolute path from the DOM
    if (!this.$basePathA) {
      this.$basePathA = document.createElement("a");
    }
    this.$basePathA.href = this.extractBasePath(file);
    this.$basePath = this.$basePathA.href;
    const fileName = this.extractFileName(file);
    const tree = this.loadComponent(this.$resolvePath(fileName));
    return this.loadQMLTree(tree, parentComponent, file);
  }

  // parse and construct qml
  // file is not required; only for debug purposes
  // This function is only used by the QmlWeb tests
  loadQML(src, parentComponent = null, file = undefined) {
    return this.loadQMLTree(QmlWeb.parseQML(src, file), parentComponent, file);
  }

  loadQMLTree(tree, parentComponent = null, file = undefined) {
    QmlWeb.engine = this;

    // Create and initialize objects
    const QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
    const component = new QMLComponent({
      object: tree,
      parent: parentComponent
    });

    this.loadImports(tree.$imports, undefined, component.importContextId);
    component.$basePath = this.$basePath;
    component.$imports = tree.$imports; // for later use
    component.$file = file; // just for debugging

    this.rootObject = component.$createObject(parentComponent);
    if (this.rootObject.dom) {
      this.domTarget.appendChild(this.rootObject.dom);
    }
    this.$initializePropertyBindings();

    this.start();

    this.updateGeometry();

    this.callCompletedSignals();

    return component;
  }

  rootContext() {
    return this.rootObject.$context;
  }

  // next 3 methods used in Qt.createComponent for qml files lookup
  // http://doc.qt.io/qt-5/qqmlengine.html#addImportPath

  addImportPath(dirpath) {
    this.userAddedImportPaths.push(dirpath);
  }

  /* Add this dirpath to be checked for components. This is the result of
   * something like:
   *
   * import "SomeDir/AnotherDirectory"
   *
   * The importContextId ensures it is only accessible from the file in which
   * it was imported. */
  addComponentImportPath(importContextId, dirpath, qualifier) {
    if (!this.componentImportPaths) {
      this.componentImportPaths = {};
    }
    if (!this.componentImportPaths[importContextId]) {
      this.componentImportPaths[importContextId] = {};
    }

    const paths = this.componentImportPaths[importContextId];

    if (qualifier) {
      if (!paths.qualified) {
        paths.qualified = {};
      }
      paths.qualified[qualifier] = dirpath;
    } else {
      if (!paths.unqualified) {
        paths.unqualified = [];
      }
      paths.unqualified.push(dirpath);
    }
  }

  importSearchPaths(importContextId) {
    if (!this.componentImportPaths) {
      return [];
    }
    const paths = this.componentImportPaths[importContextId];
    if (!paths) {
      return [];
    }
    return paths.unqualified || [];
  }

  qualifiedImportPath(importContextId, qualifier) {
    if (!this.componentImportPaths) {
      return "";
    }
    const paths = this.componentImportPaths[importContextId];
    if (!paths || !paths.qualified) {
      return "";
    }
    return paths.qualified[qualifier] || "";
  }

  setImportPathList(arrayOfDirs) {
    this.userAddedImportPaths = arrayOfDirs;
  }

  importPathList() {
    return this.userAddedImportPaths;
  }

  // `addModulePath` defines conrete path for module lookup
  // e.g. addModulePath("QtQuick.Controls", "http://example.com/controls")
  // will force system to `import QtQuick.Controls` module from
  // `http://example.com/controls/qmldir`

  addModulePath(moduleName, dirPath) {
    // Keep the mapping. It will be used in loadImports() function.
    // Remove trailing slash as it required for `readQmlDir`.
    this.userAddedModulePaths[moduleName] = dirPath.replace(/\/$/, "");
  }

  registerProperty(obj, propName) {
    const dependantProperties = [];
    let value = obj[propName];

    const getter = () => {
      const QMLProperty = QmlWeb.QMLProperty;
      if (QMLProperty.evaluatingProperty && dependantProperties.indexOf(QMLProperty.evaluatingProperty) === -1) {
        dependantProperties.push(QMLProperty.evaluatingProperty);
      }
      return value;
    };

    const setter = newVal => {
      value = newVal;
      for (const i in dependantProperties) {
        dependantProperties[i].update();
      }
    };

    QmlWeb.setupGetterSetter(obj, propName, getter, setter);
  }

  loadImports(importsArray, currentFileDir = this.$basePath, importContextId = -1) {
    if (!this.qmldirsContents) {
      this.qmldirsContents = {}; // cache

      // putting initial keys in qmldirsContents - is a hack. We should find a
      // way to explain to qmlweb, is this built-in module or qmldir-style
      // module.
      for (const module in QmlWeb.modules) {
        if (module !== "Main") {
          this.qmldirsContents[module] = {};
        }
      }
    }

    if (!this.qmldirs) {
      this.qmldirs = {}; // resulting components lookup table
    }

    if (!importsArray || importsArray.length === 0) {
      return;
    }

    for (let i = 0; i < importsArray.length; i++) {
      this.loadImport(importsArray[i], currentFileDir, importContextId);
    }
  }

  loadImport(entry, currentFileDir, importContextId) {
    let name = entry[1];

    // is it url to remote resource
    const nameIsUrl = name.indexOf("//") === 0 || name.indexOf("://") >= 0;
    // is it a module name, e.g. QtQuick, QtQuick.Controls, etc
    const nameIsQualifiedModuleName = entry[4];
    // is it a js file
    const nameIsJs = name.slice(-3) === ".js";
    // local [relative] dir
    const nameIsDir = !nameIsQualifiedModuleName && !nameIsUrl && !nameIsJs;

    if (nameIsDir) {
      name = this.$resolvePath(name, currentFileDir);
      if (name[name.length - 1] === "/") {
        // remove trailing slash as it required for `readQmlDir`
        name = name.substr(0, name.length - 1);
      }
    }

    let content = this.qmldirsContents[name];
    // check if we have already loaded that qmldir file
    if (!content) {
      if (nameIsQualifiedModuleName && this.userAddedModulePaths[name]) {
        // 1. we have qualified module and user had configured path for that
        // module with this.addModulePath
        content = QmlWeb.readQmlDir(this.userAddedModulePaths[name]);
      } else if (nameIsUrl || nameIsDir) {
        // 2. direct load
        // nameIsUrl => url do not need dirs
        // nameIsDir => already computed full path above
        content = QmlWeb.readQmlDir(name);
      } else if (nameIsJs) {
        // 3. Js file, don't need qmldir
      } else {
        // 4. qt-style lookup for qualified module
        const probableDirs = [currentFileDir].concat(this.importPathList());
        const diredName = name.replace(/\./g, "/");

        for (let k = 0; k < probableDirs.length; k++) {
          const file = probableDirs[k] + diredName;
          content = QmlWeb.readQmlDir(file);
          if (content) {
            break;
          }
        }
      }
      this.qmldirsContents[name] = content;
    }

    /* If there is no qmldir, add these directories to the list of places to
      * search for components (within this import scope). "noqmldir" is
      * inserted into the qmldir cache to avoid future attempts at fetching
      * the qmldir file, but we always need to the call to
      * "addComponentImportPath" for these sorts of directories. */
    if (!content || content === "noqmldir") {
      if (nameIsDir) {
        if (entry[3]) {
          /* Use entry[1] directly, as we don't want to include the
            * basePath, otherwise it gets prepended twice in
            * createComponent. */
          this.addComponentImportPath(importContextId, `${entry[1]}/`, entry[3]);
        } else {
          this.addComponentImportPath(importContextId, `${name}/`);
        }
      }

      this.qmldirsContents[name] = "noqmldir";
      return;
    }

    // copy founded externals to global var
    // TODO actually we have to copy it to current component
    for (const attrname in content.externals) {
      this.qmldirs[attrname] = content.externals[attrname];
    }

    // keep already loaded qmldir files
    this.qmldirsContents[name] = content;
  }

  size() {
    return {
      width: this.rootObject.getWidth(),
      height: this.rootObject.getHeight()
    };
  }

  focusedElement() {
    return this.rootContext().activeFocus;
  }

  //---------- Private Methods ----------

  $initKeyboard() {
    document.onkeypress = e => {
      let focusedElement = this.focusedElement();
      const event = QmlWeb.eventToKeyboard(e || window.event);
      const eventName = QmlWeb.keyboardSignals[event.key];

      while (focusedElement && !event.accepted) {
        const backup = focusedElement.$context.event;
        focusedElement.$context.event = event;
        focusedElement.Keys.pressed(event);
        if (eventName) {
          focusedElement.Keys[eventName](event);
        }
        focusedElement.$context.event = backup;
        if (event.accepted) {
          e.preventDefault();
        } else {
          focusedElement = focusedElement.$parent;
        }
      }
    };

    document.onkeyup = e => {
      let focusedElement = this.focusedElement();
      const event = QmlWeb.eventToKeyboard(e || window.event);

      while (focusedElement && !event.accepted) {
        const backup = focusedElement.$context.event;
        focusedElement.$context.event = event;
        focusedElement.Keys.released(event);
        focusedElement.$context.event = backup;
        if (event.accepted) {
          e.preventDefault();
        } else {
          focusedElement = focusedElement.$parent;
        }
      }
    };
  }

  _tick() {
    const now = Date.now();
    const elapsed = now - this._lastTick;
    this._lastTick = now;
    this._tickers.forEach(ticker => ticker(now, elapsed));
  }

  // Load resolved file, parse and construct as Component (.qml)
  loadComponent(file) {
    if (file in this.components) {
      return this.components[file];
    }

    const uri = this.$parseURI(file);
    if (!uri) {
      return undefined;
    }

    let tree;
    if (uri.scheme === "qrc://") {
      tree = QmlWeb.qrc[uri.path];
      if (!tree) {
        return undefined;
      }
      // QmlWeb.qrc contains pre-parsed Component objects, but they still need
      // convertToEngine called on them.
      tree = QmlWeb.convertToEngine(tree);
    } else {
      const src = QmlWeb.getUrlContents(file, true);
      if (!src) {
        console.error("QMLEngine.loadComponent: Failed to load:", file);
        return undefined;
      }

      console.log("QMLEngine.loadComponent: Loading file:", file);
      tree = QmlWeb.parseQML(src, file);
    }

    if (!tree) {
      return undefined;
    }

    if (tree.$children.length !== 1) {
      console.error("QMLEngine.loadComponent: Failed to load:", file, ": A QML component must only contain one root element!");
      return undefined;
    }

    tree.$file = file;
    this.components[file] = tree;
    return tree;
  }

  // Load resolved file and parse as JavaScript
  loadJS(file) {
    if (file in this.js) {
      return this.js[file];
    }

    const uri = this.$parseURI(file);
    if (!uri) {
      return undefined;
    }

    let jsData;
    if (uri.scheme === "qrc://") {
      jsData = QmlWeb.qrc[uri.path];
    } else {
      QmlWeb.loadParser();
      jsData = QmlWeb.jsparse(QmlWeb.getUrlContents(file));
    }

    if (!jsData) {
      return undefined;
    }

    // Remove any ".pragma" statements, as they are not valid JavaScript
    jsData.source = jsData.source.replace(/\.pragma.*(?:\r\n|\r|\n)/, "\n");

    const contextSetter = new Function("$context", `
      with(QmlWeb) with ($context) {
        ${jsData.source}
      }
      ${jsData.exports.map(sym => `$context.${sym} = ${sym};`).join("")}
    `);

    this.js[file] = contextSetter;

    return contextSetter;
  }

  $registerStart(f) {
    this._whenStart.push(f);
  }

  $registerStop(f) {
    this._whenStop.push(f);
  }

  $addTicker(t) {
    this._tickers.push(t);
  }

  $removeTicker(t) {
    const index = this._tickers.indexOf(t);
    if (index !== -1) {
      this._tickers.splice(index, 1);
    }
  }

  $initializePropertyBindings() {
    // Initialize property bindings
    // we use `while`, because $initializePropertyBindings may be called
    // recursive (because of Loader and/or createQmlObject )
    while (this.bindedProperties.length > 0) {
      const property = this.bindedProperties.shift();

      if (!property.binding) {
        // Probably, the binding was overwritten by an explicit value. Ignore.
        continue;
      }

      if (property.needsUpdate) {
        property.update();
      } else if (geometryProperties.indexOf(property.name) >= 0) {
        // It is possible that bindings with these names was already evaluated
        // during eval of other bindings but in that case $updateHGeometry and
        // $updateVGeometry could be blocked during their eval.
        // So we call them explicitly, just in case.
        const { obj, changed } = property;
        if (obj.$updateHGeometry && changed.isConnected(obj, obj.$updateHGeometry)) {
          obj.$updateHGeometry(property.val, property.val, property.name);
        }
        if (obj.$updateVGeometry && changed.isConnected(obj, obj.$updateVGeometry)) {
          obj.$updateVGeometry(property.val, property.val, property.name);
        }
      }
    }

    this.$initializeAliasSignals();
  }

  // This parses the full URL into scheme, authority and path
  $parseURI(uri) {
    const match = uri.match(/^([^/]*?:\/\/)(.*?)(\/.*)$/);
    if (match) {
      return {
        scheme: match[1],
        authority: match[2],
        path: match[3]
      };
    }
    return undefined;
  }

  // Return a path to load the file
  $resolvePath(file, basePath = this.$basePath) {
    // probably, replace :// with :/ ?
    if (!file || file.indexOf("://") !== -1) {
      return file;
    }

    const schemes = ["data:", "blob:", "about:"];
    for (let i = 0; i < schemes.length; i++) {
      if (file.lastIndexOf(schemes[i], 0) === 0) {
        return file;
      }
    }

    const basePathURI = this.$parseURI(basePath);
    if (!basePathURI) {
      return file;
    }

    let path = basePathURI.path;
    if (file.indexOf("/") === 0) {
      path = file;
    } else {
      path = `${path}${file}`;
    }

    // Remove duplicate slashes and dot segments in the path
    path = this.removeDotSegments(path.replace(/([^:]\/)\/+/g, "$1"));

    return `${basePathURI.scheme}${basePathURI.authority}${path}`;
  }

  // Return a DOM-valid path to load the image (fileURL is an already-resolved
  // URL)
  $resolveImageURL(fileURL) {
    const uri = this.$parseURI(fileURL);
    // If we are within the resource system, look up a "real" path that can be
    // used by the DOM. If not found, return the path itself without the
    // "qrc://" scheme.
    if (uri && uri.scheme === "qrc://") {
      return QmlWeb.qrc[uri.path] || uri.path;
    }

    // Something we can't parse, just pass it through
    return fileURL;
  }

  $initializeAliasSignals() {
    // Perform pending operations. Now we use it only to init alias's "changed"
    // handlers, that's why we have such strange function name.
    while (this.pendingOperations.length > 0) {
      const op = this.pendingOperations.shift();
      op[0](op[1], op[2], op[3]);
    }
    this.pendingOperations = [];
  }

  callCompletedSignals() {
    // the while loop is better than for..in loop, because completedSignals
    // array might change dynamically when some completed signal handlers will
    // create objects dynamically via createQmlObject or Loader
    while (this.completedSignals.length > 0) {
      const handler = this.completedSignals.shift();
      handler();
    }
  }
}

QmlWeb.QMLEngine = QMLEngine;

function QMLInteger(val) {
  return val | 0;
}
QMLInteger.plainType = true;
QmlWeb.qmlInteger = QMLInteger;

function QMLList(meta) {
  const list = [];
  if (meta.object instanceof Array) {
    for (const i in meta.object) {
      list.push(QmlWeb.construct({
        object: meta.object[i],
        parent: meta.parent,
        context: meta.context
      }));
    }
  } else if (meta.object instanceof QmlWeb.QMLMetaElement) {
    list.push(QmlWeb.construct({
      object: meta.object,
      parent: meta.parent,
      context: meta.context
    }));
  }

  return list;
}
QMLList.plainType = true;
QmlWeb.qmlList = QMLList;

function QMLNumber(val) {
  return +val;
}
QMLNumber.plainType = true;
QmlWeb.qmlNumber = QMLNumber;

const QMLOperationState = {
  Idle: 1,
  Init: 2,
  Running: 3
};

QmlWeb.QMLOperationState = QMLOperationState;

class QMLProperty {
  constructor(type, obj, name) {
    this.obj = obj;
    this.name = name;
    this.changed = QmlWeb.Signal.signal([], { obj });
    this.binding = null;
    this.objectScope = null;
    this.componentScope = null;
    this.value = undefined;
    this.type = type;
    this.animation = null;
    this.needsUpdate = true;

    // This list contains all signals that hold references to this object.
    // It is needed when deleting, as we need to tidy up all references to this
    // object.
    this.$tidyupList = [];
  }

  // Called by update and set to actually set this.val, performing any type
  // conversion required.
  $setVal(val, componentScope) {
    const constructors = QmlWeb.constructors;
    if (constructors[this.type] === QmlWeb.qmlList) {
      this.val = QmlWeb.qmlList({
        object: val,
        parent: this.obj,
        context: componentScope
      });
    } else if (val instanceof QmlWeb.QMLMetaElement) {
      const QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
      if (constructors[val.$class] === QMLComponent || constructors[this.type] === QMLComponent) {
        this.val = new QMLComponent({
          object: val,
          parent: this.obj,
          context: componentScope
        });
        /* $basePath must be set here so that Components that are assigned to
         * properties (e.g. Repeater delegates) can properly resolve child
         * Components that live in the same directory in
         * Component.createObject. */
        this.val.$basePath = componentScope.$basePath;
      } else {
        this.val = QmlWeb.construct({
          object: val,
          parent: this.obj,
          context: componentScope
        });
      }
    } else if (!constructors[this.type]) {
      this.val = val;
    } else if (constructors[this.type].requireParent) {
      this.val = new constructors[this.type](this.obj, val);
    } else if (val === undefined && constructors[this.type].nonNullableType) {
      this.val = new constructors[this.type]();
    } else if (constructors[this.type].requireConstructor) {
      this.val = new constructors[this.type](val);
    } else if (val instanceof Object || val === undefined || val === null) {
      this.val = val;
    } else if (constructors[this.type].plainType) {
      this.val = constructors[this.type](val);
    } else {
      this.val = new constructors[this.type](val);
    }
    if (this.val && this.val.$changed) {
      this.val.$changed.connect(() => {
        const oldVal = this.val; // TODO
        this.changed(this.val, oldVal, this.name);
      });
    } else if (this.val && this.val.$properties) {
      Object.keys(this.val.$properties).forEach(pname => {
        const prop = this.val.$properties[pname];
        if (!prop || !prop.connect) return;
        // TODO: oldVal
        prop.connect(() => this.changed(this.val, this.val, this.name));
      });
    }
  }

  // Updater recalculates the value of a property if one of the dependencies
  // changed
  update() {
    this.needsUpdate = false;

    if (!this.binding) {
      return;
    }

    const oldVal = this.val;

    try {
      QMLProperty.pushEvaluatingProperty(this);
      if (!this.binding.compiled) {
        this.binding.compile();
      }
      this.$setVal(this.binding.eval(this.objectScope, this.componentScope, this.componentScopeBasePath), this.componentScope);
    } catch (e) {
      console.log("QMLProperty.update binding error:", e, Function.prototype.toString.call(this.binding.eval));
    } finally {
      QMLProperty.popEvaluatingProperty();
    }

    if (this.animation) {
      this.animation.$actions = [{
        target: this.animation.target || this.obj,
        property: this.animation.property || this.name,
        from: this.animation.from || oldVal,
        to: this.animation.to || this.val
      }];
      this.animation.restart();
    }

    if (this.val !== oldVal) {
      this.changed(this.val, oldVal, this.name);
    }
  }

  // Define getter
  get() {
    //if (this.needsUpdate && !QMLProperty.evaluatingPropertyPaused) {
    if (this.needsUpdate && QmlWeb.engine.operationState !== QmlWeb.QMLOperationState.Init) {
      this.update();
    }

    // If this call to the getter is due to a property that is dependant on this
    // one, we need it to take track of changes
    if (QMLProperty.evaluatingProperty) {
      //console.log(this,QMLProperty.evaluatingPropertyStack.slice(0),this.val);
      this.changed.connect(QMLProperty.evaluatingProperty, QMLProperty.prototype.update, QmlWeb.Signal.UniqueConnection);
    }

    return this.val;
  }
  // Define setter
  set(newVal, reason, objectScope, componentScope) {
    const oldVal = this.val;

    let val = newVal;
    if (val instanceof QmlWeb.QMLBinding) {
      if (!objectScope || !componentScope) {
        throw new Error("Internal error: binding assigned without scope");
      }
      this.binding = val;
      this.objectScope = objectScope;
      this.componentScope = componentScope;
      this.componentScopeBasePath = componentScope.$basePath;

      if (QmlWeb.engine.operationState !== QmlWeb.QMLOperationState.Init) {
        if (!val.compiled) {
          val.compile();
        }
        try {
          QMLProperty.pushEvaluatingProperty(this);
          this.needsUpdate = false;
          val = this.binding.eval(objectScope, componentScope, this.componentScopeBasePath);
        } finally {
          QMLProperty.popEvaluatingProperty();
        }
      } else {
        QmlWeb.engine.bindedProperties.push(this);
        return;
      }
    } else {
      if (reason !== QMLProperty.ReasonAnimation) {
        this.binding = null;
      }
      if (val instanceof Array) {
        val = val.slice(); // Copies the array
      }
    }

    if (reason === QMLProperty.ReasonInit && typeof val === "undefined") {
      if (QMLProperty.typeInitialValues.hasOwnProperty(this.type)) {
        val = QMLProperty.typeInitialValues[this.type];
      }
    }

    this.$setVal(val, componentScope);

    if (this.val !== oldVal) {
      if (this.animation && reason === QMLProperty.ReasonUser) {
        this.animation.running = false;
        this.animation.$actions = [{
          target: this.animation.target || this.obj,
          property: this.animation.property || this.name,
          from: this.animation.from || oldVal,
          to: this.animation.to || this.val
        }];
        this.animation.running = true;
      }
      if (this.obj.$syncPropertyToRemote instanceof Function && reason === QMLProperty.ReasonUser) {
        // is a remote object from e.g. a QWebChannel
        this.obj.$syncPropertyToRemote(this.name, val);
      } else {
        this.changed(this.val, oldVal, this.name);
      }
    }
  }

  static pushEvalStack() {
    QMLProperty.evaluatingPropertyStackOfStacks.push(QMLProperty.evaluatingPropertyStack);
    QMLProperty.evaluatingPropertyStack = [];
    QMLProperty.evaluatingProperty = undefined;
    //  console.log("evaluatingProperty=>undefined due to push stck ");
  }

  static popEvalStack() {
    QMLProperty.evaluatingPropertyStack = QMLProperty.evaluatingPropertyStackOfStacks.pop() || [];
    QMLProperty.evaluatingProperty = QMLProperty.evaluatingPropertyStack[QMLProperty.evaluatingPropertyStack.length - 1];
  }

  static pushEvaluatingProperty(prop) {
    // TODO say warnings if already on stack. This means binding loop.
    // BTW actually we do not loop because needsUpdate flag is reset before
    // entering update again.
    if (QMLProperty.evaluatingPropertyStack.indexOf(prop) >= 0) {
      console.error("Property binding loop detected for property", prop.name, [prop].slice(0));
    }
    QMLProperty.evaluatingProperty = prop;
    QMLProperty.evaluatingPropertyStack.push(prop); //keep stack of props
  }

  static popEvaluatingProperty() {
    QMLProperty.evaluatingPropertyStack.pop();
    QMLProperty.evaluatingProperty = QMLProperty.evaluatingPropertyStack[QMLProperty.evaluatingPropertyStack.length - 1];
  }
}

// Property that is currently beeing evaluated. Used to get the information
// which property called the getter of a certain other property for
// evaluation and is thus dependant on it.
QMLProperty.evaluatingProperty = undefined;
QMLProperty.evaluatingPropertyPaused = false;
QMLProperty.evaluatingPropertyStack = [];
QMLProperty.evaluatingPropertyStackOfStacks = [];

QMLProperty.typeInitialValues = {
  int: 0,
  real: 0,
  double: 0,
  string: "",
  bool: false,
  list: [],
  enum: 0,
  url: ""
};

QMLProperty.ReasonUser = 0;
QMLProperty.ReasonInit = 1;
QMLProperty.ReasonAnimation = 2;

QmlWeb.QMLProperty = QMLProperty;

function QMLString(val) {
  return `${val}`;
}
QMLString.plainType = true;
QmlWeb.qmlString = QMLString;

function QMLUrl(val) {
  return QmlWeb.engine.$resolvePath(`${val}`);
}
QMLUrl.plainType = true;
QmlWeb.qmlUrl = QMLUrl;

function QMLVariant(val) {
  return val;
}
QMLVariant.plainType = true;
QmlWeb.qmlVariant = QMLVariant;

window.addEventListener("load", () => {
  const metaTags = document.getElementsByTagName("body");
  for (let i = 0; i < metaTags.length; ++i) {
    const metaTag = metaTags[i];
    const source = metaTag.getAttribute("data-qml");
    if (source) {
      QmlWeb.qmlEngine = new QmlWeb.QMLEngine();
      QmlWeb.qmlEngine.loadFile(source);
      QmlWeb.qmlEngine.start();
      break;
    }
  }
});

const anchorNames = ["left", "right", "top", "bottom", "verticalCenter", "horizontalCenter"];

const ignoreProps = ["x", "y", "z", "scale", "rotation", "implicitWidth", "implicitHeight"];

function getProperties(file) {
  // TODO: implement a cleaner way

  const div = document.createElement("div");
  const engine = new QmlWeb.QMLEngine(div);
  engine.loadFile(file);

  const qml = engine.rootObject;
  const properties = Object.keys(qml.$properties).filter(name => {
    // Invalid names
    if (!name.match(/^[a-z]+$/i) || name === "is") return false;

    // We don't need anchors
    if (anchorNames.indexOf(name) !== -1) return false;

    // These properties are not supported in a good way on top-level items
    if (ignoreProps.indexOf(name) !== -1) return false;

    const type = qml.$properties[name].type;
    return ["real", "color", "int", "bool", "string"].indexOf(type) !== -1;
  });

  engine.stop();
  return properties;
}

function registerElement(name, file) {
  // Delay until the document is fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      registerElement(name, file);
    });
    return;
  }

  // Bail out if Custom Elements v1 are not present
  if (!window.customElements) {
    throw new Error("window.customElements are not supported. Consider installing a polyfill.");
  }

  // We need attributes list at this point, those form a static property
  const properties = getProperties(file);
  const attributes = properties.map(pname => pname.toLowerCase());
  const attr2prop = properties.reduce((map, pname) => {
    map[pname.toLowerCase()] = pname;
    return map;
  }, {});

  const QmlElement = class extends HTMLElement {
    connectedCallback() {
      // Default wrapper display is inline-block to support native width/height
      const computedStyle = window.getComputedStyle(this);
      if (computedStyle.display === "inline") {
        this.style.display = "inline-block";
      }

      const engine = this.engine = new QmlWeb.QMLEngine(this);
      engine.loadFile(file);
      engine.start();
      const qml = this.qml = engine.rootObject;

      // Bind attributes
      attributes.forEach(attr => {
        const pname = attr2prop[attr] || attr;
        const val = this.getAttribute(attr);
        if (typeof val === "string") {
          qml[pname] = val;
        }
        this.applyAttribute(attr);
        Object.defineProperty(this, attr, {
          get() {
            return this.qml[pname];
          },
          set(value) {
            this.qml[pname] = value;
            this.applyAttribute(attr);
          }
        });
        qml.$properties[pname].changed.connect(() => this.applyAttribute(attr));
      });

      // Set and update wrapper width/height
      this.style.width = `${qml.width}px`;
      this.style.height = `${qml.height}px`;
      qml.$properties.width.changed.connect(width => {
        this.style.width = `${width}px`;
      });
      qml.$properties.height.changed.connect(height => {
        this.style.height = `${height}px`;
      });
    }

    static get observedAttributes() {
      return attributes;
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      if (!this.qml) return;
      const pname = attr2prop[attr] || attr;
      const prop = this.qml.$properties[pname];
      if (!prop) return;
      switch (prop.type) {
        case "bool":
          this.qml[pname] = typeof newValue === "string";
          break;
        default:
          this.qml[pname] = newValue;
      }
    }

    applyAttribute(attr) {
      const pname = attr2prop[attr] || attr;
      const prop = this.qml.$properties[pname];
      if (!prop) {
        this.deleteAttribute(attr);
        return;
      }
      const value = this.qml[pname];
      switch (prop.type) {
        case "bool":
          if (value) {
            this.setAttribute(attr, "");
          } else {
            this.removeAttribute(attr);
          }
          break;
        default:
          this.setAttribute(attr, this.qml[pname]);
      }
    }
  };

  window.customElements.define(name, QmlElement);
}

QmlWeb.registerElement = registerElement;

const Easing = {
  Linear: 1,
  InQuad: 2, OutQuad: 3, InOutQuad: 4, OutInQuad: 5,
  InCubic: 6, OutCubic: 7, InOutCubic: 8, OutInCubic: 9,
  InQuart: 10, OutQuart: 11, InOutQuart: 12, OutInQuart: 13,
  InQuint: 14, OutQuint: 15, InOutQuint: 16, OutInQuint: 17,
  InSine: 18, OutSine: 19, InOutSine: 20, OutInSine: 21,
  InExpo: 22, OutExpo: 23, InOutExpo: 24, OutInExpo: 25,
  InCirc: 26, OutCirc: 27, InOutCirc: 28, OutInCirc: 29,
  InElastic: 30, OutElastic: 31, InOutElastic: 32, OutInElastic: 33,
  InBack: 34, OutBack: 35, InOutBack: 36, OutInBack: 37,
  InBounce: 38, OutBounce: 39, InOutBounce: 40, OutInBounce: 41
};

// eslint-disable-next-line complexity
QmlWeb.$ease = (type, period, amplitude, overshoot, t) => {
  switch (type) {
    // Linear
    case Easing.Linear:
      return t;

    // Quad
    case Easing.InQuad:
      return Math.pow(t, 2);
    case Easing.OutQuad:
      return -Math.pow(t - 1, 2) + 1;
    case Easing.InOutQuad:
      if (t < 0.5) {
        return 2 * Math.pow(t, 2);
      }
      return -2 * Math.pow(t - 1, 2) + 1;
    case Easing.OutInQuad:
      if (t < 0.5) {
        return -2 * Math.pow(t - 0.5, 2) + 0.5;
      }
      return 2 * Math.pow(t - 0.5, 2) + 0.5;

    // Cubic
    case Easing.InCubic:
      return Math.pow(t, 3);
    case Easing.OutCubic:
      return Math.pow(t - 1, 3) + 1;
    case Easing.InOutCubic:
      if (t < 0.5) {
        return 4 * Math.pow(t, 3);
      }
      return 4 * Math.pow(t - 1, 3) + 1;
    case Easing.OutInCubic:
      return 4 * Math.pow(t - 0.5, 3) + 0.5;

    // Quart
    case Easing.InQuart:
      return Math.pow(t, 4);
    case Easing.OutQuart:
      return -Math.pow(t - 1, 4) + 1;
    case Easing.InOutQuart:
      if (t < 0.5) {
        return 8 * Math.pow(t, 4);
      }
      return -8 * Math.pow(t - 1, 4) + 1;
    case Easing.OutInQuart:
      if (t < 0.5) {
        return -8 * Math.pow(t - 0.5, 4) + 0.5;
      }
      return 8 * Math.pow(t - 0.5, 4) + 0.5;

    // Quint
    case Easing.InQuint:
      return Math.pow(t, 5);
    case Easing.OutQuint:
      return Math.pow(t - 1, 5) + 1;
    case Easing.InOutQuint:
      if (t < 0.5) {
        return 16 * Math.pow(t, 5);
      }
      return 16 * Math.pow(t - 1, 5) + 1;
    case Easing.OutInQuint:
      if (t < 0.5) {
        return 16 * Math.pow(t - 0.5, 5) + 0.5;
      }
      return 16 * Math.pow(t - 0.5, 5) + 0.5;

    // Sine
    case Easing.InSine:
      return -Math.cos(0.5 * Math.PI * t) + 1;
    case Easing.OutSine:
      return Math.sin(0.5 * Math.PI * t);
    case Easing.InOutSine:
      return -0.5 * Math.cos(Math.PI * t) + 0.5;
    case Easing.OutInSine:
      if (t < 0.5) {
        return 0.5 * Math.sin(Math.PI * t);
      }
      return -0.5 * Math.sin(Math.PI * t) + 1;

    // Expo
    case Easing.InExpo:
      return 1 / 1023 * (Math.pow(2, 10 * t) - 1);
    case Easing.OutExpo:
      return -1024 / 1023 * (Math.pow(2, -10 * t) - 1);
    case Easing.InOutExpo:
      if (t < 0.5) {
        return 1 / 62 * (Math.pow(2, 10 * t) - 1);
      }
      return -512 / 31 * Math.pow(2, -10 * t) + 63 / 62;
    case Easing.OutInExpo:
      if (t < 0.5) {
        return -16 / 31 * (Math.pow(2, -10 * t) - 1);
      }
      return 1 / 1984 * Math.pow(2, 10 * t) + 15 / 31;

    // Circ
    case Easing.InCirc:
      return 1 - Math.sqrt(1 - t * t);
    case Easing.OutCirc:
      return Math.sqrt(1 - Math.pow(t - 1, 2));
    case Easing.InOutCirc:
      if (t < 0.5) {
        return 0.5 * (1 - Math.sqrt(1 - 4 * t * t));
      }
      return 0.5 * (Math.sqrt(1 - 4 * Math.pow(t - 1, 2)) + 1);
    case Easing.OutInCirc:
      if (t < 0.5) {
        return 0.5 * Math.sqrt(1 - Math.pow(2 * t - 1, 2));
      }
      return 0.5 * (2 - Math.sqrt(1 - Math.pow(2 * t - 1, 2)));

    // Elastic
    case Easing.InElastic:
      return -amplitude * Math.pow(2, 10 * t - 10) * Math.sin(2 * t * Math.PI / period - Math.asin(1 / amplitude));
    case Easing.OutElastic:
      return amplitude * Math.pow(2, -10 * t) * Math.sin(2 * t * Math.PI / period - Math.asin(1 / amplitude)) + 1;
    case Easing.InOutElastic:
      if (t < 0.5) {
        return -0.5 * amplitude * Math.pow(2, 20 * t - 10) * Math.sin(4 * t * Math.PI / period - Math.asin(1 / amplitude));
      }
      return -0.5 * amplitude * Math.pow(2, -20 * t + 10) * Math.sin(4 * t * Math.PI / period + Math.asin(1 / amplitude)) + 1;
    case Easing.OutInElastic:
      if (t < 0.5) {
        return 0.5 * amplitude * Math.pow(2, -20 * t) * Math.sin(4 * t * Math.PI / period - Math.asin(1 / amplitude)) + 0.5;
      }
      return -0.5 * amplitude * Math.pow(2, 20 * t - 20) * Math.sin(4 * t * Math.PI / period - Math.asin(1 / amplitude)) + 0.5;

    // Back
    case Easing.InBack:
      return (overshoot + 1) * Math.pow(t, 3) - overshoot * Math.pow(t, 2);
    case Easing.OutBack:
      return (overshoot + 1) * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2) + 1;
    case Easing.InOutBack:
      if (t < 0.5) {
        return 4 * (overshoot + 1) * Math.pow(t, 3) - 2 * overshoot * Math.pow(t, 2);
      }
      return 0.5 * (overshoot + 1) * Math.pow(2 * t - 2, 3) + overshoot / 2 * Math.pow(2 * t - 2, 2) + 1;
    case Easing.OutInBack:
      if (t < 0.5) {
        return 0.5 * ((overshoot + 1) * Math.pow(2 * t - 1, 3) + overshoot * Math.pow(2 * t - 1, 2) + 1);
      }
      return 4 * (overshoot + 1) * Math.pow(t - 0.5, 3) - 2 * overshoot * Math.pow(t - 0.5, 2) + 0.5;
    // Bounce
    case Easing.InBounce:
      if (t < 1 / 11) {
        return -amplitude * 121 / 16 * (t * t - 1 / 11 * t);
      } else if (t < 3 / 11) {
        return -amplitude * 121 / 16 * (t * t - 4 / 11 * t + 3 / 121);
      } else if (t < 7 / 11) {
        return -amplitude * 121 / 16 * (t * t - 10 / 11 * t + 21 / 121);
      }
      return -(121 / 16) * (t * t - 2 * t + 1) + 1;
    case Easing.OutBounce:
      if (t < 4 / 11) {
        return 121 / 16 * t * t;
      } else if (t < 8 / 11) {
        return amplitude * (121 / 16) * (t * t - 12 / 11 * t + 32 / 121) + 1;
      } else if (t < 10 / 11) {
        return amplitude * (121 / 16) * (t * t - 18 / 11 * t + 80 / 121) + 1;
      }
      return amplitude * (121 / 16) * (t * t - 21 / 11 * t + 10 / 11) + 1;
    case Easing.InOutBounce:
      if (t < 1 / 22) {
        return -amplitude * 121 / 8 * (t * t - 1 / 22 * t);
      } else if (t < 3 / 22) {
        return -amplitude * 121 / 8 * (t * t - 2 / 11 * t + 3 / 484);
      } else if (t < 7 / 22) {
        return -amplitude * 121 / 8 * (t * t - 5 / 11 * t + 21 / 484);
      } else if (t < 11 / 22) {
        return -121 / 8 * (t * t - t + 0.25) + 0.5;
      } else if (t < 15 / 22) {
        return 121 / 8 * (t * t - t) + 137 / 32;
      } else if (t < 19 / 22) {
        return amplitude * 121 / 8 * (t * t - 17 / 11 * t + 285 / 484) + 1;
      } else if (t < 21 / 22) {
        return amplitude * 121 / 8 * (t * t - 20 / 11 * t + 399 / 484) + 1;
      }
      return amplitude * 121 / 8 * (t * t - 43 / 22 * t + 21 / 22) + 1;
    case Easing.OutInBounce:
      if (t < 4 / 22) {
        return 121 / 8 * t * t;
      } else if (t < 8 / 22) {
        return -amplitude * 121 / 8 * (t * t - 6 / 11 * t + 8 / 121) + 0.5;
      } else if (t < 10 / 22) {
        return -amplitude * 121 / 8 * (t * t - 9 / 11 * t + 20 / 121) + 0.5;
      } else if (t < 11 / 22) {
        return -amplitude * 121 / 8 * (t * t - 21 / 22 * t + 5 / 22) + 0.5;
      } else if (t < 12 / 22) {
        return amplitude * 121 / 8 * (t * t - 23 / 22 * t + 3 / 11) + 0.5;
      } else if (t < 14 / 22) {
        return amplitude * 121 / 8 * (t * t - 13 / 11 * t + 42 / 121) + 0.5;
      } else if (t < 18 / 22) {
        return amplitude * 121 / 8 * (t * t - 16 / 11 * t + 63 / 121) + 0.5;
      }
      return -121 / 8 * (t * t - 2 * t + 117 / 121) + 0.5;

    // Default
    default:
      console.error("Unsupported animation type: ", type);
      return t;
  }
};

QmlWeb.Easing = Easing;

/* eslint accessor-pairs: 0 */

function setupGetter(obj, propName, func) {
  Object.defineProperty(obj, propName, {
    get: func,
    configurable: true,
    enumerable: true
  });
}

function setupSetter(obj, propName, func) {
  Object.defineProperty(obj, propName, {
    set: func,
    configurable: true,
    enumerable: false
  });
}

function setupGetterSetter(obj, propName, getter, setter) {
  Object.defineProperty(obj, propName, {
    get: getter,
    set: setter,
    configurable: true,
    enumerable: false
  });
}

QmlWeb.setupGetter = setupGetter;
QmlWeb.setupSetter = setupSetter;
QmlWeb.setupGetterSetter = setupGetterSetter;

class QmlWebHelpers {
  static arrayFindIndex(array, callback) {
    // Note: does not support thisArg, we don't need that
    if (!Array.prototype.findIndex) {
      for (const key in array) {
        if (callback(array[key], key, array)) {
          return key;
        }
      }
      return -1;
    }
    return Array.prototype.findIndex.call(array, callback);
  }
  static mergeObjects(...args) {
    const merged = {};
    for (const i in args) {
      const arg = args[i];
      if (!arg) {
        continue;
      }
      for (const key in arg) {
        merged[key] = arg[key];
      }
    }
    return merged;
  }
}

QmlWeb.helpers = QmlWebHelpers;

/* eslint-disable no-unused-vars */

function formatString(sourceText, n) {
  let text = sourceText;
  if (typeof n !== "undefined") {
    if (typeof n !== "number") {
      throw new Error("(n) must be a number");
    }
    text = text.replace(/%n/, n.toString(10));
  }
  return text;
}

QmlWeb.qsTr = function (sourceText, disambiguation, n) {
  return formatString(sourceText, n);
};

QmlWeb.qsTrId = function (id, n) {
  return formatString(id, n);
};

QmlWeb.qsTranslate = function (context, sourceText, disambiguation, n) {
  return formatString(sourceText, n);
};

// Somewhy these are documented, but not defined in Qt QML 5.10
/*
QmlWeb.qsTrIdNoOp = function(id) {
  return id;
};

QmlWeb.qsTrNoOp = function(sourceText, disambiguation) {
  return sourceText;
};

QmlWeb.qsTranslateNoOp = function(context, sourceText, disambiguation) {
  return sourceText;
};
*/

/* @license

MIT License

Copyright (c) 2011 Lauri Paimen <lauri@paimen.info>
Copyright (c) 2015 Pavel Vasev <pavel.vasev@gmail.com> - initial and working
                                                         import implementation.
Copyright (c) 2016 QmlWeb contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Get URL contents.
 * @param url {String} Url to fetch.
 * @param skipExceptions {bool} when turned on, ignore exeptions and return
 *        false. This feature is used by readQmlDir.
 * @private
 * @return {mixed} String of contents or false in errors.
 */
function getUrlContents(url, skipExceptions) {
  if (typeof QmlWeb.urlContentCache[url] === "undefined") {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);

    if (skipExceptions) {
      try {
        xhr.send(null);
      } catch (e) {
        return false;
      }
      // it is OK to not have logging here, because DeveloperTools already will
      // have red log record
    } else {
      xhr.send(null);
    }

    if (xhr.status !== 200 && xhr.status !== 0) {
      // 0 if accessing with file://
      console.log(`Retrieving ${url} failed: ${xhr.responseText}`, xhr);
      return false;
    }
    QmlWeb.urlContentCache[url] = xhr.responseText;
  }
  return QmlWeb.urlContentCache[url];
}
if (typeof QmlWeb.urlContentCache === "undefined") {
  QmlWeb.urlContentCache = {};
}

/**
 * Read qmldir spec file at directory.
 * @param url Url of the directory
 * @return {Object} Object, where .internals lists qmldir internal references
 *                          and .externals lists qmldir external references.
 */

/*  Note on how importing works.

parseQML gives us `tree.$imports` variable, which contains information from
`import` statements.

After each call to parseQML, we call engine.loadImports(tree.$imports).
It in turn invokes readQmlDir() calls for each import, with respect to current
component base path and engine.importPathList().

We keep all component names from all qmldir files in global variable
`engine.qmldir`.

In construct() function, we use `engine.qmldir` for component url lookup.

Reference import info: http://doc.qt.io/qt-5/qtqml-syntax-imports.html
Also please look at notes and TODO's in qtcore.js::loadImports() and
qtcore.js::construct() methods.
*/

function readQmlDir(url) {
  // in case 'url' is empty, do not attach "/"
  // Q1: when this happen?
  const qmldirFileUrl = url.length > 0 ? `${url}/qmldir` : "qmldir";

  const parsedUrl = QmlWeb.engine.$parseURI(qmldirFileUrl);

  let qmldir;
  if (parsedUrl.scheme === "qrc://") {
    qmldir = QmlWeb.qrc[parsedUrl.path];
  } else {
    qmldir = getUrlContents(qmldirFileUrl, true) || undefined;
  }

  const internals = {};
  const externals = {};

  if (qmldir === undefined) {
    return false;
  }

  // we have to check for "://"
  // In that case, item path is meant to be absolute, and we have no need to
  // prefix it with base url
  function makeurl(path) {
    if (path.indexOf("://") > 0) {
      return path;
    }
    return `${url}/${path}`;
  }

  const lines = qmldir.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.length || line[0] === "#") continue; // Empty line or comment
    const parts = line.split(/\s+/);
    const res = {};
    switch (parts[0]) {
      case "designersupported": // Just a flag for IDE
      case "typeinfo":
        // For IDE code completion etc
        break;
      case "plugin":
      case "classname":
      case "depends":
      case "module":
        console.log(`${url}: qmldir "${parts[0]}" entries are not supported`);
        break;
      case "internal":
      case "singleton":
        res[parts[0]] = true;
        parts.shift();
      // fall through
      default:
        if (parts.length === 2) {
          res.url = makeurl(parts[1]);
        } else {
          res.version = parts[1];
          res.url = makeurl(parts[2]);
        }
        externals[parts[0]] = res;
    }
  }
  return { internals, externals };
}

QmlWeb.getUrlContents = getUrlContents;
QmlWeb.readQmlDir = readQmlDir;

function importJavascriptInContext(contextSetter, $context) {
  /* Set the QmlWeb.executionContext so that any internal calls to Qt.include
   * will have the proper context */
  const oldExecutionContext = QmlWeb.executionContext;
  QmlWeb.executionContext = $context;
  contextSetter($context);
  QmlWeb.executionContext = oldExecutionContext;
}

QmlWeb.importJavascriptInContext = importJavascriptInContext;

QmlWeb.keyCodeToQt = e => {
  const Qt = QmlWeb.Qt;
  e.keypad = e.keyCode >= 96 && e.keyCode <= 111;
  if (e.keyCode === Qt.Key_Tab && e.shiftKey) {
    return Qt.Key_Backtab;
  }
  if (e.keyCode >= 97 && e.keyCode <= 122) {
    return e.keyCode - (97 - Qt.Key_A);
  }
  return e.keyCode;
};

QmlWeb.eventToKeyboard = e => ({
  accepted: false,
  count: 1,
  isAutoRepeat: false,
  key: QmlWeb.keyCodeToQt(e),
  modifiers: e.ctrlKey * QmlWeb.Qt.CtrlModifier | e.altKey * QmlWeb.Qt.AltModifier | e.shiftKey * QmlWeb.Qt.ShiftModifier | e.metaKey * QmlWeb.Qt.MetaModifier | e.keypad * QmlWeb.Qt.KeypadModifier,
  text: String.fromCharCode(e.charCode)
});

QmlWeb.keyboardSignals = {};
["asterisk", "back", "backtab", "call", "cancel", "delete", "escape", "flip", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "hangup", "menu", "no", "return", "select", "space", "tab", "volumeDown", "volumeUp", "yes", "up", "right", "down", "left"].forEach(key => {
  const name = key.toString();
  const qtName = `Key_${name[0].toUpperCase()}${name.slice(1)}`;
  const prefix = typeof key === "number" ? "digit" : "";
  QmlWeb.keyboardSignals[QmlWeb.Qt[qtName]] = `${prefix}${name}Pressed`;
});

QmlWeb.executionContext = null;

const modules = {
  Main: {
    int: QmlWeb.qmlInteger,
    real: QmlWeb.qmlNumber,
    double: QmlWeb.qmlNumber,
    string: QmlWeb.qmlString,
    bool: QmlWeb.qmlBoolean,
    list: QmlWeb.qmlList,
    color: QmlWeb.QColor,
    font: QmlWeb.QFont,
    size: QmlWeb.QSizeF,
    point: QmlWeb.QPointF,
    rect: QmlWeb.QRectF,
    vector2d: QmlWeb.QVector2D,
    vector3d: QmlWeb.QVector3D,
    vector4d: QmlWeb.QVector4D,
    quaternion: QmlWeb.QQuaternion,
    matrix4x4: QmlWeb.QMatrix4x4,
    enum: QmlWeb.qmlNumber,
    url: QmlWeb.qmlUrl,
    variant: QmlWeb.qmlVariant,
    var: QmlWeb.qmlVariant
  }
};

// All object constructors
QmlWeb.constructors = modules.Main;

const perImportContextConstructors = {};
let importContextIds = 0;

// Helper. Adds a type to the constructor list
function registerGlobalQmlType(name, type) {
  QmlWeb[type.name] = type;
  QmlWeb.constructors[name] = type;
  modules.Main[name] = type;
}

// Helper. Register a type to a module
function registerQmlType(spec) {
  if (!/.*_.*/.test(spec.name)) {
    throw new Error(`Invalid class name: ${spec.name}`);
  }

  const name = spec.name.replace(/.*_/, "");
  const module = spec.name.replace(/(_[0-9]+)?_[^_]+$/, "").replace(/_/g, ".");

  spec.$qmlTypeInfo = {
    enums: spec.hasOwnProperty("enums") ? spec.enums : {},
    signals: spec.hasOwnProperty("signals") ? spec.signals : {},
    properties: spec.hasOwnProperty("properties") ? spec.properties : {},
    defaultProperty: spec.defaultProperty
  };

  if (spec.hasOwnProperty("global") && spec.global) {
    registerGlobalQmlType(name, spec);
  }

  const moduleDescriptor = {
    name,
    versions: spec.hasOwnProperty("versions") ? spec.versions : /.*/,
    constructor: spec
  };
  if (!modules.hasOwnProperty(module)) {
    modules[module] = [];
  }
  modules[module].push(moduleDescriptor);

  // TODO: Move to module initialization?
  /*
    http://doc.qt.io/qt-5/qtqml-syntax-objectattributes.html#attached-properties-and-attached-signal-handlers
     Some object treated as Attached. For example, Component.
    Here, we set property to object `QMLBaseObject.prototype` with name of that
    object, and with specific getter func.
    E.g., we create "someitem.Component" here.
    Later, if somebody will read that property, the getter will be invoked.
    Here all getters are set to `getAttachedObject` only, which is actually
    dedicated for Component attached object.
    The code of `getAttachedObject` checks whether $Component internal
    variable exist, and creates it if it absent.
    Then, `getAttachedObject` adds self "completed" signal to global
    `engine.completedSignals`.
    That is how completed handlers gathered into global list. This list then
    is called by `engine.callCompletedSignals`.
     p.s. At the moment, Repeater and Loader manually call
    `Component.completed` signals on objects they create.
    At the same time, those signals are still pushed to
    `engine.completedSignals` by getAttachedObject.
  */
  if (spec.getAttachedObject) {
    const QMLBaseObject = QmlWeb.getConstructor("QtQml", "2.0", "QtObject");
    QmlWeb.setupGetter(QMLBaseObject.prototype, name, spec.getAttachedObject);
  }
}

function getConstructor(moduleName, version, name) {
  if (typeof modules[moduleName] !== "undefined") {
    for (let i = 0; i < modules[moduleName].length; ++i) {
      const type = modules[moduleName][i];
      if (type.name === name && type.versions.test(version)) {
        return type.constructor;
      }
    }
  }
  return null;
}

function getModuleConstructors(moduleName, version) {
  const constructors = {};
  if (typeof modules[moduleName] === "undefined") {
    console.warn(`module "${moduleName}" not found`);
    return constructors;
  }
  for (let i = 0; i < modules[moduleName].length; ++i) {
    const module = modules[moduleName][i];
    if (module.versions.test(version)) {
      constructors[module.name] = module.constructor;
    }
  }
  return constructors;
}

function loadImports(self, imports) {
  const mergeObjects = QmlWeb.helpers.mergeObjects;
  let constructors = mergeObjects(modules.Main);
  if (imports.filter(row => row[1] === "QtQml").length === 0 && imports.filter(row => row[1] === "QtQuick").length === 1) {
    imports.push(["qmlimport", "QtQml", 2, "", true]);
  }
  for (let i = 0; i < imports.length; ++i) {
    const [, moduleName, moduleVersion, moduleAlias] = imports[i];
    if (typeof moduleVersion !== "number") continue;
    const versionString = moduleVersion % 1 === 0 ? moduleVersion.toFixed(1) : moduleVersion.toString();
    const moduleConstructors = getModuleConstructors(moduleName, versionString);

    if (moduleAlias !== "") {
      constructors[moduleAlias] = mergeObjects(constructors[moduleAlias], moduleConstructors);
    } else {
      constructors = mergeObjects(constructors, moduleConstructors);
    }
  }
  self.importContextId = importContextIds++;
  perImportContextConstructors[self.importContextId] = constructors;
  QmlWeb.constructors = constructors; // TODO: why do we need this?
}

/**
 * QML Object constructor.
 * @param {Object} meta Meta information about the object and the creation
 *                      context
 * @return {Object} New qml object
 */
function construct(meta) {
  let item;

  let constructors = perImportContextConstructors[meta.context.importContextId];

  const classComponents = meta.object.$class.split(".");
  for (let ci = 0; ci < classComponents.length; ++ci) {
    const c = classComponents[ci];
    constructors = constructors[c];
    if (constructors === undefined) {
      break;
    }
  }

  if (constructors !== undefined) {
    const constructor = constructors;
    meta.super = constructor;
    item = new constructor(meta);
    meta.super = undefined;
  } else {
    // Load component from file. Please look at import.js for main notes.
    // Actually, we have to use that order:
    // 1) try to load component from current basePath
    // 2) from importPathList
    // 3) from directories in imports statements and then
    // 4) from qmldir files
    // Currently we support only 1,2 and 4 and use order: 4,1,2
    // TODO: engine.qmldirs is global for all loaded components.
    //       That's not qml's original behaviour.
    const qdirInfo = QmlWeb.engine.qmldirs[meta.object.$class];
    // Are we have info on that component in some imported qmldir files?

    /* This will also be set in applyProperties, but needs to be set here
     * for Qt.createComponent to have the correct context. */
    QmlWeb.executionContext = meta.context;

    let filePath;
    if (qdirInfo) {
      filePath = qdirInfo.url;
    } else if (classComponents.length === 2) {
      const qualified = QmlWeb.engine.qualifiedImportPath(meta.context.importContextId, classComponents[0]);
      filePath = `${qualified}${classComponents[1]}.qml`;
    } else {
      filePath = `${classComponents[0]}.qml`;
    }

    const component = QmlWeb.Qt.createComponent(filePath);

    if (!component) {
      throw new Error(`No constructor found for ${meta.object.$class}`);
    }

    item = component.$createObject(meta.parent);
    if (typeof item.dom !== "undefined") {
      item.dom.className += ` ${classComponents[classComponents.length - 1]}`;
      if (meta.object.id) {
        item.dom.className += `  ${meta.object.id}`;
      }
    }
    // Handle default properties
  }

  // id
  if (meta.object.id) {
    QmlWeb.setupGetterSetter(meta.context, meta.object.id, () => item, () => {});
  }

  // keep path in item for probale use it later in Qt.resolvedUrl
  item.$context.$basePath = QmlWeb.engine.$basePath; //gut

  // We want to use the item's scope, but this Component's imports
  item.$context.importContextId = meta.context.importContextId;

  // Apply properties (Bindings won't get evaluated, yet)
  QmlWeb.applyProperties(meta.object, item, item, item.$context);

  return item;
}

QmlWeb.modules = modules;
QmlWeb.registerGlobalQmlType = registerGlobalQmlType;
QmlWeb.registerQmlType = registerQmlType;
QmlWeb.getConstructor = getConstructor;
QmlWeb.loadImports = loadImports;
QmlWeb.construct = construct;

/**
 * Create property getters and setters for object.
 * @param {Object} obj Object for which gsetters will be set
 * @param {String} propName Property name
 * @param {Object} [options] Options that allow finetuning of the property
 */
function createProperty(type, obj, propName, options = {}) {
  const QMLProperty = QmlWeb.QMLProperty;
  const prop = new QMLProperty(type, obj, propName);
  obj[`${propName}Changed`] = prop.changed;
  obj.$properties[propName] = prop;
  obj.$properties[propName].set(options.initialValue, QMLProperty.ReasonInit);

  const getter = () => obj.$properties[propName].get();
  let setter;
  if (options.readOnly) {
    setter = function (newVal) {
      if (!obj.$canEditReadOnlyProperties) {
        throw new Error(`property '${propName}' has read only access`);
      }
      obj.$properties[propName].set(newVal, QMLProperty.ReasonUser);
    };
  } else {
    setter = function (newVal) {
      obj.$properties[propName].set(newVal, QMLProperty.ReasonUser);
    };
  }
  QmlWeb.setupGetterSetter(obj, propName, getter, setter);
  if (obj.$isComponentRoot) {
    let skip = false;
    if (options.noContextOverride) {
      // Don't override context properties if options.noContextOverride is on
      const descr = Object.getOwnPropertyDescriptor(obj.$context, propName);
      skip = descr && (descr.get || descr.set);
    }
    if (!skip) {
      QmlWeb.setupGetterSetter(obj.$context, propName, getter, setter);
    }
  }
}

/**
 * Create property getters and setters for object.
 * @param {Object} obj Object for which gsetters will be set
 * @param {Object} properties An object containing properties descriptors
 */
function createProperties(obj, properties) {
  Object.keys(properties).forEach(name => {
    let desc = properties[name];
    if (typeof desc === "string") {
      desc = { type: desc };
    }
    createProperty(desc.type, obj, name, desc);
  });
}

/**
 * Apply properties from metaObject to item.
 * @param {Object} metaObject Source of properties
 * @param {Object} item Target of property apply
 * @param {Object} objectScope Scope in which properties should be evaluated
 * @param {Object} componentScope Component scope in which properties should be
 *                 evaluated
 */
function applyProperties(metaObject, item, objectScopeIn, componentScope) {
  const QMLProperty = QmlWeb.QMLProperty;
  const objectScope = objectScopeIn || item;
  QmlWeb.executionContext = componentScope;

  const children = metaObject.$children;
  if (children && children.length > 0) {
    if (item.$defaultProperty) {
      // TODO: detect based on property type, not children count?
      const value = children.length === 1 ? children[0] : children;
      item.$properties[item.$defaultProperty].set(value, QMLProperty.ReasonInit, objectScope, componentScope);
    } else {
      throw new Error("Cannot assign to unexistant default property");
    }
  }
  // We purposefully set the default property AFTER using it, in order to only
  // have it applied for instanciations of this component, but not for its
  // internal children
  if (metaObject.$defaultProperty) {
    item.$defaultProperty = metaObject.$defaultProperty;
  }

  for (const i in metaObject) {
    const value = metaObject[i];
    if (i === "id" || i === "$class") {
      // keep them
      item[i] = value;
      continue;
    }

    // skip global id's and internal values
    if (i === "id" || i[0] === "$") {
      // TODO: what? See above.
      continue;
    }

    // slots
    if (i.indexOf("on") === 0 && i.length > 2 && /[A-Z]/.test(i[2])) {
      const signalName = i[2].toLowerCase() + i.slice(3);
      if (connectSignal(item, signalName, value, objectScope, componentScope)) {
        continue;
      }
      if (item.$setCustomSlot) {
        item.$setCustomSlot(signalName, value, objectScope, componentScope);
        continue;
      }
    }

    if (value instanceof Object) {
      if (applyProperty(item, i, value, objectScope, componentScope)) {
        continue;
      }
    }

    if (item.$properties && i in item.$properties) {
      item.$properties[i].set(value, QMLProperty.ReasonInit, objectScope, componentScope);
    } else if (i in item) {
      item[i] = value;
    } else if (item.$setCustomData) {
      item.$setCustomData(i, value);
    } else {
      console.warn(`Cannot assign to non-existent property "${i}". Ignoring assignment.`);
    }
  }
}

function applyProperty(item, i, value, objectScope, componentScope) {
  const QMLProperty = QmlWeb.QMLProperty;

  if (value instanceof QmlWeb.QMLSignalDefinition) {
    item.$Signals[i] = QmlWeb.Signal.signal(value.parameters);
    if (!(i in item)) {
      item[i] = item.$Signals[i];
      if (item.$isComponentRoot) {
        componentScope[i] = item[i];
      }
    }
    return true;
  }

  if (value instanceof QmlWeb.QMLMethod) {
    value.compile();
    item[i] = value.eval(objectScope, componentScope, componentScope.$basePath);
    if (item.$isComponentRoot) {
      componentScope[i] = item[i];
    }
    return true;
  }

  if (value instanceof QmlWeb.QMLAliasDefinition) {
    // TODO
    // 1. Alias must be able to point to prop or id of local object,
    //    eg: property alias q: t
    // 2. Alias may have same name as id it points to: property alias
    //    someid: someid
    // 3. Alias proxy (or property proxy) to proxy prop access to selected
    //    incapsulated object. (think twice).
    createProperty("alias", item, i, { noContextOverride: true });
    item.$properties[i].componentScope = componentScope;
    item.$properties[i].componentScopeBasePath = componentScope.$basePath;
    item.$properties[i].val = value;
    item.$properties[i].get = function () {
      const obj = this.componentScope[this.val.objectName];
      const propertyName = this.val.propertyName;
      return propertyName ? obj.$properties[propertyName].get() : obj;
    };
    item.$properties[i].set = function (newVal, reason, _objectScope, _componentScope) {
      if (!this.val.propertyName) {
        throw new Error("Cannot set alias property pointing to an QML object.");
      }
      const obj = this.componentScope[this.val.objectName];
      const prop = obj.$properties[this.val.propertyName];
      prop.set(newVal, reason, _objectScope, _componentScope);
    };

    if (value.propertyName) {
      const con = prop => {
        const obj = prop.componentScope[prop.val.objectName];
        if (!obj) {
          console.error("qtcore: target object ", prop.val.objectName, " not found for alias ", prop);
          return;
        }
        const targetProp = obj.$properties[prop.val.propertyName];
        if (!targetProp) {
          console.error("qtcore: target property [", prop.val.objectName, "].", prop.val.propertyName, " not found for alias ", prop.name);
          return;
        }
        // targetProp.changed.connect( prop.changed );
        // it is not sufficient to connect to `changed` of source property
        // we have to propagate own changed to it too
        // seems the best way to do this is to make them identical?..
        // prop.changed = targetProp.changed;
        // obj[`${i}Changed`] = prop.changed;
        // no. because those object might be destroyed later.
        let loopWatchdog = false;
        targetProp.changed.connect(item, (...args) => {
          if (loopWatchdog) return;
          loopWatchdog = true;
          prop.changed.apply(item, args);
          loopWatchdog = false;
        });
        prop.changed.connect(obj, (...args) => {
          if (loopWatchdog) return;
          loopWatchdog = true;
          targetProp.changed.apply(obj, args);
          loopWatchdog = false;
        });
      };
      QmlWeb.engine.pendingOperations.push([con, item.$properties[i]]);
    }
    return true;
  }

  if (value instanceof QmlWeb.QMLPropertyDefinition) {
    createProperty(value.type, item, i);
    item.$properties[i].set(value.value, QMLProperty.ReasonInit, objectScope, componentScope);
    return true;
  }

  if (item[i] && value instanceof QmlWeb.QMLMetaPropertyGroup) {
    // Apply properties one by one, otherwise apply at once
    applyProperties(value, item[i], objectScope, componentScope);
    return true;
  }

  return false;
}

function connectSignal(item, signalName, value, objectScope, componentScope) {
  const signal = item.$Signals && item.$Signals[signalName] || item[signalName];
  if (!signal) {
    console.warn(`No signal called ${signalName} found!`);
    return undefined;
  } else if (typeof signal.connect !== "function") {
    console.warn(`${signalName} is not a signal!`);
    return undefined;
  }

  if (!value.compiled) {
    const params = [];
    for (const j in signal.parameters) {
      params.push(signal.parameters[j].name);
    }
    // Wrap value.src in IIFE in case it includes a "return"
    value.src = `(
      function(${params.join(", ")}) {
        QmlWeb.executionContext = __executionContext;
        const bp = QmlWeb.engine.$basePath;
        QmlWeb.engine.$basePath = "${componentScope.$basePath}";
        try {
          (function() {
            ${value.src}
          })();
        } finally {
          QmlWeb.engine.$basePath = bp;
        }
      }
    )`;
    value.isFunction = false;
    value.compile();
  }
  // Don't pass in __basePath argument, as QMLEngine.$basePath is set in the
  // value.src, as we need it set at the time the slot is called.
  const slot = value.eval(objectScope, componentScope);
  signal.connect(item, slot);
  return slot;
}

QmlWeb.createProperty = createProperty;
QmlWeb.createProperties = createProperties;
QmlWeb.applyProperties = applyProperties;
QmlWeb.connectSignal = connectSignal;

/* @license

MIT License

Copyright (c) 2011 Lauri Paimen <lauri@paimen.info>
Copyright (c) 2013 Anton Kreuzkamp <akreuzkamp@web.de>
Copyright (c) 2016 QmlWeb contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class QMLMethod extends QmlWeb.QMLBinding {}

/**
 * Create an object representing a QML property definition.
 * @param {String} type The type of the property
 * @param {Array} value The default value of the property
 * @return {Object} Object representing the defintion
 */
class QMLPropertyDefinition {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

class QMLAliasDefinition {
  constructor(objName, propName) {
    this.objectName = objName;
    this.propertyName = propName;
  }
}

/**
 * Create an object representing a QML signal definition.
 * @param {Array} params The parameters the signal ships
 * @return {Object} Object representing the defintion
 */
class QMLSignalDefinition {
  constructor(params) {
    this.parameters = params;
  }
}

/**
 * Create an object representing a group of QML properties (like anchors).
 * @return {Object} Object representing the group
 */
class QMLMetaPropertyGroup {}

/**
 * Create an object representing a QML element.
 * @param {String} type Type of the element
 * @param {String} onProp Name of the property specified with the "on" keyword
 */
class QMLMetaElement {
  constructor(type, onProp) {
    this.$class = type;
    this.$children = [];
    this.$on = onProp;
  }
}

// Convert parser tree to the format understood by engine
function convertToEngine(tree) {
  const type = tree[0];
  const walker = convertToEngine.walkers[type];
  if (!walker) {
    console.log(`No walker for ${type}`);
    return undefined;
  }
  return walker(...tree.slice(1));
}

convertToEngine.stringifyDots = function (elem) {
  let sub = elem;
  const path = [];
  while (sub[0] === "dot") {
    path.push(sub[1]);
    sub = sub[2];
  }
  path.push(sub);
  return path.join(".");
};

convertToEngine.applyProp = function (item, name, val) {
  let curr = item; // output structure
  let sub = name; // input structure
  while (sub[0] === "dot") {
    if (!curr[sub[1]]) {
      curr[sub[1]] = new QMLMetaPropertyGroup();
    }
    curr = curr[sub[1]];
    sub = sub[2];
  }
  curr[sub] = val;
};

convertToEngine.walkers = {
  toplevel: (imports, statement) => {
    const item = { $class: "Component" };
    item.$imports = imports;
    item.$children = [convertToEngine(statement)];
    return item;
  },
  qmlelem: (elem, onProp, statements) => {
    const item = new QMLMetaElement(convertToEngine.stringifyDots(elem), onProp);

    for (const i in statements) {
      const statement = statements[i];
      const name = statement[1];
      const val = convertToEngine(statement);
      switch (statement[0]) {
        case "qmldefaultprop":
          item.$defaultProperty = name;
          item[name] = val;
          break;
        case "qmlprop":
        case "qmlpropdef":
        case "qmlaliasdef":
        case "qmlmethod":
        case "qmlsignaldef":
          convertToEngine.applyProp(item, name, val);
          break;
        case "qmlelem":
          item.$children.push(val);
          break;
        case "qmlobjdef":
          throw new Error("qmlobjdef support was removed, update qmlweb-parser to ^0.3.0.");
        case "qmlobj":
          // Create object to item
          item[name] = item[name] || new QMLMetaPropertyGroup();
          for (const j in val) {
            item[name][j] = val[j];
          }
          break;
        default:
          console.log("Unknown statement", statement);
      }
    }

    return item;
  },
  qmlprop: (name, tree, src) => {
    if (name === "id") {
      // id property
      return tree[1][1];
    }
    return convertToEngine.bindout(tree, src);
  },
  qmlobjdef: (name, property, tree, src) => convertToEngine.bindout(tree, src),
  qmlobj: (elem, statements) => {
    const item = {};
    for (const i in statements) {
      const statement = statements[i];
      const name = statement[1];
      const val = convertToEngine(statement);
      if (statement[0] === "qmlprop") {
        convertToEngine.applyProp(item, name, val);
      }
    }
    return item;
  },
  qmlmethod: (name, tree, src) => new QMLMethod(src),
  qmlpropdef: (name, type, tree, src) => new QMLPropertyDefinition(type, tree ? convertToEngine.bindout(tree, src) : undefined),
  qmlaliasdef: (name, objName, propName) => new QMLAliasDefinition(objName, propName),
  qmlsignaldef: (name, params) => new QMLSignalDefinition(params),
  qmldefaultprop: tree => convertToEngine(tree),
  name: src => {
    if (src === "true" || src === "false") {
      return src === "true";
    } else if (typeof src === "boolean") {
      // TODO: is this needed? kept for compat with ==
      return src;
    }
    return new QmlWeb.QMLBinding(src, ["name", src]);
  },
  num: src => +src,
  string: src => String(src),
  array: (tree, src) => {
    const a = [];
    let isList = false;
    let hasBinding = false;
    for (const i in tree) {
      const val = convertToEngine.bindout(tree[i]);
      a.push(val);

      if (val instanceof QMLMetaElement) {
        isList = true;
      } else if (val instanceof QmlWeb.QMLBinding) {
        hasBinding = true;
      }
    }

    if (hasBinding) {
      if (isList) {
        throw new TypeError("An array may either contain bindings or Element definitions.");
      }
      return new QmlWeb.QMLBinding(src, tree);
    }

    return a;
  }
};

// Try to bind out tree and return static variable instead of binding
convertToEngine.bindout = function (statement, binding) {
  // We want to process the content of the statement
  // (but still handle the case, we get the content directly)
  const tree = statement[0] === "stat" ? statement[1] : statement;

  const type = tree[0];
  const walker = convertToEngine.walkers[type];
  if (walker) {
    return walker(...tree.slice(1));
  }
  return new QmlWeb.QMLBinding(binding, tree);
};

function loadParser() {
  if (typeof QmlWeb.parse !== "undefined") {
    return;
  }

  console.log("Loading parser...");
  const tags = document.getElementsByTagName("script");
  for (const i in tags) {
    if (tags[i].src && tags[i].src.match(/\/(qt|qmlweb)\./)) {
      const src = tags[i].src.replace(/\/(qt|qmlweb)\.(es201.\.)?/, "/qmlweb.parser.");
      // TODO: rewrite to async loading
      const xhr = new XMLHttpRequest();
      xhr.open("GET", src, false);
      xhr.send(null);
      if (xhr.status !== 200 && xhr.status !== 0) {
        // xhr.status === 0 if accessing with file://
        throw new Error("Could not load QmlWeb parser!");
      }
      new Function(xhr.responseText)();
      return;
    }
  }
}

// Function to parse qml and output tree expected by engine
function parseQML(src, file) {
  loadParser();
  QmlWeb.parse.nowParsingFile = file;
  const parsetree = QmlWeb.parse(src, QmlWeb.parse.QmlDocument);
  return convertToEngine(parsetree);
}

QmlWeb.QMLMethod = QMLMethod;
QmlWeb.QMLPropertyDefinition = QMLPropertyDefinition;
QmlWeb.QMLAliasDefinition = QMLAliasDefinition;
QmlWeb.QMLSignalDefinition = QMLSignalDefinition;
QmlWeb.QMLMetaPropertyGroup = QMLMetaPropertyGroup;
QmlWeb.QMLMetaElement = QMLMetaElement;
QmlWeb.convertToEngine = convertToEngine;
QmlWeb.loadParser = loadParser;
QmlWeb.parseQML = parseQML;

/*

QmlWeb.qrc is analogous to the Qt Resource System. It is expected to map a path
within the resource system to the following pieces of data:

1) For a QML Component, it is the return value of QmlWeb.parse
2) For a JavaScript file, it is the return value of QmlWeb.jsparse
2) For an image, it is any URL that an <img> tag can accept (e.g. a standard
   URL to an image resource, or a "data:" URI). If there is no entry for a
   given qrc image path, it will fall back to passing the path right through to
   the DOM. This is mainly a convenience until support for images is added to
   gulp-qmlweb.

The "data-qml" tag on <body> can be set to a "qrc://" URL like
"qrc:///root.qml" to use a pre-parsed "/root.qml" from QmlWeb.qrc.

Since relative URLs are resolved relative to the URL of the containing
component, any relative URL set within a file in the resource system will also
resolve within the resource system. To access a Component, JavaScript or image
file that is stored outside of the resources system from within the resource
system, a full URL must be used (e.g. "http://www.example.com/images/foo.png").

Vice-versa, in order to access a Component, JavaScript or image file that is
stored within the resource system from outside of the resource system, a full
"qrc://" URL must be used (e.g. "qrc:///images/foo.png").

More details here: http://doc.qt.io/qt-5/qml-url.html

*/
QmlWeb.qrc = {};

QmlWeb.screenshot = function (div, options) {
  const rect = div.getBoundingClientRect();
  const offset = {
    width: div.offsetWidth,
    height: div.offsetHeight,
    top: rect.top,
    left: rect.left
  };
  for (let win = window; win !== window.top; win = win.parent) {
    const rectframe = win.frameElement.getBoundingClientRect();
    offset.top += rectframe.top;
    offset.left += rectframe.left;
  }
  const fileName = options && options.fileName || undefined;

  let image;
  if (window.top.chromeScreenshot) {
    image = document.createElement("img");
    window.top.chromeScreenshot({ offset, fileName }).then(base64 => {
      image.src = `data:image/png;base64,${base64}`;
    });
  } else if (window.top.callPhantom) {
    const base64 = window.top.callPhantom("render", { offset, fileName });
    image = document.createElement("img");
    image.src = `data:image/png;base64,${base64}`;
  } else {
    throw new Error("Screenshots are not supported on this platform");
  }
  return image;
};

QmlWeb.image2canvas = function (img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.height = img.height;
  canvas.width = img.width;
  ctx.drawImage(img, 0, 0);
  return { canvas, ctx };
};

QmlWeb.image2dataUrl = function (img) {
  const { canvas } = QmlWeb.image2canvas(img);
  return canvas.toDataURL("image/png", 1);
};

QmlWeb.image2pixels = function (img) {
  const { ctx } = QmlWeb.image2canvas(img);
  return ctx.getImageData(0, 0, img.width, img.height).data;
};

QmlWeb.imagesEqual = function (a, b) {
  if (a.width !== b.width || a.height !== b.height) {
    return false;
  }
  return QmlWeb.image2dataUrl(a) === QmlWeb.image2dataUrl(b);
};

// Base object for all qml elements
class QtQml_QtObject extends QmlWeb.QObject {

  constructor(meta) {
    super(meta.parent);

    this.$Signals = {};
    this.$isComponentRoot = meta.isComponentRoot;
    this.$context = meta.context;

    // Component get own properties
    this.$attributes = [];
    for (const key in meta.object) {
      if (!meta.object.hasOwnProperty(key) || !meta.object[key]) {
        continue;
      }
      const name = meta.object[key].__proto__.constructor.name;
      if (name === "QMLPropertyDefinition" || name === "QMLAliasDefinition") {
        this.$attributes.push(key);
      }
    }

    const Signal = QmlWeb.Signal;

    this.Keys = new QmlWeb.QObject(this);
    this.Keys.asteriskPresed = Signal.signal();
    this.Keys.backPressed = Signal.signal();
    this.Keys.backtabPressed = Signal.signal();
    this.Keys.callPressed = Signal.signal();
    this.Keys.cancelPressed = Signal.signal();
    this.Keys.deletePressed = Signal.signal();
    for (let i = 0; i < 10; ++i) {
      this.Keys[`digit${i}Pressed`] = Signal.signal();
    }
    this.Keys.escapePressed = Signal.signal();
    this.Keys.flipPressed = Signal.signal();
    this.Keys.hangupPressed = Signal.signal();
    this.Keys.leftPressed = Signal.signal();
    this.Keys.menuPressed = Signal.signal();
    this.Keys.noPressed = Signal.signal();
    this.Keys.pressed = Signal.signal();
    this.Keys.released = Signal.signal();
    this.Keys.returnPressed = Signal.signal();
    this.Keys.rightPressed = Signal.signal();
    this.Keys.selectPressed = Signal.signal();
    this.Keys.spacePressed = Signal.signal();
    this.Keys.tabPressed = Signal.signal();
    this.Keys.upPressed = Signal.signal();
    this.Keys.volumeDownPressed = Signal.signal();
    this.Keys.volumeUpPressed = Signal.signal();
    this.Keys.yesPressed = Signal.signal();

    // Initialize properties, signals, etc.
    const types = [];
    let type = meta.super;
    while (type) {
      types.unshift(type);
      type = Object.getPrototypeOf(type);
    }
    types.forEach(entry => {
      if (!entry.hasOwnProperty("$qmlTypeInfo")) return;
      const info = entry.$qmlTypeInfo || {};

      Object.keys(info.enums).forEach(name => {
        // TODO: not exported to the whole file scope yet
        this[name] = info.enums[name];

        if (!global[name]) {
          global[name] = this[name]; // HACK
        }
      });

      QmlWeb.createProperties(this, info.properties);

      Object.keys(info.signals).forEach(name => {
        const params = info.signals[name];
        this.$Signals[name] = QmlWeb.Signal.signal(params);
        if (!(name in this)) this[name] = this.$Signals[name];
      });

      if (info.defaultProperty) {
        this.$defaultProperty = info.defaultProperty;
      }
    });
    meta.initialized = true;
  }
  getAttributes() {
    return this.$attributes;
  }
}
QmlWeb.registerQmlType(QtQml_QtObject);

// eslint-disable-next-line no-undef
class QtBluetooth_BluetoothDiscoveryModel extends QtQml_QtObject {}
QtBluetooth_BluetoothDiscoveryModel.enums = {
  BluetoothDiscoveryModel: {
    FullServiceDiscovery: 1, MinimalServiceDiscovery: 0, DeviceDiscovery: 2,
    NoError: 0, InputOutputError: 1, PoweredOffError: 2,
    InvalidBluetoothAdapterError: 4, UnknownError: 3
  }
};
QtBluetooth_BluetoothDiscoveryModel.properties = {
  discoveryMode: { type: "enum", initialValue: 3 }, // MinimalServiceDiscovery
  error: { type: "enum", initialValue: 0 }, // NoError
  remoteAddress: "string",
  running: "bool",
  uuidFilter: "string",
  url: "url"
};
QtBluetooth_BluetoothDiscoveryModel.signals = {
  deviceDiscovered: [{ type: "string", name: "device" }],
  serviceDiscovered: [{ type: "string", name: "device" }]
};
QmlWeb.registerQmlType(QtBluetooth_BluetoothDiscoveryModel);

// eslint-disable-next-line no-undef
class QtMultimedia_Audio extends QtQml_QtObject {

  pause() {
    // TODO
  }
  play() {
    // TODO
  }
  seek() /* offset */{
    // TODO
  }
  stop() {
    // TODO
  }
  supportedAudioRoles() {
    // TODO
  }
}
QtMultimedia_Audio.versions = /^5\./;
QtMultimedia_Audio.enums = {
  Audio: {
    Available: 0, Busy: 2, Unavailable: 1, ResourceMissing: 3,

    NoError: 0, ResourceError: 1, FormatError: 2, NetworkError: 4,
    AccessDenied: 8, ServiceMissing: 16,

    StoppedState: 0, PlayingState: 1, PausedState: 2,

    NoMedia: 0, Loading: 1, Loaded: 2, Buffering: 4, Stalled: 8,
    EndOfMedia: 16, InvalidMedia: 32, UnknownStatus: 64
  }
};
QtMultimedia_Audio.properties = {
  audioRole: "enum", // TODO
  autoLoad: { type: "bool", initialValue: true },
  autoPlay: "bool",
  availability: "enum", // Audio.Available
  duration: "int",
  error: "enum", // Audio.NoError
  errorString: "string",
  hasAudio: "bool",
  hasVideo: "bool",
  loops: { type: "int", initialValue: 1 },
  mediaObject: "var",
  // TODO: metaData
  muted: "bool",
  playbackRate: { type: "real", initialValue: 1 },
  playbackState: "enum", // Audio.StoppedState
  playlinst: "Playlist",
  position: "int",
  seekable: "bool",
  source: "url",
  status: "enum", // Audio.NoMedia
  volume: { type: "real", initialValue: 1 }
};
QtMultimedia_Audio.signals = {
  error: [{ type: "enum", name: "error" }, { type: "string", name: "errorString" }],
  paused: [],
  playing: [],
  stopped: []
};
QmlWeb.registerQmlType(QtMultimedia_Audio);

// eslint-disable-next-line no-undef
class QtMultimedia_Camera extends QtQml_QtObject {}
QtMultimedia_Camera.versions = /^5\./;
QtMultimedia_Camera.enums = {
  Camera: {
    Available: 0, Busy: 2, Unavailable: 1, ResourceMissing: 3,

    UnloadedState: 0, LoadedState: 1, ActiveState: 2
  }
};
QtMultimedia_Camera.properties = {
  availability: "enum", // Camera.Available
  cameraState: { type: "enum", initialValue: 2 }, // Camera.ActiveState
  cameraStatus: "enum", // TODO
  captureMode: "enum", // TODO
  deviceId: "string",
  digitalZoom: { type: "real", initialValue: 1 },
  displayName: "string",
  errorCode: "enum", // TODO
  errorString: "string",
  lockStatus: "enum", // TODO
  maximumDigitalZoom: "real",
  maximumOpticalZoom: "real",
  opticalZoom: { type: "real", initialValue: 1 },
  orientation: "int",
  position: "enum" // TODO
};
QtMultimedia_Camera.signals = {
  error: [{ type: "enum", name: "errorCode" }, { type: "string", name: "errorString" }]
};
QmlWeb.registerQmlType(QtMultimedia_Camera);

// eslint-disable-next-line no-undef
class QtMultimedia_MediaPlayer extends QtQml_QtObject {}
QtMultimedia_MediaPlayer.versions = /^5\./;
QtMultimedia_MediaPlayer.enums = {
  MediaPlayer: {
    Available: 0, Busy: 2, Unavailable: 1, ResourceMissing: 3,

    NoError: 0, ResourceError: 1, FormatError: 2, NetworkError: 4,
    AccessDenied: 8, ServiceMissing: 16,

    StoppedState: 0, PlayingState: 1, PausedState: 2,

    NoMedia: 0, Loading: 1, Loaded: 2, Buffering: 4, Stalled: 8,
    EndOfMedia: 16, InvalidMedia: 32, UnknownStatus: 64
  }
};
QtMultimedia_MediaPlayer.properties = {
  audioRole: "enum", // TODO
  autoLoad: { type: "bool", initialValue: true },
  autoPlay: "bool",
  availability: "enum", // MediaPlayer.Available
  bufferProgress: "real",
  duration: "int",
  error: "enum", // MediaPlayer.NoError
  errorString: "string",
  hasAudio: "bool",
  hasVideo: "bool",
  loops: "int",
  muted: "bool",
  playbackRate: { type: "real", initialValue: 1 },
  playbackState: "enum", // MediaPlayer.StoppedState
  position: "int",
  seekable: "bool",
  source: "url",
  status: "enum", // MediaPlayer.NoMedia
  volume: "real"
};
QtMultimedia_MediaPlayer.signals = {
  error: [{ type: "enum", name: "error" }, { type: "string", name: "errorString" }],
  paused: [],
  playing: [],
  stopped: []
};
QmlWeb.registerQmlType(QtMultimedia_MediaPlayer);

// eslint-disable-next-line no-undef
class QtNfc_NearField extends QtQml_QtObject {}
QtNfc_NearField.properties = {
  filter: "list",
  messageRecords: "list",
  orderMatch: "bool",
  polling: "bool"
};
QtNfc_NearField.signals = {
  tagFound: [],
  tagRemoved: []
};
QmlWeb.registerQmlType(QtNfc_NearField);

// eslint-disable-next-line no-undef
class QtQml_Binding extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.$property = undefined;

    this.valueChanged.connect(this, this.$onValueChanged);
    this.targetChanged.connect(this, this.$updateBinding);
    this.propertyChanged.connect(this, this.$updateBinding);
    this.whenChanged.connect(this, this.$updateBinding);
  }

  $updateBinding() {
    if (!this.when || !this.target || !this.target.hasOwnProperty(this.property) || this.value === undefined) {
      this.$property = undefined;
      return;
    }
    this.$property = this.target.$properties[this.property];
    this.$onValueChanged(this.value); // trigger value update
  }

  $onValueChanged(value) {
    if (value !== undefined && this.$property) {
      this.$property.set(value);
    }
  }
}
QtQml_Binding.properties = {
  target: { type: "QtObject", initialValue: null },
  property: { type: "string", initialValue: "" },
  value: { type: "var", initialValue: undefined },
  when: { type: "bool", initialValue: true }
};
QmlWeb.registerQmlType(QtQml_Binding);

class QMLContext {
  nameForObject(obj) {
    for (const name in this) {
      if (this[name] === obj) {
        return name;
      }
    }
    return undefined;
  }
}

// eslint-disable-next-line no-undef
class QtQml_Component extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    if (QmlWeb.constructors[meta.object.$class] === QtQml_Component) {
      this.$metaObject = meta.object.$children[0];
    } else {
      this.$metaObject = meta.object;
    }
    this.$context = meta.context;

    this.$jsImports = [];

    if (meta.object.$imports instanceof Array) {
      const moduleImports = [];
      const loadImport = importDesc => {
        if (/\.js$/.test(importDesc[1])) {
          this.$jsImports.push(importDesc);
        } else {
          moduleImports.push(importDesc);
        }
      };

      for (let i = 0; i < meta.object.$imports.length; ++i) {
        loadImport(meta.object.$imports[i]);
      }
      QmlWeb.loadImports(this, moduleImports);
    }

    /* If this Component does not have any imports, it is likely one that was
     * created within another Component file. It should inherit the
     * importContextId of the Component file it was created within. */
    if (this.importContextId === undefined) {
      this.importContextId = meta.context.importContextId;
    }
  }
  finalizeImports($context) {
    const engine = QmlWeb.engine;
    for (let i = 0; i < this.$jsImports.length; ++i) {
      const importDesc = this.$jsImports[i];
      const js = engine.loadJS(engine.$resolvePath(importDesc[1]));

      if (!js) {
        console.log("Component.finalizeImports: failed to import JavaScript", importDesc[1]);
        continue;
      }

      if (importDesc[3] !== "") {
        $context[importDesc[3]] = {};
        QmlWeb.importJavascriptInContext(js, $context[importDesc[3]]);
      } else {
        QmlWeb.importJavascriptInContext(js, $context);
      }
    }
  }
  $createObject(parent, properties = {}, context = this.$context) {
    const engine = QmlWeb.engine;
    const oldState = engine.operationState;
    engine.operationState = QmlWeb.QMLOperationState.Init;
    // change base path to current component base path
    const bp = engine.$basePath;
    engine.$basePath = this.$basePath ? this.$basePath : engine.$basePath;

    const newContext = context ? Object.create(context) : new QMLContext();

    if (this.importContextId !== undefined) {
      newContext.importContextId = this.importContextId;
    }

    const item = QmlWeb.construct({
      object: this.$metaObject,
      parent,
      context: newContext,
      isComponentRoot: true
    });

    this.finalizeImports(item.$context);

    Object.keys(properties).forEach(propname => {
      item[propname] = properties.propname;
    });

    // change base path back
    // TODO looks a bit hacky
    engine.$basePath = bp;

    engine.operationState = oldState;
    return item;
  }
  createObject(parent, properties = {}) {
    const item = this.$createObject(parent, properties);
    const QMLItem = QmlWeb.getConstructor("QtQuick", "2.0", "Item");

    if (item instanceof QMLItem) {
      item.$properties.parent.set(parent, QmlWeb.QMLProperty.ReasonInit);
    }

    return item;
  }
  static getAttachedObject() {
    // see QMLEngine.js for explanation how it is used.
    if (!this.$Component) {
      this.$Component = new QmlWeb.QObject(this);
      this.$Component.completed = QmlWeb.Signal.signal([]);
      QmlWeb.engine.completedSignals.push(this.$Component.completed);

      this.$Component.destruction = QmlWeb.Signal.signal([]);
    }
    return this.$Component;
  }
}
QtQml_Component.global = true;
QmlWeb.registerQmlType(QtQml_Component);

// eslint-disable-next-line no-undef
class QtQml_Connections extends QtQml_QtObject {

  constructor(meta) {
    super(meta);
    this.target = this.$parent;
    this.$connections = {};

    this.$old_target = this.target;
    this.targetChanged.connect(this, this.$onTargetChanged);
    this.Component.completed.connect(this, this.Component$onCompleted);
  }
  $onTargetChanged() {
    this.$reconnectTarget();
  }
  Component$onCompleted() {
    this.$reconnectTarget();
  }
  $reconnectTarget() {
    const old_target = this.$old_target;
    for (const i in this.$connections) {
      const c = this.$connections[i];
      if (c._currentConnection && old_target && old_target[i] && typeof old_target[i].disconnect === "function") {
        old_target[i].disconnect(c._currentConnection);
      }
      if (this.target) {
        c._currentConnection = QmlWeb.connectSignal(this.target, i, c.value, c.objectScope, c.componentScope);
      }
    }
    this.$old_target = this.target;
  }
  $setCustomSlot(propName, value, objectScope, componentScope) {
    this.$connections[propName] = { value, objectScope, componentScope };
  }
}
QtQml_Connections.properties = {
  target: "QtObject",
  ignoreUnknownSignals: "bool"
};
QmlWeb.registerQmlType(QtQml_Connections);

// eslint-disable-next-line no-undef
class QtQml_Timer extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.$properties.parent.set(this.$parent, QmlWeb.QMLProperty.ReasonInit);

    /* This ensures that if the user toggles the "running" property manually,
     * the timer will trigger. */
    this.runningChanged.connect(this, this.$onRunningChanged);

    QmlWeb.engine.$addTicker((...args) => this.$ticker(...args));

    QmlWeb.engine.$registerStart(() => {
      if (this.running) {
        this.restart();
      }
    });

    QmlWeb.engine.$registerStop(() => this.stop());
  }
  start() {
    this.running = true;
  }
  stop() {
    this.running = false;
  }
  restart() {
    this.stop();
    this.start();
  }
  $ticker(now) {
    if (!this.running) return;
    if (now - this.$prevTrigger >= this.interval) {
      this.$prevTrigger = now;
      this.$trigger();
    }
  }
  $onRunningChanged() {
    if (this.running) {
      this.$prevTrigger = Date.now();
      if (this.triggeredOnStart) {
        this.$trigger();
      }
    }
  }
  $trigger() {
    if (!this.repeat) {
      // We set the value directly in order to be able to emit the
      // runningChanged signal after triggered, like Qt does it.
      this.$properties.running.val = false;
    }

    // Trigger this.
    this.triggered();

    if (!this.repeat) {
      // Emit changed signal manually after setting the value manually above.
      this.runningChanged();
    }
  }
}
QtQml_Timer.properties = {
  interval: { type: "int", initialValue: 1000 },
  parent: { type: "QtObject", readOnly: true },
  repeat: "bool",
  running: "bool",
  triggeredOnStart: "bool"
};
QtQml_Timer.signals = {
  triggered: []
};
QmlWeb.registerQmlType(QtQml_Timer);

// eslint-disable-next-line no-undef
class QtQuick_Layouts_Layout extends QtQml_QtObject {

  constructor(meta) {
    super(meta);
    throw new Error("Do not create objects of type Layout");
  }
  static getAttachedObject() {
    if (!this.$Layout) {
      this.$Layout = new QmlWeb.QObject(this);
      QmlWeb.createProperties(this.$Layout, {
        alignment: "enum",
        bottomMargin: "real",
        column: "int",
        columnSpan: "int",
        fillHeight: "bool",
        fillWidth: "bool",
        leftMargin: "real",
        margins: "real",
        maximumHeight: "real",
        maximumWidth: "real",
        minimumHeight: "real",
        minimumWidth: "real",
        preferredHeight: "real",
        preferredWidth: "real",
        rightMargin: "real",
        row: "int",
        rowSpan: "int",
        topMargin: "real"
      });
    }
    return this.$Layout;
  }
}
QtQuick_Layouts_Layout.versions = /^1\./;
QmlWeb.registerQmlType(QtQuick_Layouts_Layout);

// eslint-disable-next-line no-undef
class QtQuick_Particles_Direction extends QtQml_QtObject {}
QtQuick_Particles_Direction.versions = /^2\./;
QmlWeb.registerQmlType(QtQuick_Particles_Direction);

// eslint-disable-next-line no-undef, max-len
class QtQuick_Particles_AngleDirection extends QtQuick_Particles_Direction {}
QtQuick_Particles_AngleDirection.versions = /^2\./;
QtQuick_Particles_AngleDirection.properties = {
  angle: "real",
  angleVariation: "real",
  magnitude: "real",
  magnitudeVariation: "real"
};
QmlWeb.registerQmlType(QtQuick_Particles_AngleDirection);

// eslint-disable-next-line no-undef
class QtQuick_Window_Screen extends QtQml_QtObject {
  constructor(meta) {
    super(meta);
    throw new Error("Screen can only be used via the attached property.");
  }
  static getAttachedObject() {
    if (!QtQuick_Window_Screen.$Screen) {
      const screen = QtQuick_Window_Screen.$Screen = new QmlWeb.QObject();
      // TODO: read-only
      QmlWeb.createProperties(screen, {
        name: "string",
        orientation: "enum",
        orientationUpdateMask: "enum",
        primaryOrientation: "enum",
        pixelDensity: "real",
        devicePixelRatio: "real",
        desktopAvailableHeight: "int",
        desktopAvailableWidth: "int",
        height: "int",
        width: "int"
      });
      screen.name = window.navigator.appName;
      screen.devicePixelRatio = window.devicePixelRatio;
      screen.pixelDensity = window.devicePixelRatio * 96 / 25.4; // per mm
      QtQuick_Window_Screen.$populateScreen();
      window.addEventListener("resize", () => QtQuick_Window_Screen.$populateScreen());

      // TODO: orientation
      const Qt = QmlWeb.Qt;
      screen.orientationUpdateMask = 0;
      screen.orientation = Qt.PrimaryOrientation;
      screen.primaryOrientation = Qt.PrimaryOrientation;
    }
    return QtQuick_Window_Screen.$Screen;
  }
  static $populateScreen() {
    const screen = QtQuick_Window_Screen.$Screen;
    screen.desktopAvailableHeight = window.outerHeight;
    screen.desktopAvailableWidth = window.outerWidth;
    screen.height = window.innerHeight;
    screen.width = window.innerWidth;
  }
}
QmlWeb.registerQmlType(QtQuick_Window_Screen);

// eslint-disable-next-line no-undef
class QtQuick_Animation extends QtQml_QtObject {

  restart() {
    this.stop();
    this.start();
  }
  start() {
    this.running = true;
  }
  stop() {
    this.running = false;
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }
  complete() {
    // To be overridden
    console.log("Unbound method for", this);
  }
}
QtQuick_Animation.enums = {
  Animation: { Infinite: -1 },
  Easing: QmlWeb.Easing
};
QtQuick_Animation.properties = {
  alwaysRunToEnd: "bool",
  loops: { type: "int", initialValue: 1 },
  paused: "bool",
  running: "bool"
};
QmlWeb.registerQmlType(QtQuick_Animation);

// eslint-disable-next-line no-undef
class QtQuick_Animator extends QtQuick_Animation {

  constructor(meta) {
    super(meta);

    this.easing = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.easing, {
      type: { type: "enum", initialValue: this.Easing.Linear },
      amplitude: { type: "real", initialValue: 1 },
      overshoot: { type: "real", initialValue: 1.70158 },
      period: { type: "real", initialValue: 0.3 },
      bezierCurve: "list"
    });
  }
}
QtQuick_Animator.versions = /^2\./;
QtQuick_Animator.properties = {
  duration: { type: "int", initialValue: 250 },
  from: "real",
  target: "Item",
  to: "real"
};
QmlWeb.registerQmlType(QtQuick_Animator);

// eslint-disable-next-line no-undef
class QtQuick_Behavior extends QtQml_QtObject {

  constructor(meta) {
    super(meta);
    this.$on = meta.object.$on;

    this.animationChanged.connect(this, this.$onAnimationChanged);
    this.enabledChanged.connect(this, this.$onEnabledChanged);
  }
  $onAnimationChanged(newVal) {
    newVal.target = this.$parent;
    newVal.property = this.$on;
    this.$parent.$properties[this.$on].animation = newVal;
  }
  $onEnabledChanged(newVal) {
    this.$parent.$properties[this.$on].animation = newVal ? this.animation : null;
  }
}
QtQuick_Behavior.properties = {
  animation: "Animation",
  enabled: { type: "bool", initialValue: true }
};
QtQuick_Behavior.defaultProperty = "animation";
QmlWeb.registerQmlType(QtQuick_Behavior);

// eslint-disable-next-line no-undef
class QtQuick_FontLoader extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.$lastName = "";
    this.$inTouchName = false;

    /*
      Maximum timeout is the maximum time for a font to load. If font isn't
      loaded in this time, the status is set to Error.
      For both cases (with and without FontLoader.js) if the font takes more
      than the maximum timeout to load, dimensions recalculations for elements
      that are using this font will not be triggered or will have no effect.
       FontLoader.js uses only the last timeout. The state and name properties
      are set immediately when the font loads. If the font could not be loaded,
      the Error status will be set only when this timeout expires. If the font
      loading takes more than the timeout, the name property is set, but the
      status is set to Error.
       Fallback sets the font name immediately and touches it several times to
      trigger dimensions recalcuations. The status is set to Error and should
      not be used.
    */
    // 15 seconds maximum
    this.$timeouts = [20, 50, 100, 300, 500, 1000, 3000, 5000, 10000, 15000];

    this.sourceChanged.connect(this, this.$onSourceChanged);
    this.nameChanged.connect(this, this.$onNameChanged);
  }
  $loadFont(fontName, fontFace) {
    /* global FontLoader */
    if (this.$lastName === fontName || this.$inTouchName) {
      return;
    }
    this.$lastName = fontName;

    if (!fontName) {
      this.status = this.FontLoader.Null;
      return;
    }
    this.status = this.FontLoader.Loading;

    let promise;
    if (fontFace) {
      promise = fontFace.loaded;
    } else if (document.fonts && document.fonts.load) {
      promise = document.fonts.load(fontName);
    }

    if (promise) {
      promise.then(() => {
        if (this.$lastName !== fontName) return;
        this.name = fontName;
        this.status = this.FontLoader.Ready;
      }, () => {
        if (this.$lastName !== fontName) return;
        this.status = this.FontLoader.Error;
      });
    } else if (typeof FontLoader === "function") {
      const fontLoader = new FontLoader([fontName], {
        fontsLoaded: error => {
          if (error !== null) {
            if (this.$lastName === fontName && error.notLoadedFontFamilies[0] === fontName) {
              // Set the name for the case of font loading after the timeout.
              this.name = fontName;
              this.status = this.FontLoader.Error;
            }
          }
        },
        fontLoaded: fontFamily => {
          if (this.$lastName === fontName && fontFamily === fontName) {
            this.name = fontName;
            this.status = this.FontLoader.Ready;
          }
        }
      }, this.$timeouts[this.$timeouts.length - 1]);
      // Else I get problems loading multiple fonts (FontLoader.js bug?)
      FontLoader.testDiv = null;
      fontLoader.loadFonts();
    } else {
      console.warn(`FontLoader.js library is not loaded.
You should load FontLoader.js if you want to use QtQuick FontLoader elements.
Refs: https://github.com/smnh/FontLoader.`);
      // You should not rely on 'status' property without FontLoader.js.
      this.status = this.FontLoader.Error;
      this.name = fontName;
      this.$cycleTouchName(fontName, 0);
    }
  }
  $cycleTouchName(fontName, i) {
    if (this.$lastName !== fontName) {
      return;
    }
    if (i > 0) {
      const name = this.name;
      this.$inTouchName = true;
      // Calling this.nameChanged() is not enough, we have to actually change
      // the value to flush the bindings.
      this.name = "sans-serif";
      this.name = name;
      this.$inTouchName = false;
    }
    if (i < this.$timeouts.length) {
      setTimeout(() => {
        this.$cycleTouchName(fontName, i + 1);
      }, this.$timeouts[i] - (i > 0 ? this.$timeouts[i - 1] : 0));
    }
  }
  $onSourceChanged(font_src) {
    // Load font by source url
    const rand = Math.round(Math.random() * 1e15);
    const fontName = `font_${Date.now().toString(36)}_${rand.toString(36)}`;
    if (typeof FontFace !== "undefined" && document.fonts && document.fonts.add) {
      const fontFace = new FontFace(fontName, `url('${font_src}')`);
      document.fonts.add(fontFace);
      fontFace.load();
      this.$loadFont(fontName, fontFace);
      return;
    }
    if (!this.$domStyle) {
      this.$domStyle = document.createElement("style");
    }
    this.$domStyle.innerHTML = `@font-face {
      font-family: ${fontName};
      src: url('${font_src}');
    }`;
    document.getElementsByTagName("head")[0].appendChild(this.$domStyle);
    this.$loadFont(fontName);
  }
  $onNameChanged(fontName) {
    // Load font by the name
    this.$loadFont(fontName);
  }
}
QtQuick_FontLoader.enums = {
  FontLoader: { Null: 0, Ready: 1, Loading: 2, Error: 3 }
};
QtQuick_FontLoader.properties = {
  name: "string",
  source: "url",
  status: "enum" // FontLoader.Null
};
QmlWeb.registerQmlType(QtQuick_FontLoader);

// eslint-disable-next-line no-undef
class QtQuick_Item extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    if (!this.dom) {
      // Create a dom element for this item.
      this.dom = document.createElement(meta.tagName || "div");
    }
    this.dom.style.position = "absolute";
    this.dom.style.pointerEvents = "none";
    if (meta.style) {
      for (const key in meta.style) {
        if (!meta.style.hasOwnProperty(key)) continue;
        this.dom.style[key] = meta.style[key];
      }
    }

    // In case the class is qualified, only use the last part for the css class
    // name.
    const classComponent = meta.object.$class.split(".").pop();
    this.dom.className = `${classComponent}${this.id ? ` ${this.id}` : ""}`;
    this.css = this.dom.style;
    this.impl = null; // Store the actually drawn element

    this.css.boxSizing = "border-box";

    if (this.$isComponentRoot) {
      QmlWeb.createProperty("var", this, "activeFocus");
    }

    this.parentChanged.connect(this, this.$onParentChanged_);
    this.dataChanged.connect(this, this.$onDataChanged);
    this.stateChanged.connect(this, this.$onStateChanged);
    this.visibleChanged.connect(this, this.$onVisibleChanged_);
    this.clipChanged.connect(this, this.$onClipChanged);
    this.zChanged.connect(this, this.$onZChanged);
    this.xChanged.connect(this, this.$onXChanged);
    this.yChanged.connect(this, this.$onYChanged);
    this.widthChanged.connect(this, this.$onWidthChanged_);
    this.heightChanged.connect(this, this.$onHeightChanged_);
    this.focusChanged.connect(this, this.$onFocusChanged_);

    this.widthChanged.connect(this, this.$updateHGeometry);
    this.heightChanged.connect(this, this.$updateVGeometry);
    this.implicitWidthChanged.connect(this, this.$onImplicitWidthChanged);
    this.implicitHeightChanged.connect(this, this.$onImplicitHeightChanged);

    this.$isUsingImplicitWidth = true;
    this.$isUsingImplicitHeight = true;

    this.anchors = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.anchors, {
      left: "var",
      right: "var",
      top: "var",
      bottom: "var",
      horizontalCenter: "var",
      verticalCenter: "var",
      fill: "Item",
      centerIn: "Item",
      margins: "real",
      leftMargin: "real",
      rightMargin: "real",
      topMargin: "real",
      bottomMargin: "real"
    });
    this.anchors.leftChanged.connect(this, this.$updateHGeometry);
    this.anchors.rightChanged.connect(this, this.$updateHGeometry);
    this.anchors.topChanged.connect(this, this.$updateVGeometry);
    this.anchors.bottomChanged.connect(this, this.$updateVGeometry);
    this.anchors.horizontalCenterChanged.connect(this, this.$updateHGeometry);
    this.anchors.verticalCenterChanged.connect(this, this.$updateVGeometry);
    this.anchors.fillChanged.connect(this, this.$updateHGeometry);
    this.anchors.fillChanged.connect(this, this.$updateVGeometry);
    this.anchors.centerInChanged.connect(this, this.$updateHGeometry);
    this.anchors.centerInChanged.connect(this, this.$updateVGeometry);
    this.anchors.leftMarginChanged.connect(this, this.$updateHGeometry);
    this.anchors.rightMarginChanged.connect(this, this.$updateHGeometry);
    this.anchors.topMarginChanged.connect(this, this.$updateVGeometry);
    this.anchors.bottomMarginChanged.connect(this, this.$updateVGeometry);
    this.anchors.marginsChanged.connect(this, this.$updateHGeometry);
    this.anchors.marginsChanged.connect(this, this.$updateVGeometry);

    // childrenRect property
    this.childrenRect = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.childrenRect, {
      x: "real", // TODO ro
      y: "real", // TODO ro
      width: "real", // TODO ro
      height: "real" // TODO ro
    });

    this.rotationChanged.connect(this, this.$updateTransform);
    this.scaleChanged.connect(this, this.$updateTransform);
    this.transformChanged.connect(this, this.$updateTransform);

    this.Component.completed.connect(this, this.Component$onCompleted_);
    this.opacityChanged.connect(this, this.$calculateOpacity);
    if (this.$parent) {
      this.$parent.$opacityChanged.connect(this, this.$calculateOpacity);
    }

    this.spacing = 0;
    this.$revertActions = [];
    this.css.left = `${this.x}px`;
    this.css.top = `${this.y}px`;
  }
  $onParentChanged_(newParent, oldParent, propName) {
    if (oldParent) {
      oldParent.children.splice(oldParent.children.indexOf(this), 1);
      oldParent.childrenChanged();
      oldParent.dom.removeChild(this.dom);
    }
    if (newParent && newParent.children.indexOf(this) === -1) {
      newParent.children.push(this);
      newParent.childrenChanged();
    }
    if (newParent) {
      newParent.dom.appendChild(this.dom);
    }
    this.$updateHGeometry(newParent, oldParent, propName);
    this.$updateVGeometry(newParent, oldParent, propName);
  }
  $onDataChanged(newData) {
    const QMLItem = QmlWeb.getConstructor("QtQuick", "2.0", "Item");
    for (const i in newData) {
      const child = newData[i];
      if (child instanceof QMLItem) {
        child.parent = this; // This will also add it to children.
      } else {
        this.resources.push(child);
      }
    }
  }
  $onStateChanged(newVal, oldVal) {
    // let oldState; // TODO: do we need oldState?
    let newState;
    for (let i = 0; i < this.states.length; i++) {
      if (this.states[i].name === newVal) {
        newState = this.states[i];
      }
      /*
      else if (this.states[i].name === oldVal) {
        oldState = this.states[i];
      }
      */
    }

    const actions = this.$revertActions.slice();

    // Get current values for revert actions
    for (const i in actions) {
      const action = actions[i];
      action.from = action.target[action.property];
    }
    if (newState) {
      const changes = newState.$getAllChanges();

      // Get all actions we need to do and create actions to revert them
      for (let i = 0; i < changes.length; i++) {
        this.$applyChange(actions, changes[i]);
      }
    }

    // Set all property changes and fetch the actual values afterwards
    // The latter is needed for transitions. We need to set all properties
    // before we fetch the values because properties can be interdependent.
    for (const i in actions) {
      const action = actions[i];
      action.target.$properties[action.property].set(action.value, QmlWeb.QMLProperty.ReasonUser, action.target, newState ? newState.$context : action.target.$context);
    }
    for (const i in actions) {
      const action = actions[i];
      action.to = action.target[action.property];
      if (action.explicit) {
        // Remove binding
        action.target[action.property] = action.target[action.property];
        action.value = action.target[action.property];
      }
    }

    // Find the best transition to use
    let transition;
    let rating = 0;
    for (let i = 0; i < this.transitions.length; i++) {
      // We need to stop running transitions, so let's do
      // it while iterating through the transitions anyway
      this.transitions[i].$stop();
      const curTransition = this.transitions[i];
      let curRating = 0;
      if (curTransition.from === oldVal || curTransition.reversible && curTransition.from === newVal) {
        curRating += 2;
      } else if (curTransition.from === "*") {
        curRating++;
      } else {
        continue;
      }
      if (curTransition.to === newVal || curTransition.reversible && curTransition.to === oldVal) {
        curRating += 2;
      } else if (curTransition.to === "*") {
        curRating++;
      } else {
        continue;
      }
      if (curRating > rating) {
        rating = curRating;
        transition = curTransition;
      }
    }
    if (transition) {
      transition.$start(actions);
    }
  }
  $applyChange(actions, change) {
    const arrayFindIndex = QmlWeb.helpers.arrayFindIndex;
    for (let j = 0; j < change.$actions.length; j++) {
      const item = change.$actions[j];

      const action = {
        target: change.target,
        property: item.property,
        origValue: change.target.$properties[item.property].binding || change.target.$properties[item.property].val,
        value: item.value,
        from: change.target[item.property],
        to: undefined,
        explicit: change.explicit
      };

      const actionIndex = arrayFindIndex(actions, element => element.target === action.target && element.property === action.property);
      if (actionIndex !== -1) {
        actions[actionIndex] = action;
      } else {
        actions.push(action);
      }

      // Look for existing revert action, else create it
      const revertIndex = arrayFindIndex(this.$revertActions, element => element.target === change.target && element.property === item.property);
      if (revertIndex !== -1 && !change.restoreEntryValues) {
        // We don't want to revert, so remove it
        this.$revertActions.splice(revertIndex, 1);
      } else if (revertIndex === -1 && change.restoreEntryValues) {
        this.$revertActions.push({
          target: change.target,
          property: item.property,
          value: change.target.$properties[item.property].binding || change.target.$properties[item.property].val,
          from: undefined,
          to: change.target[item.property]
        });
      }
    }
  }
  $onVisibleChanged_(newVal) {
    this.css.visibility = newVal ? "inherit" : "hidden";
  }
  $onClipChanged(newVal) {
    this.css.overflow = newVal ? "hidden" : "visible";
  }
  $onZChanged() {
    this.$updateTransform();
  }
  $onXChanged(newVal) {
    this.css.left = `${newVal}px`;
    this.$updateHGeometry();
  }
  $onYChanged(newVal) {
    this.css.top = `${newVal}px`;
    this.$updateVGeometry();
  }
  $onWidthChanged_(newVal) {
    this.css.width = newVal ? `${newVal}px` : "auto";
  }
  $onHeightChanged_(newVal) {
    this.css.height = newVal ? `${newVal}px` : "auto";
  }
  $onFocusChanged_(newVal) {
    if (newVal) {
      if (this.dom.firstChild) {
        this.dom.firstChild.focus();
      }
      document.qmlFocus = this;
      this.$context.activeFocus = this;
    } else if (document.qmlFocus === this) {
      document.getElementsByTagName("BODY")[0].focus();
      document.qmlFocus = QmlWeb.engine.rootContext().base;
      this.$context.activeFocus = null;
    }
  }
  setupFocusOnDom(element) {
    const updateFocus = () => {
      const hasFocus = document.activeElement === this.dom || document.activeElement === this.dom.firstChild;
      if (this.focus !== hasFocus) {
        this.focus = hasFocus;
      }
    };
    element.addEventListener("focus", updateFocus);
    element.addEventListener("blur", updateFocus);
  }
  $updateTransform() {
    const QMLTranslate = QmlWeb.getConstructor("QtQuick", "2.0", "Translate");
    const QMLRotation = QmlWeb.getConstructor("QtQuick", "2.0", "Rotation");
    const QMLScale = QmlWeb.getConstructor("QtQuick", "2.0", "Scale");
    let transform = `rotate(${this.rotation}deg) scale(${this.scale})`;
    let filter = "";
    const transformStyle = "preserve-3d";

    for (let i = 0; i < this.transform.length; i++) {
      const t = this.transform[i];
      if (t instanceof QMLRotation) {
        const ax = t.axis;
        transform += ` rotate3d(${ax.x}, ${ax.y}, ${ax.z}, ${ax.angle}deg)`;
      } else if (t instanceof QMLScale) {
        transform += ` scale(${t.xScale}, ${t.yScale})`;
      } else if (t instanceof QMLTranslate) {
        transform += ` translate(${t.x}px, ${t.y}px)`;
      } else if (typeof t.transformType !== "undefined") {
        if (t.transformType === "filter") {
          filter += `${t.operation}(${t.parameters}) `;
        }
      } else if (typeof t === "string") {
        transform += t;
      }
    }
    if (typeof this.z === "number") {
      transform += ` translate3d(0, 0, ${this.z}px)`;
      // should also consider z as zIndex for stacking order behaviour of qml
      // see http://doc.qt.io/qt-5/qml-qtquick-item.html#z-prop
      this.dom.style.zIndex = this.z;
    }
    this.dom.style.transform = transform;
    this.dom.style.transformStyle = transformStyle;
    this.dom.style.webkitTransform = transform; // Chrome, Safari and Opera
    this.dom.style.webkitTransformStyle = transformStyle;
    this.dom.style.msTransform = transform; // IE
    this.dom.style.filter = filter;
    this.dom.style.webkitFilter = filter; // Chrome, Safari and Opera
  }
  Component$onCompleted_() {
    this.$calculateOpacity();
  }
  $calculateOpacity() {
    // TODO: reset all opacity on layer.enabled changed
    /*
    if (false) { // TODO: check layer.enabled
      this.css.opacity = this.opacity;
    }
    */
    const parentOpacity = this.$parent && this.$parent.$opacity || 1;
    this.$opacity = this.opacity * parentOpacity;
    if (this.impl) {
      this.impl.style.opacity = this.$opacity;
    }
  }
  $onImplicitWidthChanged() {
    if (this.$isUsingImplicitWidth) {
      this.width = this.implicitWidth;
      this.$isUsingImplicitWidth = true;
    }
  }
  $onImplicitHeightChanged() {
    if (this.$isUsingImplicitHeight) {
      this.height = this.implicitHeight;
      this.$isUsingImplicitHeight = true;
    }
  }
  $updateHGeometry(newVal, oldVal, propName) {
    const anchors = this.anchors || this;
    if (this.$updatingHGeometry) {
      return;
    }
    this.$updatingHGeometry = true;

    const flags = QmlWeb.Signal.UniqueConnection;
    const lM = anchors.leftMargin || anchors.margins;
    const rM = anchors.rightMargin || anchors.margins;
    const w = this.width;
    const left = this.parent ? this.parent.left : 0;

    // Width
    if (propName === "width") {
      this.$isUsingImplicitWidth = false;
    }

    // Position TODO: Layouts

    const u = {}; // our update object

    if (anchors.fill !== undefined) {
      const fill = anchors.fill;
      const props = fill.$properties;
      props.left.changed.connect(this, this.$updateHGeometry, flags);
      props.right.changed.connect(this, this.$updateHGeometry, flags);
      props.width.changed.connect(this, this.$updateHGeometry, flags);

      this.$isUsingImplicitWidth = false;
      u.width = fill.width - lM - rM;
      u.x = fill.left - left + lM;
      u.left = fill.left + lM;
      u.right = fill.right - rM;
      u.horizontalCenter = (u.left + u.right) / 2;
    } else if (anchors.centerIn !== undefined) {
      const horizontalCenter = anchors.centerIn.$properties.horizontalCenter;
      horizontalCenter.changed.connect(this, this.$updateHGeometry, flags);

      u.horizontalCenter = anchors.centerIn.horizontalCenter;
      u.x = u.horizontalCenter - w / 2 - left;
      u.left = u.horizontalCenter - w / 2;
      u.right = u.horizontalCenter + w / 2;
    } else if (anchors.left !== undefined) {
      u.left = anchors.left + lM;
      if (anchors.right !== undefined) {
        u.right = anchors.right - rM;
        this.$isUsingImplicitWidth = false;
        u.width = u.right - u.left;
        u.x = u.left - left;
        u.horizontalCenter = (u.right + u.left) / 2;
      } else if (anchors.horizontalCenter !== undefined) {
        u.horizontalCenter = anchors.horizontalCenter;
        this.$isUsingImplicitWidth = false;
        u.width = (u.horizontalCenter - u.left) * 2;
        u.x = u.left - left;
        u.right = 2 * u.horizontalCenter - u.left;
      } else {
        u.x = u.left - left;
        u.right = u.left + w;
        u.horizontalCenter = u.left + w / 2;
      }
    } else if (anchors.right !== undefined) {
      u.right = anchors.right - rM;
      if (anchors.horizontalCenter !== undefined) {
        u.horizontalCenter = anchors.horizontalCenter;
        this.$isUsingImplicitWidth = false;
        u.width = (u.right - u.horizontalCenter) * 2;
        u.x = 2 * u.horizontalCenter - u.right - left;
        u.left = 2 * u.horizontalCenter - u.right;
      } else {
        u.x = u.right - w - left;
        u.left = u.right - w;
        u.horizontalCenter = u.right - w / 2;
      }
    } else if (anchors.horizontalCenter !== undefined) {
      u.horizontalCenter = anchors.horizontalCenter;
      u.x = u.horizontalCenter - w / 2 - left;
      u.left = u.horizontalCenter - w / 2;
      u.right = u.horizontalCenter + w / 2;
    } else {
      if (this.parent) {
        const leftProp = this.parent.$properties.left;
        leftProp.changed.connect(this, this.$updateHGeometry, flags);
      }

      u.left = this.x + left;
      u.right = u.left + w;
      u.horizontalCenter = u.left + w / 2;
    }

    for (const key in u) {
      this[key] = u[key];
    }

    this.$updatingHGeometry = false;

    if (this.parent) this.$updateChildrenRect(this.parent);
  }
  $updateVGeometry(newVal, oldVal, propName) {
    const anchors = this.anchors || this;
    if (this.$updatingVGeometry) {
      return;
    }
    this.$updatingVGeometry = true;

    const flags = QmlWeb.Signal.UniqueConnection;
    const tM = anchors.topMargin || anchors.margins;
    const bM = anchors.bottomMargin || anchors.margins;
    const h = this.height;
    const top = this.parent ? this.parent.top : 0;

    // HeighttopProp
    if (propName === "height") {
      this.$isUsingImplicitHeight = false;
    }

    // Position TODO: Layouts

    const u = {}; // our update object

    if (anchors.fill !== undefined) {
      const fill = anchors.fill;
      const props = fill.$properties;
      props.top.changed.connect(this, this.$updateVGeometry, flags);
      props.bottom.changed.connect(this, this.$updateVGeometry, flags);
      props.height.changed.connect(this, this.$updateVGeometry, flags);

      this.$isUsingImplicitHeight = false;
      u.height = fill.height - tM - bM;
      u.y = fill.top - top + tM;
      u.top = fill.top + tM;
      u.bottom = fill.bottom - bM;
      u.verticalCenter = (u.top + u.bottom) / 2;
    } else if (anchors.centerIn !== undefined) {
      const verticalCenter = anchors.centerIn.$properties.verticalCenter;
      verticalCenter.changed.connect(this, this.$updateVGeometry, flags);

      u.verticalCenter = anchors.centerIn.verticalCenter;
      u.y = u.verticalCenter - h / 2 - top;
      u.top = u.verticalCenter - h / 2;
      u.bottom = u.verticalCenter + h / 2;
    } else if (anchors.top !== undefined) {
      u.top = anchors.top + tM;
      if (anchors.bottom !== undefined) {
        u.bottom = anchors.bottom - bM;
        this.$isUsingImplicitHeight = false;
        u.height = u.bottom - u.top;
        u.y = u.top - top;
        u.verticalCenter = (u.bottom + u.top) / 2;
      } else if ((u.verticalCenter = anchors.verticalCenter) !== undefined) {
        this.$isUsingImplicitHeight = false;
        u.height = (u.verticalCenter - u.top) * 2;
        u.y = u.top - top;
        u.bottom = 2 * u.verticalCenter - u.top;
      } else {
        u.y = u.top - top;
        u.bottom = u.top + h;
        u.verticalCenter = u.top + h / 2;
      }
    } else if (anchors.bottom !== undefined) {
      u.bottom = anchors.bottom - bM;
      if ((u.verticalCenter = anchors.verticalCenter) !== undefined) {
        this.$isUsingImplicitHeight = false;
        u.height = (u.bottom - u.verticalCenter) * 2;
        u.y = 2 * u.verticalCenter - u.bottom - top;
        u.top = 2 * u.verticalCenter - u.bottom;
      } else {
        u.y = u.bottom - h - top;
        u.top = u.bottom - h;
        u.verticalCenter = u.bottom - h / 2;
      }
    } else if (anchors.verticalCenter !== undefined) {
      u.verticalCenter = anchors.verticalCenter;
      u.y = u.verticalCenter - h / 2 - top;
      u.top = u.verticalCenter - h / 2;
      u.bottom = u.verticalCenter + h / 2;
    } else {
      if (this.parent) {
        const topProp = this.parent.$properties.top;
        topProp.changed.connect(this, this.$updateVGeometry, flags);
      }

      u.top = this.y + top;
      u.bottom = u.top + h;
      u.verticalCenter = u.top + h / 2;
    }

    for (const key in u) {
      this[key] = u[key];
    }

    this.$updatingVGeometry = false;

    if (this.parent) this.$updateChildrenRect(this.parent);
  }
  $updateChildrenRect(component) {
    if (!component || !component.children || component.children.length === 0) {
      return;
    }
    const children = component.children;

    let maxWidth = 0;
    let maxHeight = 0;
    let minX = children.length > 0 ? children[0].x : 0;
    let minY = children.length > 0 ? children[0].y : 0;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      maxWidth = Math.max(maxWidth, child.x + child.width);
      maxHeight = Math.max(maxHeight, child.y + child.heighth);
      minX = Math.min(minX, child.x);
      minY = Math.min(minX, child.y);
    }

    component.childrenRect.x = minX;
    component.childrenRect.y = minY;
    component.childrenRect.width = maxWidth;
    component.childrenRect.height = maxHeight;
  }
}
QtQuick_Item.properties = {
  $opacity: { type: "real", initialValue: 1 },
  parent: "Item",
  antialiasing: "bool",
  state: "string",
  states: "list",
  transitions: "list",
  data: "list",
  children: "list",
  resources: "list",
  transform: "list",
  x: "real",
  y: "real",
  z: "real",
  width: "real",
  height: "real",
  implicitWidth: "real",
  implicitHeight: "real",
  left: "real",
  right: "real",
  top: "real",
  bottom: "real",
  horizontalCenter: "real",
  verticalCenter: "real",
  rotation: "real",
  scale: { type: "real", initialValue: 1 },
  opacity: { type: "real", initialValue: 1 },
  visible: { type: "bool", initialValue: true },
  clip: "bool",
  focus: "bool"
};
QtQuick_Item.defaultProperty = "data";
QmlWeb.registerQmlType(QtQuick_Item);

// eslint-disable-next-line no-undef
class QmlWeb_Dom_DomElement extends QtQuick_Item {

  constructor(meta) {
    meta.tagName = meta.object.tagName || meta.tagName;
    super(meta);

    for (const key in meta.object.attrs) {
      if (!meta.object.attrs.hasOwnProperty(key)) continue;
      this.dom[key] = meta.object.attrs[key];
    }
    for (const key in meta.object.style) {
      if (!meta.object.style.hasOwnProperty(key)) continue;
      this.dom.style[key] = meta.object.style[key];
    }

    this.htmlChanged.connect(() => {
      this.dom.innerHTML = this.html;
    });
    this.textChanged.connect(() => {
      this.dom.innerText = this.text;
    });
  }
}
QmlWeb_Dom_DomElement.properties = {
  attrs: { type: "var", initialValue: {} },
  style: { type: "var", initialValue: {} },
  html: { type: "string", initialValue: "" },
  text: { type: "string", initialValue: "" },
  tagName: { type: "string", initialValue: "div" }
};
QmlWeb.registerQmlType(QmlWeb_Dom_DomElement);

// eslint-disable-next-line no-undef
class QmlWeb_Dom_DomDiv extends QmlWeb_Dom_DomElement {}
QmlWeb.registerQmlType(QmlWeb_Dom_DomDiv);

// eslint-disable-next-line no-undef
class QmlWeb_Dom_DomParagraph extends QmlWeb_Dom_DomElement {
  constructor(meta) {
    meta.tagName = "p";
    if (!meta.style) meta.style = {};
    meta.style.margin = 0;
    super(meta);
  }
}
QmlWeb.registerQmlType(QmlWeb_Dom_DomParagraph);

// eslint-disable-next-line no-undef
class QmlWeb_RestModel extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.attributes = this.getAttributes();
    this.runningRequests = 0;
  }
  fetch() {
    this.$ajax({
      method: "GET",
      mimeType: this.mimetype,
      success: xhr => {
        this.$xhrReadResponse(xhr);
        this.fetched();
      }
    });
  }
  remove() {
    this.$ajax({
      method: "DELETE",
      success: () => {
        this.destroy();
      }
    });
  }
  create() {
    this.$sendToServer("POST");
  }
  save() {
    this.$sendToServer("PUT");
  }
  $sendToServer(method) {
    this.$ajax({
      method,
      mimeType: this.queryMimeType,
      body: this.$generateBodyForPostQuery(),
      success: xhr => {
        this.$xhrReadResponse(xhr);
        this.saved();
      }
    });
  }
  $generateBodyForPostQuery() {
    const object = {};
    for (let i = 0; i < this.attributes.length; ++i) {
      object[this.attributes[i]] = this.$properties[this.attributes[i]].get();
    }
    console.log(object);
    switch (this.queryMimeType) {
      case "application/json":
      case "text/json":
        return JSON.stringify(object);
      case "application/x-www-urlencoded":
        return this.$objectToUrlEncoded(object);
    }
    return undefined;
  }
  $objectToUrlEncoded(object, prefix) {
    const parts = [];
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        const value = object[key];
        if (typeof prefix !== "undefined") {
          key = `${prefix}[${key}]`;
        }
        if (typeof value === "object") {
          parts.push(this.$objectToUrlEncoded(value, key));
        } else {
          const ekey = this.$myEncodeURIComponent(key);
          const evalue = this.$myEncodeURIComponent(value);
          parts.push(`${ekey}=${evalue}`);
        }
      }
    }
    return parts.join("&");
  }
  $myEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16)}`);
  }
  $ajax(options) {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType(this.mimeType);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          options.success(xhr);
        } else {
          options.failure(xhr);
        }
        this.runningRequests -= 1;
        if (this.runningRequests <= 0) {
          this.isLoading = false;
        }
      }
    };
    xhr.open(options.method, this.url, true);
    if (typeof options.body !== "undefined") {
      xhr.setRequestHeader("Content-Type", this.queryMimeType);
      xhr.send(options.body);
    } else {
      xhr.send(null);
    }
    this.runningRequests += 1;
    this.isLoading = true;
  }
  $xhrReadResponse(xhr) {
    let responseObject;
    if (this.mimeType === "application/json" || this.mimeType === "text/json") {
      responseObject = JSON.parse(xhr.responseText);
    }
    this.$updatePropertiesFromResponseObject(responseObject);
  }
  $updatePropertiesFromResponseObject(responseObject) {
    const QMLProperty = QmlWeb.QMLProperty;
    for (const key in responseObject) {
      if (responseObject.hasOwnProperty(key) && this.$hasProperty(key)) {
        this.$properties[key].set(responseObject[key], QMLProperty.ReasonUser);
      }
    }
  }
  $hasProperty(name) {
    return typeof this.$properties[name] !== "undefined";
  }
}
QmlWeb_RestModel.properties = {
  url: "string",
  isLoading: "bool",
  mimeType: { type: "string", initialValue: "application/json" },
  queryMimeType: {
    type: "string",
    initialValue: "application/x-www-urlencoded"
  }
};
QmlWeb_RestModel.signals = {
  fetched: [],
  saved: []
};
QmlWeb.registerQmlType(QmlWeb_RestModel);

// eslint-disable-next-line no-undef
class Qt_labs_settings_Settings extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    if (typeof window.localStorage === "undefined") {
      return;
    }

    this.Component.completed.connect(this, this.Component$onCompleted);
  }
  Component$onCompleted() {
    this.$loadProperties();
    this.$initializeProperties();
  }
  $getKey(attrName) {
    return `${this.category}/${attrName}`;
  }
  $loadProperties() {
    this.$attributes.forEach(attrName => {
      if (!this.$properties[attrName]) return;

      const key = this.$getKey(attrName);
      this[attrName] = localStorage.getItem(key);
    });
  }
  $initializeProperties() {
    this.$attributes.forEach(attrName => {
      if (!this.$properties[attrName]) return;

      let emitter = this;
      let signalName = `${attrName}Changed`;

      if (this.$properties[attrName].type === "alias") {
        emitter = this.$context[this.$properties[attrName].val.objectName];
        signalName = `${this.$properties[attrName].val.propertyName}Changed`;
      }

      emitter[signalName].connect(this, () => {
        localStorage.setItem(this.$getKey(attrName), this[attrName]);
      });
    });
  }
}
Qt_labs_settings_Settings.properties = {
  category: "string"
};
QmlWeb.registerQmlType(Qt_labs_settings_Settings);

// eslint-disable-next-line no-undef
class QtGraphicalEffects_FastBlur extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.$previousSource = null;
    this.$filterObject = undefined;

    this.radiusChanged.connect(this, this.$onRadiusChanged);
    this.sourceChanged.connect(this, this.$onSourceChanged);
  }
  $onRadiusChanged() {
    this.$updateEffect(this.source);
  }
  $onSourceChanged() {
    this.$updateEffect(this.source);
  }
  $updateFilterObject() {
    this.$filterObject = {
      transformType: "filter",
      operation: "blur",
      parameters: `${this.radius}px`
    };
  }
  $updateEffect(source) {
    console.log("updating effect");
    if (this.$previousSource) {
      const index = this.$previousSource.transform.indexOf(this.$filterObject);
      this.$previousSource.transform.splice(index, 1);
      this.$previousSource.$updateTransform();
    }
    if (source && source.transform) {
      this.$updateFilterObject();
      console.log("updating effect:", this.$filterObject, source);
      source.transform.push(this.$filterObject);
      source.$updateTransform();
      this.$previousSource = source;
    } else {
      this.$previousSource = null;
    }
  }
}
QtGraphicalEffects_FastBlur.properties = {
  radius: "real",
  source: { type: "var", initialValue: null }
};
QmlWeb.registerQmlType(QtGraphicalEffects_FastBlur);

// eslint-disable-next-line no-undef
class QtGraphicalEffects_RectangularGlow extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.impl = document.createElement("div");
    const style = this.impl.style;
    style.pointerEvents = "none";
    style.position = "absolute";
    style.left = style.right = style.top = style.bottom = "0px";
    style.border = "none";
    style.backgroundColor = this.color.$css;
    this.dom.appendChild(this.impl);

    this.colorChanged.connect(this, this.$onColorChanged);
    this.glowRadiusChanged.connect(this, this.$updateBoxShadow);
    this.cornerRadiusChanged.connect(this, this.$updateBoxShadow);
    this.widthChanged.connect(this, this.$updateBoxShadow);
    this.heightChanged.connect(this, this.$updateBoxShadow);
    this.spreadChanged.connect(this, this.$onSpreadChanged);
  }
  $onColorChanged(newVal) {
    this.impl.style.backgroundColor = newVal.$css;
    this.$updateBoxShadow();
  }
  $onSpreadChanged(newVal) {
    if (newVal > 1) {
      this.spread = 1;
    } else if (newVal < 0) {
      this.spread = 0;
    }
    this.$updateBoxShadow();
  }
  $updateBoxShadow() {
    const { color, glowRadius, cornerRadius, spread, width, height } = this;
    const style = this.impl.style;

    // Calculate boxShadow
    const totle = glowRadius + cornerRadius * (1 - spread);
    const glow = (1 - spread) * totle;
    const blur_radius = glow * 0.64;
    const spread_radius = totle - blur_radius;
    const glow2 = glowRadius / 5;
    const blur_radius_2 = glow2 * 0.8;
    const spread_radius_2 = glow2 - blur_radius_2;

    style.boxShadow = `${color} 0px 0px ${blur_radius}px ${spread_radius}px,` + `${color} 0px 0px ${blur_radius_2}px ${spread_radius_2}px`;

    // Calculate glow css
    const spread_cornerR = cornerRadius * (1 - spread);
    const rest_cornerR = cornerRadius - spread_cornerR;
    const xScale = (width - spread_cornerR / 4) / width;
    const yScale = (height - spread_cornerR / 4) / height;

    style.width = `${width - spread_cornerR}px`;
    style.height = `${height - spread_cornerR}px`;
    style.top = `${spread_cornerR / 2}px`;
    style.left = `${spread_cornerR / 2}px`;
    style.filter = `blur(${spread_cornerR / 2}px)`;
    style.borderRadius = `${rest_cornerR / 2}px`;
    style.transform = `scale(${xScale},${yScale})`;
  }
}
QtGraphicalEffects_RectangularGlow.properties = {
  cached: "bool",
  color: { type: "color", initialValue: "white" },
  cornerRadius: "real",
  glowRadius: "real",
  spread: "real"
};
QmlWeb.registerQmlType(QtGraphicalEffects_RectangularGlow);

// eslint-disable-next-line no-undef
class QtMobility_GeoLocation extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(pos => this.$updatePosition(pos));
    navigator.geolocation.watchPosition(pos => this.$updatePosition(pos));
  }
  $updatePosition(position) {
    this.accuracy = position.coords.accuracy;
    this.altitude = position.coords.altitude;
    this.altitudeAccuracy = position.coords.altitudeAccuracy;
    this.heading = position.coords.heading;
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;
    this.speed = position.coords.speed;
    this.timestamp = position.timestamp;
  }
}
QtMobility_GeoLocation.properties = {
  accuracy: "double",
  altitude: "double",
  altitudeAccuracy: "double",
  heading: "double",
  latitude: "double",
  longitude: "double",
  speed: "double",
  timestamp: "date",
  label: "string"
};
QmlWeb.registerQmlType(QtMobility_GeoLocation);

// eslint-disable-next-line no-undef
class QtMultimedia_Video extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.$runningEventListener = 0;

    this.impl = document.createElement("video");
    this.impl.style.width = this.impl.style.height = "100%";
    this.impl.style.margin = "0";
    this.dom.appendChild(this.impl);

    this.volume = this.impl.volume;
    this.duration = this.impl.duration;

    this.impl.addEventListener("play", () => {
      this.playing();
      this.playbackState = this.MediaPlayer.PlayingState;
    });

    this.impl.addEventListener("pause", () => {
      this.paused();
      this.playbackState = this.MediaPlayer.PausedState;
    });

    this.impl.addEventListener("timeupdate", () => {
      this.$runningEventListener++;
      this.position = this.impl.currentTime * 1000;
      this.$runningEventListener--;
    });

    this.impl.addEventListener("ended", () => {
      this.stopped();
      this.playbackState = this.MediaPlayer.StoppedState;
    });

    this.impl.addEventListener("progress", () => {
      if (this.impl.buffered.length > 0) {
        this.progress = this.impl.buffered.end(0) / this.impl.duration;
        this.status = this.progress < 1 ? this.MediaPlayer.Buffering : this.MediaPlayer.Buffered;
      }
    });

    this.impl.addEventListener("stalled", () => {
      this.status = this.MediaPlayer.Stalled;
    });

    this.impl.addEventListener("canplaythrough", () => {
      this.status = this.MediaPlayer.Buffered;
    });

    this.impl.addEventListener("loadstart", () => {
      this.status = this.MediaPlayer.Loading;
    });

    this.impl.addEventListener("durationchanged", () => {
      this.duration = this.impl.duration;
    });

    this.impl.addEventListener("volumechanged", () => {
      this.$runningEventListener++;
      this.volume = this.impl.volume;
      this.$runningEventListener--;
    });

    this.impl.addEventListener("suspend", () => {
      this.error |= this.MediaPlayer.NetworkError;
    });

    this.impl.addEventListener("error", () => {
      this.error |= this.MediaPlayer.ResourceError;
    });

    this.impl.addEventListener("ratechange", () => {
      this.$runningEventListener++;
      this.playbackRate = this.impl.playbackRate;
      this.$runningEventListener--;
    });

    this.autoPlayChanged.connect(this, this.$onAutoPlayChanged);
    this.sourceChanged.connect(this, this.$onSourceChanged);
    this.positionChanged.connect(this, this.$onPositionChanged);
    this.volumeChanged.connect(this, this.$onVolumeChanged);
    this.playbackRateChanged.connect(this, this.$onPlaybackRateChanged);
    this.mutedChanged.connect(this, this.$onMutedChanged);
    this.fillModeChanged.connect(this, this.$onFillModeChanged);
  }
  $onAutoPlayChanged(newVal) {
    this.impl.autoplay = newVal;
  }
  $onSourceChanged(source) {
    const parts = source.split(".");
    const extension = parts[parts.length - 1].toLowerCase();
    const mime = this.mimetypeFromExtension(extension);
    this.impl.src = source;
    if (!this.impl.canPlayType(mime)) {
      this.error |= this.MediaPlayer.FormatError;
    }
  }
  $onPositionChanged(currentTime) {
    if (this.$runningEventListener > 0) return;
    this.impl.currentTime = currentTime / 1000;
  }
  $onVolumeChanged(volume) {
    if (this.$runningEventListener > 0) return;
    this.impl.volume = volume;
  }
  $onPlaybackRateChanged(playbackRate) {
    if (this.$runningEventListener > 0) return;
    this.impl.playbackRate = playbackRate;
  }
  $onMutedChanged(newValue) {
    if (newValue) {
      this.$volulmeBackup = this.impl.volume;
      this.volume = 0;
    } else {
      this.volume = this.$volumeBackup;
    }
  }
  $onFillModeChanged(newValue) {
    switch (newValue) {
      case this.VideoOutput.Stretch:
        this.impl.style.objectFit = "fill";
        break;
      case this.VideoOutput.PreserveAspectFit:
        this.impl.style.objectFit = "";
        break;
      case this.VideoOutput.PreserveAspectCrop:
        this.impl.style.objectFit = "cover";
        break;
    }
  }
  pause() {
    this.impl.pause();
  }
  play() {
    this.impl.play();
  }
  seek(offset) {
    this.impl.currentTime = offset * 1000;
  }
  stop() {}
  mimetypeFromExtension(extension) {
    const mimetypes = {
      ogg: "video/ogg",
      ogv: "video/ogg",
      ogm: "video/ogg",
      mp4: "video/mp4",
      webm: "video/webm"
    };
    return mimetypes[extension] || "";
  }
}
QtMultimedia_Video.versions = /^5\./;
QtMultimedia_Video.enums = {
  MediaPlayer: {
    Available: 0, Busy: 2, Unavailable: 1, ResourceMissing: 3,

    NoError: 0, ResourceError: 1, FormatError: 2, NetworkError: 4,
    AccessDenied: 8, ServiceMissing: 16,

    StoppedState: 0, PlayingState: 1, PausedState: 2,

    NoMedia: 0, Loading: 1, Loaded: 2, Buffering: 4, Stalled: 8,
    EndOfMedia: 16, InvalidMedia: 32, UnknownStatus: 64
  },
  VideoOutput: { PreserveAspectFit: 0, PreserveAspectCrop: 1, Stretch: 2 }
};
QtMultimedia_Video.properties = {
  audioRole: "enum", // TODO
  autoLoad: { type: "bool", initialValue: true },
  autoPlay: "bool",
  availability: "enum", // MediaPlayer.Available
  bufferProgress: "real",
  duration: "int",
  error: "enum", // MediaPlayer.NoError
  errorString: "string",
  fillMode: "enum", // VideoOutput.PreserveAspectFit
  hasAudio: "bool",
  hasVideo: "bool",
  muted: "bool",
  orientation: "int",
  playbackRate: { type: "real", initialValue: 1 },
  playbackState: "enum", // MediaPlayer.StoppedState
  position: "int",
  seekable: "bool",
  source: "url",
  status: "enum", // MediaPlayer.NoMedia
  volume: "real"
};
QtMultimedia_Video.signals = {
  paused: [],
  playing: [],
  stopped: []
};
QmlWeb.registerQmlType(QtMultimedia_Video);

// eslint-disable-next-line no-undef
class QtMultimedia_VideoOutput extends QtQuick_Item {}
QtMultimedia_VideoOutput.versions = /^5\./;
QtMultimedia_VideoOutput.enums = {
  VideoOutput: { PreserveAspectFit: 0, PreserveAspectCrop: 1, Stretch: 2 }
};
QtMultimedia_VideoOutput.properties = {
  autoOrientation: "bool",
  contentRect: "rect",
  fillMode: "enum", // VideoOutput.PreserveAspectFit
  filters: "list",
  orientation: "int",
  source: "variant",
  sourceRect: "rect"
};
QmlWeb.registerQmlType(QtMultimedia_VideoOutput);

// eslint-disable-next-line no-undef
class QtQuick_Controls_2_Control extends QtQuick_Item {}
QtQuick_Controls_2_Control.versions = /^2\./;
QtQuick_Controls_2_Control.properties = {
  availableHeight: "real",
  availableWidth: "real",
  background: "Item",
  bottomPadding: "real",
  contentItem: "Item",
  focusPolicy: "enum",
  focusReason: "enum",
  font: "font",
  hoverEnabled: "bool",
  hovered: "bool",
  leftPadding: "real",
  locale: "Locale",
  mirrored: "bool",
  padding: "real",
  palette: "palette",
  rightPadding: "real",
  spacing: "real",
  topPadding: "real",
  visualFocus: "bool",
  wheelEnabled: "bool"
};
QmlWeb.registerQmlType(QtQuick_Controls_2_Control);

// eslint-disable-next-line no-undef
class QtQuick_Controls_2_AbstractButton extends QtQuick_Controls_2_Control {

  constructor(meta) {
    super(meta);

    this.icon = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.icon, {
      name: "string",
      source: "url",
      width: "int",
      height: "int",
      color: "color"
    });

    // TODO
  }
}
QtQuick_Controls_2_AbstractButton.versions = /^2\./;
QtQuick_Controls_2_AbstractButton.properties = {
  action: "Action",
  autoExclusive: "bool",
  checkable: "bool",
  checked: "bool",
  display: "enum",
  // icon is defined manually
  down: "bool",
  indicator: "Item",
  pressed: "bool",
  text: "string"
};
QmlWeb.registerQmlType(QtQuick_Controls_2_AbstractButton);

// eslint-disable-next-line no-undef
class QtQuick_Controls_2_Container extends QtQuick_Controls_2_Control {

  constructor(meta) {
    super(meta);

    this.widthChanged.connect(this, this.layoutChildren);
    this.heightChanged.connect(this, this.layoutChildren);
    this.childrenChanged.connect(this, this.layoutChildren);
    this.childrenChanged.connect(this, this.$onChildrenChanged);
    this.layoutChildren();
  }
  $onChildrenChanged() {
    const flags = QmlWeb.Signal.UniqueConnection;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.widthChanged.connect(this, this.layoutChildren, flags);
      child.heightChanged.connect(this, this.layoutChildren, flags);
      child.visibleChanged.connect(this, this.layoutChildren, flags);
    }
  }
  layoutChildren() {
    // noop, defined in individual positioners
  }
}
QtQuick_Controls_2_Container.versions = /^2\./;
QtQuick_Controls_2_Container.properties = {
  contentChildren: "list",
  contentData: "list",
  contentModel: "model",
  count: "int",
  currentIndex: "int",
  currentItem: "Item"
};
QmlWeb.registerQmlType(QtQuick_Controls_2_Container);

// eslint-disable-next-line no-undef
class QtQuick_Controls_2_Page extends QtQuick_Controls_2_Control {}
QtQuick_Controls_2_Page.versions = /^2\./;
QtQuick_Controls_2_Page.properties = {
  contentChildren: "list",
  contentData: "list",
  contentHeight: "real",
  contentWidth: "real",
  footer: "Item",
  header: "Item",
  title: "string"
};
QmlWeb.registerQmlType(QtQuick_Controls_2_Page);

// eslint-disable-next-line no-undef
class QtQuick_Controls_2_SwipeView extends QtQuick_Controls_2_Container {

  // TODO

  layoutChildren() {
    let pos = 0;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (!child.visible) continue;
      child.height = this.height;
      child.width = this.width;
      child.x = pos;
      pos += child.width;
    }
  }
}
QtQuick_Controls_2_SwipeView.versions = /^2\./;
QtQuick_Controls_2_SwipeView.properties = {
  horizontal: "bool",
  interactive: "bool",
  orientation: "enum",
  vertical: "bool"
};
QmlWeb.registerQmlType(QtQuick_Controls_2_SwipeView);

// eslint-disable-next-line no-undef
class QtQuick_Controls_2_TabBar extends QtQuick_Controls_2_Container {}
QtQuick_Controls_2_TabBar.versions = /^2\./;
QtQuick_Controls_2_TabBar.properties = {
  contentHeight: "real",
  contentWidth: "real",
  position: "enum"
};
QmlWeb.registerQmlType(QtQuick_Controls_2_TabBar);

// eslint-disable-next-line no-undef
class QtQuick_Controls_2_TabButton extends QtQuick_Controls_2_AbstractButton {}
QtQuick_Controls_2_TabButton.versions = /^2\./;
QmlWeb.registerQmlType(QtQuick_Controls_2_TabButton);

// eslint-disable-next-line no-undef
class QtQuick_Controls_Button extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.Component.completed.connect(this, this.Component$onCompleted);
    this.textChanged.connect(this, this.$onTextChanged);
    this.enabledChanged.connect(this, this.$onEnabledChanged);

    const button = this.impl = document.createElement("button");
    button.style.pointerEvents = "auto";
    this.dom.appendChild(button);

    button.onclick = () => {
      this.clicked();
    };
  }
  Component$onCompleted() {
    this.implicitWidth = this.impl.offsetWidth;
    this.implicitHeight = this.impl.offsetHeight;
  }
  $onTextChanged(newVal) {
    this.impl.textContent = newVal;
    //TODO: Replace those statically sized borders
    this.implicitWidth = this.impl.offsetWidth;
    this.implicitHeight = this.impl.offsetHeight;
  }
  $onEnabledChanged(newVal) {
    this.impl.disabled = !newVal;
  }
}
QtQuick_Controls_Button.properties = {
  text: "string",
  enabled: { type: "bool", initialValue: true }
};
QtQuick_Controls_Button.signals = {
  clicked: []
};
QmlWeb.registerQmlType(QtQuick_Controls_Button);

// eslint-disable-next-line no-undef
class QtQuick_Controls_CheckBox extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.impl = document.createElement("label");
    this.impl.style.pointerEvents = "auto";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.verticalAlign = "text-bottom";
    checkbox.addEventListener("change", () => {
      this.checked = checkbox.checked;
    });
    this.impl.appendChild(checkbox);

    const span = document.createElement("span");
    this.impl.appendChild(span);

    this.dom.appendChild(this.impl);

    this.Component.completed.connect(this, this.Component$onCompleted);
    this.textChanged.connect(this, this.$onTextChanged);
    this.colorChanged.connect(this, this.$onColorChanged);
    this.checkedChanged.connect(this, this.$onCheckedChanged);
  }
  $onTextChanged(newVal) {
    this.impl.children[1].innerHTML = newVal;
    this.implicitHeight = this.impl.offsetHeight;
    this.implicitWidth = this.impl.offsetWidth > 0 ? this.impl.offsetWidth + 4 : 0;
  }
  $onColorChanged(newVal) {
    this.impl.children[1].style.color = newVal.$css;
  }
  $onCheckedChanged() {
    this.impl.children[0].checked = this.checked;
  }
  Component$onCompleted() {
    this.implicitHeight = this.impl.offsetHeight;
    this.implicitWidth = this.impl.offsetWidth > 0 ? this.impl.offsetWidth + 4 : 0;
  }
}
QtQuick_Controls_CheckBox.properties = {
  text: "string",
  font: "font",
  checked: "bool",
  color: "color"
};
QmlWeb.registerQmlType(QtQuick_Controls_CheckBox);

// eslint-disable-next-line no-undef
class QtQuick_Controls_ComboBox extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.dom.style.pointerEvents = "auto";
    this.name = "QMLComboBox";

    // TODO change innerHTML to DOM
    this.dom.innerHTML = "<select></select>";
    this.impl = this.dom.firstChild;

    this.Component.completed.connect(this, this.Component$onCompleted);
    this.modelChanged.connect(this, this.$onModelChanged);
    this.currentIndexChanged.connect(this, this.$onCurrentIndexChanged);
    this.heightChanged.connect(this, this.$onHeightChanged);
    this.widthChanged.connect(this, this.$onWidthChanged);

    this.dom.onclick = () => {
      const index = this.dom.firstChild.selectedIndex;
      this.currentIndex = index;
      this.currentText = this.model[index];
      this.accepted();
      this.activated(index);
    };
  }
  find(text) {
    return this.model.indexOf(text);
  }
  selectAll() {
    // TODO
  }
  textAt(index) {
    return this.model[index];
  }
  $updateImpl() {
    this.count = this.model.length;

    const k = this.count;const m = this.model;

    this.impl.options.length = k;
    for (let i = 0; i < k; i++) {
      this.impl.options[i] = new Option(m[i]);
    }

    // should call this, because width()/heights() invoke updateV(H)Geometry,
    // which in turn sets valid $useImplicitHeight flag
    const h = this.height;const w = this.width;

    this.implicitWidth = this.impl.offsetWidth;
    this.implicitHeight = this.impl.offsetHeight;

    this.$onHeightChanged(h);
    this.$onWidthChanged(w);

    this.impl.selectedIndex = this.currentIndex;
    this.$updateCurrentText();
  }
  Component$onCompleted() {
    this.$updateImpl();
  }
  $onModelChanged() {
    this.$updateImpl();
  }
  $onCurrentIndexChanged() {
    const i = this.currentIndex;
    if (this.impl.selectedIndex !== i) {
      this.impl.selectedIndex = i;
      this.$updateCurrentText();
      this.activated(i);
    }
  }
  $updateCurrentText() {
    if (typeof this.currentIndex === "undefined" || !this.model) {
      this.currentText = undefined;
    } else if (this.currentIndex >= 0 && this.currentIndex < this.model.length) {
      this.currentText = this.model[this.currentIndex];
    }
  }
  $onHeightChanged() {
    if (this.height > 0 && this.impl && this.height !== this.impl.offsetHeight) {
      this.impl.style.height = `${this.height}px`;
    }
  }
  $onWidthChanged() {
    if (this.width > 0 && this.impl && this.width !== this.impl.offsetWidth) {
      this.impl.style.width = `${this.width}px`;
    }
  }
}
QtQuick_Controls_ComboBox.properties = {
  count: "int",
  currentIndex: "int",
  currentText: "string",
  menu: { type: "array", initialValue: [] },
  model: { type: "array", initialValue: [] },
  pressed: "bool"
};
QtQuick_Controls_ComboBox.signals = {
  accepted: [],
  activated: [{ type: "int", name: "index" }]
};
QmlWeb.registerQmlType(QtQuick_Controls_ComboBox);

// eslint-disable-next-line no-undef
class QtQuick_Controls_ScrollView extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.css.pointerEvents = "auto";
    this.setupFocusOnDom(this.dom);

    this.contentItemChanged.connect(this, this.$onContentItemChanged);
    this.flickableItemChanged.connect(this, this.$onFlickableItemChanged);
    this.viewportChanged.connect(this, this.$onViewportChanged);
    this.frameVisibleChanged.connect(this, this.$onFrameVisibleChanged);
    this.highlightOnFocusChanged.connect(this, this.$onHighlightOnFocusChanged);
    this.horizontalScrollBarPolicyChanged.connect(this, this.$onHorizontalScrollBarPolicyChanged);
    this.verticalScrollBarPolicyChanged.connect(this, this.$onVerticalScrollBarPolicyChanged);
    this.styleChanged.connect(this, this.$onStyleChanged);
    this.childrenChanged.connect(this, this.$onChildrenChanged);
    this.focusChanged.connect(this, this.$onFocusChanged);

    this.width = this.implicitWidth = 240; // default QML ScrollView width
    this.height = this.implicitHeight = 150; // default QML ScrollView height
    this.width = this.implicitWidth;
    this.height = this.implicitHeight;

    const Qt = QmlWeb.Qt;
    this.contentItem = undefined;
    this.flickableItem = undefined;
    this.viewport = undefined;
    this.frameVisible = false;
    this.highlightOnFocus = false;

    this.verticalScrollBarPolicy = Qt.ScrollBarAsNeeded;
    this.horizontalScrollBarPolicy = Qt.ScrollBarAsNeeded;
    this.style = undefined;

    this.$onVerticalScrollBarPolicyChanged(this.verticalScrollBarPolicy);
    this.$onHorizontalScrollBarPolicyChanged(this.horizontalScrollBarPolicy);
  }
  $onContentItemChanged(newItem) {
    if (newItem) {
      newItem.parent = this;
    }
  }
  $onFlickableItemChanged() {}
  $onHighlightOnFocusChanged() {}
  $onViewportChanged() {}
  $onFocusChanged(focus) {
    this.css.outline = this.highlight && focus ? "outline: lightblue solid 2px;" : "";
  }
  $onFrameVisibleChanged(visible) {
    this.css.border = visible ? "1px solid gray" : "hidden";
  }
  $onHorizontalScrollBarPolicyChanged(newPolicy) {
    this.css.overflowX = this.$scrollBarPolicyToCssOverflow(newPolicy);
  }
  $onVerticalScrollBarPolicyChanged(newPolicy) {
    this.css.overflowY = this.$scrollBarPolicyToCssOverflow(newPolicy);
  }
  $onStyleChanged() {}
  $onChildrenChanged() {
    if (typeof this.contentItem === "undefined" && this.children.length === 1) {
      this.contentItem = this.children[0];
    }
  }
  $scrollBarPolicyToCssOverflow(policy) {
    const Qt = QmlWeb.Qt;
    switch (policy) {
      case Qt.ScrollBarAsNeeded:
        return "auto";
      case Qt.ScrollBarAlwaysOff:
        return "hidden";
      case Qt.ScrollBarAlwaysOn:
        return "scroll";
    }
    return "auto";
  }
}
QtQuick_Controls_ScrollView.properties = {
  contentItem: "Item",
  flickableItem: "Item", // TODO  0) implement it  1) make it read-only
  viewport: "Item", // TODO
  frameVisible: "bool",
  highlightOnFocus: "bool", // TODO test
  verticalScrollBarPolicy: "enum",
  horizontalScrollBarPolicy: "enum",
  style: "Component" // TODO
};
QtQuick_Controls_ScrollView.defaultProperty = "contentItem";
QmlWeb.registerQmlType(QtQuick_Controls_ScrollView);

/**
 *
 * TextField is used to accept a line of text input.
 * Input constraints can be placed on a TextField item
 * (for example, through a validator or inputMask).
 * Setting echoMode to an appropriate value enables TextField
 * to be used for a password input field.
 *
 * Valid entries for echoMode and alignment are defined in TextInput.
 *
 */

// eslint-disable-next-line no-undef
class QtQuick_Controls_TextField extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    const input = this.impl = document.createElement("input");
    input.type = "text";
    input.disabled = true;
    input.style.pointerEvents = "auto";
    input.style.margin = "0";
    input.style.width = "100%";
    this.dom.appendChild(input);
    this.setupFocusOnDom(input);
    input.disabled = false;

    this.Component.completed.connect(this, this.Component$onCompleted);
    this.textChanged.connect(this, this.$onTextChanged);
    this.echoModeChanged.connect(this, this.$onEchoModeChanged);
    this.maximumLengthChanged.connect(this, this.$onMaximumLengthChanged);
    this.readOnlyChanged.connect(this, this.$onReadOnlyChanged);
    this.Keys.pressed.connect(this, this.Keys$onPressed);

    this.impl.addEventListener("input", () => this.$updateValue());
  }
  Component$onCompleted() {
    this.implicitWidth = this.impl.offsetWidth;
    this.implicitHeight = this.impl.offsetHeight;
  }
  $onTextChanged(newVal) {
    // See TextInput for comments
    if (this.impl.value !== newVal) {
      this.impl.value = newVal;
    }
  }
  $onEchoModeChanged(newVal) {
    const TextInput = this.TextInput;
    const input = this.impl;
    switch (newVal) {
      case TextInput.Normal:
        input.type = "text";
        break;
      case TextInput.Password:
        input.type = "password";
        break;
      case TextInput.NoEcho:
        // Not supported, use password, that's nearest
        input.type = "password";
        break;
      case TextInput.PasswordEchoOnEdit:
        // Not supported, use password, that's nearest
        input.type = "password";
        break;
    }
  }
  $onMaximumLengthChanged(newVal) {
    this.impl.maxLength = newVal < 0 ? null : newVal;
  }
  $onReadOnlyChanged(newVal) {
    this.impl.disabled = newVal;
  }
  Keys$onPressed(e) {
    const Qt = QmlWeb.Qt;
    const submit = e.key === Qt.Key_Return || e.key === Qt.Key_Enter;
    if (submit && this.$testValidator()) {
      this.accepted();
      e.accepted = true;
    }
  }
  $testValidator() {
    if (this.validator) {
      return this.validator.validate(this.text);
    }
    return true;
  }
  $updateValue() {
    if (this.text !== this.impl.value) {
      this.$canEditReadOnlyProperties = true;
      this.text = this.impl.value;
      this.$canEditReadOnlyProperties = false;
    }
  }
}
QtQuick_Controls_TextField.enums = {
  TextInput: { Normal: 0, Password: 1, NoEcho: 2, PasswordEchoOnEdit: 3 }
};
QtQuick_Controls_TextField.properties = {
  text: "string",
  font: "font",
  maximumLength: { type: "int", initialValue: -1 },
  readOnly: "bool",
  validator: "var",
  echoMode: "enum" // TextInput.Normal
};
QtQuick_Controls_TextField.signals = {
  accepted: []
};
QmlWeb.registerQmlType(QtQuick_Controls_TextField);

// eslint-disable-next-line no-undef
class QtQuick_Layouts_ColumnLayout extends QtQuick_Item {}
QtQuick_Layouts_ColumnLayout.versions = /^1\./;
QtQuick_Layouts_ColumnLayout.properties = {
  layoutDirection: "enum",
  spacing: "real"
};
QmlWeb.registerQmlType(QtQuick_Layouts_ColumnLayout);

// eslint-disable-next-line no-undef
class QtQuick_Layouts_GridLayout extends QtQuick_Item {}
QtQuick_Layouts_GridLayout.versions = /^1\./;
QtQuick_Layouts_GridLayout.properties = {
  columnSpacing: "real",
  columns: "int",
  flow: "enum",
  layoutDirection: "enum",
  rowSpacing: "real",
  rows: "int"
};
QmlWeb.registerQmlType(QtQuick_Layouts_GridLayout);

// eslint-disable-next-line no-undef
class QtQuick_Layouts_RowLayout extends QtQuick_Item {}
QtQuick_Layouts_RowLayout.versions = /^1\./;
QtQuick_Layouts_RowLayout.properties = {
  layoutDirection: "enum",
  spacing: "real"
};
QmlWeb.registerQmlType(QtQuick_Layouts_RowLayout);

// eslint-disable-next-line no-undef
class QtQuick_Layouts_StackLayout extends QtQuick_Item {}
QtQuick_Layouts_StackLayout.versions = /^1\./;
QtQuick_Layouts_StackLayout.properties = {
  count: "int",
  currentIndex: "int"
};
QmlWeb.registerQmlType(QtQuick_Layouts_StackLayout);

// eslint-disable-next-line no-undef
class QtQuick_Particles_Emitter extends QtQuick_Item {

  // TODO

  burst() /*count, x, y*/{
    // TODO
  }
  pulse(duration) {
    if (this.enabled) return;
    this.enabled = true;
    setTimeout(() => {
      this.enabled = false;
    }, duration);
  }
}
QtQuick_Particles_Emitter.versions = /^2\./;
QtQuick_Particles_Emitter.properties = {
  acceleration: "StochasticDirection",
  emitRate: { type: "real", initialValue: 10 },
  enabled: { type: "bool", initialValue: true },
  endSize: { type: "real", initialValue: -1 },
  group: "string",
  lifeSpan: { type: "int", initialValue: 1000 },
  lifeSpanVariation: "int",
  maximumEmitted: { type: "int", initialValue: -1 },
  shape: "Shape",
  size: { type: "real", initialValue: 16 },
  sizeVariation: "real",
  startTime: "int",
  system: "ParticleSystem",
  velocity: "StochasticDirection",
  velocityFromMovement: "real"
};
QtQuick_Particles_Emitter.signals = {
  emitParticles: [{ type: "Array", name: "particles" }]
};
QmlWeb.registerQmlType(QtQuick_Particles_Emitter);

// eslint-disable-next-line no-undef
class QtQuick_Particles_ParticlePainter extends QtQuick_Item {}
QtQuick_Particles_ParticlePainter.versions = /^2\./;
QtQuick_Particles_ParticlePainter.properties = {
  groups: "list",
  system: "ParticleSystem"
};
QmlWeb.registerQmlType(QtQuick_Particles_ParticlePainter);

// eslint-disable-next-line no-undef, max-len
class QtQuick_Particles_CustomParticle extends QtQuick_Particles_ParticlePainter {}
QtQuick_Particles_CustomParticle.versions = /^2\./;
QtQuick_Particles_CustomParticle.properties = {
  fragmentShader: "string",
  vertexShader: "string"
};
QmlWeb.registerQmlType(QtQuick_Particles_CustomParticle);

// eslint-disable-next-line no-undef
class QtQuick_Particles_ParticleSystem extends QtQuick_Item {

  // TODO

  pause() {
    this.paused = true;
  }
  reset() {
    // TODO
  }
  restart() {
    this.running = false;
    this.running = true;
  }
  resume() {
    this.paused = false;
  }
  start() {
    this.running = true;
  }
  stop() {
    this.running = false;
  }
}
QtQuick_Particles_ParticleSystem.versions = /^2\./;
QtQuick_Particles_ParticleSystem.properties = {
  empty: "bool",
  particleStates: "list",
  paused: "bool",
  running: { type: "bool", initialValue: true }
};
QmlWeb.registerQmlType(QtQuick_Particles_ParticleSystem);

// eslint-disable-next-line no-undef
class QtQuick_Window_Window extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.colorChanged.connect(this, this.$onColorChanged);
  }
  $onColorChanged(newVal) {
    this.dom.style.backgroundColor = newVal.$css;
  }
}
QtQuick_Window_Window.versions = /^2\./;
QtQuick_Window_Window.properties = {
  active: "bool",
  activeFocusItem: "Item",
  color: { type: "color", initialValue: "#ffffff" },
  //contentItem: "Item", // TODO
  contentOrientation: "enum",
  flags: "int",
  maximumHeight: "int",
  maximumWidth: "int",
  minimumHeight: "int",
  minimumWidth: "int",
  modality: "enum",
  title: "string",
  visibility: "enum"
};
QtQuick_Window_Window.signals = {
  closing: [{ type: "CloseEvent", name: "close" }]
};
QmlWeb.registerQmlType(QtQuick_Window_Window);

// eslint-disable-next-line no-undef
class QtQuick_Controls_2_ApplicationWindow extends QtQuick_Window_Window {}
QtQuick_Controls_2_ApplicationWindow.versions = /^2\./;
QtQuick_Controls_2_ApplicationWindow.properties = {
  font: "font",
  activeFocusControl: "Control",
  background: "Item",
  contentData: "list",
  //contentItem: "ContentItem", // TODO
  footer: "Item",
  header: "Item",
  overlay: "Item"
};
QmlWeb.registerQmlType(QtQuick_Controls_2_ApplicationWindow);

// eslint-disable-next-line no-undef
class QtQuick_Controls_ApplicationWindow extends QtQuick_Window_Window {}
QtQuick_Controls_ApplicationWindow.versions = /^1\./;
QtQuick_Controls_ApplicationWindow.properties = {
  //contentItem: "ContentItem", // TODO
  menuBar: "MenuBar",
  statusBar: "Item",
  style: "Component",
  toolBar: "Item"
};
QmlWeb.registerQmlType(QtQuick_Controls_ApplicationWindow);

// eslint-disable-next-line no-undef
class QtQuick_BorderImage extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.border = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.border, {
      left: "int",
      right: "int",
      top: "int",
      bottom: "int"
    });

    const bg = this.impl = document.createElement("div");
    bg.style.pointerEvents = "none";
    bg.style.height = "100%";
    bg.style.boxSizing = "border-box";
    this.dom.appendChild(bg);

    this.$img = new Image();
    this.$img.addEventListener("load", () => {
      this.progress = 1;
      this.status = this.BorderImage.Ready;
    });
    this.$img.addEventListener("error", () => {
      this.status = this.BorderImage.Error;
    });

    this.sourceChanged.connect(this, this.$onSourceChanged);
    this.border.leftChanged.connect(this, this.$updateBorder);
    this.border.rightChanged.connect(this, this.$updateBorder);
    this.border.topChanged.connect(this, this.$updateBorder);
    this.border.bottomChanged.connect(this, this.$updateBorder);
    this.horizontalTileModeChanged.connect(this, this.$updateBorder);
    this.verticalTileModeChanged.connect(this, this.$updateBorder);
    this.smoothChanged.connect(this, this.$onSmoothChanged);
  }
  $onSourceChanged(source) {
    this.progress = 0;
    this.status = this.BorderImage.Loading;
    const style = this.impl.style;
    const imageURL = QmlWeb.engine.$resolveImageURL(source);
    style.OBorderImageSource = `url("${imageURL}")`;
    style.borderImageSource = `url("${imageURL}")`;
    this.$img.src = imageURL;
    if (this.$img.complete) {
      this.progress = 1;
      this.status = this.BorderImage.Ready;
    }
  }
  $updateBorder() {
    const style = this.impl.style;
    const { right, left, top, bottom } = this.border;
    const slice = `${top} ${right} ${bottom} ${left} fill`;
    const width = `${top}px ${right}px ${bottom}px ${left}px`;
    const repeat = `${this.horizontalTileMode} ${this.verticalTileMode}`;
    style.OBorderImageSlice = slice;
    style.OBorderImageRepeat = repeat;
    style.OBorderImageWidth = width;
    style.borderImageSlice = slice;
    style.borderImageRepeat = repeat;
    style.borderImageWidth = width;
  }
  $onSmoothChanged(val) {
    const style = this.impl.style;
    if (val) {
      style.imageRendering = "auto";
    } else {
      style.imageRendering = "-webkit-optimize-contrast";
      style.imageRendering = "-moz-crisp-edges";
      style.imageRendering = "crisp-edges";
      style.imageRendering = "pixelated";
    }
  }
}
QtQuick_BorderImage.enums = {
  BorderImage: {
    Stretch: "stretch", Repeat: "repeat", Round: "round",
    Null: 1, Ready: 2, Loading: 3, Error: 4
  }
};
QtQuick_BorderImage.properties = {
  source: "url",
  smooth: { type: "bool", initialValue: true },
  // BorderImage.Stretch
  horizontalTileMode: { type: "enum", initialValue: "stretch" },
  // BorderImage.Stretch
  verticalTileMode: { type: "enum", initialValue: "stretch" },
  progress: "real",
  status: { type: "enum", initialValue: 1 // BorderImage.Null
  } };
QmlWeb.registerQmlType(QtQuick_BorderImage);

// TODO
// Currently only a skeleton implementation

// eslint-disable-next-line no-undef
class QtQuick_Canvas extends QtQuick_Item {

  cancelRequestAnimationFrame() /*handle*/{
    return false;
  }
  getContext() /*context_id, ...args*/{
    return {};
  }
  isImageError() /*image*/{
    return true;
  }
  isImageLoaded() /*image*/{
    return false;
  }
  isImageLoading() /*image*/{
    return false;
  }
  loadImage(image) {
    //loadImageAsync(image);
    if (this.isImageLoaded(image)) {
      this.imageLoaded();
    }
  }
  markDirty(area) {
    // if dirty
    this.paint(area);
  }
  requestAnimationFrame() /*callback*/{
    return 0;
  }
  requestPaint() {}
  save() /*file_name*/{
    return false;
  }
  toDataURL() /*mime_type*/{
    return "";
  }
  unloadImage() /*image*/{}
}
QtQuick_Canvas.properties = {
  available: { type: "bool", initialValue: true },
  canvasSize: { type: "var", initialValue: [0, 0] },
  canvasWindow: { type: "var", initialValue: [0, 0, 0, 0] },
  context: { type: "var", initialValue: {} },
  contextType: { type: "string", initialValue: "contextType" },
  renderStrategy: "enum",
  renderTarget: "enum",
  tileSize: { type: "var", initialValue: [0, 0] }
};
QtQuick_Canvas.signals = {
  imageLoaded: [],
  paint: [{ type: "var", name: "region" }],
  painted: []
};
QmlWeb.registerQmlType(QtQuick_Canvas);

// eslint-disable-next-line no-undef
class QtQuick_DoubleValidator extends QtQuick_Item {

  constructor(meta) {
    super(meta);
    this.$standardRegExp = /^(-|\+)?\s*[0-9]+(\.[0-9]+)?$/;
    this.$scientificRegExp = /^(-|\+)?\s*[0-9]+(\.[0-9]+)?(E(-|\+)?[0-9]+)?$/;
  }
  getRegExpForNotation(notation) {
    switch (notation) {
      case this.DoubleValidator.ScientificNotation:
        return this.$scientificRegExp;
      case this.DoubleValidator.StandardNotation:
        return this.$standardRegExp;
    }
    return null;
  }
  $getDecimalsForNumber(number) {
    if (Math.round(number) === number) {
      return 0;
    }
    const str = `${number}`;
    return (/\d*$/.exec(str)[0].length
    );
  }
  validate(string) {
    const regExp = this.getRegExpForNotation(this.notation);
    if (!regExp.test(string.trim())) {
      return false;
    }
    const value = parseFloat(string);
    return this.bottom <= value && this.top >= value && this.$getDecimalsForNumber(value) <= this.decimals;
  }
}
QtQuick_DoubleValidator.enums = {
  DoubleValidator: { StandardNotation: 1, ScientificNotation: 2 }
};
QtQuick_DoubleValidator.properties = {
  bottom: { type: "real", initialValue: -Infinity },
  top: { type: "real", initialValue: Infinity },
  decimals: { type: "int", initialValue: 1000 },
  // DoubleValidator.ScientificNotation
  notation: { type: "enum", initialValue: 2 }
};
QmlWeb.registerQmlType(QtQuick_DoubleValidator);

// eslint-disable-next-line no-undef
class QtQuick_FocusScope extends QtQuick_Item {
  // TODO
}
QmlWeb.registerQmlType(QtQuick_FocusScope);

// eslint-disable-next-line no-undef
class QtQuick_Image extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.sourceSize = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.sourceSize, {
      width: "int",
      height: "int"
    });

    const bg = this.impl = document.createElement("div");
    bg.style.pointerEvents = "none";
    bg.style.height = "100%";
    this.dom.appendChild(bg);

    this.$img = new Image();
    this.$img.addEventListener("load", () => {
      const w = this.$img.naturalWidth;
      const h = this.$img.naturalHeight;
      this.sourceSize.width = w;
      this.sourceSize.height = h;
      this.implicitWidth = w;
      this.implicitHeight = h;
      this.progress = 1;
      this.status = this.Image.Ready;
    });
    this.$img.addEventListener("error", () => {
      this.status = this.Image.Error;
    });

    this.sourceChanged.connect(this, this.$onSourceChanged);
    this.mirrorChanged.connect(this, this.$onMirrorChanged);
    this.fillModeChanged.connect(this, this.$onFillModeChanged);
    this.smoothChanged.connect(this, this.$onSmoothChanged);
  }
  $updateFillMode(val = this.fillMode) {
    const style = this.impl.style;
    switch (val) {
      default:
      case this.Image.Stretch:
        style.backgroundRepeat = "auto";
        style.backgroundSize = "100% 100%";
        style.backgroundPosition = "auto";
        break;
      case this.Image.Tile:
        style.backgroundRepeat = "auto";
        style.backgroundSize = "auto";
        style.backgroundPosition = "center";
        break;
      case this.Image.PreserveAspectFit:
        style.backgroundRepeat = "no-repeat";
        style.backgroundSize = "contain";
        style.backgroundPosition = "center";
        break;
      case this.Image.PreserveAspectCrop:
        style.backgroundRepeat = "no-repeat";
        style.backgroundSize = "cover";
        style.backgroundPosition = "center";
        break;
      case this.Image.TileVertically:
        style.backgroundRepeat = "repeat-y";
        style.backgroundSize = "100% auto";
        style.backgroundPosition = "auto";
        break;
      case this.Image.TileHorizontally:
        style.backgroundRepeat = "repeat-x";
        style.backgroundSize = "auto 100%";
        style.backgroundPosition = "auto";
        break;
    }
  }
  $onSourceChanged(source) {
    this.progress = 0;
    this.status = this.Image.Loading;
    const imageURL = QmlWeb.engine.$resolveImageURL(source);
    this.impl.style.backgroundImage = `url("${imageURL}")`;
    this.$img.src = imageURL;
    if (this.$img.complete) {
      setTimeout(() => {
        this.progress = 1;
        this.status = this.Image.Ready;
      }, 0);
    }
    this.$updateFillMode();
  }
  $onMirrorChanged(val) {
    const transformRule = "scale(-1,1)";
    if (!val) {
      const index = this.transform.indexOf(transformRule);
      if (index >= 0) {
        this.transform.splice(index, 1);
      }
    } else {
      this.transform.push(transformRule);
    }
    this.$updateTransform();
  }
  $onFillModeChanged(val) {
    this.$updateFillMode(val);
  }
  $onSmoothChanged(val) {
    const style = this.impl.style;
    if (val) {
      style.imageRendering = "auto";
    } else {
      style.imageRendering = "-webkit-optimize-contrast";
      style.imageRendering = "-moz-crisp-edges";
      style.imageRendering = "crisp-edges";
      style.imageRendering = "pixelated";
    }
  }
}
QtQuick_Image.enums = {
  Image: {
    Stretch: 1, PreserveAspectFit: 2, PreserveAspectCrop: 3,
    Tile: 4, TileVertically: 5, TileHorizontally: 6,

    Null: 1, Ready: 2, Loading: 3, Error: 4
  }
};
QtQuick_Image.properties = {
  asynchronous: { type: "bool", initialValue: true },
  cache: { type: "bool", initialValue: true },
  smooth: { type: "bool", initialValue: true },
  fillMode: { type: "enum", initialValue: 1 }, // Image.Stretch
  mirror: "bool",
  progress: "real",
  source: "url",
  status: { type: "enum", initialValue: 1 // Image.Null
  } };
QmlWeb.registerQmlType(QtQuick_Image);

// eslint-disable-next-line no-undef
class QtQuick_AnimatedImage extends QtQuick_Image {}
QmlWeb.registerQmlType(QtQuick_AnimatedImage);

// eslint-disable-next-line no-undef
class QtQuick_IntValidator extends QtQuick_Item {

  validate(string) {
    const regExp = /^(-|\+)?\s*[0-9]+$/;
    let acceptable = regExp.test(string.trim());

    if (acceptable) {
      const value = parseInt(string, 10);
      acceptable = this.bottom <= value && this.top >= value;
    }
    return acceptable;
  }
}
QtQuick_IntValidator.properties = {
  bottom: { type: "int", initialValue: -2147483647 },
  top: { type: "int", initialValue: 2147483647 }
};
QmlWeb.registerQmlType(QtQuick_IntValidator);

// eslint-disable-next-line no-undef
class QtQuick_ListElement extends QtQml_QtObject {
  constructor(meta) {
    super(meta);

    for (const i in meta.object) {
      if (i[0] !== "$") {
        QmlWeb.createProperty("variant", this, i);
      }
    }
    QmlWeb.applyProperties(meta.object, this, this, this.$context);
  }
}
QmlWeb.registerQmlType(QtQuick_ListElement);

// eslint-disable-next-line no-undef
class QtQml_Models_ListElement extends QtQuick_ListElement {}
QtQml_Models_ListElement.versions = /^2\./;
QmlWeb.registerQmlType(QtQml_Models_ListElement);

// eslint-disable-next-line no-undef
class QtQuick_ListModel extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.$firstItem = true;
    this.$itemsChanged.connect(this, this.$on$itemsChanged);
    this.$model = new QmlWeb.JSItemModel();
    this.$model.data = (index, role) => this.$items[index][role];
    this.$model.rowCount = () => this.$items.length;
  }
  $on$itemsChanged(newVal) {
    this.count = this.$items.length;
    if (this.$firstItem && newVal.length > 0) {
      const QMLListElement = QmlWeb.getConstructor("QtQuick", "2.0", "ListElement");
      this.$firstItem = false;
      const roleNames = [];
      let dict = newVal[0];
      if (dict instanceof QMLListElement) {
        dict = dict.$properties;
      }
      for (const i in dict) {
        if (i !== "index") {
          roleNames.push(i);
        }
      }
      this.$model.setRoleNames(roleNames);
    }
  }
  append(dict) {
    const index = this.$items.length;
    let c = 0;

    if (dict instanceof Array) {
      for (const key in dict) {
        this.$items.push(dict[key]);
        c++;
      }
    } else {
      this.$items.push(dict);
      c = 1;
    }

    this.$itemsChanged(this.$items);
    this.$model.rowsInserted(index, index + c);
  }
  clear() {
    this.$items.length = 0;
    this.count = 0;
    this.$model.modelReset();
  }
  get(index) {
    return this.$items[index];
  }
  insert(index, dict) {
    this.$items.splice(index, 0, dict);
    this.$itemsChanged(this.$items);
    this.$model.rowsInserted(index, index + 1);
  }
  move(from, to, n) {
    const vals = this.$items.splice(from, n);
    for (let i = 0; i < vals.length; i++) {
      this.$items.splice(to + i, 0, vals[i]);
    }
    this.$model.rowsMoved(from, from + n, to);
  }
  remove(index) {
    this.$items.splice(index, 1);
    this.$model.rowsRemoved(index, index + 1);
    this.count = this.$items.length;
  }
  set(index, dict) {
    this.$items[index] = dict;
    this.$model.dataChanged(index, index);
  }
  setProperty(index, property, value) {
    this.$items[index][property] = value;
    this.$model.dataChanged(index, index);
  }
}
QtQuick_ListModel.properties = {
  count: "int",
  $items: "list"
};
QtQuick_ListModel.defaultProperty = "$items";
QmlWeb.registerQmlType(QtQuick_ListModel);

// eslint-disable-next-line no-undef
class QtQml_Models_ListModel extends QtQuick_ListModel {}
QtQml_Models_ListModel.versions = /^2\./;
QtQml_Models_ListModel.defaultProperty = "$items";
QmlWeb.registerQmlType(QtQml_Models_ListModel);

// eslint-disable-next-line no-undef
class QtQuick_Loader extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.$sourceUrl = "";

    this.activeChanged.connect(this, this.$onActiveChanged);
    this.sourceChanged.connect(this, this.$onSourceChanged);
    this.sourceComponentChanged.connect(this, this.$onSourceComponentChanged);
    this.widthChanged.connect(this, this.$updateGeometry);
    this.heightChanged.connect(this, this.$updateGeometry);
  }
  $onActiveChanged() {
    if (!this.active) {
      this.$unload();
      return;
    }
    if (this.source) {
      this.$onSourceChanged(this.source);
    } else if (this.sourceComponent) {
      this.$onSourceComponentChanged(this.sourceComponent);
    }
  }
  $onSourceChanged(fileName) {
    // TODO
    // if (fileName == this.$sourceUrl && this.item !== undefined) return;
    if (!this.active) return;
    this.$unload();

    if (!fileName) {
      this.sourceComponent = null;
      this.$sourceUrl = fileName;
      return;
    }

    const tree = QmlWeb.engine.loadComponent(fileName);
    const QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
    const meta = { object: tree, context: this.$context, parent: this };
    const qmlComponent = new QMLComponent(meta);
    qmlComponent.$basePath = QmlWeb.engine.extractBasePath(tree.$file);
    qmlComponent.$imports = tree.$imports;
    qmlComponent.$file = tree.$file;
    QmlWeb.engine.loadImports(tree.$imports, qmlComponent.$basePath, qmlComponent.importContextId);
    const loadedComponent = this.$createComponentObject(qmlComponent, this);
    this.sourceComponent = loadedComponent;
    this.$sourceUrl = fileName;
  }
  $onSourceComponentChanged(newItem) {
    if (!this.active) return;
    this.$unload();

    if (!newItem) {
      this.item = null;
      return;
    }

    const QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
    let qmlComponent = newItem;
    if (newItem instanceof QMLComponent) {
      qmlComponent = newItem.$createObject(this, {}, this);
    }
    qmlComponent.parent = this;
    this.item = qmlComponent;
    this.$updateGeometry();
    if (this.item) {
      this.loaded();
    }
  }
  setSource(url, options) {
    this.$sourceUrl = url;
    this.props = options;
    this.source = url;
  }
  $unload() {
    if (!this.item) return;
    this.item.$delete();
    this.item.parent = undefined;
    this.item = undefined;
  }
  $callOnCompleted(child) {
    child.Component.completed();
    const QMLBaseObject = QmlWeb.getConstructor("QtQml", "2.0", "QtObject");
    for (let i = 0; i < child.$tidyupList.length; i++) {
      if (child.$tidyupList[i] instanceof QMLBaseObject) {
        this.$callOnCompleted(child.$tidyupList[i]);
      }
    }
  }
  $createComponentObject(qmlComponent, parent) {
    const newComponent = qmlComponent.createObject(parent);
    if (QmlWeb.engine.operationState !== QmlWeb.QMLOperationState.Init) {
      // We don't call those on first creation, as they will be called
      // by the regular creation-procedures at the right time.
      QmlWeb.engine.$initializePropertyBindings();
      this.$callOnCompleted(newComponent);
    }
    return newComponent;
  }
  $updateGeometry() {
    // Loader size doesn't exist
    if (!this.width) {
      this.width = this.item ? this.item.width : 0;
    } else if (this.item) {
      // Loader size exists
      this.item.width = this.width;
    }

    if (!this.height) {
      this.height = this.item ? this.item.height : 0;
    } else if (this.item) {
      // Loader size exists
      this.item.height = this.height;
    }
  }
}
QtQuick_Loader.properties = {
  active: { type: "bool", initialValue: true },
  asynchronous: "bool",
  item: "var",
  progress: "real",
  source: "url",
  sourceComponent: "Component",
  status: { type: "enum", initialValue: 1 }
};
QtQuick_Loader.signals = {
  loaded: []
};
QmlWeb.registerQmlType(QtQuick_Loader);

// eslint-disable-next-line no-undef
class QtQuick_MouseArea extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.dom.style.pointerEvents = "all";

    // IE does not handle mouse clicks to transparent divs, so we have
    // to set a background color and make it invisible using opacity
    // as that doesn't affect the mouse handling.
    this.dom.style.backgroundColor = "white";
    this.dom.style.opacity = 0;

    this.cursorShapeChanged.connect(this, this.$onCursorShapeChanged);

    this.dom.addEventListener("click", e => this.$handleClick(e));
    this.dom.addEventListener("contextmenu", e => this.$handleClick(e));
    const handleMouseMove = e => {
      if (!this.enabled || !this.hoverEnabled && !this.pressed) return;
      this.$handlePositionChanged(e);
    };
    const handleMouseUp = e => {
      const mouse = this.$eventToMouse(e);
      this.pressed = false;
      this.containsPress = false;
      this.pressedButtons = 0;
      this.released(mouse);
      document.removeEventListener("mouseup", handleMouseUp);
      this.$clientTransform = undefined;
      document.removeEventListener("mousemove", handleMouseMove);
    };
    this.dom.addEventListener("mousedown", e => {
      if (!this.enabled) return;
      // Handle scale and translate transformations
      const boundingRect = this.dom.getBoundingClientRect();
      this.$clientTransform = {
        x: boundingRect.left,
        y: boundingRect.top,
        xScale: this.width ? (boundingRect.right - boundingRect.left) / this.width : 1,
        yScale: this.height ? (boundingRect.bottom - boundingRect.top) / this.height : 1
      };
      const mouse = this.$eventToMouse(e);
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.pressed = true;
      this.containsPress = true;
      this.pressedButtons = mouse.button;
      this.$Signals.pressed(mouse);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
    });
    this.dom.addEventListener("mouseover", () => {
      this.containsMouse = true;
      this.containsPress = this.pressed;
      this.entered();
    });
    this.dom.addEventListener("mouseout", () => {
      this.containsMouse = false;
      this.containsPress = false;
      this.exited();
    });
    // This is to emit positionChanged for `hoverEnabled` only. When `pressed`,
    // `positionChanged` is handled by a temporary `mousemove` event listener
    // on `document`.
    this.dom.addEventListener("mousemove", e => {
      if (!this.enabled || !this.hoverEnabled || this.pressed) return;
      this.$handlePositionChanged(e);
    });
    this.dom.addEventListener("wheel", e => {
      this.$handleWheel(e);
    });
  }
  $onCursorShapeChanged() {
    this.dom.style.cursor = this.$cursorShapeToCSS();
  }
  $handlePositionChanged(e) {
    const mouse = this.$eventToMouse(e);
    this.mouseX = mouse.x;
    this.mouseY = mouse.y;
    this.positionChanged(mouse);
  }
  $handleWheel(e) {
    const wheel = this.$eventToMouse(e);
    wheel.angleDelta = { x: e.deltaX, y: e.deltaY };
    wheel.accepted = false;

    this.wheel(wheel);

    if (wheel.accepted) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
  $handleClick(e) {
    const mouse = this.$eventToMouse(e);
    if (this.enabled && this.acceptedButtons & mouse.button) {
      this.clicked(mouse);
    }
    // This decides whether to show the browser's context menu on right click or
    // not
    return !(this.acceptedButtons & QmlWeb.Qt.RightButton);
  }
  $eventToMouse(e) {
    const Qt = QmlWeb.Qt;
    const mouse = {
      accepted: true,
      button: e.button === 0 ? Qt.LeftButton : e.button === 1 ? Qt.MiddleButton : e.button === 2 ? Qt.RightButton : 0,
      modifiers: e.ctrlKey * Qt.CtrlModifier | e.altKey * Qt.AltModifier | e.shiftKey * Qt.ShiftModifier | e.metaKey * Qt.MetaModifier
    };
    if (this.$clientTransform) {
      // Handle scale and translate transformations
      mouse.x = (e.clientX - this.$clientTransform.x) / this.$clientTransform.xScale;
      mouse.y = (e.clientY - this.$clientTransform.y) / this.$clientTransform.yScale;
    } else {
      mouse.x = e.offsetX || e.layerX;
      mouse.y = e.offsetY || e.layerY;
    }
    return mouse;
  }

  // eslint-disable-next-line complexity
  $cursorShapeToCSS() {
    const Qt = QmlWeb.Qt;
    switch (this.cursorShape) {
      case Qt.ArrowCursor:
        return "default";
      case Qt.UpArrowCursor:
        return "n-resize";
      case Qt.CrossCursor:
        return "crosshair";
      case Qt.WaitCursor:
        return "wait";
      case Qt.IBeamCursor:
        return "text";
      case Qt.SizeVerCursor:
        return "ew-resize";
      case Qt.SizeHorCursor:
        return "ns-resize";
      case Qt.SizeBDiagCursor:
        return "nesw-resize";
      case Qt.SizeFDiagCursor:
        return "nwse-resize";
      case Qt.SizeAllCursor:
        return "all-scroll";
      case Qt.BlankCursor:
        return "none";
      case Qt.SplitVCursor:
        return "row-resize";
      case Qt.SplitHCursor:
        return "col-resize";
      case Qt.PointingHandCursor:
        return "pointer";
      case Qt.ForbiddenCursor:
        return "not-allowed";
      case Qt.WhatsThisCursor:
        return "help";
      case Qt.BusyCursor:
        return "progress";
      case Qt.OpenHandCursor:
        return "grab";
      case Qt.ClosedHandCursor:
        return "grabbing";
      case Qt.DragCopyCursor:
        return "copy";
      case Qt.DragMoveCursor:
        return "move";
      case Qt.DragLinkCursor:
        return "alias";
      //case Qt.BitmapCursor: return "auto";
      //case Qt.CustomCursor: return "auto";
    }
    return "auto";
  }
}
QtQuick_MouseArea.properties = {
  acceptedButtons: { type: "variant", initialValue: 1 }, // Qt.LeftButton
  enabled: { type: "bool", initialValue: true },
  hoverEnabled: "bool",
  mouseX: "real",
  mouseY: "real",
  pressed: "bool",
  containsMouse: "bool",
  containsPress: "bool",
  pressedButtons: { type: "variant", initialValue: 0 },
  cursorShape: "enum" // Qt.ArrowCursor
};
QtQuick_MouseArea.signals = {
  canceled: [],
  clicked: [{ type: "variant", name: "mouse" }],
  doubleClicked: [{ type: "variant", name: "mouse" }],
  entered: [],
  exited: [],
  positionChanged: [{ type: "variant", name: "mouse" }],
  pressAndHold: [{ type: "variant", name: "mouse" }],
  pressed: [{ type: "variant", name: "mouse" }],
  released: [{ type: "variant", name: "mouse" }],
  wheel: [{ type: "variant", name: "wheel" }]
};
QmlWeb.registerQmlType(QtQuick_MouseArea);

// eslint-disable-next-line no-undef
class QtQuick_OpacityAnimator extends QtQuick_Animator {}
QtQuick_OpacityAnimator.versions = /^2\./;
QmlWeb.registerQmlType(QtQuick_OpacityAnimator);

// eslint-disable-next-line no-undef
class QtQuick_ParallelAnimation extends QtQuick_Animation {

  constructor(meta) {
    super(meta);

    this.$runningAnimations = 0;

    this.animationsChanged.connect(this, this.$onAnimationsChanged);

    QmlWeb.engine.$registerStart(() => {
      if (!this.running) return;
      self.running = false; // toggled back by start();
      self.start();
    });
    QmlWeb.engine.$registerStop(() => this.stop());
  }
  $onAnimationsChanged() {
    const flags = QmlWeb.Signal.UniqueConnection;
    for (let i = 0; i < this.animations.length; i++) {
      const animation = this.animations[i];
      animation.runningChanged.connect(this, this.$animationFinished, flags);
    }
  }
  $animationFinished(newVal) {
    this.$runningAnimations += newVal ? 1 : -1;
    if (this.$runningAnimations === 0) {
      this.running = false;
    }
  }
  start() {
    if (this.running) return;
    this.running = true;
    for (let i = 0; i < this.animations.length; i++) {
      this.animations[i].start();
    }
  }
  stop() {
    if (!this.running) return;
    for (let i = 0; i < this.animations.length; i++) {
      this.animations[i].stop();
    }
    this.running = false;
  }
  complete() {
    this.stop();
  }
}
QtQuick_ParallelAnimation.enums = {
  Animation: { Infinite: Math.Infinite }
};
QtQuick_ParallelAnimation.properties = {
  animations: "list"
};
QtQuick_ParallelAnimation.defaultProperty = "animations";
QmlWeb.registerQmlType(QtQuick_ParallelAnimation);

// eslint-disable-next-line no-undef
class QtQuick_PauseAnimation extends QtQuick_Animation {

  constructor(meta) {
    super(meta);

    this.$at = 0;

    QmlWeb.engine.$addTicker((...args) => this.$ticker(...args));
    this.runningChanged.connect(this, this.$onRunningChanged);
  }
  $ticker(now, elapsed) {
    if (!this.running || this.paused) {
      return;
    }
    this.$at += elapsed / this.duration;
    if (this.$at >= 1) {
      this.complete();
    }
  }
  $onRunningChanged(newVal) {
    if (newVal) {
      this.$at = 0;
      this.paused = false;
    }
  }
  complete() {
    this.running = false;
  }
}
QtQuick_PauseAnimation.properties = {
  duration: { type: "int", initialValue: 250 }
};
QmlWeb.registerQmlType(QtQuick_PauseAnimation);

// eslint-disable-next-line no-undef
class QtQuick_Positioner extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.childrenChanged.connect(this, this.$onChildrenChanged);
    this.spacingChanged.connect(this, this.layoutChildren);
    this.childrenChanged.connect(this, this.layoutChildren);
    this.layoutChildren();
  }
  $onChildrenChanged() {
    const flags = QmlWeb.Signal.UniqueConnection;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.widthChanged.connect(this, this.layoutChildren, flags);
      child.heightChanged.connect(this, this.layoutChildren, flags);
      child.visibleChanged.connect(this, this.layoutChildren, flags);
    }
  }
  layoutChildren() {
    // noop, defined in individual positioners
  }
}
QtQuick_Positioner.properties = {
  spacing: "int",
  padding: "int"
};
QmlWeb.registerQmlType(QtQuick_Positioner);

// eslint-disable-next-line no-undef
class QtQuick_Column extends QtQuick_Positioner {
  layoutChildren() {
    let curPos = this.padding;
    let maxWidth = 0;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (!child.visible || !child.width || !child.height) {
        continue;
      }
      maxWidth = child.width > maxWidth ? child.width : maxWidth;
      child.y = curPos + this.padding;
      if (this.padding > 0) child.x = this.padding;
      curPos += child.height + this.spacing;
    }
    this.implicitWidth = maxWidth + this.padding * 2;
    this.implicitHeight = curPos - this.spacing + this.padding;
    // We want no spacing at the bottom side
  }
}
QmlWeb.registerQmlType(QtQuick_Column);

// eslint-disable-next-line no-undef
class QtQuick_Flow extends QtQuick_Positioner {

  constructor(meta) {
    super(meta);

    this.flowChanged.connect(this, this.layoutChildren);
    this.layoutDirectionChanged.connect(this, this.layoutChildren);
    this.widthChanged.connect(this, this.layoutChildren);
    this.heightChanged.connect(this, this.layoutChildren);
    this.layoutChildren();
  }

  layoutChildren() {
    if (this.flow === undefined) {
      // Flow has not been fully initialized yet
      return;
    }

    let curHPos = 0;
    let curVPos = 0;
    let rowSize = 0;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (!child.visible || !child.width || !child.height) {
        continue;
      }

      if (this.flow === this.Flow.LeftToRight) {
        if (!this.$isUsingImplicitWidth && curHPos + child.width > this.width) {
          curHPos = 0;
          curVPos += rowSize + this.spacing;
          rowSize = 0;
        }
        rowSize = child.height > rowSize ? child.height : rowSize;
        child.x = this.layoutDirection === this.Flow.TopToBottom ? this.width - curHPos - child.width : curHPos;
        child.y = curVPos;
        curHPos += child.width + this.spacing;
      } else {
        // Flow.TopToBottom
        if (!this.$isUsingImplicitHeight && curVPos + child.height > this.height) {
          curVPos = 0;
          curHPos += rowSize + this.spacing;
          rowSize = 0;
        }
        rowSize = child.width > rowSize ? child.width : rowSize;
        child.x = this.layoutDirection === this.Flow.TopToBottom ? this.width - curHPos - child.width : curHPos;
        child.y = curVPos;
        curVPos += child.height + this.spacing;
      }
    }

    if (this.flow === this.Flow.LeftToRight) {
      this.implicitWidth = curHPos - this.spacing;
      this.implicitHeight = curVPos + rowSize;
    } else {
      // Flow.TopToBottom
      this.implicitWidth = curHPos + rowSize;
      this.implicitHeight = curVPos - this.spacing;
    }
  }
}
QtQuick_Flow.enums = {
  Flow: { LeftToRight: 0, TopToBottom: 1 }
};
QtQuick_Flow.properties = {
  flow: "enum", // Flow.LeftToRight
  layoutDirection: "enum" // Flow.LeftToRight
};
QmlWeb.registerQmlType(QtQuick_Flow);

// eslint-disable-next-line no-undef
class QtQuick_Grid extends QtQuick_Positioner {

  constructor(meta) {
    super(meta);

    this.columnsChanged.connect(this, this.layoutChildren);
    this.rowsChanged.connect(this, this.layoutChildren);
    this.flowChanged.connect(this, this.layoutChildren);
    this.layoutDirectionChanged.connect(this, this.layoutChildren);
    this.layoutChildren();
  }
  layoutChildren() {
    // How many items are actually visible?
    const visibleItems = this.$getVisibleItems();

    // How many rows and columns do we need?
    const [c, r] = this.$calculateSize(visibleItems.length);

    // How big are the colums/rows?
    const [colWidth, rowHeight] = this.$calculateGrid(visibleItems, c, r);

    // Do actual positioning
    // When layoutDirection is RightToLeft we need oposite order of coumns
    const step = this.layoutDirection === 1 ? -1 : 1;
    const startingPoint = this.layoutDirection === 1 ? c - 1 : 0;
    const endPoint = this.layoutDirection === 1 ? -1 : c;
    let curHPos = 0;
    let curVPos = 0;
    if (this.flow === 0) {
      for (let i = 0; i < r; i++) {
        for (let j = startingPoint; j !== endPoint; j += step) {
          const item = visibleItems[i * c + j];
          if (!item) {
            break;
          }
          item.x = curHPos;
          item.y = curVPos;

          curHPos += colWidth[j] + this.spacing;
        }
        curVPos += rowHeight[i] + this.spacing;
        curHPos = 0;
      }
    } else {
      for (let i = startingPoint; i !== endPoint; i += step) {
        for (let j = 0; j < r; j++) {
          const item = visibleItems[i * r + j];
          if (!item) {
            break;
          }
          item.x = curHPos;
          item.y = curVPos;

          curVPos += rowHeight[j] + this.spacing;
        }
        curHPos += colWidth[i] + this.spacing;
        curVPos = 0;
      }
    }

    // Set implicit size
    let gridWidth = -this.spacing;
    let gridHeight = -this.spacing;
    for (const i in colWidth) {
      gridWidth += colWidth[i] + this.spacing;
    }
    for (const i in rowHeight) {
      gridHeight += rowHeight[i] + this.spacing;
    }
    this.implicitWidth = gridWidth;
    this.implicitHeight = gridHeight;
  }
  $getVisibleItems() {
    return this.children.filter(child => child.visible && child.width && child.height);
  }
  $calculateSize(length) {
    let cols;
    let rows;
    if (!this.columns && !this.rows) {
      cols = 4;
      rows = Math.ceil(length / cols);
    } else if (!this.columns) {
      rows = this.rows;
      cols = Math.ceil(length / rows);
    } else {
      cols = this.columns;
      rows = Math.ceil(length / cols);
    }
    return [cols, rows];
  }
  $calculateGrid(visibleItems, cols, rows) {
    const colWidth = [];
    const rowHeight = [];

    if (this.flow === 0) {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const item = visibleItems[i * cols + j];
          if (!item) {
            break;
          }
          if (!colWidth[j] || item.width > colWidth[j]) {
            colWidth[j] = item.width;
          }
          if (!rowHeight[i] || item.height > rowHeight[i]) {
            rowHeight[i] = item.height;
          }
        }
      }
    } else {
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const item = visibleItems[i * rows + j];
          if (!item) {
            break;
          }
          if (!rowHeight[j] || item.height > rowHeight[j]) {
            rowHeight[j] = item.height;
          }
          if (!colWidth[i] || item.width > colWidth[i]) {
            colWidth[i] = item.width;
          }
        }
      }
    }

    return [colWidth, rowHeight];
  }
}
QtQuick_Grid.enums = {
  Grid: { LeftToRight: 0, TopToBottom: 1 }
};
QtQuick_Grid.properties = {
  columns: "int",
  rows: "int",
  flow: "enum",
  layoutDirection: "enum"
};
QmlWeb.registerQmlType(QtQuick_Grid);

// eslint-disable-next-line no-undef
class QtQuick_PropertyAnimation extends QtQuick_Animation {

  constructor(meta) {
    super(meta);

    this.easing = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.easing, {
      type: { type: "enum", initialValue: this.Easing.Linear },
      amplitude: { type: "real", initialValue: 1 },
      overshoot: { type: "real", initialValue: 1.70158 },
      period: { type: "real", initialValue: 0.3 },
      bezierCurve: "list"
    });

    this.easing.$valueForProgress = function (t) {
      return QmlWeb.$ease(this.type, this.period, this.amplitude, this.overshoot, t);
    };

    this.$props = [];
    this.$targets = [];
    this.$actions = [];

    this.targetChanged.connect(this, this.$redoTargets);
    this.targetsChanged.connect(this, this.$redoTargets);
    this.propertyChanged.connect(this, this.$redoProperties);
    this.propertiesChanged.connect(this, this.$redoProperties);

    if (meta.object.$on !== undefined) {
      this.property = meta.object.$on;
      this.target = this.$parent;
      this.running = true;
    }
  }
  $redoActions() {
    this.$actions = [];
    for (let i = 0; i < this.$targets.length; i++) {
      for (const j in this.$props) {
        this.$actions.push({
          target: this.$targets[i],
          property: this.$props[j],
          from: this.from,
          to: this.to
        });
      }
    }
  }
  $redoProperties() {
    this.$props = this.properties.split(",");

    // Remove whitespaces
    for (let i = 0; i < this.$props.length; i++) {
      const matches = this.$props[i].match(/\w+/);
      if (matches) {
        this.$props[i] = matches[0];
      } else {
        this.$props.splice(i, 1);
        i--;
      }
    }
    // Merge properties and property
    if (this.property && this.$props.indexOf(this.property) === -1) {
      this.$props.push(this.property);
    }
  }
  $redoTargets() {
    this.$targets = this.targets.slice();
    if (this.target && this.$targets.indexOf(this.target) === -1) {
      this.$targets.push(this.target);
    }
  }
}
QtQuick_PropertyAnimation.properties = {
  duration: { type: "int", initialValue: 250 },
  from: "real",
  to: "real",
  properties: "string",
  property: "string",
  target: "QtObject",
  targets: "list"
};
QmlWeb.registerQmlType(QtQuick_PropertyAnimation);

// eslint-disable-next-line no-undef
class QtQuick_NumberAnimation extends QtQuick_PropertyAnimation {
  constructor(meta) {
    super(meta);

    this.$at = 0;
    this.$loop = 0;

    QmlWeb.engine.$addTicker((...args) => this.$ticker(...args));
    this.runningChanged.connect(this, this.$onRunningChanged);
  }
  $startLoop() {
    for (const i in this.$actions) {
      const action = this.$actions[i];
      action.from = action.from !== undefined ? action.from : action.target[action.property];
    }
    this.$at = 0;
  }
  $ticker(now, elapsed) {
    if (!this.running && this.$loop !== -1 || this.paused) {
      // $loop === -1 is a marker to just finish this run
      return;
    }
    if (this.$at === 0 && this.$loop === 0 && !this.$actions.length) {
      this.$redoActions();
    }
    this.$at += elapsed / this.duration;
    if (this.$at >= 1) {
      this.complete();
      return;
    }
    for (const i in this.$actions) {
      const action = this.$actions[i];
      const value = action.from + (action.to - action.from) * this.easing.$valueForProgress(this.$at);
      const property = action.target.$properties[action.property];
      property.set(value, QmlWeb.QMLProperty.ReasonAnimation);
    }
  }
  $onRunningChanged(newVal) {
    if (newVal) {
      this.$startLoop();
      this.paused = false;
    } else if (this.alwaysRunToEnd && this.$at < 1) {
      this.$loop = -1; // -1 is used as a marker to stop
    } else {
      this.$loop = 0;
      this.$actions = [];
    }
  }
  complete() {
    for (const i in this.$actions) {
      const action = this.$actions[i];
      const property = action.target.$properties[action.property];
      property.set(action.to, QmlWeb.QMLProperty.ReasonAnimation);
    }
    this.$loop++;
    if (this.$loop === this.loops) {
      this.running = false;
    } else if (!this.running) {
      this.$actions = [];
    } else {
      this.$startLoop(this);
    }
  }
}
QmlWeb.registerQmlType(QtQuick_NumberAnimation);

// eslint-disable-next-line no-undef
class QtQuick_PropertyChanges extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.$actions = [];
  }
  $setCustomData(property, value) {
    this.$actions.push({ property, value });
  }
}
QtQuick_PropertyChanges.properties = {
  target: "QtObject",
  explicit: "bool",
  restoreEntryValues: { type: "bool", initialValue: true }
};
QmlWeb.registerQmlType(QtQuick_PropertyChanges);

// eslint-disable-next-line no-undef
class QtQuick_Rectangle extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.border = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.border, {
      color: { type: "color", initialValue: "black" },
      width: { type: "int", initialValue: 1 }
    });
    this.$borderActive = false;

    const bg = this.impl = document.createElement("div");
    bg.style.pointerEvents = "none";
    bg.style.position = "absolute";
    bg.style.left = bg.style.right = bg.style.top = bg.style.bottom = "0px";
    bg.style.borderWidth = "0px";
    bg.style.borderStyle = "solid";
    bg.style.borderColor = this.border.color.$css;
    bg.style.backgroundColor = this.color.$css;
    this.dom.appendChild(bg);

    this.colorChanged.connect(this, this.$onColorChanged);
    this.radiusChanged.connect(this, this.$onRadiusChanged);
    this.border.colorChanged.connect(this, this.border$onColorChanged);
    this.border.widthChanged.connect(this, this.border$onWidthChanged);
    this.widthChanged.connect(this, this.$updateBorder);
    this.heightChanged.connect(this, this.$updateBorder);
  }
  $onColorChanged(newVal) {
    this.impl.style.backgroundColor = newVal.$css;
  }
  border$onColorChanged(newVal) {
    this.$borderActive = true;
    this.impl.style.borderColor = newVal.$css;
    this.$updateBorder();
  }
  border$onWidthChanged() {
    this.$borderActive = true;
    this.$updateBorder();
  }
  $onRadiusChanged(newVal) {
    this.impl.style.borderRadius = `${newVal}px`;
  }
  $updateBorder() {
    const border = this.$borderActive ? Math.max(0, this.border.width) : 0;
    const style = this.impl.style;
    if (border * 2 > this.width || border * 2 > this.height) {
      // Border is covering the whole background
      style.borderWidth = "0px";
      style.borderTopWidth = `${this.height}px`;
    } else {
      style.borderWidth = `${border}px`;
    }
  }
}
QtQuick_Rectangle.properties = {
  color: { type: "color", initialValue: "white" },
  radius: "real"
};
QmlWeb.registerQmlType(QtQuick_Rectangle);

// eslint-disable-next-line no-undef
class QtQuick_RegExpValidator extends QtQuick_Item {

  validate(string) {
    if (!this.regExp) return true;
    return this.regExp.test(string);
  }
}
QtQuick_RegExpValidator.properties = {
  regExp: "var"
};
QmlWeb.registerQmlType(QtQuick_RegExpValidator);

// eslint-disable-next-line no-undef
class QtQuick_Repeater extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.parent = meta.parent;
    // TODO: some (all ?) of the components including Repeater needs to know own
    // parent at creation time. Please consider this major change.

    this.$completed = false;
    this.$items = []; // List of created items

    this.modelChanged.connect(this, this.$onModelChanged);
    this.delegateChanged.connect(this, this.$onDelegateChanged);
    this.parentChanged.connect(this, this.$onParentChanged);
  }
  container() {
    return this.parent;
  }
  itemAt(index) {
    return this.$items[index];
  }
  $onModelChanged() {
    this.$applyModel();
  }
  $onDelegateChanged() {
    this.$applyModel();
  }
  $onParentChanged() {
    this.$applyModel();
  }
  $getModel() {
    const QMLListModel = QmlWeb.getConstructor("QtQuick", "2.0", "ListModel");
    return this.model instanceof QMLListModel ? this.model.$model : this.model;
  }
  $applyModel() {
    if (!this.delegate || !this.parent) {
      return;
    }
    const model = this.$getModel();
    if (model instanceof QmlWeb.JSItemModel) {
      const flags = QmlWeb.Signal.UniqueConnection;
      model.dataChanged.connect(this, this.$_onModelDataChanged, flags);
      model.rowsInserted.connect(this, this.$_onRowsInserted, flags);
      model.rowsMoved.connect(this, this.$_onRowsMoved, flags);
      model.rowsRemoved.connect(this, this.$_onRowsRemoved, flags);
      model.modelReset.connect(this, this.$_onModelReset, flags);

      this.$removeChildren(0, this.$items.length);
      this.$insertChildren(0, model.rowCount());
    } else if (typeof model === "number") {
      if (this.$items.length > model) {
        // have more than we need
        this.$removeChildren(model, this.$items.length);
      } else {
        // need more
        this.$insertChildren(this.$items.length, model);
      }
    } else if (model instanceof Array) {
      this.$removeChildren(0, this.$items.length);
      this.$insertChildren(0, model.length);
    }
    this.count = this.$items.length;
  }
  $callOnCompleted(child) {
    child.Component.completed();
    const QMLBaseObject = QmlWeb.getConstructor("QtQml", "2.0", "QtObject");
    for (let i = 0; i < child.$tidyupList.length; i++) {
      if (child.$tidyupList[i] instanceof QMLBaseObject) {
        this.$callOnCompleted(child.$tidyupList[i]);
      }
    }
  }
  $_onModelDataChanged(startIndex, endIndex, roles) {
    const model = this.$getModel();
    const roleNames = roles || model.roleNames;
    for (let index = startIndex; index <= endIndex; index++) {
      const item = this.$items[index];
      const modelData = item.$properties.model;
      for (const i in roleNames) {
        const roleName = roleNames[i];
        const roleData = model.data(index, roleName);
        item.$properties[roleName].set(roleData, QmlWeb.QMLProperty.ReasonInit, item, this.model.$context);
        modelData[roleName] = roleData;
      }
      item.$properties.model.set(modelData, QmlWeb.QMLProperty.ReasonInit, item, this.model.$context);
    }
  }
  $_onRowsInserted(startIndex, endIndex) {
    this.$insertChildren(startIndex, endIndex);
    this.count = this.$items.length;
  }
  $_onRowsMoved(sourceStartIndex, sourceEndIndex, destinationIndex) {
    const vals = this.$items.splice(sourceStartIndex, sourceEndIndex - sourceStartIndex);
    for (let i = 0; i < vals.length; i++) {
      this.$items.splice(destinationIndex + i, 0, vals[i]);
    }
    const smallestChangedIndex = sourceStartIndex < destinationIndex ? sourceStartIndex : destinationIndex;
    for (let i = smallestChangedIndex; i < this.$items.length; i++) {
      this.$items[i].index = i;
    }
  }
  $_onRowsRemoved(startIndex, endIndex) {
    this.$removeChildren(startIndex, endIndex);
    for (let i = startIndex; i < this.$items.length; i++) {
      this.$items[i].index = i;
    }
    this.count = this.$items.length;
  }
  $_onModelReset() {
    this.$applyModel();
  }
  $insertChildren(startIndex, endIndex) {
    if (endIndex <= 0) {
      this.count = 0;
      return;
    }

    const QMLOperationState = QmlWeb.QMLOperationState;
    const createProperty = QmlWeb.createProperty;
    const model = this.$getModel();
    let index;
    for (index = startIndex; index < endIndex; index++) {
      const newItem = this.delegate.$createObject(this.parent);
      createProperty("int", newItem, "index", { initialValue: index });

      if (typeof model === "number" || model instanceof Array) {
        if (typeof newItem.$properties.modelData === "undefined") {
          createProperty("variant", newItem, "modelData");
        }
        const value = model instanceof Array ? model[index] : typeof model === "number" ? index : "undefined";
        newItem.$properties.modelData.set(value, QmlWeb.QMLProperty.ReasonInit, newItem, model.$context);
      } else {
        // QML exposes a "model" property in the scope that contains all role
        // data.
        const modelData = {};
        for (let i = 0; i < model.roleNames.length; i++) {
          const roleName = model.roleNames[i];
          if (typeof newItem.$properties[roleName] === "undefined") {
            createProperty("variant", newItem, roleName);
          }
          const roleData = model.data(index, roleName);
          modelData[roleName] = roleData;
          newItem.$properties[roleName].set(roleData, QmlWeb.QMLProperty.ReasonInit, newItem, this.model.$context);
        }
        if (typeof newItem.$properties.model === "undefined") {
          createProperty("variant", newItem, "model");
        }
        newItem.$properties.model.set(modelData, QmlWeb.QMLProperty.ReasonInit, newItem, this.model.$context);
      }

      this.$items.splice(index, 0, newItem);

      // parent must be set after the roles have been added to newItem scope in
      // case we are outside of QMLOperationState.Init and parentChanged has
      // any side effects that result in those roleNames being referenced.
      newItem.parent = this.parent;

      // TODO debug this. Without check to Init, Completed sometimes called
      // twice.. But is this check correct?
      if (QmlWeb.engine.operationState !== QMLOperationState.Init && QmlWeb.engine.operationState !== QMLOperationState.Idle) {
        // We don't call those on first creation, as they will be called
        // by the regular creation-procedures at the right time.
        this.$callOnCompleted(newItem);
      }
    }
    if (QmlWeb.engine.operationState !== QMLOperationState.Init) {
      // We don't call those on first creation, as they will be called
      // by the regular creation-procedures at the right time.
      QmlWeb.engine.$initializePropertyBindings();
    }

    if (index > 0) {
      this.container().childrenChanged();
    }

    for (let i = endIndex; i < this.$items.length; i++) {
      this.$items[i].index = i;
    }
  }
  $removeChildren(startIndex, endIndex) {
    const removed = this.$items.splice(startIndex, endIndex - startIndex);
    for (const index in removed) {
      removed[index].$delete();
      this.$removeChildProperties(removed[index]);
    }
  }
  $removeChildProperties(child) {
    const signals = QmlWeb.engine.completedSignals;
    signals.splice(signals.indexOf(child.Component.completed), 1);
    for (let i = 0; i < child.children.length; i++) {
      this.$removeChildProperties(child.children[i]);
    }
  }
}
QtQuick_Repeater.properties = {
  delegate: "Component",
  model: { type: "variant", initialValue: 0 },
  count: "int"
};
QtQuick_Repeater.signals = {
  _childrenInserted: []
};
QtQuick_Repeater.defaultProperty = "delegate";
QmlWeb.registerQmlType(QtQuick_Repeater);

// eslint-disable-next-line no-undef
class QtQuick_ListView extends QtQuick_Repeater {

  constructor(meta) {
    super(meta);
    this.modelChanged.connect(this, this.$styleChanged);
    this.delegateChanged.connect(this, this.$styleChanged);
    this.orientationChanged.connect(this, this.$styleChanged);
    this.spacingChanged.connect(this, this.$styleChanged);
    this._childrenInserted.connect(this, this.$applyStyleOnItem);
  }
  container() {
    return this;
  }
  $applyStyleOnItem($item) {
    const Qt = QmlWeb.Qt;
    $item.dom.style.position = "initial";
    if (this.orientation === Qt.Horizontal) {
      $item.dom.style.display = "inline-block";
      if ($item !== this.$items[0]) {
        $item.dom.style["margin-left"] = `${this.spacing}px`;
      }
    } else {
      $item.dom.style.display = "block";
      if ($item !== this.$items[0]) {
        $item.dom.style["margin-top"] = `${this.spacing}px`;
      }
    }
  }
  $styleChanged() {
    for (let i = 0; i < this.$items.length; ++i) {
      this.$applyStyleOnItem(this.$items[i]);
    }
  }
}
QtQuick_ListView.properties = {
  orientation: "enum",
  spacing: "real"
};
QmlWeb.registerQmlType(QtQuick_ListView);

// eslint-disable-next-line no-undef
class QtQuick_Rotation extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.axis = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.axis, {
      x: "real",
      y: "real",
      z: { type: "real", initialValue: 1 }
    });

    this.origin = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.origin, {
      x: "real",
      y: "real"
    });

    this.angleChanged.connect(this.$parent, this.$parent.$updateTransform);
    this.axis.xChanged.connect(this.$parent, this.$parent.$updateTransform);
    this.axis.yChanged.connect(this.$parent, this.$parent.$updateTransform);
    this.axis.zChanged.connect(this.$parent, this.$parent.$updateTransform);
    this.origin.xChanged.connect(this, this.$updateOrigin);
    this.origin.yChanged.connect(this, this.$updateOrigin);
    this.$parent.$updateTransform();
  }
  $updateOrigin() {
    const style = this.$parent.dom.style;
    style.transformOrigin = `${this.origin.x}px ${this.origin.y}px`;
    style.webkitTransformOrigin = `${this.origin.x}px ${this.origin.y}px`;
  }
}
QtQuick_Rotation.properties = {
  angle: "real"
};
QmlWeb.registerQmlType(QtQuick_Rotation);

// eslint-disable-next-line no-undef
class QtQuick_RotationAnimator extends QtQuick_Animator {}
QtQuick_RotationAnimator.versions = /^2\./;
QmlWeb.registerQmlType(QtQuick_RotationAnimator);

// eslint-disable-next-line no-undef
class QtQuick_Row extends QtQuick_Positioner {

  constructor(meta) {
    super(meta);

    this.layoutDirectionChanged.connect(this, this.layoutChildren);
    this.layoutChildren();
  }
  layoutChildren() {
    let curPos = this.padding;
    let maxHeight = 0;
    // When layoutDirection is RightToLeft we need oposite order
    let i = this.layoutDirection === 1 ? this.children.length - 1 : 0;
    const endPoint = this.layoutDirection === 1 ? -1 : this.children.length;
    const step = this.layoutDirection === 1 ? -1 : 1;
    for (; i !== endPoint; i += step) {
      const child = this.children[i];
      if (!(child.visible && child.width && child.height)) {
        continue;
      }
      maxHeight = child.height > maxHeight ? child.height : maxHeight;

      child.x = curPos;
      if (this.padding > 0) child.y = this.padding;

      curPos += child.width + this.spacing;
    }
    this.implicitHeight = maxHeight + this.padding * 2;
    // We want no spacing at the right side
    this.implicitWidth = curPos - this.spacing + this.padding;
  }
}
QtQuick_Row.properties = {
  layoutDirection: "enum"
};
QmlWeb.registerQmlType(QtQuick_Row);

// eslint-disable-next-line no-undef
class QtQuick_Scale extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.origin = new QmlWeb.QObject(this);
    QmlWeb.createProperties(this.origin, {
      x: "real",
      y: "real"
    });

    this.xScaleChanged.connect(this.$parent, this.$parent.$updateTransform);
    this.yScaleChanged.connect(this.$parent, this.$parent.$updateTransform);
    this.origin.xChanged.connect(this, this.$updateOrigin);
    this.origin.yChanged.connect(this, this.$updateOrigin);

    /* QML default origin is top-left, while CSS default origin is centre, so
     * $updateOrigin must be called to set the initial transformOrigin. */
    this.$updateOrigin();
  }
  $updateOrigin() {
    const style = this.$parent.dom.style;
    style.transformOrigin = `${this.origin.x}px ${this.origin.y}px`;
    style.webkitTransformOrigin = `${this.origin.x}px ${this.origin.y}px`;
  }
}
QtQuick_Scale.properties = {
  xScale: { type: "real", initialValue: 1 },
  yScale: { type: "real", initialValue: 1 }
};
QmlWeb.registerQmlType(QtQuick_Scale);

// eslint-disable-next-line no-undef
class QtQuick_ScaleAnimator extends QtQuick_Animator {}
QtQuick_ScaleAnimator.versions = /^2\./;
QmlWeb.registerQmlType(QtQuick_ScaleAnimator);

// eslint-disable-next-line no-undef
class QtQuick_SequentialAnimation extends QtQuick_Animation {

  constructor(meta) {
    super(meta);

    this.animationsChanged.connect(this, this.$onAnimatonsChanged);

    QmlWeb.engine.$registerStart(() => {
      if (!this.running) return;
      this.running = false; // toggled back by start();
      this.start();
    });
    QmlWeb.engine.$registerStop(() => self.stop());
  }
  $onAnimatonsChanged() {
    const flags = QmlWeb.Signal.UniqueConnection;
    for (let i = 0; i < this.animations.length; i++) {
      const animation = this.animations[i];
      animation.runningChanged.connect(this, this.$nextAnimation, flags);
    }
  }
  $nextAnimation(proceed) {
    if (this.running && !proceed) {
      this.$curIndex++;
      if (this.$curIndex < this.animations.length) {
        const anim = this.animations[this.$curIndex];
        console.log("nextAnimation", this, this.$curIndex, anim);
        anim.start();
      } else {
        this.$passedLoops++;
        if (this.$passedLoops >= this.loops) {
          this.complete();
        } else {
          this.$curIndex = -1;
          this.$nextAnimation();
        }
      }
    }
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.$curIndex = -1;
    this.$passedLoops = 0;
    this.$nextAnimation();
  }
  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.$curIndex < this.animations.length) {
      this.animations[this.$curIndex].stop();
    }
  }
  complete() {
    if (!this.running) return;
    if (this.$curIndex < this.animations.length) {
      // Stop current animation
      this.animations[this.$curIndex].stop();
    }
    this.running = false;
  }
}
QtQuick_SequentialAnimation.properties = {
  animations: "list"
};
QtQuick_SequentialAnimation.defaultProperty = "animations";
QmlWeb.registerQmlType(QtQuick_SequentialAnimation);

// eslint-disable-next-line no-undef
class QtQuick_ShaderEffect extends QtQuick_Item {}
QtQuick_ShaderEffect.enums = {
  ShaderEffect: {
    NoCulling: 0, BackFaceCulling: 1, FrontFaceCulling: 2,
    Compiled: 0, Uncompiled: 1, Error: 2
  }
};
QtQuick_ShaderEffect.properties = {
  blending: { type: "bool", initialValue: true },
  cullMode: "enum", // ShaderEffect.NoCulling
  fragmentShader: "string",
  log: "string",
  mesh: "var",
  status: { type: "enum", initialValue: 1 }, // ShaderEffect.Uncompiled
  supportsAtlasTextures: "bool",
  vertexShader: "string"
};
QmlWeb.registerQmlType(QtQuick_ShaderEffect);

// eslint-disable-next-line no-undef
class QtQuick_ShaderEffectSource extends QtQuick_Item {

  // TODO

  scheduleUpdate() {
    // TODO
  }
}
QtQuick_ShaderEffectSource.enums = {
  ShaderEffectSource: {
    Alpha: 0x6406, RGB: 0x6407, RGBA: 0x6408,
    NoMirroring: 0, MirrorHorizontally: 1, MirrorVertically: 2,
    ClampToEdge: 0, RepeatHorizontally: 1, RepeatVertically: 2, Repeat: 3
  }
};
QtQuick_ShaderEffectSource.properties = {
  format: { type: "enum", initialValue: 0x6408 }, // ShaderEffectSource.RGBA
  hideSource: "bool",
  live: { type: "bool", initialValue: true },
  mipmap: "bool",
  recursive: "bool",
  sourceItem: "Item",
  sourceRect: "rect",
  textureMirroring: { type: "enum", initialValue: 2 }, // MirrorVertically
  textureSize: "size",
  wrapMode: "enum" // ShaderEffectSource.ClampToEdge
};
QmlWeb.registerQmlType(QtQuick_ShaderEffectSource);

// eslint-disable-next-line no-undef
class QtQuick_State extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.$item = this.$parent;

    this.whenChanged.connect(this, this.$onWhenChanged);
  }
  $getAllChanges() {
    if (this.extend) {
      /* ECMAScript 2015. TODO: polyfill Array?
      const base = this.$item.states.find(state => state.name === this.extend);
      */
      const states = this.$item.states;
      const base = states.filter(state => state.name === this.extend)[0];
      if (base) {
        return base.$getAllChanges().concat(this.changes);
      }
      console.error("Can't find the state to extend!");
    }
    return this.changes;
  }
  $onWhenChanged(newVal) {
    if (newVal) {
      this.$item.state = this.name;
    } else if (this.$item.state === this.name) {
      this.$item.state = "";
    }
  }
}
QtQuick_State.properties = {
  name: "string",
  changes: "list",
  extend: "string",
  when: "bool"
};
QtQuick_State.defaultProperty = "changes";
QmlWeb.registerQmlType(QtQuick_State);

const platformsDetectors = [
//{ name: "W8", regexp: /Windows NT 6\.2/ },
//{ name: "W7", regexp: /Windows NT 6\.1/ },
//{ name: "Windows", regexp: /Windows NT/ },
{ name: "OSX", regexp: /Macintosh/ }];

const systemPalettes = {};

// eslint-disable-next-line no-undef
class QtQuick_SystemPalette extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.colorGroupChanged.connect(this, this.$onColorGroupChanged);

    this.$platform = "OSX";
    // Detect OS
    for (let i = 0; i < platformsDetectors.length; ++i) {
      if (platformsDetectors[i].regexp.test(navigator.userAgent)) {
        this.$platform = platformsDetectors[i].name;
        break;
      }
    }

    this.$onColorGroupChanged(this.colorGroup);
  }
  $onColorGroupChanged(newVal) {
    const name = ["active", "disabled", "inactive"][newVal];
    const pallete = systemPalettes[this.$platform][name];
    this.$canEditReadOnlyProperties = true;
    Object.keys(pallete).forEach(key => {
      this[key] = pallete[key];
    });
    delete this.$canEditReadOnlyProperties;
  }
}

QtQuick_SystemPalette.enums = {
  SystemPalette: {
    Active: 0, Inactive: 2, Disabled: 1
  }
};
QtQuick_SystemPalette.properties = {
  alternateBase: { type: "color", readOnly: true },
  base: { type: "color", readOnly: true },
  button: { type: "color", readOnly: true },
  buttonText: { type: "color", readOnly: true },
  dark: { type: "color", readOnly: true },
  highlight: { type: "color", readOnly: true },
  highlightedText: { type: "color", readOnly: true },
  light: { type: "color", readOnly: true },
  mid: { type: "color", readOnly: true },
  midlight: { type: "color", readOnly: true },
  shadow: { type: "color", readOnly: true },
  text: { type: "color", readOnly: true },
  window: { type: "color", readOnly: true },
  windowText: { type: "color", readOnly: true },

  colorGroup: "enum"
};
systemPalettes.OSX = {
  active: {
    alternateBase: "#f6f6f6",
    base: "#ffffff",
    button: "#ededed",
    buttonText: "#000000",
    dark: "#bfbfbf",
    highlight: "#fbed73",
    highlightText: "#000000",
    light: "#ffffff",
    mid: "#a9a9a9",
    midlight: "#f6f6f6",
    shadow: "#8b8b8b",
    text: "#000000",
    window: "#ededed",
    windowText: "#000000"
  },
  inactive: {
    alternateBase: "#f6f6f6",
    base: "#ffffff",
    button: "#ededed",
    buttonText: "#000000",
    dark: "#bfbfbf",
    highlight: "#d0d0d0",
    highlightText: "#000000",
    light: "#ffffff",
    mid: "#a9a9a9",
    midlight: "#f6f6f6",
    shadow: "#8b8b8b",
    text: "#000000",
    window: "#ededed",
    windowText: "#000000"
  },
  disabled: {
    alternateBase: "#f6f6f6",
    base: "#ededed",
    button: "#ededed",
    buttonText: "#949494",
    dark: "#bfbfbf",
    highlight: "#d0d0d0",
    highlightText: "#7f7f7f",
    light: "#ffffff",
    mid: "#a9a9a9",
    midlight: "#f6f6f6",
    shadow: "#8b8b8b",
    text: "#7f7f7f",
    window: "#ededed",
    windowText: "#7f7f7f"
  }
};

QmlWeb.systemPalettes = systemPalettes;
QmlWeb.platformsDetectors = platformsDetectors;
QmlWeb.registerQmlType(QtQuick_SystemPalette);

// eslint-disable-next-line no-undef
class QtQuick_Text extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    const fc = this.impl = document.createElement("span");
    fc.style.pointerEvents = "none";
    fc.style.width = "100%";
    fc.style.height = "100%";
    fc.style.whiteSpace = "pre";
    this.dom.style.textAlign = "left";
    this.dom.appendChild(fc);

    this.colorChanged.connect(this, this.$onColorChanged);
    this.textChanged.connect(this, this.$onTextChanged);
    this.textFormatChanged.connect(this, this.$onTextFormatChanged);
    this.lineHeightChanged.connect(this, this.$onLineHeightChanged);
    this.wrapModeChanged.connect(this, this.$onWrapModeChanged);
    this.horizontalAlignmentChanged.connect(this, this.$onHorizontalAlignmentChanged);
    this.styleChanged.connect(this, this.$onStyleChanged);
    this.styleColorChanged.connect(this, this.$onStyleColorChanged);

    this.widthChanged.connect(this, this.$onWidthChanged);
    this.fontChanged.connect(this, this.$onFontChanged);

    this.Component.completed.connect(this, this.Component$onCompleted);
  }
  $redrawText() {
    const text = this.text;
    let format = this.textFormat;
    if (format === this.Text.AutoText) {
      // NOTE: this is not the exact same heuristics that Qt uses
      if (/<[a-zA-Z]+(\s[^>]*)?\/?>/.test(text)) {
        format = this.Text.StyledText;
      } else {
        format = this.Text.PlainText;
      }
    }
    if (format === this.Text.PlainText) {
      this.impl.innerHTML = "";
      this.impl.appendChild(document.createTextNode(text));
    } else {
      // TODO: sanitize StyledText/RichText
      this.impl.innerHTML = text;
    }
    this.$updateImplicit();
  }
  $onColorChanged(newVal) {
    this.impl.style.color = newVal.$css;
  }
  $onTextChanged() {
    this.$redrawText();
  }
  $onTextFormatChanged() {
    this.$redrawText();
  }
  $onWidthChanged() {
    this.$updateImplicit();
  }
  $onLineHeightChanged(newVal) {
    this.impl.style.lineHeight = `${newVal}px`;
    this.$updateImplicit();
  }
  $onStyleChanged(newVal) {
    this.$updateShadow(newVal, this.styleColor.$css);
  }
  $onStyleColorChanged(newVal) {
    this.$updateShadow(this.style, newVal.$css);
  }
  $onWrapModeChanged(newVal) {
    const style = this.impl.style;
    switch (newVal) {
      case this.Text.NoWrap:
        style.whiteSpace = "pre";
        break;
      case this.Text.WordWrap:
        style.whiteSpace = "pre-wrap";
        style.wordWrap = "normal";
        break;
      case this.Text.WrapAnywhere:
        style.whiteSpace = "pre-wrap";
        style.wordBreak = "break-all";
        break;
      case this.Text.Wrap:
      case this.Text.WrapAtWordBoundaryOrAnywhere:
        style.whiteSpace = "pre-wrap";
        style.wordWrap = "break-word";
    }
    this.$updateJustifyWhiteSpace();
  }
  $onHorizontalAlignmentChanged(newVal) {
    let textAlign = null;
    switch (newVal) {
      case this.Text.AlignLeft:
        textAlign = "left";
        break;
      case this.Text.AlignRight:
        textAlign = "right";
        break;
      case this.Text.AlignHCenter:
        textAlign = "center";
        break;
      case this.Text.AlignJustify:
        textAlign = "justify";
        break;
    }
    this.dom.style.textAlign = textAlign;
    this.$updateJustifyWhiteSpace();
  }
  $onFontChanged() {
    this.$updateImplicit();
  }
  Component$onCompleted() {
    this.$updateImplicit();
  }
  $updateImplicit() {
    if (!this.text || !this.dom) {
      this.implicitHeight = this.implicitWidth = 0;
      return;
    }

    if (!this.$isUsingImplicitWidth) {
      this.implicitWidth = this.impl.offsetWidth;
      this.implicitHeight = this.impl.offsetHeight;
      return;
    }

    const fc = this.impl;
    const engine = QmlWeb.engine;
    // Need to move the child out of it's parent so that it can properly
    // recalculate it's "natural" offsetWidth/offsetHeight
    if (engine.dom === document.body && engine.dom !== engine.domTarget) {
      // Can't use document.body here, as it could have Shadow DOM inside
      // The root is document.body, though, so it's probably not hidden
      engine.domTarget.appendChild(fc);
    } else {
      document.body.appendChild(fc);
    }
    const height = fc.offsetHeight;
    const width = fc.offsetWidth;
    this.dom.appendChild(fc);

    this.implicitHeight = height;
    this.implicitWidth = width;
  }
  $updateShadow(textStyle, styleColor) {
    const style = this.impl.style;
    switch (textStyle) {
      case 0:
        style.textShadow = "none";
        break;
      case 1:
        style.textShadow = [`1px 0 0 ${styleColor}`, `-1px 0 0 ${styleColor}`, `0 1px 0 ${styleColor}`, `0 -1px 0 ${styleColor}`].join(",");
        break;
      case 2:
        style.textShadow = `1px 1px 0 ${styleColor}`;
        break;
      case 3:
        style.textShadow = `-1px -1px 0 ${styleColor}`;
        break;
    }
  }
  $updateJustifyWhiteSpace() {
    const style = this.impl.style;
    // AlignJustify doesn't work with pre/pre-wrap, so we decide the lesser of
    // the two evils to be ignoring "\n"s inside the text.
    if (this.horizontalAlignment === this.Text.AlignJustify) {
      style.whiteSpace = "normal";
    }
    this.$updateImplicit();
  }
}
QtQuick_Text.enums = {
  Text: {
    NoWrap: 0, WordWrap: 1, WrapAnywhere: 2, Wrap: 3,
    WrapAtWordBoundaryOrAnywhere: 4,
    AlignLeft: 1, AlignRight: 2, AlignHCenter: 4, AlignJustify: 8,
    AlignTop: 32, AlignBottom: 64, AlignVCenter: 128,
    AutoText: 2, PlainText: 0, StyledText: 4, RichText: 1,
    Normal: 0, Outline: 1, Raised: 2, Sunken: 3
  }
};
QtQuick_Text.properties = {
  color: { type: "color", initialValue: "black" },
  text: "string",
  textFormat: { type: "enum", initialValue: 2 }, // Text.AutoText
  font: "font",
  lineHeight: "real",
  wrapMode: { type: "enum", initialValue: 0 }, // Text.NoWrap
  horizontalAlignment: { type: "enum", initialValue: 1 }, // Text.AlignLeft
  style: "enum",
  styleColor: "color"
};
QmlWeb.registerQmlType(QtQuick_Text);

// eslint-disable-next-line no-undef
class QtQuick_Controls_2_Label extends QtQuick_Text {}
QtQuick_Controls_2_Label.versions = /^2\./;
QtQuick_Controls_2_Label.properties = {
  background: "Item",
  palette: "palette"
};
QmlWeb.registerQmlType(QtQuick_Controls_2_Label);

// eslint-disable-next-line no-undef
class QtQuick_TextEdit extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    // Undo / Redo stacks;
    this.undoStack = [];
    this.undoStackPosition = -1;
    this.redoStack = [];
    this.redoStackPosition = -1;

    const textarea = this.impl = document.createElement("textarea");
    textarea.style.pointerEvents = "auto";
    textarea.style.width = "100%";
    textarea.style.height = "100%";
    textarea.style.boxSizing = "border-box";
    textarea.style.borderWidth = "0";
    textarea.style.background = "none";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.padding = "0"; // TODO: padding/*Padding props from Qt 5.6
    // In some browsers text-areas have a margin by default, which distorts
    // the positioning, so we need to manually set it to 0.
    textarea.style.margin = "0";
    textarea.disabled = false;
    this.dom.appendChild(textarea);

    this.Component.completed.connect(this, this.Component$onCompleted);
    this.textChanged.connect(this, this.$onTextChanged);
    this.colorChanged.connect(this, this.$onColorChanged);

    this.impl.addEventListener("input", () => this.$updateValue());
  }
  append(text) {
    this.text += text;
  }
  copy() {
    // TODO
  }
  cut() {
    this.text = this.text(0, this.selectionStart) + this.text(this.selectionEnd, this.text.length);
    // TODO
  }
  deselect() {
    //this.selectionStart = -1;
    //this.selectionEnd = -1;
    //this.selectedText = null;
    // TODO
  }
  getFormattedText(start, end) {
    const text = this.text.slice(start, end);
    // TODO
    // process text
    return text;
  }
  getText(start, end) {
    return this.text.slice(start, end);
  }
  insert() /*position, text*/{
    // TODO
  }
  isRightToLeft() /*start, end*/{
    // TODO
  }
  linkAt() /*x, y*/{
    // TODO
  }
  moveCursorSelection() /*x, y*/{
    // TODO
  }
  paste() {
    // TODO
  }
  positionAt() /*x, y*/{
    // TODO
  }
  positionToRectangle() /*position*/{
    // TODO
  }
  redo() {
    // TODO
  }
  remove() /*start, end*/{
    // TODO
  }
  select() /*start, end*/{
    // TODO
  }
  selectAll() {
    // TODO
  }
  selectWord() {
    // TODO
  }
  undo() {
    // TODO
  }
  Component$onCompleted() {
    this.selectByKeyboard = !this.readOnly;
    this.impl.readOnly = this.readOnly;
    this.$updateValue();
    this.implicitWidth = this.offsetWidth;
    this.implicitHeight = this.offsetHeight;
  }
  $onTextChanged(newVal) {
    this.impl.value = newVal;
  }
  $onColorChanged(newVal) {
    this.impl.style.color = newVal.$css;
  }
  $updateValue() {
    if (this.text !== this.impl.value) {
      this.text = this.impl.value;
    }
    this.length = this.text.length;
    this.lineCount = this.$getLineCount();
    this.$updateCss();
  }
  // Transfer dom style to firstChild,
  // then clear corresponding dom style
  $updateCss() {
    const supported = ["border", "borderRadius", "borderWidth", "borderColor", "backgroundColor"];
    const style = this.impl.style;
    for (let n = 0; n < supported.length; n++) {
      const o = supported[n];
      const v = this.css[o];
      if (v) {
        style[o] = v;
        this.css[o] = null;
      }
    }
  }
  $getLineCount() {
    return this.text.split(/\n/).length;
  }
}
QtQuick_TextEdit.properties = {
  activeFocusOnPress: { type: "bool", initialValue: true },
  baseUrl: "url",
  canPaste: "bool",
  canRedo: "bool",
  canUndo: "bool",
  color: { type: "color", initialValue: "white" },
  contentHeight: "real",
  contentWidth: "real",
  cursorDelegate: "Component",
  cursorPosition: "int",
  cursorRectangle: "rect",
  cursorVisible: { type: "bool", initialValue: true },
  effectiveHorizontalAlignment: "enum",
  font: "font",
  horizontalAlignment: "enum",
  hoveredLink: "string",
  inputMethodComposing: "bool",
  inputMethodHints: "enum",
  length: "int",
  lineCount: "int",
  mouseSelectionMode: "enum",
  persistentSelection: "bool",
  readOnly: "bool",
  renderType: "enum",
  selectByKeyboard: { type: "bool", initialValue: true },
  selectByMouse: "bool",
  selectedText: "string",
  selectedTextColor: { type: "color", initialValue: "yellow" },
  selectionColor: { type: "color", initialValue: "pink" },
  selectionEnd: "int",
  selectionStart: "int",
  text: "string",
  textDocument: "TextDocument",
  textFormat: "enum",
  textMargin: "real",
  verticalAlignment: "enum",
  wrapMode: "enum"
};
QtQuick_TextEdit.signals = {
  linkActivated: [{ type: "string", name: "link" }],
  linkHovered: [{ type: "string", name: "link" }]
};
QmlWeb.registerQmlType(QtQuick_TextEdit);

// eslint-disable-next-line no-undef
class QtQuick_Controls_TextArea extends QtQuick_TextEdit {
  constructor(meta) {
    super(meta);
    const textarea = this.impl;
    textarea.style.padding = "5px";
    textarea.style.borderWidth = "1px";
    textarea.style.backgroundColor = "#fff";
  }
}
QmlWeb.registerQmlType(QtQuick_Controls_TextArea);

// eslint-disable-next-line no-undef
class QtQuick_TextInput extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    const input = this.impl = document.createElement("input");
    input.type = "text";
    input.disabled = true;
    input.style.pointerEvents = "auto";
    // In some browsers text-inputs have a margin by default, which distorts
    // the positioning, so we need to manually set it to 0.
    input.style.margin = "0";
    input.style.padding = "0";
    input.style.width = "100%";
    input.style.height = "100%";
    this.dom.appendChild(input);
    this.setupFocusOnDom(input);
    input.disabled = false;

    this.Component.completed.connect(this, this.Component$onCompleted);
    this.textChanged.connect(this, this.$onTextChanged);
    this.echoModeChanged.connect(this, this.$onEchoModeChanged);
    this.maximumLengthChanged.connect(this, this.$onMaximumLengthChanged);
    this.readOnlyChanged.connect(this, this.$onReadOnlyChanged);
    this.Keys.pressed.connect(this, this.Keys$onPressed);

    this.impl.addEventListener("input", () => this.$updateValue());
  }
  Component$onCompleted() {
    this.implicitWidth = this.impl.offsetWidth;
    this.implicitHeight = this.impl.offsetHeight;
  }
  $onTextChanged(newVal) {
    // We have to check if value actually changes.
    // If we do not have this check, then after user updates text input
    // following occurs: user updates gui text -> updateValue gets called ->
    // textChanged gets called -> gui value updates again -> caret position
    // moves to the right!
    if (this.impl.value !== newVal) {
      this.impl.value = newVal;
    }
  }
  $onEchoModeChanged(newVal) {
    const TextInput = this.TextInput;
    const input = this.impl;
    switch (newVal) {
      case TextInput.Normal:
        input.type = "text";
        break;
      case TextInput.Password:
        input.type = "password";
        break;
      case TextInput.NoEcho:
        // Not supported, use password, that's nearest
        input.type = "password";
        break;
      case TextInput.PasswordEchoOnEdit:
        // Not supported, use password, that's nearest
        input.type = "password";
        break;
    }
  }
  $onMaximumLengthChanged(newVal) {
    this.impl.maxLength = newVal < 0 ? null : newVal;
  }
  $onReadOnlyChanged(newVal) {
    this.impl.disabled = newVal;
  }
  Keys$onPressed(e) {
    const Qt = QmlWeb.Qt;
    const submit = e.key === Qt.Key_Return || e.key === Qt.Key_Enter;
    if (submit && this.$testValidator()) {
      this.accepted();
      e.accepted = true;
    }
  }
  $testValidator() {
    if (this.validator) {
      return this.validator.validate(this.text);
    }
    return true;
  }
  $updateValue() {
    if (this.text !== this.impl.value) {
      this.$canEditReadOnlyProperties = true;
      this.text = this.impl.value;
      this.$canEditReadOnlyProperties = false;
    }
  }
}
QtQuick_TextInput.enums = {
  TextInput: { Normal: 0, Password: 1, NoEcho: 2, PasswordEchoOnEdit: 3 }
};
QtQuick_TextInput.properties = {
  text: "string",
  font: "font",
  maximumLength: { type: "int", initialValue: -1 },
  readOnly: "bool",
  validator: "var",
  echoMode: "enum" // TextInput.Normal
};
QtQuick_TextInput.signals = {
  accepted: []
};
QmlWeb.registerQmlType(QtQuick_TextInput);

// eslint-disable-next-line no-undef
class QtQuick_Transition extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.$item = this.$parent;
  }
  $start(actions) {
    for (let i = 0; i < this.animations.length; i++) {
      const animation = this.animations[i];
      animation.$actions = [];
      const { $targets, $props, $actions } = animation;
      for (const j in actions) {
        const action = actions[j];
        if (($targets.length === 0 || $targets.indexOf(action.target) !== -1) && ($props.length === 0 || $props.indexOf(action.property) !== -1)) {
          $actions.push(action);
        }
      }
      animation.start();
    }
  }
  $stop() {
    for (let i = 0; i < this.animations.length; i++) {
      this.animations[i].stop();
    }
  }
}
QtQuick_Transition.properties = {
  animations: "list",
  from: { type: "string", initialValue: "*" },
  to: { type: "string", initialValue: "*" },
  reversible: "bool"
};
QtQuick_Transition.defaultProperty = "animations";
QmlWeb.registerQmlType(QtQuick_Transition);

// eslint-disable-next-line no-undef
class QtQuick_Translate extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.xChanged.connect(this.$parent, this.$parent.$updateTransform);
    this.yChanged.connect(this.$parent, this.$parent.$updateTransform);
  }
}
QtQuick_Translate.properties = {
  x: "real",
  y: "real"
};
QmlWeb.registerQmlType(QtQuick_Translate);

// eslint-disable-next-line no-undef
class QtQuick_UniformAnimator extends QtQuick_Animator {}
QtQuick_UniformAnimator.versions = /^2\./;
QtQuick_UniformAnimator.properties = {
  uniform: "string"
};
QmlWeb.registerQmlType(QtQuick_UniformAnimator);

// eslint-disable-next-line no-undef
class QtQuick_XAnimator extends QtQuick_Animator {}
QtQuick_XAnimator.versions = /^2\./;
QmlWeb.registerQmlType(QtQuick_XAnimator);

// eslint-disable-next-line no-undef
class QtQuick_YAnimator extends QtQuick_Animator {}
QtQuick_YAnimator.versions = /^2\./;
QmlWeb.registerQmlType(QtQuick_YAnimator);

// eslint-disable-next-line no-undef
class QtTest_SignalSpy extends QtQuick_Item {

  // TODO

  clear() {
    this.count = 0;
    this.signalArguments.length = 0;
    //this.valid = false;
  }

  /*
  wait(timeout = 5000) {
  }
  */
}
QtTest_SignalSpy.versions = /^1\./;
QtTest_SignalSpy.properties = {
  count: "int",
  signalArguments: "list",
  signalName: "string",
  target: "var",
  valid: "bool"
};
QmlWeb.registerQmlType(QtTest_SignalSpy);

// eslint-disable-next-line no-undef
class QtTest_TestCase extends QtQuick_Item {

  constructor(meta) {
    super(meta);
    this.Component.completed.connect(this, this.Component$onCompleted);

    const engine = QmlWeb.engine;
    if (!engine.tests) {
      QmlWeb.engine.tests = {
        name: engine.name || `Run_${Math.random().toString(36).slice(2, 10)}`,
        started: false,
        finished: false,
        duration: 0,
        total: 0,
        completed: 0,
        errors: [],
        stats: {
          pass: 0,
          fail: 0,
          skip: 0
        }
      };
    }
    QmlWeb.engine.tests.total++;

    this.console = {
      assert: (...a) => console.assert(...a),
      error: (...a) => console.error(`QSYSTEM: ${this.$testId} qml:`, ...a),
      info: (...a) => console.info(`QINFO  : ${this.$testId} qml:`, ...a),
      log: (...a) => console.log(`QDEBUG : ${this.$testId} qml:`, ...a),
      time: (...a) => console.time(...a),
      timeEnd: (...a) => console.timeEnd(...a),
      trace: (...a) => console.trace(...a),
      warn: (...a) => console.warn(`QWARN  : ${this.$testId} qml:`, ...a)
    };
  }

  Component$onCompleted() {
    const info = QmlWeb.engine.tests;
    if (!info.started) {
      console.log(`********* Start testing of ${info.name} *********`);
      console.log(`Config: Using QmlWeb, ${window.navigator.userAgent}`);
      info.started = true;
    }

    const keys = Object.keys(this);
    const tests = keys.filter(key => key.lastIndexOf("test_", 0) === 0).filter(key => key.indexOf("_data", key.length - 5) === -1).sort();

    tests.unshift("initTestCase");
    tests.push("cleanupTestCase");
    tests.forEach(test => {
      this.$testId = `${info.name}::${this.name}::${test}()`;
      const special = test === "initTestCase" || test === "cleanupTestCase";

      const dstart = performance.now();
      let data;
      if (this[`${test}_data`] && !special) {
        data = this[`${test}_data`]();
        if (!data || !data.length) {
          this.warn(`no data supplied for ${test}() by ${test}_data()`);
          data = [];
        }
      } else if (this.init_data && !special) {
        data = this.init_data();
        if (!data || !data.length) {
          data = undefined;
        }
      }
      if (!data) {
        data = [null];
      }
      const dend = performance.now();
      info.duration += dend - dstart;

      data.forEach(row => {
        const arg = row ? row.tag : "";
        this.$testId = `${info.name}::${this.name}::${test}(${arg})`;
        const start = performance.now();
        let error;
        try {
          if (!special) {
            this.init();
          }
          this[test](row);
        } catch (e) {
          error = e;
        } finally {
          if (!special) {
            this.cleanup();
          }
        }
        const end = performance.now();
        info.duration += end - start;
        if (error && error.skip) {
          info.stats.skip++;
          console.log(`SKIP   : ${this.$testId} ${error.message}`);
        } else if (error) {
          info.stats.fail++;
          info.errors.push(`${this.$testId} ${error.message}`);
          console.log(`FAIL!  : ${this.$testId} ${error.message}`);
          if ("actual" in error) {
            console.log(`   Actual   (): ${error.actual}`);
          }
          if ("expected" in error) {
            console.log(`   Expected (): ${error.expected}`);
          }
        } else {
          info.stats.pass++;
          console.log(`PASS   : ${this.$testId}`);
        }
      });

      this.$testId = `${info.name}::UnknownTestFunc()`;
    });

    // TODO: benchmarks

    info.completed++;
    if (info.completed === info.total) {
      info.finished = true;
      const { pass, fail, skip } = info.stats;
      const duration = Math.round(info.duration * 100) / 100;
      console.log(`Totals: ${pass} passed, ${fail} failed, ${skip} skipped, ${duration}ms`);
      console.log(`********* Finished testing of ${info.name} *********`);
    }
  }

  // No-ops
  init() {}
  initTestCase() {}
  cleanup() {}
  cleanupTestCase() {}

  // API
  compare(actual, expected, message = "") {
    if (actual !== expected) {
      const err = new Error(message);
      err.actual = actual;
      err.expected = expected;
      throw err;
    }
  }
  verify(condition, message = "") {
    if (!condition) {
      throw new Error(`'${message}' returned FALSE. ()`);
    }
  }
  fail(message = "") {
    throw new Error(message);
  }
  warn(message) {
    console.warn(`WARNING: ${this.$testId} ${message}`);
  }
  skip(message = "") {
    const err = new Error(message);
    err.skip = true;
    throw err;
  }
  /*
  expectFail(tag, message) {
    // TODO
  }
  expectFailContinue(tag, message) {
    // TODO
  }
  findChild(parent, objectName) {
    // TODO
    // return QtObject
  }
  fuzzyCompare(actual, expected, delta, message) {
    // TODO
  }
  grabImage(item) {
    if (!window.top || !window.top.callPhantom) {
      this.skip("Can't use TestCase::grabImage() without PhantomJS.");
    }
    // TODO
    return {
      red: (x, y) => {},
      green: (x, y) => {},
      blue: (x, y) => {},
      alpha: (x, y) => {},
      pixel: (x, y) => {},
      equals: image => false
    };
  }
  ignoreWarning(message) {
    // TODO
  }
  sleep(ms) {
    // TODO
  }
  tryCompare(obj, property, expected, timeout, message) {
    // TODO
  }
  wait(ms) {
    // TODO
  }
  waitForRendering(item, timeout = 5000) {
    // TODO
  }
  */

  // TODO
  /*
  // Events
  keyClick(key, modifiers, delay = -1) {
    // TODO
  }
  keyPress(key, modifiers, delay = -1) {
    // TODO
  }
  keyRelease(key, modifiers, delay = -1) {
    // TODO
  }
  mouseClick(item, x, y, button, modifiers, delay = -1) {
    // TODO
  }
  mouseDoubleClick(item, x, y, button, modifiers, delay = -1) {
    // TODO
  }
  mouseDoubleClickSequence(item, x, y, button, modifiers, delay = -1) {
    // TODO
  }
  mouseDrag(item, x, y, dx, dy, button, modifiers, delay = -1) {
    // TODO
  }
  mouseMove(item, x, y, delay = -1) {
    // TODO
  }
  mousePress(item, x, y, button, modifiers, delay = -1) {
    // TODO
  }
  mouseRelease(item, x, y, button, modifiers, delay = -1) {
    // TODO
  }
  mouseWheel(item, x, y, xDelta, yDelta, button, modifiers, delay = -1) {
    // button = Qt.LeftButton, modifiers = Qt.NoModifier
    // TODO
  }
  */
}
QtTest_TestCase.versions = /^1\./;
QtTest_TestCase.properties = {
  completed: "bool",
  name: "string",
  optional: "bool",
  running: "bool",
  when: "bool",
  windowShown: "bool"
};
QmlWeb.registerQmlType(QtTest_TestCase);

// WARNING: Can have wrong behavior if url is changed while the socket is in
// Connecting state.
// TODO: Recheck everything.

// eslint-disable-next-line no-undef
class QtWebSockets_WebSocket extends QtQml_QtObject {

  constructor(meta) {
    super(meta);

    this.$socket = undefined;
    this.$reconnect = false;

    this.statusChanged.connect(this, this.$onStatusChanged);
    this.activeChanged.connect(this, this.$reconnectSocket);
    this.urlChanged.connect(this, this.$reconnectSocket);
  }
  $onStatusChanged(status) {
    if (status !== this.WebSocket.Error) {
      this.errorString = "";
    }
  }
  $connectSocket() {
    this.$reconnect = false;

    if (!this.url || !this.active) {
      return;
    }

    this.status = this.WebSocket.Connecting;
    this.$socket = new WebSocket(this.url);
    this.$socket.onopen = () => {
      this.status = this.WebSocket.Open;
    };
    this.$socket.onclose = () => {
      this.status = this.WebSocket.Closed;
      if (this.$reconnect) {
        this.$connectSocket();
      }
    };
    this.$socket.onerror = error => {
      this.errorString = error.message;
      this.status = this.WebSocket.Error;
    };
    this.$socket.onmessage = message => {
      this.textMessageReceived(message.data);
    };
  }
  $reconnectSocket() {
    this.$reconnect = true;
    if (this.status === this.WebSocket.Open) {
      this.status = this.WebSocket.Closing;
      this.$socket.close();
    } else if (this.status !== this.WebSocket.Closing) {
      this.$connectSocket();
    }
  }
  sendTextMessage(message) {
    if (this.status === this.WebSocket.Open) {
      this.$socket.send(message);
    }
  }
  sendBinaryMessage(message) {
    if (this.status === this.WebSocket.Open) {
      this.$socket.send(message);
    }
  }
}
QtWebSockets_WebSocket.enums = {
  WebSocket: { Connecting: 0, Open: 1, Closing: 2, Closed: 3, Error: 4 }
};
QtWebSockets_WebSocket.properties = {
  active: "bool",
  status: { type: "enum", initialValue: 3 }, // WebSocket.Closed
  errorString: "string",
  url: "url"
};
QtWebSockets_WebSocket.signals = {
  textMessageReceived: [{ type: "string", name: "message" }]
};
QmlWeb.registerQmlType(QtWebSockets_WebSocket);

// eslint-disable-next-line no-undef
class QtWebView_WebView extends QtQuick_Item {

  constructor(meta) {
    super(meta);

    this.urlChanged.connect(this, this.$onUrlChanged);

    const iframe = this.impl = document.createElement("iframe");
    iframe.style.display = "block";
    iframe.style.position = "absolute";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.borderWidth = "0";
    iframe.style.pointerEvents = "auto";
    this.dom.appendChild(iframe);

    iframe.onload = () => {
      try {
        this.title = iframe.contentDocument.title;
      } catch (e) {
        console.log(`CSP prevents us from reading title for ${this.url}`);
        this.title = "";
      }
      this.loadProgress = 100;
      this.loading = false;
    };
    iframe.onerror = () => {
      this.title = "";
      this.loadProgress = 0;
      this.loading = false;
    };
  }
  $onUrlChanged(newVal) {
    this.loadProgress = 0;
    this.loading = true;
    this.impl.src = newVal;
  }
}
QtWebView_WebView.versions = /^1\./;
QtWebView_WebView.properties = {
  canGoBack: "bool", // TODO
  canGoForward: "bool", // TODO
  loadProgress: "int",
  loading: "bool",
  title: "string",
  url: "url"
};
QtWebView_WebView.signals = {
  /* // TODO
  loadingChanged: [
    { type: "WebViewLoadRequest", name: "loadRequest" }
  ]
  */
};
QmlWeb.registerQmlType(QtWebView_WebView);

// eslint-disable-next-line no-undef
class QtWebEngine_WebEngineView extends QtWebView_WebView {}
QtWebEngine_WebEngineView.versions = /^5\./;
QtWebEngine_WebEngineView.properties = {
  // TODO
};
QtWebEngine_WebEngineView.signals = {
  // TODO
};
QmlWeb.registerQmlType(QtWebEngine_WebEngineView);

// eslint-disable-next-line no-undef
class QtWebKit_WebView extends QtWebView_WebView {}
QtWebKit_WebView.versions = /^3\./;
QtWebKit_WebView.enums = {
  WebView: {
    // ErrorDomain
    NoErrorDomain: 0, InternalErrorDomain: 1, NetworkErrorDomain: 2,
    HttpErrorDomain: 3, DownloadErrorDomain: 4,

    // LoadStatus
    LoadStartedStatus: 0, LoadSucceededStatus: 2, LoadFailedStatus: 3,

    // NavigationRequestAction
    AcceptRequest: 0, IgnoreRequest: 255,

    // NavigationType
    LinkClickedNavigation: 0, FormSubmittedNavigation: 1,
    BackForwardNavigation: 2, ReloadNavigation: 3,
    FormResubmittedNavigation: 4, OtherNavigation: 5
  }
};
QtWebKit_WebView.properties = {
  icon: "url"
};
QtWebKit_WebView.signals = {
  navigationRequested: [{ type: "var", name: "request" }],
  linkHovered: [{ type: "url", name: "hoveredUrl" }, { type: "string", name: "hoveredTitle" }]
};
QmlWeb.registerQmlType(QtWebKit_WebView);
}(typeof global != "undefined" ? global : window));

//# sourceMappingURL=qmlweb.es2015.js.map
