;(function(global) {
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var QmlWeb = {};

global.QmlWeb = QmlWeb;

var objectIds = 0;

var QObject = function () {
  function QObject(parent) {
    _classCallCheck(this, QObject);

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

  _createClass(QObject, [{
    key: "$delete",
    value: function $delete() {
      if (this.$Component) {
        this.$Component.destruction();
      }

      while (this.$tidyupList.length > 0) {
        var item = this.$tidyupList[0];
        if (item.$delete) {
          // It's a QObject
          item.$delete();
        } else {
          // It must be a signal
          item.disconnect(this);
        }
      }

      for (var i in this.$properties) {
        var prop = this.$properties[i];
        while (prop.$tidyupList.length > 0) {
          prop.$tidyupList[0].disconnect(prop);
        }
      }

      if (this.$parent && this.$parent.$tidyupList) {
        var index = this.$parent.$tidyupList.indexOf(this);
        this.$parent.$tidyupList.splice(index, 1);
      }

      // must do this:
      // 1) parent will be notified and erase object from it's children.
      // 2) DOM node will be removed.
      this.parent = undefined;

      // Disconnect any slots connected to any of our signals. Do this after
      // clearing the parent, as that relies on parentChanged being handled.
      for (var _i in this.$signals) {
        this.$signals[_i].disconnect();
      }
    }

    // must have a `destroy` method
    // http://doc.qt.io/qt-5/qtqml-javascript-dynamicobjectcreation.html

  }, {
    key: "destroy",
    value: function destroy() {
      this.$delete();
    }
  }, {
    key: "$toString",
    value: function $toString() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this.constructor.name + "(" + args.join(", ") + ")";
    }
  }]);

  return QObject;
}();

QmlWeb.QObject = QObject;

var JSItemModel = function () {
  function JSItemModel() {
    _classCallCheck(this, JSItemModel);

    this.roleNames = [];

    var Signal = QmlWeb.Signal;
    this.dataChanged = Signal.signal([{ type: "int", name: "startIndex" }, { type: "int", name: "endIndex" }]);
    this.rowsInserted = Signal.signal([{ type: "int", name: "startIndex" }, { type: "int", name: "endIndex" }]);
    this.rowsMoved = Signal.signal([{ type: "int", name: "sourceStartIndex" }, { type: "int", name: "sourceEndIndex" }, { type: "int", name: "destinationIndex" }]);
    this.rowsRemoved = Signal.signal([{ type: "int", name: "startIndex" }, { type: "int", name: "endIndex" }]);
    this.modelReset = Signal.signal();
  }

  _createClass(JSItemModel, [{
    key: "setRoleNames",
    value: function setRoleNames(names) {
      this.roleNames = names;
    }
  }]);

  return JSItemModel;
}();

QmlWeb.JSItemModel = JSItemModel;

var QColor = function () {
  function QColor() {
    _classCallCheck(this, QColor);

    this.$changed = new QmlWeb.Signal();
    this.$r = this.$g = this.$b = 0;
    this.$a = 1;
    var val = arguments.length <= 0 ? undefined : arguments[0];
    if (arguments.length >= 3) {
      this.$r = arguments.length <= 0 ? undefined : arguments[0];
      this.$g = arguments.length <= 1 ? undefined : arguments[1];
      this.$b = arguments.length <= 2 ? undefined : arguments[2];
      if (arguments.length >= 4) {
        this.$a = arguments.length <= 3 ? undefined : arguments[3];
      }
    } else if (val instanceof QColor) {
      // Copy constructor
      this.$a = val.a;
      this.$r = val.r;
      this.$g = val.g;
      this.$b = val.b;
    } else if (typeof val === "string") {
      var lval = val.toLowerCase();
      if (QColor.colormap[lval]) {
        var rgb = QColor.colormap[lval];
        this.$r = rgb[0] / 255;
        this.$g = rgb[1] / 255;
        this.$b = rgb[2] / 255;
      } else if (lval === "transparent") {
        this.$a = 0;
      } else if (lval[0] === "#") {
        var hex = lval.substr(1);
        if (hex.length === 3) {
          this.$r = parseInt(hex[0], 16) / 15;
          this.$g = parseInt(hex[1], 16) / 15;
          this.$b = parseInt(hex[2], 16) / 15;
        } else {
          var _rgb = hex.match(/.{2}/g).map(function (x) {
            return parseInt(x, 16);
          });
          if (_rgb.length === 4) {
            this.$a = _rgb.shift() / 255;
          }
          this.$r = _rgb[0] / 255;
          this.$g = _rgb[1] / 255;
          this.$b = _rgb[2] / 255;
        }
      } else {
        throw new Error("Can not convert " + val + " to color");
      }
    } else if (typeof val !== "undefined") {
      throw new Error("Can not assign " + (typeof val === "undefined" ? "undefined" : _typeof(val)) + " to QColor");
    }
  }

  _createClass(QColor, [{
    key: "toString",
    value: function toString() {
      if (this.$string) return this.$string;
      var argb = [this.$a, this.$r, this.$g, this.$b].map(function (x) {
        return (Math.round(x * 255) + 0x100).toString(16).substr(-2);
      });
      if (argb[0] === "ff") {
        argb.shift(); // We don't need alpha if it's ff
      }
      this.$string = "#" + argb.join("");
      return "#" + argb.join("");
    }
  }, {
    key: "$css",
    get: function get() {
      if (this.$cssValue) return this.$cssValue;
      if (this.$a === 1) {
        this.$cssValue = this.toString();
      } else if (this.$a === 0) {
        this.$cssValue = "transparent";
      } else {
        var intr = Math.round(this.$r * 255);
        var intg = Math.round(this.$g * 255);
        var intb = Math.round(this.$b * 255);
        this.$cssValue = "rgba(" + intr + "," + intg + "," + intb + "," + this.$a + ")";
      }
      return this.$cssValue;
    }
  }, {
    key: "r",
    get: function get() {
      return this.$r;
    },
    set: function set(r) {
      this.$r = r;
      this.$string = this.$cssValue = null;
      this.$changed.execute();
    }
  }, {
    key: "g",
    get: function get() {
      return this.$g;
    },
    set: function set(g) {
      this.$g = g;
      this.$string = this.$cssValue = null;
      this.$changed.execute();
    }
  }, {
    key: "b",
    get: function get() {
      return this.$b;
    },
    set: function set(b) {
      this.$b = b;
      this.$string = this.$cssValue = null;
      this.$changed.execute();
    }
  }, {
    key: "a",
    get: function get() {
      return this.$a;
    },
    set: function set(a) {
      this.$a = a;
      this.$string = this.$cssValue = null;
      this.$changed.execute();
    }
  }, {
    key: "hsvHue",
    get: function get() {
      var v = this.hsvValue;
      var m = Math.min(this.$r, this.$g, this.$b);
      if (v === m) return -1;
      if (v === this.$r) return ((this.$g - this.$b) / (v - m) + 1) % 1 / 6;
      if (v === this.$g) return ((this.$b - this.$r) / (v - m) + 2) / 6;
      if (v === this.$b) return ((this.$r - this.$g) / (v - m) + 4) / 6;
      throw new Error();
    },
    set: function set(h) {
      var rgb = QColor.$hsv(h, this.hsvSaturation, this.hsvValue);
      this.$r = rgb[0];
      this.$g = rgb[1];
      this.$b = rgb[2];
      this.$string = this.$cssValue = null;
      this.$changed.execute();
    }
  }, {
    key: "hsvSaturation",
    get: function get() {
      var v = this.hsvValue;
      if (v === 0) return 0;
      return 1 - Math.min(this.$r, this.$g, this.$b) / v;
    },
    set: function set(s) {
      var rgb = QColor.$hsv(this.hsvHue, s, this.hsvValue);
      this.$r = rgb[0];
      this.$g = rgb[1];
      this.$b = rgb[2];
      this.$string = this.$cssValue = null;
      this.$changed.execute();
    }
  }, {
    key: "hsvValue",
    get: function get() {
      return Math.max(this.$r, this.$g, this.$b);
    },
    set: function set(v) {
      var rgb = QColor.$hsv(this.hsvHue, this.hsvSaturation, v);
      this.$r = rgb[0];
      this.$g = rgb[1];
      this.$b = rgb[2];
      this.$string = this.$cssValue = null;
      this.$changed.execute();
    }
  }, {
    key: "hslHue",
    get: function get() {
      return this.hsvHue;
    },
    set: function set(h) {
      var rgb = QColor.$hsl(h, this.hslSaturation, this.hslLightness);
      this.$r = rgb[0];
      this.$g = rgb[1];
      this.$b = rgb[2];
      this.$string = this.$cssValue = null;
      this.$changed.execute();
    }
  }, {
    key: "hslSaturation",
    get: function get() {
      var max = Math.max(this.$r, this.$g, this.$b);
      var min = Math.min(this.$r, this.$g, this.$b);
      if (max === min) return 0;
      return (max - min) / (1 - Math.abs(1 - max - min));
    },
    set: function set(s) {
      var rgb = QColor.$hsl(this.hslHue, s, this.hslLightness);
      this.$r = rgb[0];
      this.$g = rgb[1];
      this.$b = rgb[2];
      this.$string = this.$cssValue = null;
      this.$changed.execute();
    }
  }, {
    key: "hslLightness",
    get: function get() {
      var max = Math.max(this.$r, this.$g, this.$b);
      var min = Math.min(this.$r, this.$g, this.$b);
      return (max + min) / 2;
    },
    set: function set(l) {
      var rgb = QColor.$hsl(this.hslHue, this.hslSaturation, l);
      this.$r = rgb[0];
      this.$g = rgb[1];
      this.$b = rgb[2];
      this.$string = this.$cssValue = null;
      this.$changed.execute();
    }
  }], [{
    key: "$hsv",
    value: function $hsv(h, s, v) {
      var c = v * s;
      var m = v - c;
      return QColor.$hcma(h, c, m);
    }
  }, {
    key: "$hsl",
    value: function $hsl(h, s, l) {
      var c = (1 - Math.abs(2 * l - 1)) * s;
      var m = l - c / 2;
      return QColor.$hcma(h, c, m);
    }
  }, {
    key: "$hcma",
    value: function $hcma(h, c, m) {
      var hh = h > 0 ? h * 6 % 6 : 0;
      var x = c * (1 - Math.abs(hh % 2 - 1));
      var rgb = void 0;
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
      return rgb.map(function (y) {
        return Math.min(1, y + m);
      });
    }
  }, {
    key: "darker",
    value: function darker(baseColor) {
      var factor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

      var color = baseColor instanceof QColor ? baseColor : new QColor(baseColor);
      var v = color.hsvValue / factor;
      // Undocumented in Qt, but this matches the observed Qt behaviour
      var s = color.hsvSaturation - Math.max(0, v - 1);
      return QColor.hsva(color.hsvHue, Math.max(0, s), Math.min(1, v), color.a);
    }
  }, {
    key: "lighter",
    value: function lighter(baseColor) {
      var factor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.5;

      var color = baseColor instanceof QColor ? baseColor : new QColor(baseColor);
      var v = color.hsvValue * factor;
      // Undocumented in Qt, but this matches the observed Qt behaviour
      var s = color.hsvSaturation - Math.max(0, v - 1);
      return QColor.hsva(color.hsvHue, Math.max(0, s), Math.min(1, v), color.a);
    }
  }, {
    key: "equal",
    value: function equal(lhs, rhs) {
      var a = lhs instanceof QColor ? lhs : new QColor(lhs);
      var b = rhs instanceof QColor ? rhs : new QColor(rhs);
      return a.toString() === b.toString();
    }
  }]);

  return QColor;
}();

QColor.rgba = function (r, g, b) {
  var a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
  return new QColor(r, g, b, a);
};

QColor.hsva = function (h, s, v) {
  var a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
  return new (Function.prototype.bind.apply(QColor, [null].concat(_toConsumableArray(QColor.$hsv(h, s, v)), [a])))();
};

QColor.hsla = function (h, s, l) {
  var a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
  return new (Function.prototype.bind.apply(QColor, [null].concat(_toConsumableArray(QColor.$hsl(h, s, l)), [a])))();
};

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

var QFont = function (_QmlWeb$QObject) {
  _inherits(QFont, _QmlWeb$QObject);

  function QFont(parent) {
    _classCallCheck(this, QFont);

    var _this = _possibleConstructorReturn(this, (QFont.__proto__ || Object.getPrototypeOf(QFont)).call(this, parent));

    _this.Font = QFont.Font;

    var Font = _this.Font;

    QmlWeb.createProperties(_this, {
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

    _this.$sizeLock = false;

    _this.boldChanged.connect(_this, _this.$onBoldChanged);
    _this.capitalizationChanged.connect(_this, _this.$onCapitalizationChanged);
    _this.familyChanged.connect(_this, _this.$onFamilyChanged);
    _this.italicChanged.connect(_this, _this.$onItalicChanged);
    _this.letterSpacingChanged.connect(_this, _this.$onLetterSpacingChanged);
    _this.pixelSizeChanged.connect(_this, _this.$onPixelSizeChanged);
    _this.pointSizeChanged.connect(_this, _this.$onPointSizeChanged);
    _this.strikeoutChanged.connect(_this, _this.$onStrikeoutChanged);
    _this.underlineChanged.connect(_this, _this.$onUnderlineChanged);
    _this.weightChanged.connect(_this, _this.$onWidthChanged);
    _this.wordSpacingChanged.connect(_this, _this.$onWordSpacingChanged);
    return _this;
  }

  _createClass(QFont, [{
    key: "$onBoldChanged",
    value: function $onBoldChanged(newVal) {
      var Font = this.Font;
      this.weight = newVal ? Font.Bold : Font.Normal;
    }
  }, {
    key: "$onCapitalizationChanged",
    value: function $onCapitalizationChanged(newVal) {
      var style = this.$parent.dom.firstChild.style;
      style.fontVariant = newVal === this.Font.SmallCaps ? "small-caps" : "none";
      style.textTransform = this.$capitalizationToTextTransform(newVal);
    }
  }, {
    key: "$onFamilyChanged",
    value: function $onFamilyChanged(newVal) {
      var style = this.$parent.dom.firstChild.style;
      style.fontFamily = newVal;
    }
  }, {
    key: "$onItalicChanged",
    value: function $onItalicChanged(newVal) {
      var style = this.$parent.dom.firstChild.style;
      style.fontStyle = newVal ? "italic" : "normal";
    }
  }, {
    key: "$onLetterSpacingChanged",
    value: function $onLetterSpacingChanged(newVal) {
      var style = this.$parent.dom.firstChild.style;
      style.letterSpacing = newVal !== undefined ? newVal + "px" : "";
    }
  }, {
    key: "$onPixelSizeChanged",
    value: function $onPixelSizeChanged(newVal) {
      if (!this.$sizeLock) {
        this.pointSize = newVal * 0.75;
      }
      var val = newVal + "px";
      this.$parent.dom.style.fontSize = val;
      this.$parent.dom.firstChild.style.fontSize = val;
    }
  }, {
    key: "$onPointSizeChanged",
    value: function $onPointSizeChanged(newVal) {
      this.$sizeLock = true;
      this.pixelSize = Math.round(newVal / 0.75);
      this.$sizeLock = false;
    }
  }, {
    key: "$onStrikeoutChanged",
    value: function $onStrikeoutChanged(newVal) {
      var style = this.$parent.dom.firstChild.style;
      style.textDecoration = newVal ? "line-through" : this.$parent.font.underline ? "underline" : "none";
    }
  }, {
    key: "$onUnderlineChanged",
    value: function $onUnderlineChanged(newVal) {
      var style = this.$parent.dom.firstChild.style;
      style.textDecoration = this.$parent.font.strikeout ? "line-through" : newVal ? "underline" : "none";
    }
  }, {
    key: "$onWidthChanged",
    value: function $onWidthChanged(newVal) {
      var style = this.$parent.dom.firstChild.style;
      style.fontWeight = this.$weightToCss(newVal);
    }
  }, {
    key: "$onWordSpacingChanged",
    value: function $onWordSpacingChanged(newVal) {
      var style = this.$parent.dom.firstChild.style;
      style.wordSpacing = newVal !== undefined ? newVal + "px" : "";
    }
  }, {
    key: "$weightToCss",
    value: function $weightToCss(weight) {
      var Font = this.Font;
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
  }, {
    key: "$capitalizationToTextTransform",
    value: function $capitalizationToTextTransform(capitalization) {
      var Font = this.Font;
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
  }]);

  return QFont;
}(QmlWeb.QObject);

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

var QMatrix4x4 = function (_QmlWeb$QObject2) {
  _inherits(QMatrix4x4, _QmlWeb$QObject2);

  function QMatrix4x4() {
    _classCallCheck(this, QMatrix4x4);

    var _this2 = _possibleConstructorReturn(this, (QMatrix4x4.__proto__ || Object.getPrototypeOf(QMatrix4x4)).call(this));

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var data = args;
    if (args.length === 0) {
      data = [];
      for (var row = 1; row <= 4; row++) {
        for (var col = 1; col <= 4; col++) {
          data.push(col === row ? 1 : 0);
        }
      }
    } else if (args.length === 1 && args[0] instanceof QMatrix4x4) {
      data = [];
      for (var _row = 1; _row <= 4; _row++) {
        for (var _col = 1; _col <= 4; _col++) {
          var name = "m" + _row + _col;
          data.push(args[0][name]);
        }
      }
    } else if (args.length !== 16) {
      throw new Error("Invalid arguments");
    }
    for (var _row2 = 1; _row2 <= 4; _row2++) {
      for (var _col2 = 1; _col2 <= 4; _col2++) {
        var _name = "m" + _row2 + _col2;
        var value = data[4 * (_row2 - 1) + _col2 - 1];
        QmlWeb.createProperty("real", _this2, _name, { initialValue: value });
      }
    }
    return _this2;
  }

  _createClass(QMatrix4x4, [{
    key: "toString",
    value: function toString() {
      return _get(QMatrix4x4.prototype.__proto__ || Object.getPrototypeOf(QMatrix4x4.prototype), "$toString", this).call(this, this.m11, this.m12, this.m13, this.m14, this.m21, this.m22, this.m23, this.m24, this.m31, this.m32, this.m33, this.m34, this.m41, this.m42, this.m43, this.m44);
    }
  }, {
    key: "times",
    value: function times(a) {
      if (a instanceof QmlWeb.QMatrix4x4) {
        var t = this;
        return new QmlWeb.QMatrix4x4(t.m11 * a.m11 + t.m12 * a.m21 + t.m13 * a.m31 + t.m14 * a.m41, t.m11 * a.m12 + t.m12 * a.m22 + t.m13 * a.m32 + t.m14 * a.m42, t.m11 * a.m13 + t.m12 * a.m23 + t.m13 * a.m33 + t.m14 * a.m43, t.m11 * a.m14 + t.m12 * a.m24 + t.m13 * a.m34 + t.m14 * a.m44, t.m21 * a.m11 + t.m22 * a.m21 + t.m23 * a.m31 + t.m24 * a.m41, t.m21 * a.m12 + t.m22 * a.m22 + t.m23 * a.m32 + t.m24 * a.m42, t.m21 * a.m13 + t.m22 * a.m23 + t.m23 * a.m33 + t.m24 * a.m43, t.m21 * a.m14 + t.m22 * a.m24 + t.m23 * a.m34 + t.m24 * a.m44, t.m31 * a.m11 + t.m32 * a.m21 + t.m33 * a.m31 + t.m34 * a.m41, t.m31 * a.m12 + t.m32 * a.m22 + t.m33 * a.m32 + t.m34 * a.m42, t.m31 * a.m13 + t.m32 * a.m23 + t.m33 * a.m33 + t.m34 * a.m43, t.m31 * a.m14 + t.m32 * a.m24 + t.m33 * a.m34 + t.m34 * a.m44, t.m41 * a.m11 + t.m42 * a.m21 + t.m43 * a.m31 + t.m44 * a.m41, t.m41 * a.m12 + t.m42 * a.m22 + t.m43 * a.m32 + t.m44 * a.m42, t.m41 * a.m13 + t.m42 * a.m23 + t.m43 * a.m33 + t.m44 * a.m43, t.m41 * a.m14 + t.m42 * a.m24 + t.m43 * a.m34 + t.m44 * a.m44);
      }
      if (a instanceof QmlWeb.QVector4D) {
        var _t = this;
        return new QmlWeb.QVector4D(_t.m11 * a.x + _t.m12 * a.y + _t.m13 * a.z + _t.m14 * a.w, _t.m21 * a.x + _t.m22 * a.y + _t.m23 * a.z + _t.m24 * a.w, _t.m31 * a.x + _t.m32 * a.y + _t.m33 * a.z + _t.m34 * a.w, _t.m41 * a.x + _t.m42 * a.y + _t.m43 * a.z + _t.m44 * a.w);
      }
      if (a instanceof QmlWeb.QVector3D) {
        var v = this.times(new QmlWeb.QVector4D(a.x, a.y, a.z, 1));
        return new QmlWeb.QVector3D(v.x / v.w, v.y / v.w, v.z / v.w);
      }
      return new QMatrix4x4(this.m11 * a, this.m12 * a, this.m13 * a, this.m14 * a, this.m21 * a, this.m22 * a, this.m23 * a, this.m24 * a, this.m31 * a, this.m32 * a, this.m33 * a, this.m34 * a, this.m41 * a, this.m42 * a, this.m43 * a, this.m44 * a);
    }
  }, {
    key: "plus",
    value: function plus(other) {
      var a = other instanceof QMatrix4x4 ? other : new QMatrix4x4();
      return new QMatrix4x4(this.m11 + a.m11, this.m12 + a.m12, this.m13 + a.m13, this.m14 + a.m14, this.m21 + a.m21, this.m22 + a.m22, this.m23 + a.m23, this.m24 + a.m24, this.m31 + a.m31, this.m32 + a.m32, this.m33 + a.m33, this.m34 + a.m34, this.m41 + a.m41, this.m42 + a.m42, this.m43 + a.m43, this.m44 + a.m44);
    }
  }, {
    key: "minus",
    value: function minus(other) {
      var a = other instanceof QMatrix4x4 ? other : new QMatrix4x4();
      return new QMatrix4x4(this.m11 - a.m11, this.m12 - a.m12, this.m13 - a.m13, this.m14 - a.m14, this.m21 - a.m21, this.m22 - a.m22, this.m23 - a.m23, this.m24 - a.m24, this.m31 - a.m31, this.m32 - a.m32, this.m33 - a.m33, this.m34 - a.m34, this.m41 - a.m41, this.m42 - a.m42, this.m43 - a.m43, this.m44 - a.m44);
    }
  }, {
    key: "row",
    value: function row(i) {
      var _this3 = this;

      var row = i + 1;
      var arr = [1, 2, 3, 4].map(function (col) {
        return _this3["m" + row + col];
      });
      return new (Function.prototype.bind.apply(QmlWeb.QVector4D, [null].concat(_toConsumableArray(arr))))();
    }
  }, {
    key: "column",
    value: function column(i) {
      var _this4 = this;

      var col = i + 1;
      var arr = [1, 2, 3, 4].map(function (row) {
        return _this4["m" + row + col];
      });
      return new (Function.prototype.bind.apply(QmlWeb.QVector4D, [null].concat(_toConsumableArray(arr))))();
    }
  }, {
    key: "determinant",
    value: function determinant() {
      // Laplace expansion
      var t = this;
      var s0 = t.m11 * t.m22 - t.m12 * t.m21;
      var c5 = t.m33 * t.m44 - t.m34 * t.m43;
      var s1 = t.m11 * t.m23 - t.m13 * t.m21;
      var c4 = t.m32 * t.m44 - t.m34 * t.m42;
      var s2 = t.m11 * t.m24 - t.m14 * t.m21;
      var c3 = t.m32 * t.m43 - t.m33 * t.m42;
      var s3 = t.m12 * t.m23 - t.m13 * t.m22;
      var c2 = t.m31 * t.m44 - t.m34 * t.m41;
      var s4 = t.m12 * t.m24 - t.m14 * t.m22;
      var c1 = t.m31 * t.m43 - t.m33 * t.m41;
      var s5 = t.m13 * t.m24 - t.m14 * t.m23;
      var c0 = t.m31 * t.m42 - t.m32 * t.m41;
      return s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0;
    }
  }, {
    key: "inverted",
    value: function inverted() {
      // Laplace expansion
      var t = this;
      var s0 = t.m11 * t.m22 - t.m12 * t.m21;
      var c5 = t.m33 * t.m44 - t.m34 * t.m43;
      var s1 = t.m11 * t.m23 - t.m13 * t.m21;
      var c4 = t.m32 * t.m44 - t.m34 * t.m42;
      var s2 = t.m11 * t.m24 - t.m14 * t.m21;
      var c3 = t.m32 * t.m43 - t.m33 * t.m42;
      var s3 = t.m12 * t.m23 - t.m13 * t.m22;
      var c2 = t.m31 * t.m44 - t.m34 * t.m41;
      var s4 = t.m12 * t.m24 - t.m14 * t.m22;
      var c1 = t.m31 * t.m43 - t.m33 * t.m41;
      var s5 = t.m13 * t.m24 - t.m14 * t.m23;
      var c0 = t.m31 * t.m42 - t.m32 * t.m41;
      var det = s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0;
      var adj = [+t.m22 * c5 - t.m23 * c4 + t.m24 * c3, -t.m12 * c5 + t.m13 * c4 - t.m14 * c3, +t.m42 * s5 - t.m43 * s4 + t.m44 * s3, -t.m32 * s5 + t.m33 * s4 - t.m34 * s3, -t.m21 * c5 + t.m23 * c2 - t.m24 * c1, +t.m11 * c5 - t.m13 * c2 + t.m14 * c1, -t.m41 * s5 + t.m43 * s2 - t.m44 * s1, +t.m31 * s5 - t.m33 * s2 + t.m34 * s1, +t.m21 * c4 - t.m22 * c2 + t.m24 * c0, -t.m11 * c4 + t.m12 * c2 - t.m14 * c0, +t.m41 * s4 - t.m42 * s2 + t.m44 * s0, -t.m31 * s4 + t.m32 * s2 - t.m34 * s0, -t.m21 * c3 + t.m22 * c1 - t.m23 * c0, +t.m11 * c3 - t.m12 * c1 + t.m13 * c0, -t.m41 * s3 + t.m42 * s1 - t.m43 * s0, +t.m31 * s3 - t.m32 * s1 + t.m33 * s0];
      return new (Function.prototype.bind.apply(QMatrix4x4, [null].concat(_toConsumableArray(adj.map(function (x) {
        return x / det;
      })))))();
    }
  }, {
    key: "transposed",
    value: function transposed() {
      return new QMatrix4x4(this.m11, this.m21, this.m31, this.m41, this.m12, this.m22, this.m32, this.m42, this.m13, this.m23, this.m33, this.m43, this.m14, this.m24, this.m34, this.m44);
    }
  }, {
    key: "fuzzyEquals",
    value: function fuzzyEquals(a) {
      var epsilon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.00001;

      for (var row = 1; row <= 4; row++) {
        for (var col = 1; col <= 4; col++) {
          var name = "m" + row + col;
          if (Math.abs(this[name] - a[name]) > epsilon) {
            return false;
          }
        }
      }
      return true;
    }
  }]);

  return QMatrix4x4;
}(QmlWeb.QObject);

QMatrix4x4.nonNullableType = true;
QMatrix4x4.requireConstructor = true;


QmlWeb.QMatrix4x4 = QMatrix4x4;

var QPointF = function (_QmlWeb$QObject3) {
  _inherits(QPointF, _QmlWeb$QObject3);

  function QPointF() {
    _classCallCheck(this, QPointF);

    var _this5 = _possibleConstructorReturn(this, (QPointF.__proto__ || Object.getPrototypeOf(QPointF)).call(this));

    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var data = args;
    if (args.length === 0) {
      data = [0, 0];
    } else if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split(",").map(function (x) {
        return parseFloat(x.trim());
      });
      if (data.length !== 2) throw new Error("point expected");
    } else if (args.length === 1 && args[0] instanceof QPointF) {
      data = [args[0].x, args[0].y];
    } else if (args.length !== 2) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(_this5, {
      x: { type: "real", initialValue: data[0] },
      y: { type: "real", initialValue: data[1] }
    });
    return _this5;
  }

  _createClass(QPointF, [{
    key: "toString",
    value: function toString() {
      return _get(QPointF.prototype.__proto__ || Object.getPrototypeOf(QPointF.prototype), "$toString", this).call(this, this.x, this.y);
    }
  }]);

  return QPointF;
}(QmlWeb.QObject);

QPointF.nonNullableType = true;
QPointF.requireConstructor = true;


QmlWeb.QPointF = QPointF;

var QQuaternion = function (_QmlWeb$QObject4) {
  _inherits(QQuaternion, _QmlWeb$QObject4);

  function QQuaternion() {
    _classCallCheck(this, QQuaternion);

    var _this6 = _possibleConstructorReturn(this, (QQuaternion.__proto__ || Object.getPrototypeOf(QQuaternion)).call(this));

    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    var data = args;
    if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split(",").map(function (x) {
        return parseFloat(x.trim());
      });
      if (data.length !== 4) data = [];
    } else if (args.length === 1 && args[0] instanceof QQuaternion) {
      data = [args[0].scalar, args[0].x, args[0].y, args[0].z];
    }
    if (data.length === 0) {
      data = [1, 0, 0, 0];
    } else if (data.length !== 4) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(_this6, {
      scalar: { type: "real", initialValue: data[0] },
      x: { type: "real", initialValue: data[1] },
      y: { type: "real", initialValue: data[2] },
      z: { type: "real", initialValue: data[3] }
    });
    return _this6;
  }

  _createClass(QQuaternion, [{
    key: "toString",
    value: function toString() {
      return _get(QQuaternion.prototype.__proto__ || Object.getPrototypeOf(QQuaternion.prototype), "$toString", this).call(this, this.scalar, this.x, this.y, this.z);
    }
  }]);

  return QQuaternion;
}(QmlWeb.QObject);

QQuaternion.nonNullableType = true;
QQuaternion.requireConstructor = true;


QmlWeb.QQuaternion = QQuaternion;

var QRectF = function (_QmlWeb$QObject5) {
  _inherits(QRectF, _QmlWeb$QObject5);

  function QRectF() {
    _classCallCheck(this, QRectF);

    var _this7 = _possibleConstructorReturn(this, (QRectF.__proto__ || Object.getPrototypeOf(QRectF)).call(this));

    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    var data = args;
    if (args.length === 0) {
      data = [0, 0, 0, 0];
    } else if (args.length === 1 && typeof args[0] === "string") {
      var mask = /^\s*[-\d.]+\s*,\s*[-\d.]+\s*,\s*[-\d.]+\s*x\s*[-\d.]+\s*$/;
      if (!args[0].match(mask)) throw new Error("rect expected");
      data = args[0].replace("x", ",").split(",").map(function (x) {
        return parseFloat(x.trim());
      });
    } else if (args.length === 1 && args[0] instanceof QRectF) {
      data = [args[0].x, args[0].y, args[0].z, args[0].width];
    } else if (args.length !== 4) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(_this7, {
      x: { type: "real", initialValue: data[0] },
      y: { type: "real", initialValue: data[1] },
      width: { type: "real", initialValue: data[2] },
      height: { type: "real", initialValue: data[3] }
    });
    return _this7;
  }

  _createClass(QRectF, [{
    key: "toString",
    value: function toString() {
      return _get(QRectF.prototype.__proto__ || Object.getPrototypeOf(QRectF.prototype), "$toString", this).call(this, this.x, this.y, this.width, this.height);
    }
  }]);

  return QRectF;
}(QmlWeb.QObject);

QRectF.nonNullableType = true;
QRectF.requireConstructor = true;


QmlWeb.QRectF = QRectF;

var QSizeF = function (_QmlWeb$QObject6) {
  _inherits(QSizeF, _QmlWeb$QObject6);

  function QSizeF() {
    _classCallCheck(this, QSizeF);

    var _this8 = _possibleConstructorReturn(this, (QSizeF.__proto__ || Object.getPrototypeOf(QSizeF)).call(this));

    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    var data = args;
    if (args.length === 0) {
      data = [-1, -1];
    } else if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split("x").map(function (x) {
        return parseFloat(x.trim());
      });
      if (data.length !== 2) throw new Error("size expected");
    } else if (args.length === 1 && args[0] instanceof QSizeF) {
      data = [args[0].width, args[0].height];
    } else if (args.length !== 2) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(_this8, {
      width: { type: "real", initialValue: data[0] },
      height: { type: "real", initialValue: data[1] }
    });
    return _this8;
  }

  _createClass(QSizeF, [{
    key: "toString",
    value: function toString() {
      return _get(QSizeF.prototype.__proto__ || Object.getPrototypeOf(QSizeF.prototype), "$toString", this).call(this, this.width, this.height);
    }
  }]);

  return QSizeF;
}(QmlWeb.QObject);

QSizeF.nonNullableType = true;
QSizeF.requireConstructor = true;


QmlWeb.QSizeF = QSizeF;

var QVector2D = function (_QmlWeb$QObject7) {
  _inherits(QVector2D, _QmlWeb$QObject7);

  function QVector2D() {
    _classCallCheck(this, QVector2D);

    var _this9 = _possibleConstructorReturn(this, (QVector2D.__proto__ || Object.getPrototypeOf(QVector2D)).call(this));

    for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    var data = args;
    if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split(",").map(function (x) {
        return parseFloat(x.trim());
      });
      if (data.length !== 2) data = [];
    } else if (args.length === 1 && args[0] instanceof QVector2D) {
      data = [args[0].x, args[0].y];
    }
    if (data.length === 0) {
      data = [0, 0];
    } else if (data.length !== 2) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(_this9, {
      x: { type: "real", initialValue: data[0] },
      y: { type: "real", initialValue: data[1] }
    });
    return _this9;
  }

  _createClass(QVector2D, [{
    key: "toString",
    value: function toString() {
      return _get(QVector2D.prototype.__proto__ || Object.getPrototypeOf(QVector2D.prototype), "$toString", this).call(this, this.x, this.y);
    }
  }, {
    key: "dotProduct",
    value: function dotProduct(a) {
      if (a instanceof QVector2D) {
        return a.x * this.x + a.y * this.y;
      }
      return 0;
    }
  }, {
    key: "times",
    value: function times(a) {
      if (a instanceof QVector2D) {
        return new QVector2D(this.x * a.x, this.y * a.y);
      }
      return new QVector2D(this.x * a, this.y * a);
    }
  }, {
    key: "plus",
    value: function plus(a) {
      if (a instanceof QVector2D) {
        return new QVector2D(this.x + a.x, this.y + a.y);
      }
      return new QVector2D(this.x, this.y);
    }
  }, {
    key: "minus",
    value: function minus(a) {
      if (a instanceof QVector2D) {
        return new QVector2D(this.x - a.x, this.y - a.y);
      }
      return new QVector2D(this.x, this.y);
    }
  }, {
    key: "normalized",
    value: function normalized() {
      var length = this.length();
      return this.times(1 / (length === 0 ? 1 : length));
    }
  }, {
    key: "length",
    value: function length() {
      return Math.sqrt(this.dotProduct(this));
    }
  }, {
    key: "toVector3d",
    value: function toVector3d() {
      return new QmlWeb.QVector3D(this.x, this.y, 0);
    }
  }, {
    key: "toVector4d",
    value: function toVector4d() {
      return new QmlWeb.QVector4D(this.x, this.y, 0, 0);
    }
  }, {
    key: "fuzzyEquals",
    value: function fuzzyEquals(a) {
      var epsilon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.00001;

      return [this.x - a.x, this.y - a.y].every(function (delta) {
        return Math.abs(delta) <= epsilon;
      });
    }
  }]);

  return QVector2D;
}(QmlWeb.QObject);

QVector2D.nonNullableType = true;
QVector2D.requireConstructor = true;


QmlWeb.QVector2D = QVector2D;

var QVector3D = function (_QmlWeb$QObject8) {
  _inherits(QVector3D, _QmlWeb$QObject8);

  function QVector3D() {
    _classCallCheck(this, QVector3D);

    var _this10 = _possibleConstructorReturn(this, (QVector3D.__proto__ || Object.getPrototypeOf(QVector3D)).call(this));

    for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      args[_key8] = arguments[_key8];
    }

    var data = args;
    if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split(",").map(function (x) {
        return parseFloat(x.trim());
      });
      if (data.length !== 3) data = [];
    } else if (args.length === 1 && args[0] instanceof QVector3D) {
      data = [args[0].x, args[0].y, args[0].z];
    }
    if (data.length === 0) {
      data = [0, 0, 0];
    } else if (data.length !== 3) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(_this10, {
      x: { type: "real", initialValue: data[0] },
      y: { type: "real", initialValue: data[1] },
      z: { type: "real", initialValue: data[2] }
    });
    return _this10;
  }

  _createClass(QVector3D, [{
    key: "toString",
    value: function toString() {
      return _get(QVector3D.prototype.__proto__ || Object.getPrototypeOf(QVector3D.prototype), "$toString", this).call(this, this.x, this.y, this.z);
    }
  }, {
    key: "crossProduct",
    value: function crossProduct(a) {
      if (a instanceof QVector3D) {
        return new QVector3D(this.y * a.z - this.z * a.y, this.z * a.x - this.x * a.z, this.x * a.y - this.y * a.x);
      }
      return new QVector3D();
    }
  }, {
    key: "dotProduct",
    value: function dotProduct(a) {
      if (a instanceof QVector3D) {
        return a.x * this.x + a.y * this.y + a.z * this.z;
      }
      return 0;
    }
  }, {
    key: "times",
    value: function times(a) {
      if (a instanceof QmlWeb.QMatrix4x4) {
        var v = new QmlWeb.QVector4D(this.x, this.y, this.z, 1).times(a);
        return new QVector3D(v.x / v.w, v.y / v.w, v.z / v.w);
      }
      if (a instanceof QVector3D) {
        return new QVector3D(this.x * a.x, this.y * a.y, this.z * a.z);
      }
      return new QVector3D(this.x * a, this.y * a, this.z * a);
    }
  }, {
    key: "plus",
    value: function plus(a) {
      if (a instanceof QVector3D) {
        return new QVector3D(this.x + a.x, this.y + a.y, this.z + a.z);
      }
      return new QVector3D(this.x, this.y, this.z);
    }
  }, {
    key: "minus",
    value: function minus(a) {
      if (a instanceof QVector3D) {
        return new QVector3D(this.x - a.x, this.y - a.y, this.z - a.z);
      }
      return new QVector3D(this.x, this.y, this.z);
    }
  }, {
    key: "normalized",
    value: function normalized() {
      var length = this.length();
      return this.times(1 / (length === 0 ? 1 : length));
    }
  }, {
    key: "length",
    value: function length() {
      return Math.sqrt(this.dotProduct(this));
    }
  }, {
    key: "toVector2d",
    value: function toVector2d() {
      return new QmlWeb.QVector2D(this.x, this.y);
    }
  }, {
    key: "toVector4d",
    value: function toVector4d() {
      return new QmlWeb.QVector4D(this.x, this.y, this.z, 0);
    }
  }, {
    key: "fuzzyEquals",
    value: function fuzzyEquals(a) {
      var epsilon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.00001;

      return [this.x - a.x, this.y - a.y, this.z - a.z].every(function (delta) {
        return Math.abs(delta) <= epsilon;
      });
    }
  }]);

  return QVector3D;
}(QmlWeb.QObject);

QVector3D.nonNullableType = true;
QVector3D.requireConstructor = true;


QmlWeb.QVector3D = QVector3D;

var QVector4D = function (_QmlWeb$QObject9) {
  _inherits(QVector4D, _QmlWeb$QObject9);

  function QVector4D() {
    _classCallCheck(this, QVector4D);

    var _this11 = _possibleConstructorReturn(this, (QVector4D.__proto__ || Object.getPrototypeOf(QVector4D)).call(this));

    for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      args[_key9] = arguments[_key9];
    }

    var data = args;
    if (args.length === 1 && typeof args[0] === "string") {
      data = args[0].split(",").map(function (x) {
        return parseFloat(x.trim());
      });
      if (data.length !== 4) data = [];
    } else if (args.length === 1 && args[0] instanceof QVector4D) {
      data = [args[0].x, args[0].y, args[0].z, args[0].w];
    }
    if (data.length === 0) {
      data = [0, 0, 0, 0];
    } else if (data.length !== 4) {
      throw new Error("Invalid arguments");
    }
    QmlWeb.createProperties(_this11, {
      x: { type: "real", initialValue: data[0] },
      y: { type: "real", initialValue: data[1] },
      z: { type: "real", initialValue: data[2] },
      w: { type: "real", initialValue: data[3] }
    });
    return _this11;
  }

  _createClass(QVector4D, [{
    key: "toString",
    value: function toString() {
      return _get(QVector4D.prototype.__proto__ || Object.getPrototypeOf(QVector4D.prototype), "$toString", this).call(this, this.x, this.y, this.z, this.w);
    }
  }, {
    key: "dotProduct",
    value: function dotProduct(a) {
      if (a instanceof QVector4D) {
        return a.x * this.x + a.y * this.y + a.z * this.z + a.w * this.w;
      }
      return 0;
    }
  }, {
    key: "times",
    value: function times(a) {
      if (a instanceof QmlWeb.QMatrix4x4) {
        var t = this;
        return new QVector4D(t.x * a.m11 + t.y * a.m21 + t.z * a.m31 + t.w * a.m41, t.x * a.m12 + t.y * a.m22 + t.z * a.m32 + t.w * a.m42, t.x * a.m13 + t.y * a.m23 + t.z * a.m33 + t.w * a.m43, t.x * a.m14 + t.y * a.m24 + t.z * a.m34 + t.w * a.m44);
      }
      if (a instanceof QVector4D) {
        var _t2 = this;
        return new QVector4D(_t2.x * a.x, _t2.y * a.y, _t2.z * a.z, _t2.w * a.w);
      }
      return new QVector4D(this.x * a, this.y * a, this.z * a, this.w * a);
    }
  }, {
    key: "plus",
    value: function plus(a) {
      if (a instanceof QVector4D) {
        var t = this;
        return new QVector4D(t.x + a.x, t.y + a.y, t.z + a.z, t.w + a.w);
      }
      return new QVector4D(this.x, this.y, this.z, this.w);
    }
  }, {
    key: "minus",
    value: function minus(a) {
      if (a instanceof QVector4D) {
        var t = this;
        return new QVector4D(t.x - a.x, t.y - a.y, t.z - a.z, t.w - a.w);
      }
      return new QVector4D(this.x, this.y, this.z, this.w);
    }
  }, {
    key: "normalized",
    value: function normalized() {
      var length = this.length();
      return this.times(1 / (length === 0 ? 1 : length));
    }
  }, {
    key: "length",
    value: function length() {
      return Math.sqrt(this.dotProduct(this));
    }
  }, {
    key: "toVector2d",
    value: function toVector2d() {
      return new QmlWeb.QVector2D(this.x, this.y);
    }
  }, {
    key: "toVector3d",
    value: function toVector3d() {
      return new QmlWeb.QVector3D(this.x, this.y, this.z);
    }
  }, {
    key: "fuzzyEquals",
    value: function fuzzyEquals(a) {
      var epsilon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.00001;

      return [this.x - a.x, this.y - a.y, this.z - a.z, this.w - a.w].every(function (delta) {
        return Math.abs(delta) <= epsilon;
      });
    }
  }]);

  return QVector4D;
}(QmlWeb.QObject);

QVector4D.nonNullableType = true;
QVector4D.requireConstructor = true;


QmlWeb.QVector4D = QVector4D;

var Signal = function () {
  function Signal() {
    var _this12 = this;

    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Signal);

    this.connectedSlots = [];
    this.signal = null;

    this.obj = options.obj;
    this.options = options;

    this.signal = function () {
      return _this12.execute.apply(_this12, arguments);
    };
    this.signal.parameters = params;
    this.signal.connect = this.connect.bind(this);
    this.signal.disconnect = this.disconnect.bind(this);
    this.signal.isConnected = this.isConnected.bind(this);

    // TODO Fix Keys that don't have an obj for the signal
    if (this.obj && this.obj.$signals !== undefined) {
      this.obj.$signals.push(this.signal);
    }
  }

  _createClass(Signal, [{
    key: "execute",
    value: function execute() {
      QmlWeb.QMLProperty.pushEvalStack();

      for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }

      for (var i in this.connectedSlots) {
        var desc = this.connectedSlots[i];
        if (desc.type & Signal.QueuedConnection) {
          Signal.$addQueued(desc, args);
        } else {
          Signal.$execute(desc, args);
        }
      }
      QmlWeb.QMLProperty.popEvalStack();
    }
  }, {
    key: "connect",
    value: function connect() {
      var type = Signal.AutoConnection;

      for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }

      if (typeof args[args.length - 1] === "number") {
        type = args.pop();
      }
      if (type & Signal.UniqueConnection) {
        if (this.isConnected.apply(this, args)) {
          return;
        }
      }
      if (args.length === 1) {
        this.connectedSlots.push({ thisObj: global, slot: args[0], type: type });
      } else if (typeof args[1] === "string" || args[1] instanceof String) {
        if (args[0].$tidyupList && args[0] !== this.obj) {
          args[0].$tidyupList.push(this.signal);
        }
        var slot = args[0][args[1]];
        this.connectedSlots.push({ thisObj: args[0], slot: slot, type: type });
      } else {
        if (args[0].$tidyupList && (!this.obj || args[0] !== this.obj && args[0] !== this.obj.$parent)) {
          args[0].$tidyupList.push(this.signal);
        }
        this.connectedSlots.push({ thisObj: args[0], slot: args[1], type: type });
      }

      // Notify object of connect
      if (this.options.obj && this.options.obj.$connectNotify) {
        this.options.obj.$connectNotify(this.options);
      }
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
        args[_key12] = arguments[_key12];
      }

      // type meaning:
      //  1 = function, 2 = string
      //  3 = object with string method,  4 = object with function
      // No args means disconnect everything connected to this signal
      var callType = args.length === 1 ? args[0] instanceof Function ? 1 : 2 : typeof args[1] === "string" || args[1] instanceof String ? 3 : 4;
      for (var i = 0; i < this.connectedSlots.length; i++) {
        var _connectedSlots$i = this.connectedSlots[i],
            slot = _connectedSlots$i.slot,
            thisObj = _connectedSlots$i.thisObj;

        if (args.length === 0 || callType === 1 && slot === args[0] || callType === 2 && thisObj === args[0] || callType === 3 && thisObj === args[0] && slot === args[0][args[1]] || thisObj === args[0] && slot === args[1]) {
          if (thisObj) {
            var index = thisObj.$tidyupList.indexOf(this.signal);
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
  }, {
    key: "isConnected",
    value: function isConnected() {
      for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
        args[_key13] = arguments[_key13];
      }

      var callType = args.length === 1 ? 1 : typeof args[1] === "string" || args[1] instanceof String ? 2 : 3;
      for (var i in this.connectedSlots) {
        var _connectedSlots$i2 = this.connectedSlots[i],
            slot = _connectedSlots$i2.slot,
            thisObj = _connectedSlots$i2.thisObj;

        if (callType === 1 && slot === args[0] || callType === 2 && thisObj === args[0] && slot === args[0][args[1]] || thisObj === args[0] && slot === args[1]) {
          return true;
        }
      }
      return false;
    }
  }], [{
    key: "signal",
    value: function signal() {
      for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
        args[_key14] = arguments[_key14];
      }

      return new (Function.prototype.bind.apply(Signal, [null].concat(args)))().signal;
    }
  }, {
    key: "$execute",
    value: function $execute(desc, args) {
      try {
        desc.slot.apply(desc.thisObj, args);
      } catch (err) {
        console.error("Signal slot error:", err.message, err, desc.slot ? Function.prototype.toString.call(desc.slot) : "desc.slot is undefined!");
      }
    }
  }, {
    key: "$addQueued",
    value: function $addQueued(desc, args) {
      if (Signal.$queued.length === 0) {
        if (global.setImmediate) {
          global.setImmediate(Signal.$executeQueued);
        } else {
          global.setTimeout(Signal.$executeQueued, 0);
        }
      }
      Signal.$queued.push([desc, args]);
    }
  }, {
    key: "$executeQueued",
    value: function $executeQueued() {
      // New queued signals should be executed on next tick of the event loop
      var queued = Signal.$queued;
      Signal.$queued = [];

      QmlWeb.QMLProperty.pushEvalStack();
      for (var i in queued) {
        Signal.$execute.apply(Signal, _toConsumableArray(queued[i]));
      }
      QmlWeb.QMLProperty.popEvalStack();
    }
  }]);

  return Signal;
}();

Signal.$queued = [];
Signal.AutoConnection = 0;
Signal.DirectConnection = 1;
Signal.QueuedConnection = 2;
Signal.UniqueConnection = 128;


QmlWeb.Signal = Signal;

var Qt = {
  openUrlExternally: function openUrlExternally(url) {
    var page = window.open(url, "_blank");
    page.focus();
  },
  // Load file, parse and construct as Component (.qml)
  createComponent: function createComponent(name) {
    var engine = QmlWeb.engine;

    var file = engine.$resolvePath(name);

    // If "name" was a full URL, "file" will be equivalent to name and this
    // will try and load the Component from the full URL, otherwise, this
    // doubles as checking for the file in the current directory.
    var tree = engine.loadComponent(file);

    // If the Component is not found, and it is not a URL, look for "name" in
    // this context's importSearchPaths
    if (!tree) {
      var nameIsUrl = engine.$parseURI(name) !== undefined;
      if (!nameIsUrl) {
        var moreDirs = engine.importSearchPaths(QmlWeb.executionContext.importContextId);
        for (var i = 0; i < moreDirs.length; i++) {
          file = "" + moreDirs[i] + name;
          tree = engine.loadComponent(file);
          if (tree) break;
        }
      }
    }

    if (!tree) {
      return undefined;
    }

    var QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
    var component = new QMLComponent({
      object: tree,
      context: QmlWeb.executionContext
    });
    component.$basePath = engine.extractBasePath(file);
    component.$imports = tree.$imports;
    component.$file = file; // just for debugging

    engine.loadImports(tree.$imports, component.$basePath, component.importContextId);

    return component;
  },

  createQmlObject: function createQmlObject(src, parent, file) {
    var tree = QmlWeb.parseQML(src, file);

    // Create and initialize objects

    var QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
    var component = new QMLComponent({
      object: tree,
      parent: parent,
      context: QmlWeb.executionContext
    });

    var engine = QmlWeb.engine;
    engine.loadImports(tree.$imports, undefined, component.importContextId);

    var resolvedFile = file || Qt.resolvedUrl("createQmlObject_function");
    component.$basePath = engine.extractBasePath(resolvedFile);
    component.$imports = tree.$imports; // for later use
    // not just for debugging, but for basepath too, see above
    component.$file = resolvedFile;

    var obj = component.createObject(parent);

    var QMLOperationState = QmlWeb.QMLOperationState;
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
  resolvedUrl: function resolvedUrl(url) {
    return QmlWeb.qmlUrl(url);
  },

  // Basic QML types constructors
  point: function point() {
    for (var _len15 = arguments.length, args = Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
      args[_key15] = arguments[_key15];
    }

    return new (Function.prototype.bind.apply(QmlWeb.QPointF, [null].concat(args)))();
  },
  rect: function rect() {
    for (var _len16 = arguments.length, args = Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
      args[_key16] = arguments[_key16];
    }

    return new (Function.prototype.bind.apply(QmlWeb.QRectF, [null].concat(args)))();
  },
  size: function size() {
    for (var _len17 = arguments.length, args = Array(_len17), _key17 = 0; _key17 < _len17; _key17++) {
      args[_key17] = arguments[_key17];
    }

    return new (Function.prototype.bind.apply(QmlWeb.QSizeF, [null].concat(args)))();
  },
  vector2d: function vector2d() {
    for (var _len18 = arguments.length, args = Array(_len18), _key18 = 0; _key18 < _len18; _key18++) {
      args[_key18] = arguments[_key18];
    }

    return new (Function.prototype.bind.apply(QmlWeb.QVector2D, [null].concat(args)))();
  },
  vector3d: function vector3d() {
    for (var _len19 = arguments.length, args = Array(_len19), _key19 = 0; _key19 < _len19; _key19++) {
      args[_key19] = arguments[_key19];
    }

    return new (Function.prototype.bind.apply(QmlWeb.QVector3D, [null].concat(args)))();
  },
  vector4d: function vector4d() {
    for (var _len20 = arguments.length, args = Array(_len20), _key20 = 0; _key20 < _len20; _key20++) {
      args[_key20] = arguments[_key20];
    }

    return new (Function.prototype.bind.apply(QmlWeb.QVector4D, [null].concat(args)))();
  },
  quaternion: function quaternion() {
    for (var _len21 = arguments.length, args = Array(_len21), _key21 = 0; _key21 < _len21; _key21++) {
      args[_key21] = arguments[_key21];
    }

    return new (Function.prototype.bind.apply(QmlWeb.QQuaternion, [null].concat(args)))();
  },
  matrix4x4: function matrix4x4() {
    for (var _len22 = arguments.length, args = Array(_len22), _key22 = 0; _key22 < _len22; _key22++) {
      args[_key22] = arguments[_key22];
    }

    return new (Function.prototype.bind.apply(QmlWeb.QMatrix4x4, [null].concat(args)))();
  },

  // Colors
  rgba: function rgba() {
    var _QmlWeb$QColor;

    return (_QmlWeb$QColor = QmlWeb.QColor).rgba.apply(_QmlWeb$QColor, arguments);
  },
  hsla: function hsla() {
    var _QmlWeb$QColor2;

    return (_QmlWeb$QColor2 = QmlWeb.QColor).hsla.apply(_QmlWeb$QColor2, arguments);
  },
  hsva: function hsva() {
    var _QmlWeb$QColor3;

    return (_QmlWeb$QColor3 = QmlWeb.QColor).hsva.apply(_QmlWeb$QColor3, arguments);
  },
  colorEqual: function colorEqual() {
    var _QmlWeb$QColor4;

    return (_QmlWeb$QColor4 = QmlWeb.QColor).equal.apply(_QmlWeb$QColor4, arguments);
  },
  darker: function darker() {
    var _QmlWeb$QColor5;

    return (_QmlWeb$QColor5 = QmlWeb.QColor).darker.apply(_QmlWeb$QColor5, arguments);
  },
  lighter: function lighter() {
    var _QmlWeb$QColor6;

    return (_QmlWeb$QColor6 = QmlWeb.QColor).lighter.apply(_QmlWeb$QColor6, arguments);
  },

  include: function include(path) {
    var engine = QmlWeb.engine;

    var uri = engine.$resolvePath(path);

    /* Handle recursive includes */
    if (QmlWeb.executionContext.$qmlJsIncludes === undefined) {
      QmlWeb.executionContext.$qmlJsIncludes = [];
    }

    if (QmlWeb.executionContext.$qmlJsIncludes.indexOf(uri) >= 0) {
      return;
    }

    QmlWeb.executionContext.$qmlJsIncludes.push(uri);

    var js = engine.loadJS(uri);

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

var QMLBinding = function () {
  /**
   * Create QML binding.
   * @param {Variant} val Sourcecode or function representing the binding
   * @param {Array} tree Parser tree of the binding
   * @return {Object} Object representing the binding
   */
  function QMLBinding(val, tree) {
    _classCallCheck(this, QMLBinding);

    // this.isFunction states whether the binding is a simple js statement or a
    // function containing a return statement. We decide this on whether it is a
    // code block or not. If it is, we require a return statement. If it is a
    // code block it could though also be a object definition, so we need to
    // check that as well (it is, if the content is labels).
    this.isFunction = tree && tree[0] === "block" && tree[1][0] && tree[1][0][0] !== "label";
    this.src = val;
    this.compiled = false;
  }

  _createClass(QMLBinding, [{
    key: "toJSON",
    value: function toJSON() {
      return {
        src: this.src,
        deps: JSON.stringify(this.deps),
        tree: JSON.stringify(this.tree)
      };
    }
  }, {
    key: "eval",
    value: function _eval(object, context, basePath) {
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

  }, {
    key: "compile",
    value: function compile() {
      this.src = this.src.trim();
      this.impl = QMLBinding.bindSrc(this.src, this.isFunction);
      this.compiled = true;
    }
  }], [{
    key: "bindSrc",
    value: function bindSrc(src, isFunction) {
      return new Function("__executionObject", "__executionContext", "\n      with(QmlWeb) with(__executionContext) with(__executionObject) {\n        " + (isFunction ? "" : "return") + " " + src + "\n      }\n    ");
    }
  }]);

  return QMLBinding;
}();

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

var geometryProperties = ["width", "height", "fill", "x", "y", "left", "right", "top", "bottom"];

// QML engine. EXPORTED.

var QMLEngine = function () {
  function QMLEngine(element) {
    var _this13 = this;

    _classCallCheck(this, QMLEngine);

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
      var style = window.getComputedStyle(this.dom);
      if (style.getPropertyValue("position") === "static") {
        this.dom.style.position = "relative";
        this.dom.style.top = "0";
        this.dom.style.left = "0";
      }
    }

    window.addEventListener("resize", function () {
      return _this13.updateGeometry();
    });
  }

  //---------- Public Methods ----------

  _createClass(QMLEngine, [{
    key: "updateGeometry",
    value: function updateGeometry() {
      // we have to call `this.implicitHeight =` and `this.implicitWidth =`
      // each time the root element changes it's geometry
      // to reposition child elements of qml scene
      var width = void 0;
      var height = void 0;
      if (this.dom === document.body) {
        width = window.innerWidth;
        height = window.innerHeight;
      } else {
        var style = window.getComputedStyle(this.dom);
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

  }, {
    key: "start",
    value: function start() {
      QmlWeb.engine = this;
      var QMLOperationState = QmlWeb.QMLOperationState;
      if (this.operationState !== QMLOperationState.Running) {
        this.operationState = QMLOperationState.Running;
        this._tickerId = setInterval(this._tick.bind(this), this.$interval);
        this._whenStart.forEach(function (callback) {
          return callback();
        });
      }
    }

    // Stop the engine

  }, {
    key: "stop",
    value: function stop() {
      var QMLOperationState = QmlWeb.QMLOperationState;
      if (this.operationState === QMLOperationState.Running) {
        clearInterval(this._tickerId);
        this.operationState = QMLOperationState.Idle;
        this._whenStop.forEach(function (callback) {
          return callback();
        });
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

  }, {
    key: "removeDotSegments",
    value: function removeDotSegments(path) {
      // path.startsWith("/") is not supported in some browsers
      var leadingSlash = path && path[0] === "/";
      var segments = path.split("/");
      var out = [];

      for (var pos = 0; pos < segments.length;) {
        var segment = segments[pos++];

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
  }, {
    key: "extractBasePath",
    value: function extractBasePath(file) {
      // work both in url ("/") and windows ("\", from file://d:\test\) notation
      var basePath = file.split(/[/\\]/);
      basePath[basePath.length - 1] = "";
      return basePath.join("/");
    }
  }, {
    key: "extractFileName",
    value: function extractFileName(file) {
      return file.split(/[/\\]/).pop();
    }

    // Load file, parse and construct (.qml or .qml.js)

  }, {
    key: "loadFile",
    value: function loadFile(file) {
      var parentComponent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      // Create an anchor element to get the absolute path from the DOM
      if (!this.$basePathA) {
        this.$basePathA = document.createElement("a");
      }
      this.$basePathA.href = this.extractBasePath(file);
      this.$basePath = this.$basePathA.href;
      var fileName = this.extractFileName(file);
      var tree = this.loadComponent(this.$resolvePath(fileName));
      return this.loadQMLTree(tree, parentComponent, file);
    }

    // parse and construct qml
    // file is not required; only for debug purposes
    // This function is only used by the QmlWeb tests

  }, {
    key: "loadQML",
    value: function loadQML(src) {
      var parentComponent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var file = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      return this.loadQMLTree(QmlWeb.parseQML(src, file), parentComponent, file);
    }
  }, {
    key: "loadQMLTree",
    value: function loadQMLTree(tree) {
      var parentComponent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var file = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      QmlWeb.engine = this;

      // Create and initialize objects
      var QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
      var component = new QMLComponent({
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
  }, {
    key: "rootContext",
    value: function rootContext() {
      return this.rootObject.$context;
    }

    // next 3 methods used in Qt.createComponent for qml files lookup
    // http://doc.qt.io/qt-5/qqmlengine.html#addImportPath

  }, {
    key: "addImportPath",
    value: function addImportPath(dirpath) {
      this.userAddedImportPaths.push(dirpath);
    }

    /* Add this dirpath to be checked for components. This is the result of
     * something like:
     *
     * import "SomeDir/AnotherDirectory"
     *
     * The importContextId ensures it is only accessible from the file in which
     * it was imported. */

  }, {
    key: "addComponentImportPath",
    value: function addComponentImportPath(importContextId, dirpath, qualifier) {
      if (!this.componentImportPaths) {
        this.componentImportPaths = {};
      }
      if (!this.componentImportPaths[importContextId]) {
        this.componentImportPaths[importContextId] = {};
      }

      var paths = this.componentImportPaths[importContextId];

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
  }, {
    key: "importSearchPaths",
    value: function importSearchPaths(importContextId) {
      if (!this.componentImportPaths) {
        return [];
      }
      var paths = this.componentImportPaths[importContextId];
      if (!paths) {
        return [];
      }
      return paths.unqualified || [];
    }
  }, {
    key: "qualifiedImportPath",
    value: function qualifiedImportPath(importContextId, qualifier) {
      if (!this.componentImportPaths) {
        return "";
      }
      var paths = this.componentImportPaths[importContextId];
      if (!paths || !paths.qualified) {
        return "";
      }
      return paths.qualified[qualifier] || "";
    }
  }, {
    key: "setImportPathList",
    value: function setImportPathList(arrayOfDirs) {
      this.userAddedImportPaths = arrayOfDirs;
    }
  }, {
    key: "importPathList",
    value: function importPathList() {
      return this.userAddedImportPaths;
    }

    // `addModulePath` defines conrete path for module lookup
    // e.g. addModulePath("QtQuick.Controls", "http://example.com/controls")
    // will force system to `import QtQuick.Controls` module from
    // `http://example.com/controls/qmldir`

  }, {
    key: "addModulePath",
    value: function addModulePath(moduleName, dirPath) {
      // Keep the mapping. It will be used in loadImports() function.
      // Remove trailing slash as it required for `readQmlDir`.
      this.userAddedModulePaths[moduleName] = dirPath.replace(/\/$/, "");
    }
  }, {
    key: "registerProperty",
    value: function registerProperty(obj, propName) {
      var dependantProperties = [];
      var value = obj[propName];

      var getter = function getter() {
        var QMLProperty = QmlWeb.QMLProperty;
        if (QMLProperty.evaluatingProperty && dependantProperties.indexOf(QMLProperty.evaluatingProperty) === -1) {
          dependantProperties.push(QMLProperty.evaluatingProperty);
        }
        return value;
      };

      var setter = function setter(newVal) {
        value = newVal;
        for (var i in dependantProperties) {
          dependantProperties[i].update();
        }
      };

      QmlWeb.setupGetterSetter(obj, propName, getter, setter);
    }
  }, {
    key: "loadImports",
    value: function loadImports(importsArray) {
      var currentFileDir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.$basePath;
      var importContextId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

      if (!this.qmldirsContents) {
        this.qmldirsContents = {}; // cache

        // putting initial keys in qmldirsContents - is a hack. We should find a
        // way to explain to qmlweb, is this built-in module or qmldir-style
        // module.
        for (var module in QmlWeb.modules) {
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

      for (var i = 0; i < importsArray.length; i++) {
        this.loadImport(importsArray[i], currentFileDir, importContextId);
      }
    }
  }, {
    key: "loadImport",
    value: function loadImport(entry, currentFileDir, importContextId) {
      var name = entry[1];

      // is it url to remote resource
      var nameIsUrl = name.indexOf("//") === 0 || name.indexOf("://") >= 0;
      // is it a module name, e.g. QtQuick, QtQuick.Controls, etc
      var nameIsQualifiedModuleName = entry[4];
      // is it a js file
      var nameIsJs = name.slice(-3) === ".js";
      // local [relative] dir
      var nameIsDir = !nameIsQualifiedModuleName && !nameIsUrl && !nameIsJs;

      if (nameIsDir) {
        name = this.$resolvePath(name, currentFileDir);
        if (name[name.length - 1] === "/") {
          // remove trailing slash as it required for `readQmlDir`
          name = name.substr(0, name.length - 1);
        }
      }

      var content = this.qmldirsContents[name];
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
          var probableDirs = [currentFileDir].concat(this.importPathList());
          var diredName = name.replace(/\./g, "/");

          for (var k = 0; k < probableDirs.length; k++) {
            var file = probableDirs[k] + diredName;
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
            this.addComponentImportPath(importContextId, entry[1] + "/", entry[3]);
          } else {
            this.addComponentImportPath(importContextId, name + "/");
          }
        }

        this.qmldirsContents[name] = "noqmldir";
        return;
      }

      // copy founded externals to global var
      // TODO actually we have to copy it to current component
      for (var attrname in content.externals) {
        this.qmldirs[attrname] = content.externals[attrname];
      }

      // keep already loaded qmldir files
      this.qmldirsContents[name] = content;
    }
  }, {
    key: "size",
    value: function size() {
      return {
        width: this.rootObject.getWidth(),
        height: this.rootObject.getHeight()
      };
    }
  }, {
    key: "focusedElement",
    value: function focusedElement() {
      return this.rootContext().activeFocus;
    }

    //---------- Private Methods ----------

  }, {
    key: "$initKeyboard",
    value: function $initKeyboard() {
      var _this14 = this;

      document.onkeypress = function (e) {
        var focusedElement = _this14.focusedElement();
        var event = QmlWeb.eventToKeyboard(e || window.event);
        var eventName = QmlWeb.keyboardSignals[event.key];

        while (focusedElement && !event.accepted) {
          var backup = focusedElement.$context.event;
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

      document.onkeyup = function (e) {
        var focusedElement = _this14.focusedElement();
        var event = QmlWeb.eventToKeyboard(e || window.event);

        while (focusedElement && !event.accepted) {
          var backup = focusedElement.$context.event;
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
  }, {
    key: "_tick",
    value: function _tick() {
      var now = Date.now();
      var elapsed = now - this._lastTick;
      this._lastTick = now;
      this._tickers.forEach(function (ticker) {
        return ticker(now, elapsed);
      });
    }

    // Load resolved file, parse and construct as Component (.qml)

  }, {
    key: "loadComponent",
    value: function loadComponent(file) {
      if (file in this.components) {
        return this.components[file];
      }

      var uri = this.$parseURI(file);
      if (!uri) {
        return undefined;
      }

      var tree = void 0;
      if (uri.scheme === "qrc://") {
        tree = QmlWeb.qrc[uri.path];
        if (!tree) {
          return undefined;
        }
        // QmlWeb.qrc contains pre-parsed Component objects, but they still need
        // convertToEngine called on them.
        tree = QmlWeb.convertToEngine(tree);
      } else {
        var src = QmlWeb.getUrlContents(file, true);
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

  }, {
    key: "loadJS",
    value: function loadJS(file) {
      if (file in this.js) {
        return this.js[file];
      }

      var uri = this.$parseURI(file);
      if (!uri) {
        return undefined;
      }

      var jsData = void 0;
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

      var contextSetter = new Function("$context", "\n      with(QmlWeb) with ($context) {\n        " + jsData.source + "\n      }\n      " + jsData.exports.map(function (sym) {
        return "$context." + sym + " = " + sym + ";";
      }).join("") + "\n    ");

      this.js[file] = contextSetter;

      return contextSetter;
    }
  }, {
    key: "$registerStart",
    value: function $registerStart(f) {
      this._whenStart.push(f);
    }
  }, {
    key: "$registerStop",
    value: function $registerStop(f) {
      this._whenStop.push(f);
    }
  }, {
    key: "$addTicker",
    value: function $addTicker(t) {
      this._tickers.push(t);
    }
  }, {
    key: "$removeTicker",
    value: function $removeTicker(t) {
      var index = this._tickers.indexOf(t);
      if (index !== -1) {
        this._tickers.splice(index, 1);
      }
    }
  }, {
    key: "$initializePropertyBindings",
    value: function $initializePropertyBindings() {
      // Initialize property bindings
      // we use `while`, because $initializePropertyBindings may be called
      // recursive (because of Loader and/or createQmlObject )
      while (this.bindedProperties.length > 0) {
        var property = this.bindedProperties.shift();

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
          var obj = property.obj,
              changed = property.changed;

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

  }, {
    key: "$parseURI",
    value: function $parseURI(uri) {
      var match = uri.match(/^([^/]*?:\/\/)(.*?)(\/.*)$/);
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

  }, {
    key: "$resolvePath",
    value: function $resolvePath(file) {
      var basePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.$basePath;

      // probably, replace :// with :/ ?
      if (!file || file.indexOf("://") !== -1) {
        return file;
      }

      var schemes = ["data:", "blob:", "about:"];
      for (var i = 0; i < schemes.length; i++) {
        if (file.lastIndexOf(schemes[i], 0) === 0) {
          return file;
        }
      }

      var basePathURI = this.$parseURI(basePath);
      if (!basePathURI) {
        return file;
      }

      var path = basePathURI.path;
      if (file.indexOf("/") === 0) {
        path = file;
      } else {
        path = "" + path + file;
      }

      // Remove duplicate slashes and dot segments in the path
      path = this.removeDotSegments(path.replace(/([^:]\/)\/+/g, "$1"));

      return "" + basePathURI.scheme + basePathURI.authority + path;
    }

    // Return a DOM-valid path to load the image (fileURL is an already-resolved
    // URL)

  }, {
    key: "$resolveImageURL",
    value: function $resolveImageURL(fileURL) {
      var uri = this.$parseURI(fileURL);
      // If we are within the resource system, look up a "real" path that can be
      // used by the DOM. If not found, return the path itself without the
      // "qrc://" scheme.
      if (uri && uri.scheme === "qrc://") {
        return QmlWeb.qrc[uri.path] || uri.path;
      }

      // Something we can't parse, just pass it through
      return fileURL;
    }
  }, {
    key: "$initializeAliasSignals",
    value: function $initializeAliasSignals() {
      // Perform pending operations. Now we use it only to init alias's "changed"
      // handlers, that's why we have such strange function name.
      while (this.pendingOperations.length > 0) {
        var op = this.pendingOperations.shift();
        op[0](op[1], op[2], op[3]);
      }
      this.pendingOperations = [];
    }
  }, {
    key: "callCompletedSignals",
    value: function callCompletedSignals() {
      // the while loop is better than for..in loop, because completedSignals
      // array might change dynamically when some completed signal handlers will
      // create objects dynamically via createQmlObject or Loader
      while (this.completedSignals.length > 0) {
        var handler = this.completedSignals.shift();
        handler();
      }
    }
  }]);

  return QMLEngine;
}();

QmlWeb.QMLEngine = QMLEngine;

function QMLInteger(val) {
  return val | 0;
}
QMLInteger.plainType = true;
QmlWeb.qmlInteger = QMLInteger;

function QMLList(meta) {
  var list = [];
  if (meta.object instanceof Array) {
    for (var i in meta.object) {
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

var QMLOperationState = {
  Idle: 1,
  Init: 2,
  Running: 3
};

QmlWeb.QMLOperationState = QMLOperationState;

var QMLProperty = function () {
  function QMLProperty(type, obj, name) {
    _classCallCheck(this, QMLProperty);

    this.obj = obj;
    this.name = name;
    this.changed = QmlWeb.Signal.signal([], { obj: obj });
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


  _createClass(QMLProperty, [{
    key: "$setVal",
    value: function $setVal(val, componentScope) {
      var _this15 = this;

      var constructors = QmlWeb.constructors;
      if (constructors[this.type] === QmlWeb.qmlList) {
        this.val = QmlWeb.qmlList({
          object: val,
          parent: this.obj,
          context: componentScope
        });
      } else if (val instanceof QmlWeb.QMLMetaElement) {
        var QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
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
        this.val.$changed.connect(function () {
          var oldVal = _this15.val; // TODO
          _this15.changed(_this15.val, oldVal, _this15.name);
        });
      } else if (this.val && this.val.$properties) {
        Object.keys(this.val.$properties).forEach(function (pname) {
          var prop = _this15.val.$properties[pname];
          if (!prop || !prop.connect) return;
          // TODO: oldVal
          prop.connect(function () {
            return _this15.changed(_this15.val, _this15.val, _this15.name);
          });
        });
      }
    }

    // Updater recalculates the value of a property if one of the dependencies
    // changed

  }, {
    key: "update",
    value: function update() {
      this.needsUpdate = false;

      if (!this.binding) {
        return;
      }

      var oldVal = this.val;

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

  }, {
    key: "get",
    value: function get() {
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

  }, {
    key: "set",
    value: function set(newVal, reason, objectScope, componentScope) {
      var oldVal = this.val;

      var val = newVal;
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
  }], [{
    key: "pushEvalStack",
    value: function pushEvalStack() {
      QMLProperty.evaluatingPropertyStackOfStacks.push(QMLProperty.evaluatingPropertyStack);
      QMLProperty.evaluatingPropertyStack = [];
      QMLProperty.evaluatingProperty = undefined;
      //  console.log("evaluatingProperty=>undefined due to push stck ");
    }
  }, {
    key: "popEvalStack",
    value: function popEvalStack() {
      QMLProperty.evaluatingPropertyStack = QMLProperty.evaluatingPropertyStackOfStacks.pop() || [];
      QMLProperty.evaluatingProperty = QMLProperty.evaluatingPropertyStack[QMLProperty.evaluatingPropertyStack.length - 1];
    }
  }, {
    key: "pushEvaluatingProperty",
    value: function pushEvaluatingProperty(prop) {
      // TODO say warnings if already on stack. This means binding loop.
      // BTW actually we do not loop because needsUpdate flag is reset before
      // entering update again.
      if (QMLProperty.evaluatingPropertyStack.indexOf(prop) >= 0) {
        console.error("Property binding loop detected for property", prop.name, [prop].slice(0));
      }
      QMLProperty.evaluatingProperty = prop;
      QMLProperty.evaluatingPropertyStack.push(prop); //keep stack of props
    }
  }, {
    key: "popEvaluatingProperty",
    value: function popEvaluatingProperty() {
      QMLProperty.evaluatingPropertyStack.pop();
      QMLProperty.evaluatingProperty = QMLProperty.evaluatingPropertyStack[QMLProperty.evaluatingPropertyStack.length - 1];
    }
  }]);

  return QMLProperty;
}();

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
  return "" + val;
}
QMLString.plainType = true;
QmlWeb.qmlString = QMLString;

function QMLUrl(val) {
  return QmlWeb.engine.$resolvePath("" + val);
}
QMLUrl.plainType = true;
QmlWeb.qmlUrl = QMLUrl;

function QMLVariant(val) {
  return val;
}
QMLVariant.plainType = true;
QmlWeb.qmlVariant = QMLVariant;

window.addEventListener("load", function () {
  var metaTags = document.getElementsByTagName("body");
  for (var i = 0; i < metaTags.length; ++i) {
    var metaTag = metaTags[i];
    var source = metaTag.getAttribute("data-qml");
    if (source) {
      QmlWeb.qmlEngine = new QmlWeb.QMLEngine();
      QmlWeb.qmlEngine.loadFile(source);
      QmlWeb.qmlEngine.start();
      break;
    }
  }
});

var anchorNames = ["left", "right", "top", "bottom", "verticalCenter", "horizontalCenter"];

var ignoreProps = ["x", "y", "z", "scale", "rotation", "implicitWidth", "implicitHeight"];

function getProperties(file) {
  // TODO: implement a cleaner way

  var div = document.createElement("div");
  var engine = new QmlWeb.QMLEngine(div);
  engine.loadFile(file);

  var qml = engine.rootObject;
  var properties = Object.keys(qml.$properties).filter(function (name) {
    // Invalid names
    if (!name.match(/^[a-z]+$/i) || name === "is") return false;

    // We don't need anchors
    if (anchorNames.indexOf(name) !== -1) return false;

    // These properties are not supported in a good way on top-level items
    if (ignoreProps.indexOf(name) !== -1) return false;

    var type = qml.$properties[name].type;
    return ["real", "color", "int", "bool", "string"].indexOf(type) !== -1;
  });

  engine.stop();
  return properties;
}

function registerElement(name, file) {
  // Delay until the document is fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      registerElement(name, file);
    });
    return;
  }

  // Bail out if Custom Elements v1 are not present
  if (!window.customElements) {
    throw new Error("window.customElements are not supported. Consider installing a polyfill.");
  }

  // We need attributes list at this point, those form a static property
  var properties = getProperties(file);
  var attributes = properties.map(function (pname) {
    return pname.toLowerCase();
  });
  var attr2prop = properties.reduce(function (map, pname) {
    map[pname.toLowerCase()] = pname;
    return map;
  }, {});

  var QmlElement = function (_HTMLElement) {
    _inherits(QmlElement, _HTMLElement);

    function QmlElement() {
      _classCallCheck(this, QmlElement);

      return _possibleConstructorReturn(this, (QmlElement.__proto__ || Object.getPrototypeOf(QmlElement)).apply(this, arguments));
    }

    _createClass(QmlElement, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        var _this17 = this;

        // Default wrapper display is inline-block to support native width/height
        var computedStyle = window.getComputedStyle(this);
        if (computedStyle.display === "inline") {
          this.style.display = "inline-block";
        }

        var engine = this.engine = new QmlWeb.QMLEngine(this);
        engine.loadFile(file);
        engine.start();
        var qml = this.qml = engine.rootObject;

        // Bind attributes
        attributes.forEach(function (attr) {
          var pname = attr2prop[attr] || attr;
          var val = _this17.getAttribute(attr);
          if (typeof val === "string") {
            qml[pname] = val;
          }
          _this17.applyAttribute(attr);
          Object.defineProperty(_this17, attr, {
            get: function get() {
              return this.qml[pname];
            },
            set: function set(value) {
              this.qml[pname] = value;
              this.applyAttribute(attr);
            }
          });
          qml.$properties[pname].changed.connect(function () {
            return _this17.applyAttribute(attr);
          });
        });

        // Set and update wrapper width/height
        this.style.width = qml.width + "px";
        this.style.height = qml.height + "px";
        qml.$properties.width.changed.connect(function (width) {
          _this17.style.width = width + "px";
        });
        qml.$properties.height.changed.connect(function (height) {
          _this17.style.height = height + "px";
        });
      }
    }, {
      key: "attributeChangedCallback",
      value: function attributeChangedCallback(attr, oldValue, newValue) {
        if (!this.qml) return;
        var pname = attr2prop[attr] || attr;
        var prop = this.qml.$properties[pname];
        if (!prop) return;
        switch (prop.type) {
          case "bool":
            this.qml[pname] = typeof newValue === "string";
            break;
          default:
            this.qml[pname] = newValue;
        }
      }
    }, {
      key: "applyAttribute",
      value: function applyAttribute(attr) {
        var pname = attr2prop[attr] || attr;
        var prop = this.qml.$properties[pname];
        if (!prop) {
          this.deleteAttribute(attr);
          return;
        }
        var value = this.qml[pname];
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
    }], [{
      key: "observedAttributes",
      get: function get() {
        return attributes;
      }
    }]);

    return QmlElement;
  }(HTMLElement);

  window.customElements.define(name, QmlElement);
}

QmlWeb.registerElement = registerElement;

var Easing = {
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
QmlWeb.$ease = function (type, period, amplitude, overshoot, t) {
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

var QmlWebHelpers = function () {
  function QmlWebHelpers() {
    _classCallCheck(this, QmlWebHelpers);
  }

  _createClass(QmlWebHelpers, null, [{
    key: "arrayFindIndex",
    value: function arrayFindIndex(array, callback) {
      // Note: does not support thisArg, we don't need that
      if (!Array.prototype.findIndex) {
        for (var key in array) {
          if (callback(array[key], key, array)) {
            return key;
          }
        }
        return -1;
      }
      return Array.prototype.findIndex.call(array, callback);
    }
  }, {
    key: "mergeObjects",
    value: function mergeObjects() {
      var merged = {};

      for (var _len23 = arguments.length, args = Array(_len23), _key23 = 0; _key23 < _len23; _key23++) {
        args[_key23] = arguments[_key23];
      }

      for (var i in args) {
        var arg = args[i];
        if (!arg) {
          continue;
        }
        for (var key in arg) {
          merged[key] = arg[key];
        }
      }
      return merged;
    }
  }]);

  return QmlWebHelpers;
}();

QmlWeb.helpers = QmlWebHelpers;

/* eslint-disable no-unused-vars */

function formatString(sourceText, n) {
  var text = sourceText;
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
    var xhr = new XMLHttpRequest();
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
      console.log("Retrieving " + url + " failed: " + xhr.responseText, xhr);
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
  var qmldirFileUrl = url.length > 0 ? url + "/qmldir" : "qmldir";

  var parsedUrl = QmlWeb.engine.$parseURI(qmldirFileUrl);

  var qmldir = void 0;
  if (parsedUrl.scheme === "qrc://") {
    qmldir = QmlWeb.qrc[parsedUrl.path];
  } else {
    qmldir = getUrlContents(qmldirFileUrl, true) || undefined;
  }

  var internals = {};
  var externals = {};

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
    return url + "/" + path;
  }

  var lines = qmldir.split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line.length || line[0] === "#") continue; // Empty line or comment
    var parts = line.split(/\s+/);
    var res = {};
    switch (parts[0]) {
      case "designersupported": // Just a flag for IDE
      case "typeinfo":
        // For IDE code completion etc
        break;
      case "plugin":
      case "classname":
      case "depends":
      case "module":
        console.log(url + ": qmldir \"" + parts[0] + "\" entries are not supported");
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
  return { internals: internals, externals: externals };
}

QmlWeb.getUrlContents = getUrlContents;
QmlWeb.readQmlDir = readQmlDir;

function importJavascriptInContext(contextSetter, $context) {
  /* Set the QmlWeb.executionContext so that any internal calls to Qt.include
   * will have the proper context */
  var oldExecutionContext = QmlWeb.executionContext;
  QmlWeb.executionContext = $context;
  contextSetter($context);
  QmlWeb.executionContext = oldExecutionContext;
}

QmlWeb.importJavascriptInContext = importJavascriptInContext;

QmlWeb.keyCodeToQt = function (e) {
  var Qt = QmlWeb.Qt;
  e.keypad = e.keyCode >= 96 && e.keyCode <= 111;
  if (e.keyCode === Qt.Key_Tab && e.shiftKey) {
    return Qt.Key_Backtab;
  }
  if (e.keyCode >= 97 && e.keyCode <= 122) {
    return e.keyCode - (97 - Qt.Key_A);
  }
  return e.keyCode;
};

QmlWeb.eventToKeyboard = function (e) {
  return {
    accepted: false,
    count: 1,
    isAutoRepeat: false,
    key: QmlWeb.keyCodeToQt(e),
    modifiers: e.ctrlKey * QmlWeb.Qt.CtrlModifier | e.altKey * QmlWeb.Qt.AltModifier | e.shiftKey * QmlWeb.Qt.ShiftModifier | e.metaKey * QmlWeb.Qt.MetaModifier | e.keypad * QmlWeb.Qt.KeypadModifier,
    text: String.fromCharCode(e.charCode)
  };
};

QmlWeb.keyboardSignals = {};
["asterisk", "back", "backtab", "call", "cancel", "delete", "escape", "flip", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "hangup", "menu", "no", "return", "select", "space", "tab", "volumeDown", "volumeUp", "yes", "up", "right", "down", "left"].forEach(function (key) {
  var name = key.toString();
  var qtName = "Key_" + name[0].toUpperCase() + name.slice(1);
  var prefix = typeof key === "number" ? "digit" : "";
  QmlWeb.keyboardSignals[QmlWeb.Qt[qtName]] = "" + prefix + name + "Pressed";
});

QmlWeb.executionContext = null;

var modules = {
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

var perImportContextConstructors = {};
var importContextIds = 0;

// Helper. Adds a type to the constructor list
function registerGlobalQmlType(name, type) {
  QmlWeb[type.name] = type;
  QmlWeb.constructors[name] = type;
  modules.Main[name] = type;
}

// Helper. Register a type to a module
function registerQmlType(spec) {
  if (!/.*_.*/.test(spec.name)) {
    throw new Error("Invalid class name: " + spec.name);
  }

  var name = spec.name.replace(/.*_/, "");
  var module = spec.name.replace(/(_[0-9]+)?_[^_]+$/, "").replace(/_/g, ".");

  spec.$qmlTypeInfo = {
    enums: spec.hasOwnProperty("enums") ? spec.enums : {},
    signals: spec.hasOwnProperty("signals") ? spec.signals : {},
    properties: spec.hasOwnProperty("properties") ? spec.properties : {},
    defaultProperty: spec.defaultProperty
  };

  if (spec.hasOwnProperty("global") && spec.global) {
    registerGlobalQmlType(name, spec);
  }

  var moduleDescriptor = {
    name: name,
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
    var QMLBaseObject = QmlWeb.getConstructor("QtQml", "2.0", "QtObject");
    QmlWeb.setupGetter(QMLBaseObject.prototype, name, spec.getAttachedObject);
  }
}

function getConstructor(moduleName, version, name) {
  if (typeof modules[moduleName] !== "undefined") {
    for (var i = 0; i < modules[moduleName].length; ++i) {
      var type = modules[moduleName][i];
      if (type.name === name && type.versions.test(version)) {
        return type.constructor;
      }
    }
  }
  return null;
}

function getModuleConstructors(moduleName, version) {
  var constructors = {};
  if (typeof modules[moduleName] === "undefined") {
    console.warn("module \"" + moduleName + "\" not found");
    return constructors;
  }
  for (var i = 0; i < modules[moduleName].length; ++i) {
    var module = modules[moduleName][i];
    if (module.versions.test(version)) {
      constructors[module.name] = module.constructor;
    }
  }
  return constructors;
}

function loadImports(self, imports) {
  var mergeObjects = QmlWeb.helpers.mergeObjects;
  var constructors = mergeObjects(modules.Main);
  if (imports.filter(function (row) {
    return row[1] === "QtQml";
  }).length === 0 && imports.filter(function (row) {
    return row[1] === "QtQuick";
  }).length === 1) {
    imports.push(["qmlimport", "QtQml", 2, "", true]);
  }
  for (var i = 0; i < imports.length; ++i) {
    var _imports$i = _slicedToArray(imports[i], 4),
        moduleName = _imports$i[1],
        moduleVersion = _imports$i[2],
        moduleAlias = _imports$i[3];

    if (typeof moduleVersion !== "number") continue;
    var versionString = moduleVersion % 1 === 0 ? moduleVersion.toFixed(1) : moduleVersion.toString();
    var moduleConstructors = getModuleConstructors(moduleName, versionString);

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
  var item = void 0;

  var constructors = perImportContextConstructors[meta.context.importContextId];

  var classComponents = meta.object.$class.split(".");
  for (var ci = 0; ci < classComponents.length; ++ci) {
    var c = classComponents[ci];
    constructors = constructors[c];
    if (constructors === undefined) {
      break;
    }
  }

  if (constructors !== undefined) {
    var _constructor = constructors;
    meta.super = _constructor;
    item = new _constructor(meta);
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
    var qdirInfo = QmlWeb.engine.qmldirs[meta.object.$class];
    // Are we have info on that component in some imported qmldir files?

    /* This will also be set in applyProperties, but needs to be set here
     * for Qt.createComponent to have the correct context. */
    QmlWeb.executionContext = meta.context;

    var filePath = void 0;
    if (qdirInfo) {
      filePath = qdirInfo.url;
    } else if (classComponents.length === 2) {
      var qualified = QmlWeb.engine.qualifiedImportPath(meta.context.importContextId, classComponents[0]);
      filePath = "" + qualified + classComponents[1] + ".qml";
    } else {
      filePath = classComponents[0] + ".qml";
    }

    var component = QmlWeb.Qt.createComponent(filePath);

    if (!component) {
      throw new Error("No constructor found for " + meta.object.$class);
    }

    item = component.$createObject(meta.parent);
    if (typeof item.dom !== "undefined") {
      item.dom.className += " " + classComponents[classComponents.length - 1];
      if (meta.object.id) {
        item.dom.className += "  " + meta.object.id;
      }
    }
    // Handle default properties
  }

  // id
  if (meta.object.id) {
    QmlWeb.setupGetterSetter(meta.context, meta.object.id, function () {
      return item;
    }, function () {});
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
function createProperty(type, obj, propName) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var QMLProperty = QmlWeb.QMLProperty;
  var prop = new QMLProperty(type, obj, propName);
  obj[propName + "Changed"] = prop.changed;
  obj.$properties[propName] = prop;
  obj.$properties[propName].set(options.initialValue, QMLProperty.ReasonInit);

  var getter = function getter() {
    return obj.$properties[propName].get();
  };
  var setter = void 0;
  if (options.readOnly) {
    setter = function setter(newVal) {
      if (!obj.$canEditReadOnlyProperties) {
        throw new Error("property '" + propName + "' has read only access");
      }
      obj.$properties[propName].set(newVal, QMLProperty.ReasonUser);
    };
  } else {
    setter = function setter(newVal) {
      obj.$properties[propName].set(newVal, QMLProperty.ReasonUser);
    };
  }
  QmlWeb.setupGetterSetter(obj, propName, getter, setter);
  if (obj.$isComponentRoot) {
    var skip = false;
    if (options.noContextOverride) {
      // Don't override context properties if options.noContextOverride is on
      var descr = Object.getOwnPropertyDescriptor(obj.$context, propName);
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
  Object.keys(properties).forEach(function (name) {
    var desc = properties[name];
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
  var QMLProperty = QmlWeb.QMLProperty;
  var objectScope = objectScopeIn || item;
  QmlWeb.executionContext = componentScope;

  var children = metaObject.$children;
  if (children && children.length > 0) {
    if (item.$defaultProperty) {
      // TODO: detect based on property type, not children count?
      var value = children.length === 1 ? children[0] : children;
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

  for (var i in metaObject) {
    var _value = metaObject[i];
    if (i === "id" || i === "$class") {
      // keep them
      item[i] = _value;
      continue;
    }

    // skip global id's and internal values
    if (i === "id" || i[0] === "$") {
      // TODO: what? See above.
      continue;
    }

    // slots
    if (i.indexOf("on") === 0 && i.length > 2 && /[A-Z]/.test(i[2])) {
      var signalName = i[2].toLowerCase() + i.slice(3);
      if (connectSignal(item, signalName, _value, objectScope, componentScope)) {
        continue;
      }
      if (item.$setCustomSlot) {
        item.$setCustomSlot(signalName, _value, objectScope, componentScope);
        continue;
      }
    }

    if (_value instanceof Object) {
      if (applyProperty(item, i, _value, objectScope, componentScope)) {
        continue;
      }
    }

    if (item.$properties && i in item.$properties) {
      item.$properties[i].set(_value, QMLProperty.ReasonInit, objectScope, componentScope);
    } else if (i in item) {
      item[i] = _value;
    } else if (item.$setCustomData) {
      item.$setCustomData(i, _value);
    } else {
      console.warn("Cannot assign to non-existent property \"" + i + "\". Ignoring assignment.");
    }
  }
}

function applyProperty(item, i, value, objectScope, componentScope) {
  var QMLProperty = QmlWeb.QMLProperty;

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
      var obj = this.componentScope[this.val.objectName];
      var propertyName = this.val.propertyName;
      return propertyName ? obj.$properties[propertyName].get() : obj;
    };
    item.$properties[i].set = function (newVal, reason, _objectScope, _componentScope) {
      if (!this.val.propertyName) {
        throw new Error("Cannot set alias property pointing to an QML object.");
      }
      var obj = this.componentScope[this.val.objectName];
      var prop = obj.$properties[this.val.propertyName];
      prop.set(newVal, reason, _objectScope, _componentScope);
    };

    if (value.propertyName) {
      var con = function con(prop) {
        var obj = prop.componentScope[prop.val.objectName];
        if (!obj) {
          console.error("qtcore: target object ", prop.val.objectName, " not found for alias ", prop);
          return;
        }
        var targetProp = obj.$properties[prop.val.propertyName];
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
        var loopWatchdog = false;
        targetProp.changed.connect(item, function () {
          for (var _len24 = arguments.length, args = Array(_len24), _key24 = 0; _key24 < _len24; _key24++) {
            args[_key24] = arguments[_key24];
          }

          if (loopWatchdog) return;
          loopWatchdog = true;
          prop.changed.apply(item, args);
          loopWatchdog = false;
        });
        prop.changed.connect(obj, function () {
          for (var _len25 = arguments.length, args = Array(_len25), _key25 = 0; _key25 < _len25; _key25++) {
            args[_key25] = arguments[_key25];
          }

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
  var signal = item.$Signals && item.$Signals[signalName] || item[signalName];
  if (!signal) {
    console.warn("No signal called " + signalName + " found!");
    return undefined;
  } else if (typeof signal.connect !== "function") {
    console.warn(signalName + " is not a signal!");
    return undefined;
  }

  if (!value.compiled) {
    var params = [];
    for (var j in signal.parameters) {
      params.push(signal.parameters[j].name);
    }
    // Wrap value.src in IIFE in case it includes a "return"
    value.src = "(\n      function(" + params.join(", ") + ") {\n        QmlWeb.executionContext = __executionContext;\n        const bp = QmlWeb.engine.$basePath;\n        QmlWeb.engine.$basePath = \"" + componentScope.$basePath + "\";\n        try {\n          (function() {\n            " + value.src + "\n          })();\n        } finally {\n          QmlWeb.engine.$basePath = bp;\n        }\n      }\n    )";
    value.isFunction = false;
    value.compile();
  }
  // Don't pass in __basePath argument, as QMLEngine.$basePath is set in the
  // value.src, as we need it set at the time the slot is called.
  var slot = value.eval(objectScope, componentScope);
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

var QMLMethod = function (_QmlWeb$QMLBinding) {
  _inherits(QMLMethod, _QmlWeb$QMLBinding);

  function QMLMethod() {
    _classCallCheck(this, QMLMethod);

    return _possibleConstructorReturn(this, (QMLMethod.__proto__ || Object.getPrototypeOf(QMLMethod)).apply(this, arguments));
  }

  return QMLMethod;
}(QmlWeb.QMLBinding);

/**
 * Create an object representing a QML property definition.
 * @param {String} type The type of the property
 * @param {Array} value The default value of the property
 * @return {Object} Object representing the defintion
 */


var QMLPropertyDefinition = function QMLPropertyDefinition(type, value) {
  _classCallCheck(this, QMLPropertyDefinition);

  this.type = type;
  this.value = value;
};

var QMLAliasDefinition = function QMLAliasDefinition(objName, propName) {
  _classCallCheck(this, QMLAliasDefinition);

  this.objectName = objName;
  this.propertyName = propName;
};

/**
 * Create an object representing a QML signal definition.
 * @param {Array} params The parameters the signal ships
 * @return {Object} Object representing the defintion
 */


var QMLSignalDefinition = function QMLSignalDefinition(params) {
  _classCallCheck(this, QMLSignalDefinition);

  this.parameters = params;
};

/**
 * Create an object representing a group of QML properties (like anchors).
 * @return {Object} Object representing the group
 */


var QMLMetaPropertyGroup = function QMLMetaPropertyGroup() {
  _classCallCheck(this, QMLMetaPropertyGroup);
};

/**
 * Create an object representing a QML element.
 * @param {String} type Type of the element
 * @param {String} onProp Name of the property specified with the "on" keyword
 */


var QMLMetaElement = function QMLMetaElement(type, onProp) {
  _classCallCheck(this, QMLMetaElement);

  this.$class = type;
  this.$children = [];
  this.$on = onProp;
};

// Convert parser tree to the format understood by engine


function convertToEngine(tree) {
  var type = tree[0];
  var walker = convertToEngine.walkers[type];
  if (!walker) {
    console.log("No walker for " + type);
    return undefined;
  }
  return walker.apply(undefined, _toConsumableArray(tree.slice(1)));
}

convertToEngine.stringifyDots = function (elem) {
  var sub = elem;
  var path = [];
  while (sub[0] === "dot") {
    path.push(sub[1]);
    sub = sub[2];
  }
  path.push(sub);
  return path.join(".");
};

convertToEngine.applyProp = function (item, name, val) {
  var curr = item; // output structure
  var sub = name; // input structure
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
  toplevel: function toplevel(imports, statement) {
    var item = { $class: "Component" };
    item.$imports = imports;
    item.$children = [convertToEngine(statement)];
    return item;
  },
  qmlelem: function qmlelem(elem, onProp, statements) {
    var item = new QMLMetaElement(convertToEngine.stringifyDots(elem), onProp);

    for (var i in statements) {
      var statement = statements[i];
      var name = statement[1];
      var val = convertToEngine(statement);
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
          for (var j in val) {
            item[name][j] = val[j];
          }
          break;
        default:
          console.log("Unknown statement", statement);
      }
    }

    return item;
  },
  qmlprop: function qmlprop(name, tree, src) {
    if (name === "id") {
      // id property
      return tree[1][1];
    }
    return convertToEngine.bindout(tree, src);
  },
  qmlobjdef: function qmlobjdef(name, property, tree, src) {
    return convertToEngine.bindout(tree, src);
  },
  qmlobj: function qmlobj(elem, statements) {
    var item = {};
    for (var i in statements) {
      var statement = statements[i];
      var name = statement[1];
      var val = convertToEngine(statement);
      if (statement[0] === "qmlprop") {
        convertToEngine.applyProp(item, name, val);
      }
    }
    return item;
  },
  qmlmethod: function qmlmethod(name, tree, src) {
    return new QMLMethod(src);
  },
  qmlpropdef: function qmlpropdef(name, type, tree, src) {
    return new QMLPropertyDefinition(type, tree ? convertToEngine.bindout(tree, src) : undefined);
  },
  qmlaliasdef: function qmlaliasdef(name, objName, propName) {
    return new QMLAliasDefinition(objName, propName);
  },
  qmlsignaldef: function qmlsignaldef(name, params) {
    return new QMLSignalDefinition(params);
  },
  qmldefaultprop: function qmldefaultprop(tree) {
    return convertToEngine(tree);
  },
  name: function name(src) {
    if (src === "true" || src === "false") {
      return src === "true";
    } else if (typeof src === "boolean") {
      // TODO: is this needed? kept for compat with ==
      return src;
    }
    return new QmlWeb.QMLBinding(src, ["name", src]);
  },
  num: function num(src) {
    return +src;
  },
  string: function string(src) {
    return String(src);
  },
  array: function array(tree, src) {
    var a = [];
    var isList = false;
    var hasBinding = false;
    for (var i in tree) {
      var val = convertToEngine.bindout(tree[i]);
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
  var tree = statement[0] === "stat" ? statement[1] : statement;

  var type = tree[0];
  var walker = convertToEngine.walkers[type];
  if (walker) {
    return walker.apply(undefined, _toConsumableArray(tree.slice(1)));
  }
  return new QmlWeb.QMLBinding(binding, tree);
};

function loadParser() {
  if (typeof QmlWeb.parse !== "undefined") {
    return;
  }

  console.log("Loading parser...");
  var tags = document.getElementsByTagName("script");
  for (var i in tags) {
    if (tags[i].src && tags[i].src.match(/\/(qt|qmlweb)\./)) {
      var src = tags[i].src.replace(/\/(qt|qmlweb)\.(es201.\.)?/, "/qmlweb.parser.");
      // TODO: rewrite to async loading
      var xhr = new XMLHttpRequest();
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
  var parsetree = QmlWeb.parse(src, QmlWeb.parse.QmlDocument);
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
  var rect = div.getBoundingClientRect();
  var offset = {
    width: div.offsetWidth,
    height: div.offsetHeight,
    top: rect.top,
    left: rect.left
  };
  for (var win = window; win !== window.top; win = win.parent) {
    var rectframe = win.frameElement.getBoundingClientRect();
    offset.top += rectframe.top;
    offset.left += rectframe.left;
  }
  var fileName = options && options.fileName || undefined;

  var image = void 0;
  if (window.top.chromeScreenshot) {
    image = document.createElement("img");
    window.top.chromeScreenshot({ offset: offset, fileName: fileName }).then(function (base64) {
      image.src = "data:image/png;base64," + base64;
    });
  } else if (window.top.callPhantom) {
    var base64 = window.top.callPhantom("render", { offset: offset, fileName: fileName });
    image = document.createElement("img");
    image.src = "data:image/png;base64," + base64;
  } else {
    throw new Error("Screenshots are not supported on this platform");
  }
  return image;
};

QmlWeb.image2canvas = function (img) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.height = img.height;
  canvas.width = img.width;
  ctx.drawImage(img, 0, 0);
  return { canvas: canvas, ctx: ctx };
};

QmlWeb.image2dataUrl = function (img) {
  var _QmlWeb$image2canvas = QmlWeb.image2canvas(img),
      canvas = _QmlWeb$image2canvas.canvas;

  return canvas.toDataURL("image/png", 1);
};

QmlWeb.image2pixels = function (img) {
  var _QmlWeb$image2canvas2 = QmlWeb.image2canvas(img),
      ctx = _QmlWeb$image2canvas2.ctx;

  return ctx.getImageData(0, 0, img.width, img.height).data;
};

QmlWeb.imagesEqual = function (a, b) {
  if (a.width !== b.width || a.height !== b.height) {
    return false;
  }
  return QmlWeb.image2dataUrl(a) === QmlWeb.image2dataUrl(b);
};

// Base object for all qml elements

var QtQml_QtObject = function (_QmlWeb$QObject10) {
  _inherits(QtQml_QtObject, _QmlWeb$QObject10);

  function QtQml_QtObject(meta) {
    _classCallCheck(this, QtQml_QtObject);

    var _this19 = _possibleConstructorReturn(this, (QtQml_QtObject.__proto__ || Object.getPrototypeOf(QtQml_QtObject)).call(this, meta.parent));

    _this19.$Signals = {};


    _this19.$isComponentRoot = meta.isComponentRoot;
    _this19.$context = meta.context;

    // Component get own properties
    _this19.$attributes = [];
    for (var key in meta.object) {
      if (!meta.object.hasOwnProperty(key) || !meta.object[key]) {
        continue;
      }
      var name = meta.object[key].__proto__.constructor.name;
      if (name === "QMLPropertyDefinition" || name === "QMLAliasDefinition") {
        _this19.$attributes.push(key);
      }
    }

    var Signal = QmlWeb.Signal;

    _this19.Keys = new QmlWeb.QObject(_this19);
    _this19.Keys.asteriskPresed = Signal.signal();
    _this19.Keys.backPressed = Signal.signal();
    _this19.Keys.backtabPressed = Signal.signal();
    _this19.Keys.callPressed = Signal.signal();
    _this19.Keys.cancelPressed = Signal.signal();
    _this19.Keys.deletePressed = Signal.signal();
    for (var i = 0; i < 10; ++i) {
      _this19.Keys["digit" + i + "Pressed"] = Signal.signal();
    }
    _this19.Keys.escapePressed = Signal.signal();
    _this19.Keys.flipPressed = Signal.signal();
    _this19.Keys.hangupPressed = Signal.signal();
    _this19.Keys.leftPressed = Signal.signal();
    _this19.Keys.menuPressed = Signal.signal();
    _this19.Keys.noPressed = Signal.signal();
    _this19.Keys.pressed = Signal.signal();
    _this19.Keys.released = Signal.signal();
    _this19.Keys.returnPressed = Signal.signal();
    _this19.Keys.rightPressed = Signal.signal();
    _this19.Keys.selectPressed = Signal.signal();
    _this19.Keys.spacePressed = Signal.signal();
    _this19.Keys.tabPressed = Signal.signal();
    _this19.Keys.upPressed = Signal.signal();
    _this19.Keys.volumeDownPressed = Signal.signal();
    _this19.Keys.volumeUpPressed = Signal.signal();
    _this19.Keys.yesPressed = Signal.signal();

    // Initialize properties, signals, etc.
    var types = [];
    var type = meta.super;
    while (type) {
      types.unshift(type);
      type = Object.getPrototypeOf(type);
    }
    types.forEach(function (entry) {
      if (!entry.hasOwnProperty("$qmlTypeInfo")) return;
      var info = entry.$qmlTypeInfo || {};

      Object.keys(info.enums).forEach(function (name) {
        // TODO: not exported to the whole file scope yet
        _this19[name] = info.enums[name];

        if (!global[name]) {
          global[name] = _this19[name]; // HACK
        }
      });

      QmlWeb.createProperties(_this19, info.properties);

      Object.keys(info.signals).forEach(function (name) {
        var params = info.signals[name];
        _this19.$Signals[name] = QmlWeb.Signal.signal(params);
        if (!(name in _this19)) _this19[name] = _this19.$Signals[name];
      });

      if (info.defaultProperty) {
        _this19.$defaultProperty = info.defaultProperty;
      }
    });
    meta.initialized = true;
    return _this19;
  }

  _createClass(QtQml_QtObject, [{
    key: "getAttributes",
    value: function getAttributes() {
      return this.$attributes;
    }
  }]);

  return QtQml_QtObject;
}(QmlWeb.QObject);

QmlWeb.registerQmlType(QtQml_QtObject);

// eslint-disable-next-line no-undef

var QtBluetooth_BluetoothDiscoveryModel = function (_QtQml_QtObject) {
  _inherits(QtBluetooth_BluetoothDiscoveryModel, _QtQml_QtObject);

  function QtBluetooth_BluetoothDiscoveryModel() {
    _classCallCheck(this, QtBluetooth_BluetoothDiscoveryModel);

    return _possibleConstructorReturn(this, (QtBluetooth_BluetoothDiscoveryModel.__proto__ || Object.getPrototypeOf(QtBluetooth_BluetoothDiscoveryModel)).apply(this, arguments));
  }

  return QtBluetooth_BluetoothDiscoveryModel;
}(QtQml_QtObject);

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

var QtMultimedia_Audio = function (_QtQml_QtObject2) {
  _inherits(QtMultimedia_Audio, _QtQml_QtObject2);

  function QtMultimedia_Audio() {
    _classCallCheck(this, QtMultimedia_Audio);

    return _possibleConstructorReturn(this, (QtMultimedia_Audio.__proto__ || Object.getPrototypeOf(QtMultimedia_Audio)).apply(this, arguments));
  }

  _createClass(QtMultimedia_Audio, [{
    key: "pause",
    value: function pause() {
      // TODO
    }
  }, {
    key: "play",
    value: function play() {
      // TODO
    }
  }, {
    key: "seek",
    value: function seek() /* offset */{
      // TODO
    }
  }, {
    key: "stop",
    value: function stop() {
      // TODO
    }
  }, {
    key: "supportedAudioRoles",
    value: function supportedAudioRoles() {
      // TODO
    }
  }]);

  return QtMultimedia_Audio;
}(QtQml_QtObject);

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

var QtMultimedia_Camera = function (_QtQml_QtObject3) {
  _inherits(QtMultimedia_Camera, _QtQml_QtObject3);

  function QtMultimedia_Camera() {
    _classCallCheck(this, QtMultimedia_Camera);

    return _possibleConstructorReturn(this, (QtMultimedia_Camera.__proto__ || Object.getPrototypeOf(QtMultimedia_Camera)).apply(this, arguments));
  }

  return QtMultimedia_Camera;
}(QtQml_QtObject);

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

var QtMultimedia_MediaPlayer = function (_QtQml_QtObject4) {
  _inherits(QtMultimedia_MediaPlayer, _QtQml_QtObject4);

  function QtMultimedia_MediaPlayer() {
    _classCallCheck(this, QtMultimedia_MediaPlayer);

    return _possibleConstructorReturn(this, (QtMultimedia_MediaPlayer.__proto__ || Object.getPrototypeOf(QtMultimedia_MediaPlayer)).apply(this, arguments));
  }

  return QtMultimedia_MediaPlayer;
}(QtQml_QtObject);

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

var QtNfc_NearField = function (_QtQml_QtObject5) {
  _inherits(QtNfc_NearField, _QtQml_QtObject5);

  function QtNfc_NearField() {
    _classCallCheck(this, QtNfc_NearField);

    return _possibleConstructorReturn(this, (QtNfc_NearField.__proto__ || Object.getPrototypeOf(QtNfc_NearField)).apply(this, arguments));
  }

  return QtNfc_NearField;
}(QtQml_QtObject);

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

var QtQml_Binding = function (_QtQml_QtObject6) {
  _inherits(QtQml_Binding, _QtQml_QtObject6);

  function QtQml_Binding(meta) {
    _classCallCheck(this, QtQml_Binding);

    var _this25 = _possibleConstructorReturn(this, (QtQml_Binding.__proto__ || Object.getPrototypeOf(QtQml_Binding)).call(this, meta));

    _this25.$property = undefined;

    _this25.valueChanged.connect(_this25, _this25.$onValueChanged);
    _this25.targetChanged.connect(_this25, _this25.$updateBinding);
    _this25.propertyChanged.connect(_this25, _this25.$updateBinding);
    _this25.whenChanged.connect(_this25, _this25.$updateBinding);
    return _this25;
  }

  _createClass(QtQml_Binding, [{
    key: "$updateBinding",
    value: function $updateBinding() {
      if (!this.when || !this.target || !this.target.hasOwnProperty(this.property) || this.value === undefined) {
        this.$property = undefined;
        return;
      }
      this.$property = this.target.$properties[this.property];
      this.$onValueChanged(this.value); // trigger value update
    }
  }, {
    key: "$onValueChanged",
    value: function $onValueChanged(value) {
      if (value !== undefined && this.$property) {
        this.$property.set(value);
      }
    }
  }]);

  return QtQml_Binding;
}(QtQml_QtObject);

QtQml_Binding.properties = {
  target: { type: "QtObject", initialValue: null },
  property: { type: "string", initialValue: "" },
  value: { type: "var", initialValue: undefined },
  when: { type: "bool", initialValue: true }
};

QmlWeb.registerQmlType(QtQml_Binding);

var QMLContext = function () {
  function QMLContext() {
    _classCallCheck(this, QMLContext);
  }

  _createClass(QMLContext, [{
    key: "nameForObject",
    value: function nameForObject(obj) {
      for (var name in this) {
        if (this[name] === obj) {
          return name;
        }
      }
      return undefined;
    }
  }]);

  return QMLContext;
}();

// eslint-disable-next-line no-undef


var QtQml_Component = function (_QtQml_QtObject7) {
  _inherits(QtQml_Component, _QtQml_QtObject7);

  function QtQml_Component(meta) {
    _classCallCheck(this, QtQml_Component);

    var _this26 = _possibleConstructorReturn(this, (QtQml_Component.__proto__ || Object.getPrototypeOf(QtQml_Component)).call(this, meta));

    if (QmlWeb.constructors[meta.object.$class] === QtQml_Component) {
      _this26.$metaObject = meta.object.$children[0];
    } else {
      _this26.$metaObject = meta.object;
    }
    _this26.$context = meta.context;

    _this26.$jsImports = [];

    if (meta.object.$imports instanceof Array) {
      var moduleImports = [];
      var loadImport = function loadImport(importDesc) {
        if (/\.js$/.test(importDesc[1])) {
          _this26.$jsImports.push(importDesc);
        } else {
          moduleImports.push(importDesc);
        }
      };

      for (var i = 0; i < meta.object.$imports.length; ++i) {
        loadImport(meta.object.$imports[i]);
      }
      QmlWeb.loadImports(_this26, moduleImports);
    }

    /* If this Component does not have any imports, it is likely one that was
     * created within another Component file. It should inherit the
     * importContextId of the Component file it was created within. */
    if (_this26.importContextId === undefined) {
      _this26.importContextId = meta.context.importContextId;
    }
    return _this26;
  }

  _createClass(QtQml_Component, [{
    key: "finalizeImports",
    value: function finalizeImports($context) {
      var engine = QmlWeb.engine;
      for (var i = 0; i < this.$jsImports.length; ++i) {
        var importDesc = this.$jsImports[i];
        var js = engine.loadJS(engine.$resolvePath(importDesc[1]));

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
  }, {
    key: "$createObject",
    value: function $createObject(parent) {
      var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.$context;

      var engine = QmlWeb.engine;
      var oldState = engine.operationState;
      engine.operationState = QmlWeb.QMLOperationState.Init;
      // change base path to current component base path
      var bp = engine.$basePath;
      engine.$basePath = this.$basePath ? this.$basePath : engine.$basePath;

      var newContext = context ? Object.create(context) : new QMLContext();

      if (this.importContextId !== undefined) {
        newContext.importContextId = this.importContextId;
      }

      var item = QmlWeb.construct({
        object: this.$metaObject,
        parent: parent,
        context: newContext,
        isComponentRoot: true
      });

      this.finalizeImports(item.$context);

      Object.keys(properties).forEach(function (propname) {
        item[propname] = properties.propname;
      });

      // change base path back
      // TODO looks a bit hacky
      engine.$basePath = bp;

      engine.operationState = oldState;
      return item;
    }
  }, {
    key: "createObject",
    value: function createObject(parent) {
      var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var item = this.$createObject(parent, properties);
      var QMLItem = QmlWeb.getConstructor("QtQuick", "2.0", "Item");

      if (item instanceof QMLItem) {
        item.$properties.parent.set(parent, QmlWeb.QMLProperty.ReasonInit);
      }

      return item;
    }
  }], [{
    key: "getAttachedObject",
    value: function getAttachedObject() {
      // see QMLEngine.js for explanation how it is used.
      if (!this.$Component) {
        this.$Component = new QmlWeb.QObject(this);
        this.$Component.completed = QmlWeb.Signal.signal([]);
        QmlWeb.engine.completedSignals.push(this.$Component.completed);

        this.$Component.destruction = QmlWeb.Signal.signal([]);
      }
      return this.$Component;
    }
  }]);

  return QtQml_Component;
}(QtQml_QtObject);

QtQml_Component.global = true;

QmlWeb.registerQmlType(QtQml_Component);

// eslint-disable-next-line no-undef

var QtQml_Connections = function (_QtQml_QtObject8) {
  _inherits(QtQml_Connections, _QtQml_QtObject8);

  function QtQml_Connections(meta) {
    _classCallCheck(this, QtQml_Connections);

    var _this27 = _possibleConstructorReturn(this, (QtQml_Connections.__proto__ || Object.getPrototypeOf(QtQml_Connections)).call(this, meta));

    _this27.target = _this27.$parent;
    _this27.$connections = {};

    _this27.$old_target = _this27.target;
    _this27.targetChanged.connect(_this27, _this27.$onTargetChanged);
    _this27.Component.completed.connect(_this27, _this27.Component$onCompleted);
    return _this27;
  }

  _createClass(QtQml_Connections, [{
    key: "$onTargetChanged",
    value: function $onTargetChanged() {
      this.$reconnectTarget();
    }
  }, {
    key: "Component$onCompleted",
    value: function Component$onCompleted() {
      this.$reconnectTarget();
    }
  }, {
    key: "$reconnectTarget",
    value: function $reconnectTarget() {
      var old_target = this.$old_target;
      for (var i in this.$connections) {
        var c = this.$connections[i];
        if (c._currentConnection && old_target && old_target[i] && typeof old_target[i].disconnect === "function") {
          old_target[i].disconnect(c._currentConnection);
        }
        if (this.target) {
          c._currentConnection = QmlWeb.connectSignal(this.target, i, c.value, c.objectScope, c.componentScope);
        }
      }
      this.$old_target = this.target;
    }
  }, {
    key: "$setCustomSlot",
    value: function $setCustomSlot(propName, value, objectScope, componentScope) {
      this.$connections[propName] = { value: value, objectScope: objectScope, componentScope: componentScope };
    }
  }]);

  return QtQml_Connections;
}(QtQml_QtObject);

QtQml_Connections.properties = {
  target: "QtObject",
  ignoreUnknownSignals: "bool"
};

QmlWeb.registerQmlType(QtQml_Connections);

// eslint-disable-next-line no-undef

var QtQml_Timer = function (_QtQml_QtObject9) {
  _inherits(QtQml_Timer, _QtQml_QtObject9);

  function QtQml_Timer(meta) {
    _classCallCheck(this, QtQml_Timer);

    var _this28 = _possibleConstructorReturn(this, (QtQml_Timer.__proto__ || Object.getPrototypeOf(QtQml_Timer)).call(this, meta));

    _this28.$properties.parent.set(_this28.$parent, QmlWeb.QMLProperty.ReasonInit);

    /* This ensures that if the user toggles the "running" property manually,
     * the timer will trigger. */
    _this28.runningChanged.connect(_this28, _this28.$onRunningChanged);

    QmlWeb.engine.$addTicker(function () {
      return _this28.$ticker.apply(_this28, arguments);
    });

    QmlWeb.engine.$registerStart(function () {
      if (_this28.running) {
        _this28.restart();
      }
    });

    QmlWeb.engine.$registerStop(function () {
      return _this28.stop();
    });
    return _this28;
  }

  _createClass(QtQml_Timer, [{
    key: "start",
    value: function start() {
      this.running = true;
    }
  }, {
    key: "stop",
    value: function stop() {
      this.running = false;
    }
  }, {
    key: "restart",
    value: function restart() {
      this.stop();
      this.start();
    }
  }, {
    key: "$ticker",
    value: function $ticker(now) {
      if (!this.running) return;
      if (now - this.$prevTrigger >= this.interval) {
        this.$prevTrigger = now;
        this.$trigger();
      }
    }
  }, {
    key: "$onRunningChanged",
    value: function $onRunningChanged() {
      if (this.running) {
        this.$prevTrigger = Date.now();
        if (this.triggeredOnStart) {
          this.$trigger();
        }
      }
    }
  }, {
    key: "$trigger",
    value: function $trigger() {
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
  }]);

  return QtQml_Timer;
}(QtQml_QtObject);

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

var QtQuick_Layouts_Layout = function (_QtQml_QtObject10) {
  _inherits(QtQuick_Layouts_Layout, _QtQml_QtObject10);

  function QtQuick_Layouts_Layout(meta) {
    _classCallCheck(this, QtQuick_Layouts_Layout);

    var _this29 = _possibleConstructorReturn(this, (QtQuick_Layouts_Layout.__proto__ || Object.getPrototypeOf(QtQuick_Layouts_Layout)).call(this, meta));

    throw new Error("Do not create objects of type Layout");
    return _this29;
  }

  _createClass(QtQuick_Layouts_Layout, null, [{
    key: "getAttachedObject",
    value: function getAttachedObject() {
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
  }]);

  return QtQuick_Layouts_Layout;
}(QtQml_QtObject);

QtQuick_Layouts_Layout.versions = /^1\./;

QmlWeb.registerQmlType(QtQuick_Layouts_Layout);

// eslint-disable-next-line no-undef

var QtQuick_Particles_Direction = function (_QtQml_QtObject11) {
  _inherits(QtQuick_Particles_Direction, _QtQml_QtObject11);

  function QtQuick_Particles_Direction() {
    _classCallCheck(this, QtQuick_Particles_Direction);

    return _possibleConstructorReturn(this, (QtQuick_Particles_Direction.__proto__ || Object.getPrototypeOf(QtQuick_Particles_Direction)).apply(this, arguments));
  }

  return QtQuick_Particles_Direction;
}(QtQml_QtObject);

QtQuick_Particles_Direction.versions = /^2\./;

QmlWeb.registerQmlType(QtQuick_Particles_Direction);

// eslint-disable-next-line no-undef, max-len

var QtQuick_Particles_AngleDirection = function (_QtQuick_Particles_Di) {
  _inherits(QtQuick_Particles_AngleDirection, _QtQuick_Particles_Di);

  function QtQuick_Particles_AngleDirection() {
    _classCallCheck(this, QtQuick_Particles_AngleDirection);

    return _possibleConstructorReturn(this, (QtQuick_Particles_AngleDirection.__proto__ || Object.getPrototypeOf(QtQuick_Particles_AngleDirection)).apply(this, arguments));
  }

  return QtQuick_Particles_AngleDirection;
}(QtQuick_Particles_Direction);

QtQuick_Particles_AngleDirection.versions = /^2\./;
QtQuick_Particles_AngleDirection.properties = {
  angle: "real",
  angleVariation: "real",
  magnitude: "real",
  magnitudeVariation: "real"
};

QmlWeb.registerQmlType(QtQuick_Particles_AngleDirection);

// eslint-disable-next-line no-undef

var QtQuick_Window_Screen = function (_QtQml_QtObject12) {
  _inherits(QtQuick_Window_Screen, _QtQml_QtObject12);

  function QtQuick_Window_Screen(meta) {
    _classCallCheck(this, QtQuick_Window_Screen);

    var _this32 = _possibleConstructorReturn(this, (QtQuick_Window_Screen.__proto__ || Object.getPrototypeOf(QtQuick_Window_Screen)).call(this, meta));

    throw new Error("Screen can only be used via the attached property.");
    return _this32;
  }

  _createClass(QtQuick_Window_Screen, null, [{
    key: "getAttachedObject",
    value: function getAttachedObject() {
      if (!QtQuick_Window_Screen.$Screen) {
        var screen = QtQuick_Window_Screen.$Screen = new QmlWeb.QObject();
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
        window.addEventListener("resize", function () {
          return QtQuick_Window_Screen.$populateScreen();
        });

        // TODO: orientation
        var _Qt = QmlWeb.Qt;
        screen.orientationUpdateMask = 0;
        screen.orientation = _Qt.PrimaryOrientation;
        screen.primaryOrientation = _Qt.PrimaryOrientation;
      }
      return QtQuick_Window_Screen.$Screen;
    }
  }, {
    key: "$populateScreen",
    value: function $populateScreen() {
      var screen = QtQuick_Window_Screen.$Screen;
      screen.desktopAvailableHeight = window.outerHeight;
      screen.desktopAvailableWidth = window.outerWidth;
      screen.height = window.innerHeight;
      screen.width = window.innerWidth;
    }
  }]);

  return QtQuick_Window_Screen;
}(QtQml_QtObject);

QmlWeb.registerQmlType(QtQuick_Window_Screen);

// eslint-disable-next-line no-undef

var QtQuick_Animation = function (_QtQml_QtObject13) {
  _inherits(QtQuick_Animation, _QtQml_QtObject13);

  function QtQuick_Animation() {
    _classCallCheck(this, QtQuick_Animation);

    return _possibleConstructorReturn(this, (QtQuick_Animation.__proto__ || Object.getPrototypeOf(QtQuick_Animation)).apply(this, arguments));
  }

  _createClass(QtQuick_Animation, [{
    key: "restart",
    value: function restart() {
      this.stop();
      this.start();
    }
  }, {
    key: "start",
    value: function start() {
      this.running = true;
    }
  }, {
    key: "stop",
    value: function stop() {
      this.running = false;
    }
  }, {
    key: "pause",
    value: function pause() {
      this.paused = true;
    }
  }, {
    key: "resume",
    value: function resume() {
      this.paused = false;
    }
  }, {
    key: "complete",
    value: function complete() {
      // To be overridden
      console.log("Unbound method for", this);
    }
  }]);

  return QtQuick_Animation;
}(QtQml_QtObject);

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

var QtQuick_Animator = function (_QtQuick_Animation) {
  _inherits(QtQuick_Animator, _QtQuick_Animation);

  function QtQuick_Animator(meta) {
    _classCallCheck(this, QtQuick_Animator);

    var _this34 = _possibleConstructorReturn(this, (QtQuick_Animator.__proto__ || Object.getPrototypeOf(QtQuick_Animator)).call(this, meta));

    _this34.easing = new QmlWeb.QObject(_this34);
    QmlWeb.createProperties(_this34.easing, {
      type: { type: "enum", initialValue: _this34.Easing.Linear },
      amplitude: { type: "real", initialValue: 1 },
      overshoot: { type: "real", initialValue: 1.70158 },
      period: { type: "real", initialValue: 0.3 },
      bezierCurve: "list"
    });
    return _this34;
  }

  return QtQuick_Animator;
}(QtQuick_Animation);

QtQuick_Animator.versions = /^2\./;
QtQuick_Animator.properties = {
  duration: { type: "int", initialValue: 250 },
  from: "real",
  target: "Item",
  to: "real"
};

QmlWeb.registerQmlType(QtQuick_Animator);

// eslint-disable-next-line no-undef

var QtQuick_Behavior = function (_QtQml_QtObject14) {
  _inherits(QtQuick_Behavior, _QtQml_QtObject14);

  function QtQuick_Behavior(meta) {
    _classCallCheck(this, QtQuick_Behavior);

    var _this35 = _possibleConstructorReturn(this, (QtQuick_Behavior.__proto__ || Object.getPrototypeOf(QtQuick_Behavior)).call(this, meta));

    _this35.$on = meta.object.$on;

    _this35.animationChanged.connect(_this35, _this35.$onAnimationChanged);
    _this35.enabledChanged.connect(_this35, _this35.$onEnabledChanged);
    return _this35;
  }

  _createClass(QtQuick_Behavior, [{
    key: "$onAnimationChanged",
    value: function $onAnimationChanged(newVal) {
      newVal.target = this.$parent;
      newVal.property = this.$on;
      this.$parent.$properties[this.$on].animation = newVal;
    }
  }, {
    key: "$onEnabledChanged",
    value: function $onEnabledChanged(newVal) {
      this.$parent.$properties[this.$on].animation = newVal ? this.animation : null;
    }
  }]);

  return QtQuick_Behavior;
}(QtQml_QtObject);

QtQuick_Behavior.properties = {
  animation: "Animation",
  enabled: { type: "bool", initialValue: true }
};
QtQuick_Behavior.defaultProperty = "animation";

QmlWeb.registerQmlType(QtQuick_Behavior);

// eslint-disable-next-line no-undef

var QtQuick_FontLoader = function (_QtQml_QtObject15) {
  _inherits(QtQuick_FontLoader, _QtQml_QtObject15);

  function QtQuick_FontLoader(meta) {
    _classCallCheck(this, QtQuick_FontLoader);

    var _this36 = _possibleConstructorReturn(this, (QtQuick_FontLoader.__proto__ || Object.getPrototypeOf(QtQuick_FontLoader)).call(this, meta));

    _this36.$lastName = "";
    _this36.$inTouchName = false;

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
    _this36.$timeouts = [20, 50, 100, 300, 500, 1000, 3000, 5000, 10000, 15000];

    _this36.sourceChanged.connect(_this36, _this36.$onSourceChanged);
    _this36.nameChanged.connect(_this36, _this36.$onNameChanged);
    return _this36;
  }

  _createClass(QtQuick_FontLoader, [{
    key: "$loadFont",
    value: function $loadFont(fontName, fontFace) {
      var _this37 = this;

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

      var promise = void 0;
      if (fontFace) {
        promise = fontFace.loaded;
      } else if (document.fonts && document.fonts.load) {
        promise = document.fonts.load(fontName);
      }

      if (promise) {
        promise.then(function () {
          if (_this37.$lastName !== fontName) return;
          _this37.name = fontName;
          _this37.status = _this37.FontLoader.Ready;
        }, function () {
          if (_this37.$lastName !== fontName) return;
          _this37.status = _this37.FontLoader.Error;
        });
      } else if (typeof FontLoader === "function") {
        var fontLoader = new FontLoader([fontName], {
          fontsLoaded: function fontsLoaded(error) {
            if (error !== null) {
              if (_this37.$lastName === fontName && error.notLoadedFontFamilies[0] === fontName) {
                // Set the name for the case of font loading after the timeout.
                _this37.name = fontName;
                _this37.status = _this37.FontLoader.Error;
              }
            }
          },
          fontLoaded: function fontLoaded(fontFamily) {
            if (_this37.$lastName === fontName && fontFamily === fontName) {
              _this37.name = fontName;
              _this37.status = _this37.FontLoader.Ready;
            }
          }
        }, this.$timeouts[this.$timeouts.length - 1]);
        // Else I get problems loading multiple fonts (FontLoader.js bug?)
        FontLoader.testDiv = null;
        fontLoader.loadFonts();
      } else {
        console.warn("FontLoader.js library is not loaded.\nYou should load FontLoader.js if you want to use QtQuick FontLoader elements.\nRefs: https://github.com/smnh/FontLoader.");
        // You should not rely on 'status' property without FontLoader.js.
        this.status = this.FontLoader.Error;
        this.name = fontName;
        this.$cycleTouchName(fontName, 0);
      }
    }
  }, {
    key: "$cycleTouchName",
    value: function $cycleTouchName(fontName, i) {
      var _this38 = this;

      if (this.$lastName !== fontName) {
        return;
      }
      if (i > 0) {
        var name = this.name;
        this.$inTouchName = true;
        // Calling this.nameChanged() is not enough, we have to actually change
        // the value to flush the bindings.
        this.name = "sans-serif";
        this.name = name;
        this.$inTouchName = false;
      }
      if (i < this.$timeouts.length) {
        setTimeout(function () {
          _this38.$cycleTouchName(fontName, i + 1);
        }, this.$timeouts[i] - (i > 0 ? this.$timeouts[i - 1] : 0));
      }
    }
  }, {
    key: "$onSourceChanged",
    value: function $onSourceChanged(font_src) {
      // Load font by source url
      var rand = Math.round(Math.random() * 1e15);
      var fontName = "font_" + Date.now().toString(36) + "_" + rand.toString(36);
      if (typeof FontFace !== "undefined" && document.fonts && document.fonts.add) {
        var fontFace = new FontFace(fontName, "url('" + font_src + "')");
        document.fonts.add(fontFace);
        fontFace.load();
        this.$loadFont(fontName, fontFace);
        return;
      }
      if (!this.$domStyle) {
        this.$domStyle = document.createElement("style");
      }
      this.$domStyle.innerHTML = "@font-face {\n      font-family: " + fontName + ";\n      src: url('" + font_src + "');\n    }";
      document.getElementsByTagName("head")[0].appendChild(this.$domStyle);
      this.$loadFont(fontName);
    }
  }, {
    key: "$onNameChanged",
    value: function $onNameChanged(fontName) {
      // Load font by the name
      this.$loadFont(fontName);
    }
  }]);

  return QtQuick_FontLoader;
}(QtQml_QtObject);

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

var QtQuick_Item = function (_QtQml_QtObject16) {
  _inherits(QtQuick_Item, _QtQml_QtObject16);

  function QtQuick_Item(meta) {
    _classCallCheck(this, QtQuick_Item);

    var _this39 = _possibleConstructorReturn(this, (QtQuick_Item.__proto__ || Object.getPrototypeOf(QtQuick_Item)).call(this, meta));

    if (!_this39.dom) {
      // Create a dom element for this item.
      _this39.dom = document.createElement(meta.tagName || "div");
    }
    _this39.dom.style.position = "absolute";
    _this39.dom.style.pointerEvents = "none";
    if (meta.style) {
      for (var key in meta.style) {
        if (!meta.style.hasOwnProperty(key)) continue;
        _this39.dom.style[key] = meta.style[key];
      }
    }

    // In case the class is qualified, only use the last part for the css class
    // name.
    var classComponent = meta.object.$class.split(".").pop();
    _this39.dom.className = "" + classComponent + (_this39.id ? " " + _this39.id : "");
    _this39.css = _this39.dom.style;
    _this39.impl = null; // Store the actually drawn element

    _this39.css.boxSizing = "border-box";

    if (_this39.$isComponentRoot) {
      QmlWeb.createProperty("var", _this39, "activeFocus");
    }

    _this39.parentChanged.connect(_this39, _this39.$onParentChanged_);
    _this39.dataChanged.connect(_this39, _this39.$onDataChanged);
    _this39.stateChanged.connect(_this39, _this39.$onStateChanged);
    _this39.visibleChanged.connect(_this39, _this39.$onVisibleChanged_);
    _this39.clipChanged.connect(_this39, _this39.$onClipChanged);
    _this39.zChanged.connect(_this39, _this39.$onZChanged);
    _this39.xChanged.connect(_this39, _this39.$onXChanged);
    _this39.yChanged.connect(_this39, _this39.$onYChanged);
    _this39.widthChanged.connect(_this39, _this39.$onWidthChanged_);
    _this39.heightChanged.connect(_this39, _this39.$onHeightChanged_);
    _this39.focusChanged.connect(_this39, _this39.$onFocusChanged_);

    _this39.widthChanged.connect(_this39, _this39.$updateHGeometry);
    _this39.heightChanged.connect(_this39, _this39.$updateVGeometry);
    _this39.implicitWidthChanged.connect(_this39, _this39.$onImplicitWidthChanged);
    _this39.implicitHeightChanged.connect(_this39, _this39.$onImplicitHeightChanged);

    _this39.$isUsingImplicitWidth = true;
    _this39.$isUsingImplicitHeight = true;

    _this39.anchors = new QmlWeb.QObject(_this39);
    QmlWeb.createProperties(_this39.anchors, {
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
    _this39.anchors.leftChanged.connect(_this39, _this39.$updateHGeometry);
    _this39.anchors.rightChanged.connect(_this39, _this39.$updateHGeometry);
    _this39.anchors.topChanged.connect(_this39, _this39.$updateVGeometry);
    _this39.anchors.bottomChanged.connect(_this39, _this39.$updateVGeometry);
    _this39.anchors.horizontalCenterChanged.connect(_this39, _this39.$updateHGeometry);
    _this39.anchors.verticalCenterChanged.connect(_this39, _this39.$updateVGeometry);
    _this39.anchors.fillChanged.connect(_this39, _this39.$updateHGeometry);
    _this39.anchors.fillChanged.connect(_this39, _this39.$updateVGeometry);
    _this39.anchors.centerInChanged.connect(_this39, _this39.$updateHGeometry);
    _this39.anchors.centerInChanged.connect(_this39, _this39.$updateVGeometry);
    _this39.anchors.leftMarginChanged.connect(_this39, _this39.$updateHGeometry);
    _this39.anchors.rightMarginChanged.connect(_this39, _this39.$updateHGeometry);
    _this39.anchors.topMarginChanged.connect(_this39, _this39.$updateVGeometry);
    _this39.anchors.bottomMarginChanged.connect(_this39, _this39.$updateVGeometry);
    _this39.anchors.marginsChanged.connect(_this39, _this39.$updateHGeometry);
    _this39.anchors.marginsChanged.connect(_this39, _this39.$updateVGeometry);

    // childrenRect property
    _this39.childrenRect = new QmlWeb.QObject(_this39);
    QmlWeb.createProperties(_this39.childrenRect, {
      x: "real", // TODO ro
      y: "real", // TODO ro
      width: "real", // TODO ro
      height: "real" // TODO ro
    });

    _this39.rotationChanged.connect(_this39, _this39.$updateTransform);
    _this39.scaleChanged.connect(_this39, _this39.$updateTransform);
    _this39.transformChanged.connect(_this39, _this39.$updateTransform);

    _this39.Component.completed.connect(_this39, _this39.Component$onCompleted_);
    _this39.opacityChanged.connect(_this39, _this39.$calculateOpacity);
    if (_this39.$parent) {
      _this39.$parent.$opacityChanged.connect(_this39, _this39.$calculateOpacity);
    }

    _this39.spacing = 0;
    _this39.$revertActions = [];
    _this39.css.left = _this39.x + "px";
    _this39.css.top = _this39.y + "px";
    return _this39;
  }

  _createClass(QtQuick_Item, [{
    key: "$onParentChanged_",
    value: function $onParentChanged_(newParent, oldParent, propName) {
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
  }, {
    key: "$onDataChanged",
    value: function $onDataChanged(newData) {
      var QMLItem = QmlWeb.getConstructor("QtQuick", "2.0", "Item");
      for (var i in newData) {
        var child = newData[i];
        if (child instanceof QMLItem) {
          child.parent = this; // This will also add it to children.
        } else {
          this.resources.push(child);
        }
      }
    }
  }, {
    key: "$onStateChanged",
    value: function $onStateChanged(newVal, oldVal) {
      // let oldState; // TODO: do we need oldState?
      var newState = void 0;
      for (var i = 0; i < this.states.length; i++) {
        if (this.states[i].name === newVal) {
          newState = this.states[i];
        }
        /*
        else if (this.states[i].name === oldVal) {
          oldState = this.states[i];
        }
        */
      }

      var actions = this.$revertActions.slice();

      // Get current values for revert actions
      for (var _i2 in actions) {
        var action = actions[_i2];
        action.from = action.target[action.property];
      }
      if (newState) {
        var changes = newState.$getAllChanges();

        // Get all actions we need to do and create actions to revert them
        for (var _i3 = 0; _i3 < changes.length; _i3++) {
          this.$applyChange(actions, changes[_i3]);
        }
      }

      // Set all property changes and fetch the actual values afterwards
      // The latter is needed for transitions. We need to set all properties
      // before we fetch the values because properties can be interdependent.
      for (var _i4 in actions) {
        var _action = actions[_i4];
        _action.target.$properties[_action.property].set(_action.value, QmlWeb.QMLProperty.ReasonUser, _action.target, newState ? newState.$context : _action.target.$context);
      }
      for (var _i5 in actions) {
        var _action2 = actions[_i5];
        _action2.to = _action2.target[_action2.property];
        if (_action2.explicit) {
          // Remove binding
          _action2.target[_action2.property] = _action2.target[_action2.property];
          _action2.value = _action2.target[_action2.property];
        }
      }

      // Find the best transition to use
      var transition = void 0;
      var rating = 0;
      for (var _i6 = 0; _i6 < this.transitions.length; _i6++) {
        // We need to stop running transitions, so let's do
        // it while iterating through the transitions anyway
        this.transitions[_i6].$stop();
        var curTransition = this.transitions[_i6];
        var curRating = 0;
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
  }, {
    key: "$applyChange",
    value: function $applyChange(actions, change) {
      var _this40 = this;

      var arrayFindIndex = QmlWeb.helpers.arrayFindIndex;

      var _loop = function _loop(j) {
        var item = change.$actions[j];

        var action = {
          target: change.target,
          property: item.property,
          origValue: change.target.$properties[item.property].binding || change.target.$properties[item.property].val,
          value: item.value,
          from: change.target[item.property],
          to: undefined,
          explicit: change.explicit
        };

        var actionIndex = arrayFindIndex(actions, function (element) {
          return element.target === action.target && element.property === action.property;
        });
        if (actionIndex !== -1) {
          actions[actionIndex] = action;
        } else {
          actions.push(action);
        }

        // Look for existing revert action, else create it
        var revertIndex = arrayFindIndex(_this40.$revertActions, function (element) {
          return element.target === change.target && element.property === item.property;
        });
        if (revertIndex !== -1 && !change.restoreEntryValues) {
          // We don't want to revert, so remove it
          _this40.$revertActions.splice(revertIndex, 1);
        } else if (revertIndex === -1 && change.restoreEntryValues) {
          _this40.$revertActions.push({
            target: change.target,
            property: item.property,
            value: change.target.$properties[item.property].binding || change.target.$properties[item.property].val,
            from: undefined,
            to: change.target[item.property]
          });
        }
      };

      for (var j = 0; j < change.$actions.length; j++) {
        _loop(j);
      }
    }
  }, {
    key: "$onVisibleChanged_",
    value: function $onVisibleChanged_(newVal) {
      this.css.visibility = newVal ? "inherit" : "hidden";
    }
  }, {
    key: "$onClipChanged",
    value: function $onClipChanged(newVal) {
      this.css.overflow = newVal ? "hidden" : "visible";
    }
  }, {
    key: "$onZChanged",
    value: function $onZChanged() {
      this.$updateTransform();
    }
  }, {
    key: "$onXChanged",
    value: function $onXChanged(newVal) {
      this.css.left = newVal + "px";
      this.$updateHGeometry();
    }
  }, {
    key: "$onYChanged",
    value: function $onYChanged(newVal) {
      this.css.top = newVal + "px";
      this.$updateVGeometry();
    }
  }, {
    key: "$onWidthChanged_",
    value: function $onWidthChanged_(newVal) {
      this.css.width = newVal ? newVal + "px" : "auto";
    }
  }, {
    key: "$onHeightChanged_",
    value: function $onHeightChanged_(newVal) {
      this.css.height = newVal ? newVal + "px" : "auto";
    }
  }, {
    key: "$onFocusChanged_",
    value: function $onFocusChanged_(newVal) {
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
  }, {
    key: "setupFocusOnDom",
    value: function setupFocusOnDom(element) {
      var _this41 = this;

      var updateFocus = function updateFocus() {
        var hasFocus = document.activeElement === _this41.dom || document.activeElement === _this41.dom.firstChild;
        if (_this41.focus !== hasFocus) {
          _this41.focus = hasFocus;
        }
      };
      element.addEventListener("focus", updateFocus);
      element.addEventListener("blur", updateFocus);
    }
  }, {
    key: "$updateTransform",
    value: function $updateTransform() {
      var QMLTranslate = QmlWeb.getConstructor("QtQuick", "2.0", "Translate");
      var QMLRotation = QmlWeb.getConstructor("QtQuick", "2.0", "Rotation");
      var QMLScale = QmlWeb.getConstructor("QtQuick", "2.0", "Scale");
      var transform = "rotate(" + this.rotation + "deg) scale(" + this.scale + ")";
      var filter = "";
      var transformStyle = "preserve-3d";

      for (var i = 0; i < this.transform.length; i++) {
        var t = this.transform[i];
        if (t instanceof QMLRotation) {
          var ax = t.axis;
          transform += " rotate3d(" + ax.x + ", " + ax.y + ", " + ax.z + ", " + ax.angle + "deg)";
        } else if (t instanceof QMLScale) {
          transform += " scale(" + t.xScale + ", " + t.yScale + ")";
        } else if (t instanceof QMLTranslate) {
          transform += " translate(" + t.x + "px, " + t.y + "px)";
        } else if (typeof t.transformType !== "undefined") {
          if (t.transformType === "filter") {
            filter += t.operation + "(" + t.parameters + ") ";
          }
        } else if (typeof t === "string") {
          transform += t;
        }
      }
      if (typeof this.z === "number") {
        transform += " translate3d(0, 0, " + this.z + "px)";
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
  }, {
    key: "Component$onCompleted_",
    value: function Component$onCompleted_() {
      this.$calculateOpacity();
    }
  }, {
    key: "$calculateOpacity",
    value: function $calculateOpacity() {
      // TODO: reset all opacity on layer.enabled changed
      /*
      if (false) { // TODO: check layer.enabled
        this.css.opacity = this.opacity;
      }
      */
      var parentOpacity = this.$parent && this.$parent.$opacity || 1;
      this.$opacity = this.opacity * parentOpacity;
      if (this.impl) {
        this.impl.style.opacity = this.$opacity;
      }
    }
  }, {
    key: "$onImplicitWidthChanged",
    value: function $onImplicitWidthChanged() {
      if (this.$isUsingImplicitWidth) {
        this.width = this.implicitWidth;
        this.$isUsingImplicitWidth = true;
      }
    }
  }, {
    key: "$onImplicitHeightChanged",
    value: function $onImplicitHeightChanged() {
      if (this.$isUsingImplicitHeight) {
        this.height = this.implicitHeight;
        this.$isUsingImplicitHeight = true;
      }
    }
  }, {
    key: "$updateHGeometry",
    value: function $updateHGeometry(newVal, oldVal, propName) {
      var anchors = this.anchors || this;
      if (this.$updatingHGeometry) {
        return;
      }
      this.$updatingHGeometry = true;

      var flags = QmlWeb.Signal.UniqueConnection;
      var lM = anchors.leftMargin || anchors.margins;
      var rM = anchors.rightMargin || anchors.margins;
      var w = this.width;
      var left = this.parent ? this.parent.left : 0;

      // Width
      if (propName === "width") {
        this.$isUsingImplicitWidth = false;
      }

      // Position TODO: Layouts

      var u = {}; // our update object

      if (anchors.fill !== undefined) {
        var fill = anchors.fill;
        var props = fill.$properties;
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
        var horizontalCenter = anchors.centerIn.$properties.horizontalCenter;
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
          var leftProp = this.parent.$properties.left;
          leftProp.changed.connect(this, this.$updateHGeometry, flags);
        }

        u.left = this.x + left;
        u.right = u.left + w;
        u.horizontalCenter = u.left + w / 2;
      }

      for (var key in u) {
        this[key] = u[key];
      }

      this.$updatingHGeometry = false;

      if (this.parent) this.$updateChildrenRect(this.parent);
    }
  }, {
    key: "$updateVGeometry",
    value: function $updateVGeometry(newVal, oldVal, propName) {
      var anchors = this.anchors || this;
      if (this.$updatingVGeometry) {
        return;
      }
      this.$updatingVGeometry = true;

      var flags = QmlWeb.Signal.UniqueConnection;
      var tM = anchors.topMargin || anchors.margins;
      var bM = anchors.bottomMargin || anchors.margins;
      var h = this.height;
      var top = this.parent ? this.parent.top : 0;

      // HeighttopProp
      if (propName === "height") {
        this.$isUsingImplicitHeight = false;
      }

      // Position TODO: Layouts

      var u = {}; // our update object

      if (anchors.fill !== undefined) {
        var fill = anchors.fill;
        var props = fill.$properties;
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
        var verticalCenter = anchors.centerIn.$properties.verticalCenter;
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
          var topProp = this.parent.$properties.top;
          topProp.changed.connect(this, this.$updateVGeometry, flags);
        }

        u.top = this.y + top;
        u.bottom = u.top + h;
        u.verticalCenter = u.top + h / 2;
      }

      for (var key in u) {
        this[key] = u[key];
      }

      this.$updatingVGeometry = false;

      if (this.parent) this.$updateChildrenRect(this.parent);
    }
  }, {
    key: "$updateChildrenRect",
    value: function $updateChildrenRect(component) {
      if (!component || !component.children || component.children.length === 0) {
        return;
      }
      var children = component.children;

      var maxWidth = 0;
      var maxHeight = 0;
      var minX = children.length > 0 ? children[0].x : 0;
      var minY = children.length > 0 ? children[0].y : 0;

      for (var i = 0; i < children.length; i++) {
        var child = children[i];
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
  }]);

  return QtQuick_Item;
}(QtQml_QtObject);

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

var QmlWeb_Dom_DomElement = function (_QtQuick_Item) {
  _inherits(QmlWeb_Dom_DomElement, _QtQuick_Item);

  function QmlWeb_Dom_DomElement(meta) {
    _classCallCheck(this, QmlWeb_Dom_DomElement);

    meta.tagName = meta.object.tagName || meta.tagName;

    var _this42 = _possibleConstructorReturn(this, (QmlWeb_Dom_DomElement.__proto__ || Object.getPrototypeOf(QmlWeb_Dom_DomElement)).call(this, meta));

    for (var key in meta.object.attrs) {
      if (!meta.object.attrs.hasOwnProperty(key)) continue;
      _this42.dom[key] = meta.object.attrs[key];
    }
    for (var _key26 in meta.object.style) {
      if (!meta.object.style.hasOwnProperty(_key26)) continue;
      _this42.dom.style[_key26] = meta.object.style[_key26];
    }

    _this42.htmlChanged.connect(function () {
      _this42.dom.innerHTML = _this42.html;
    });
    _this42.textChanged.connect(function () {
      _this42.dom.innerText = _this42.text;
    });
    return _this42;
  }

  return QmlWeb_Dom_DomElement;
}(QtQuick_Item);

QmlWeb_Dom_DomElement.properties = {
  attrs: { type: "var", initialValue: {} },
  style: { type: "var", initialValue: {} },
  html: { type: "string", initialValue: "" },
  text: { type: "string", initialValue: "" },
  tagName: { type: "string", initialValue: "div" }
};

QmlWeb.registerQmlType(QmlWeb_Dom_DomElement);

// eslint-disable-next-line no-undef

var QmlWeb_Dom_DomDiv = function (_QmlWeb_Dom_DomElemen) {
  _inherits(QmlWeb_Dom_DomDiv, _QmlWeb_Dom_DomElemen);

  function QmlWeb_Dom_DomDiv() {
    _classCallCheck(this, QmlWeb_Dom_DomDiv);

    return _possibleConstructorReturn(this, (QmlWeb_Dom_DomDiv.__proto__ || Object.getPrototypeOf(QmlWeb_Dom_DomDiv)).apply(this, arguments));
  }

  return QmlWeb_Dom_DomDiv;
}(QmlWeb_Dom_DomElement);

QmlWeb.registerQmlType(QmlWeb_Dom_DomDiv);

// eslint-disable-next-line no-undef

var QmlWeb_Dom_DomParagraph = function (_QmlWeb_Dom_DomElemen2) {
  _inherits(QmlWeb_Dom_DomParagraph, _QmlWeb_Dom_DomElemen2);

  function QmlWeb_Dom_DomParagraph(meta) {
    _classCallCheck(this, QmlWeb_Dom_DomParagraph);

    meta.tagName = "p";
    if (!meta.style) meta.style = {};
    meta.style.margin = 0;
    return _possibleConstructorReturn(this, (QmlWeb_Dom_DomParagraph.__proto__ || Object.getPrototypeOf(QmlWeb_Dom_DomParagraph)).call(this, meta));
  }

  return QmlWeb_Dom_DomParagraph;
}(QmlWeb_Dom_DomElement);

QmlWeb.registerQmlType(QmlWeb_Dom_DomParagraph);

// eslint-disable-next-line no-undef

var QmlWeb_RestModel = function (_QtQuick_Item2) {
  _inherits(QmlWeb_RestModel, _QtQuick_Item2);

  function QmlWeb_RestModel(meta) {
    _classCallCheck(this, QmlWeb_RestModel);

    var _this45 = _possibleConstructorReturn(this, (QmlWeb_RestModel.__proto__ || Object.getPrototypeOf(QmlWeb_RestModel)).call(this, meta));

    _this45.attributes = _this45.getAttributes();
    _this45.runningRequests = 0;
    return _this45;
  }

  _createClass(QmlWeb_RestModel, [{
    key: "fetch",
    value: function fetch() {
      var _this46 = this;

      this.$ajax({
        method: "GET",
        mimeType: this.mimetype,
        success: function success(xhr) {
          _this46.$xhrReadResponse(xhr);
          _this46.fetched();
        }
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this47 = this;

      this.$ajax({
        method: "DELETE",
        success: function success() {
          _this47.destroy();
        }
      });
    }
  }, {
    key: "create",
    value: function create() {
      this.$sendToServer("POST");
    }
  }, {
    key: "save",
    value: function save() {
      this.$sendToServer("PUT");
    }
  }, {
    key: "$sendToServer",
    value: function $sendToServer(method) {
      var _this48 = this;

      this.$ajax({
        method: method,
        mimeType: this.queryMimeType,
        body: this.$generateBodyForPostQuery(),
        success: function success(xhr) {
          _this48.$xhrReadResponse(xhr);
          _this48.saved();
        }
      });
    }
  }, {
    key: "$generateBodyForPostQuery",
    value: function $generateBodyForPostQuery() {
      var object = {};
      for (var i = 0; i < this.attributes.length; ++i) {
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
  }, {
    key: "$objectToUrlEncoded",
    value: function $objectToUrlEncoded(object, prefix) {
      var parts = [];
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          var value = object[key];
          if (typeof prefix !== "undefined") {
            key = prefix + "[" + key + "]";
          }
          if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object") {
            parts.push(this.$objectToUrlEncoded(value, key));
          } else {
            var ekey = this.$myEncodeURIComponent(key);
            var evalue = this.$myEncodeURIComponent(value);
            parts.push(ekey + "=" + evalue);
          }
        }
      }
      return parts.join("&");
    }
  }, {
    key: "$myEncodeURIComponent",
    value: function $myEncodeURIComponent(str) {
      return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return "%" + c.charCodeAt(0).toString(16);
      });
    }
  }, {
    key: "$ajax",
    value: function $ajax(options) {
      var _this49 = this;

      var xhr = new XMLHttpRequest();
      xhr.overrideMimeType(this.mimeType);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            options.success(xhr);
          } else {
            options.failure(xhr);
          }
          _this49.runningRequests -= 1;
          if (_this49.runningRequests <= 0) {
            _this49.isLoading = false;
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
  }, {
    key: "$xhrReadResponse",
    value: function $xhrReadResponse(xhr) {
      var responseObject = void 0;
      if (this.mimeType === "application/json" || this.mimeType === "text/json") {
        responseObject = JSON.parse(xhr.responseText);
      }
      this.$updatePropertiesFromResponseObject(responseObject);
    }
  }, {
    key: "$updatePropertiesFromResponseObject",
    value: function $updatePropertiesFromResponseObject(responseObject) {
      var QMLProperty = QmlWeb.QMLProperty;
      for (var key in responseObject) {
        if (responseObject.hasOwnProperty(key) && this.$hasProperty(key)) {
          this.$properties[key].set(responseObject[key], QMLProperty.ReasonUser);
        }
      }
    }
  }, {
    key: "$hasProperty",
    value: function $hasProperty(name) {
      return typeof this.$properties[name] !== "undefined";
    }
  }]);

  return QmlWeb_RestModel;
}(QtQuick_Item);

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

var Qt_labs_settings_Settings = function (_QtQuick_Item3) {
  _inherits(Qt_labs_settings_Settings, _QtQuick_Item3);

  function Qt_labs_settings_Settings(meta) {
    _classCallCheck(this, Qt_labs_settings_Settings);

    var _this50 = _possibleConstructorReturn(this, (Qt_labs_settings_Settings.__proto__ || Object.getPrototypeOf(Qt_labs_settings_Settings)).call(this, meta));

    if (typeof window.localStorage === "undefined") {
      return _possibleConstructorReturn(_this50);
    }

    _this50.Component.completed.connect(_this50, _this50.Component$onCompleted);
    return _this50;
  }

  _createClass(Qt_labs_settings_Settings, [{
    key: "Component$onCompleted",
    value: function Component$onCompleted() {
      this.$loadProperties();
      this.$initializeProperties();
    }
  }, {
    key: "$getKey",
    value: function $getKey(attrName) {
      return this.category + "/" + attrName;
    }
  }, {
    key: "$loadProperties",
    value: function $loadProperties() {
      var _this51 = this;

      this.$attributes.forEach(function (attrName) {
        if (!_this51.$properties[attrName]) return;

        var key = _this51.$getKey(attrName);
        _this51[attrName] = localStorage.getItem(key);
      });
    }
  }, {
    key: "$initializeProperties",
    value: function $initializeProperties() {
      var _this52 = this;

      this.$attributes.forEach(function (attrName) {
        if (!_this52.$properties[attrName]) return;

        var emitter = _this52;
        var signalName = attrName + "Changed";

        if (_this52.$properties[attrName].type === "alias") {
          emitter = _this52.$context[_this52.$properties[attrName].val.objectName];
          signalName = _this52.$properties[attrName].val.propertyName + "Changed";
        }

        emitter[signalName].connect(_this52, function () {
          localStorage.setItem(_this52.$getKey(attrName), _this52[attrName]);
        });
      });
    }
  }]);

  return Qt_labs_settings_Settings;
}(QtQuick_Item);

Qt_labs_settings_Settings.properties = {
  category: "string"
};

QmlWeb.registerQmlType(Qt_labs_settings_Settings);

// eslint-disable-next-line no-undef

var QtGraphicalEffects_FastBlur = function (_QtQuick_Item4) {
  _inherits(QtGraphicalEffects_FastBlur, _QtQuick_Item4);

  function QtGraphicalEffects_FastBlur(meta) {
    _classCallCheck(this, QtGraphicalEffects_FastBlur);

    var _this53 = _possibleConstructorReturn(this, (QtGraphicalEffects_FastBlur.__proto__ || Object.getPrototypeOf(QtGraphicalEffects_FastBlur)).call(this, meta));

    _this53.$previousSource = null;
    _this53.$filterObject = undefined;

    _this53.radiusChanged.connect(_this53, _this53.$onRadiusChanged);
    _this53.sourceChanged.connect(_this53, _this53.$onSourceChanged);
    return _this53;
  }

  _createClass(QtGraphicalEffects_FastBlur, [{
    key: "$onRadiusChanged",
    value: function $onRadiusChanged() {
      this.$updateEffect(this.source);
    }
  }, {
    key: "$onSourceChanged",
    value: function $onSourceChanged() {
      this.$updateEffect(this.source);
    }
  }, {
    key: "$updateFilterObject",
    value: function $updateFilterObject() {
      this.$filterObject = {
        transformType: "filter",
        operation: "blur",
        parameters: this.radius + "px"
      };
    }
  }, {
    key: "$updateEffect",
    value: function $updateEffect(source) {
      console.log("updating effect");
      if (this.$previousSource) {
        var index = this.$previousSource.transform.indexOf(this.$filterObject);
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
  }]);

  return QtGraphicalEffects_FastBlur;
}(QtQuick_Item);

QtGraphicalEffects_FastBlur.properties = {
  radius: "real",
  source: { type: "var", initialValue: null }
};

QmlWeb.registerQmlType(QtGraphicalEffects_FastBlur);

// eslint-disable-next-line no-undef

var QtGraphicalEffects_RectangularGlow = function (_QtQuick_Item5) {
  _inherits(QtGraphicalEffects_RectangularGlow, _QtQuick_Item5);

  function QtGraphicalEffects_RectangularGlow(meta) {
    _classCallCheck(this, QtGraphicalEffects_RectangularGlow);

    var _this54 = _possibleConstructorReturn(this, (QtGraphicalEffects_RectangularGlow.__proto__ || Object.getPrototypeOf(QtGraphicalEffects_RectangularGlow)).call(this, meta));

    _this54.impl = document.createElement("div");
    var style = _this54.impl.style;
    style.pointerEvents = "none";
    style.position = "absolute";
    style.left = style.right = style.top = style.bottom = "0px";
    style.border = "none";
    style.backgroundColor = _this54.color.$css;
    _this54.dom.appendChild(_this54.impl);

    _this54.colorChanged.connect(_this54, _this54.$onColorChanged);
    _this54.glowRadiusChanged.connect(_this54, _this54.$updateBoxShadow);
    _this54.cornerRadiusChanged.connect(_this54, _this54.$updateBoxShadow);
    _this54.widthChanged.connect(_this54, _this54.$updateBoxShadow);
    _this54.heightChanged.connect(_this54, _this54.$updateBoxShadow);
    _this54.spreadChanged.connect(_this54, _this54.$onSpreadChanged);
    return _this54;
  }

  _createClass(QtGraphicalEffects_RectangularGlow, [{
    key: "$onColorChanged",
    value: function $onColorChanged(newVal) {
      this.impl.style.backgroundColor = newVal.$css;
      this.$updateBoxShadow();
    }
  }, {
    key: "$onSpreadChanged",
    value: function $onSpreadChanged(newVal) {
      if (newVal > 1) {
        this.spread = 1;
      } else if (newVal < 0) {
        this.spread = 0;
      }
      this.$updateBoxShadow();
    }
  }, {
    key: "$updateBoxShadow",
    value: function $updateBoxShadow() {
      var color = this.color,
          glowRadius = this.glowRadius,
          cornerRadius = this.cornerRadius,
          spread = this.spread,
          width = this.width,
          height = this.height;

      var style = this.impl.style;

      // Calculate boxShadow
      var totle = glowRadius + cornerRadius * (1 - spread);
      var glow = (1 - spread) * totle;
      var blur_radius = glow * 0.64;
      var spread_radius = totle - blur_radius;
      var glow2 = glowRadius / 5;
      var blur_radius_2 = glow2 * 0.8;
      var spread_radius_2 = glow2 - blur_radius_2;

      style.boxShadow = color + " 0px 0px " + blur_radius + "px " + spread_radius + "px," + (color + " 0px 0px " + blur_radius_2 + "px " + spread_radius_2 + "px");

      // Calculate glow css
      var spread_cornerR = cornerRadius * (1 - spread);
      var rest_cornerR = cornerRadius - spread_cornerR;
      var xScale = (width - spread_cornerR / 4) / width;
      var yScale = (height - spread_cornerR / 4) / height;

      style.width = width - spread_cornerR + "px";
      style.height = height - spread_cornerR + "px";
      style.top = spread_cornerR / 2 + "px";
      style.left = spread_cornerR / 2 + "px";
      style.filter = "blur(" + spread_cornerR / 2 + "px)";
      style.borderRadius = rest_cornerR / 2 + "px";
      style.transform = "scale(" + xScale + "," + yScale + ")";
    }
  }]);

  return QtGraphicalEffects_RectangularGlow;
}(QtQuick_Item);

QtGraphicalEffects_RectangularGlow.properties = {
  cached: "bool",
  color: { type: "color", initialValue: "white" },
  cornerRadius: "real",
  glowRadius: "real",
  spread: "real"
};

QmlWeb.registerQmlType(QtGraphicalEffects_RectangularGlow);

// eslint-disable-next-line no-undef

var QtMobility_GeoLocation = function (_QtQuick_Item6) {
  _inherits(QtMobility_GeoLocation, _QtQuick_Item6);

  function QtMobility_GeoLocation(meta) {
    _classCallCheck(this, QtMobility_GeoLocation);

    var _this55 = _possibleConstructorReturn(this, (QtMobility_GeoLocation.__proto__ || Object.getPrototypeOf(QtMobility_GeoLocation)).call(this, meta));

    if (!navigator.geolocation) {
      return _possibleConstructorReturn(_this55);
    }

    navigator.geolocation.getCurrentPosition(function (pos) {
      return _this55.$updatePosition(pos);
    });
    navigator.geolocation.watchPosition(function (pos) {
      return _this55.$updatePosition(pos);
    });
    return _this55;
  }

  _createClass(QtMobility_GeoLocation, [{
    key: "$updatePosition",
    value: function $updatePosition(position) {
      this.accuracy = position.coords.accuracy;
      this.altitude = position.coords.altitude;
      this.altitudeAccuracy = position.coords.altitudeAccuracy;
      this.heading = position.coords.heading;
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.speed = position.coords.speed;
      this.timestamp = position.timestamp;
    }
  }]);

  return QtMobility_GeoLocation;
}(QtQuick_Item);

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

var QtMultimedia_Video = function (_QtQuick_Item7) {
  _inherits(QtMultimedia_Video, _QtQuick_Item7);

  function QtMultimedia_Video(meta) {
    _classCallCheck(this, QtMultimedia_Video);

    var _this56 = _possibleConstructorReturn(this, (QtMultimedia_Video.__proto__ || Object.getPrototypeOf(QtMultimedia_Video)).call(this, meta));

    _this56.$runningEventListener = 0;

    _this56.impl = document.createElement("video");
    _this56.impl.style.width = _this56.impl.style.height = "100%";
    _this56.impl.style.margin = "0";
    _this56.dom.appendChild(_this56.impl);

    _this56.volume = _this56.impl.volume;
    _this56.duration = _this56.impl.duration;

    _this56.impl.addEventListener("play", function () {
      _this56.playing();
      _this56.playbackState = _this56.MediaPlayer.PlayingState;
    });

    _this56.impl.addEventListener("pause", function () {
      _this56.paused();
      _this56.playbackState = _this56.MediaPlayer.PausedState;
    });

    _this56.impl.addEventListener("timeupdate", function () {
      _this56.$runningEventListener++;
      _this56.position = _this56.impl.currentTime * 1000;
      _this56.$runningEventListener--;
    });

    _this56.impl.addEventListener("ended", function () {
      _this56.stopped();
      _this56.playbackState = _this56.MediaPlayer.StoppedState;
    });

    _this56.impl.addEventListener("progress", function () {
      if (_this56.impl.buffered.length > 0) {
        _this56.progress = _this56.impl.buffered.end(0) / _this56.impl.duration;
        _this56.status = _this56.progress < 1 ? _this56.MediaPlayer.Buffering : _this56.MediaPlayer.Buffered;
      }
    });

    _this56.impl.addEventListener("stalled", function () {
      _this56.status = _this56.MediaPlayer.Stalled;
    });

    _this56.impl.addEventListener("canplaythrough", function () {
      _this56.status = _this56.MediaPlayer.Buffered;
    });

    _this56.impl.addEventListener("loadstart", function () {
      _this56.status = _this56.MediaPlayer.Loading;
    });

    _this56.impl.addEventListener("durationchanged", function () {
      _this56.duration = _this56.impl.duration;
    });

    _this56.impl.addEventListener("volumechanged", function () {
      _this56.$runningEventListener++;
      _this56.volume = _this56.impl.volume;
      _this56.$runningEventListener--;
    });

    _this56.impl.addEventListener("suspend", function () {
      _this56.error |= _this56.MediaPlayer.NetworkError;
    });

    _this56.impl.addEventListener("error", function () {
      _this56.error |= _this56.MediaPlayer.ResourceError;
    });

    _this56.impl.addEventListener("ratechange", function () {
      _this56.$runningEventListener++;
      _this56.playbackRate = _this56.impl.playbackRate;
      _this56.$runningEventListener--;
    });

    _this56.autoPlayChanged.connect(_this56, _this56.$onAutoPlayChanged);
    _this56.sourceChanged.connect(_this56, _this56.$onSourceChanged);
    _this56.positionChanged.connect(_this56, _this56.$onPositionChanged);
    _this56.volumeChanged.connect(_this56, _this56.$onVolumeChanged);
    _this56.playbackRateChanged.connect(_this56, _this56.$onPlaybackRateChanged);
    _this56.mutedChanged.connect(_this56, _this56.$onMutedChanged);
    _this56.fillModeChanged.connect(_this56, _this56.$onFillModeChanged);
    return _this56;
  }

  _createClass(QtMultimedia_Video, [{
    key: "$onAutoPlayChanged",
    value: function $onAutoPlayChanged(newVal) {
      this.impl.autoplay = newVal;
    }
  }, {
    key: "$onSourceChanged",
    value: function $onSourceChanged(source) {
      var parts = source.split(".");
      var extension = parts[parts.length - 1].toLowerCase();
      var mime = this.mimetypeFromExtension(extension);
      this.impl.src = source;
      if (!this.impl.canPlayType(mime)) {
        this.error |= this.MediaPlayer.FormatError;
      }
    }
  }, {
    key: "$onPositionChanged",
    value: function $onPositionChanged(currentTime) {
      if (this.$runningEventListener > 0) return;
      this.impl.currentTime = currentTime / 1000;
    }
  }, {
    key: "$onVolumeChanged",
    value: function $onVolumeChanged(volume) {
      if (this.$runningEventListener > 0) return;
      this.impl.volume = volume;
    }
  }, {
    key: "$onPlaybackRateChanged",
    value: function $onPlaybackRateChanged(playbackRate) {
      if (this.$runningEventListener > 0) return;
      this.impl.playbackRate = playbackRate;
    }
  }, {
    key: "$onMutedChanged",
    value: function $onMutedChanged(newValue) {
      if (newValue) {
        this.$volulmeBackup = this.impl.volume;
        this.volume = 0;
      } else {
        this.volume = this.$volumeBackup;
      }
    }
  }, {
    key: "$onFillModeChanged",
    value: function $onFillModeChanged(newValue) {
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
  }, {
    key: "pause",
    value: function pause() {
      this.impl.pause();
    }
  }, {
    key: "play",
    value: function play() {
      this.impl.play();
    }
  }, {
    key: "seek",
    value: function seek(offset) {
      this.impl.currentTime = offset * 1000;
    }
  }, {
    key: "stop",
    value: function stop() {}
  }, {
    key: "mimetypeFromExtension",
    value: function mimetypeFromExtension(extension) {
      var mimetypes = {
        ogg: "video/ogg",
        ogv: "video/ogg",
        ogm: "video/ogg",
        mp4: "video/mp4",
        webm: "video/webm"
      };
      return mimetypes[extension] || "";
    }
  }]);

  return QtMultimedia_Video;
}(QtQuick_Item);

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

var QtMultimedia_VideoOutput = function (_QtQuick_Item8) {
  _inherits(QtMultimedia_VideoOutput, _QtQuick_Item8);

  function QtMultimedia_VideoOutput() {
    _classCallCheck(this, QtMultimedia_VideoOutput);

    return _possibleConstructorReturn(this, (QtMultimedia_VideoOutput.__proto__ || Object.getPrototypeOf(QtMultimedia_VideoOutput)).apply(this, arguments));
  }

  return QtMultimedia_VideoOutput;
}(QtQuick_Item);

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

var QtQuick_Controls_2_Control = function (_QtQuick_Item9) {
  _inherits(QtQuick_Controls_2_Control, _QtQuick_Item9);

  function QtQuick_Controls_2_Control() {
    _classCallCheck(this, QtQuick_Controls_2_Control);

    return _possibleConstructorReturn(this, (QtQuick_Controls_2_Control.__proto__ || Object.getPrototypeOf(QtQuick_Controls_2_Control)).apply(this, arguments));
  }

  return QtQuick_Controls_2_Control;
}(QtQuick_Item);

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

var QtQuick_Controls_2_AbstractButton = function (_QtQuick_Controls_2_C) {
  _inherits(QtQuick_Controls_2_AbstractButton, _QtQuick_Controls_2_C);

  function QtQuick_Controls_2_AbstractButton(meta) {
    _classCallCheck(this, QtQuick_Controls_2_AbstractButton);

    var _this59 = _possibleConstructorReturn(this, (QtQuick_Controls_2_AbstractButton.__proto__ || Object.getPrototypeOf(QtQuick_Controls_2_AbstractButton)).call(this, meta));

    _this59.icon = new QmlWeb.QObject(_this59);
    QmlWeb.createProperties(_this59.icon, {
      name: "string",
      source: "url",
      width: "int",
      height: "int",
      color: "color"
    });

    // TODO
    return _this59;
  }

  return QtQuick_Controls_2_AbstractButton;
}(QtQuick_Controls_2_Control);

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

var QtQuick_Controls_2_Container = function (_QtQuick_Controls_2_C2) {
  _inherits(QtQuick_Controls_2_Container, _QtQuick_Controls_2_C2);

  function QtQuick_Controls_2_Container(meta) {
    _classCallCheck(this, QtQuick_Controls_2_Container);

    var _this60 = _possibleConstructorReturn(this, (QtQuick_Controls_2_Container.__proto__ || Object.getPrototypeOf(QtQuick_Controls_2_Container)).call(this, meta));

    _this60.widthChanged.connect(_this60, _this60.layoutChildren);
    _this60.heightChanged.connect(_this60, _this60.layoutChildren);
    _this60.childrenChanged.connect(_this60, _this60.layoutChildren);
    _this60.childrenChanged.connect(_this60, _this60.$onChildrenChanged);
    _this60.layoutChildren();
    return _this60;
  }

  _createClass(QtQuick_Controls_2_Container, [{
    key: "$onChildrenChanged",
    value: function $onChildrenChanged() {
      var flags = QmlWeb.Signal.UniqueConnection;
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        child.widthChanged.connect(this, this.layoutChildren, flags);
        child.heightChanged.connect(this, this.layoutChildren, flags);
        child.visibleChanged.connect(this, this.layoutChildren, flags);
      }
    }
  }, {
    key: "layoutChildren",
    value: function layoutChildren() {
      // noop, defined in individual positioners
    }
  }]);

  return QtQuick_Controls_2_Container;
}(QtQuick_Controls_2_Control);

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

var QtQuick_Controls_2_Page = function (_QtQuick_Controls_2_C3) {
  _inherits(QtQuick_Controls_2_Page, _QtQuick_Controls_2_C3);

  function QtQuick_Controls_2_Page() {
    _classCallCheck(this, QtQuick_Controls_2_Page);

    return _possibleConstructorReturn(this, (QtQuick_Controls_2_Page.__proto__ || Object.getPrototypeOf(QtQuick_Controls_2_Page)).apply(this, arguments));
  }

  return QtQuick_Controls_2_Page;
}(QtQuick_Controls_2_Control);

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

var QtQuick_Controls_2_SwipeView = function (_QtQuick_Controls_2_C4) {
  _inherits(QtQuick_Controls_2_SwipeView, _QtQuick_Controls_2_C4);

  function QtQuick_Controls_2_SwipeView() {
    _classCallCheck(this, QtQuick_Controls_2_SwipeView);

    return _possibleConstructorReturn(this, (QtQuick_Controls_2_SwipeView.__proto__ || Object.getPrototypeOf(QtQuick_Controls_2_SwipeView)).apply(this, arguments));
  }

  _createClass(QtQuick_Controls_2_SwipeView, [{
    key: "layoutChildren",


    // TODO

    value: function layoutChildren() {
      var pos = 0;
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (!child.visible) continue;
        child.height = this.height;
        child.width = this.width;
        child.x = pos;
        pos += child.width;
      }
    }
  }]);

  return QtQuick_Controls_2_SwipeView;
}(QtQuick_Controls_2_Container);

QtQuick_Controls_2_SwipeView.versions = /^2\./;
QtQuick_Controls_2_SwipeView.properties = {
  horizontal: "bool",
  interactive: "bool",
  orientation: "enum",
  vertical: "bool"
};

QmlWeb.registerQmlType(QtQuick_Controls_2_SwipeView);

// eslint-disable-next-line no-undef

var QtQuick_Controls_2_TabBar = function (_QtQuick_Controls_2_C5) {
  _inherits(QtQuick_Controls_2_TabBar, _QtQuick_Controls_2_C5);

  function QtQuick_Controls_2_TabBar() {
    _classCallCheck(this, QtQuick_Controls_2_TabBar);

    return _possibleConstructorReturn(this, (QtQuick_Controls_2_TabBar.__proto__ || Object.getPrototypeOf(QtQuick_Controls_2_TabBar)).apply(this, arguments));
  }

  return QtQuick_Controls_2_TabBar;
}(QtQuick_Controls_2_Container);

QtQuick_Controls_2_TabBar.versions = /^2\./;
QtQuick_Controls_2_TabBar.properties = {
  contentHeight: "real",
  contentWidth: "real",
  position: "enum"
};

QmlWeb.registerQmlType(QtQuick_Controls_2_TabBar);

// eslint-disable-next-line no-undef

var QtQuick_Controls_2_TabButton = function (_QtQuick_Controls_2_A) {
  _inherits(QtQuick_Controls_2_TabButton, _QtQuick_Controls_2_A);

  function QtQuick_Controls_2_TabButton() {
    _classCallCheck(this, QtQuick_Controls_2_TabButton);

    return _possibleConstructorReturn(this, (QtQuick_Controls_2_TabButton.__proto__ || Object.getPrototypeOf(QtQuick_Controls_2_TabButton)).apply(this, arguments));
  }

  return QtQuick_Controls_2_TabButton;
}(QtQuick_Controls_2_AbstractButton);

QtQuick_Controls_2_TabButton.versions = /^2\./;

QmlWeb.registerQmlType(QtQuick_Controls_2_TabButton);

// eslint-disable-next-line no-undef

var QtQuick_Controls_Button = function (_QtQuick_Item10) {
  _inherits(QtQuick_Controls_Button, _QtQuick_Item10);

  function QtQuick_Controls_Button(meta) {
    _classCallCheck(this, QtQuick_Controls_Button);

    var _this65 = _possibleConstructorReturn(this, (QtQuick_Controls_Button.__proto__ || Object.getPrototypeOf(QtQuick_Controls_Button)).call(this, meta));

    _this65.Component.completed.connect(_this65, _this65.Component$onCompleted);
    _this65.textChanged.connect(_this65, _this65.$onTextChanged);
    _this65.enabledChanged.connect(_this65, _this65.$onEnabledChanged);

    var button = _this65.impl = document.createElement("button");
    button.style.pointerEvents = "auto";
    _this65.dom.appendChild(button);

    button.onclick = function () {
      _this65.clicked();
    };
    return _this65;
  }

  _createClass(QtQuick_Controls_Button, [{
    key: "Component$onCompleted",
    value: function Component$onCompleted() {
      this.implicitWidth = this.impl.offsetWidth;
      this.implicitHeight = this.impl.offsetHeight;
    }
  }, {
    key: "$onTextChanged",
    value: function $onTextChanged(newVal) {
      this.impl.textContent = newVal;
      //TODO: Replace those statically sized borders
      this.implicitWidth = this.impl.offsetWidth;
      this.implicitHeight = this.impl.offsetHeight;
    }
  }, {
    key: "$onEnabledChanged",
    value: function $onEnabledChanged(newVal) {
      this.impl.disabled = !newVal;
    }
  }]);

  return QtQuick_Controls_Button;
}(QtQuick_Item);

QtQuick_Controls_Button.properties = {
  text: "string",
  enabled: { type: "bool", initialValue: true }
};
QtQuick_Controls_Button.signals = {
  clicked: []
};

QmlWeb.registerQmlType(QtQuick_Controls_Button);

// eslint-disable-next-line no-undef

var QtQuick_Controls_CheckBox = function (_QtQuick_Item11) {
  _inherits(QtQuick_Controls_CheckBox, _QtQuick_Item11);

  function QtQuick_Controls_CheckBox(meta) {
    _classCallCheck(this, QtQuick_Controls_CheckBox);

    var _this66 = _possibleConstructorReturn(this, (QtQuick_Controls_CheckBox.__proto__ || Object.getPrototypeOf(QtQuick_Controls_CheckBox)).call(this, meta));

    _this66.impl = document.createElement("label");
    _this66.impl.style.pointerEvents = "auto";

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.verticalAlign = "text-bottom";
    checkbox.addEventListener("change", function () {
      _this66.checked = checkbox.checked;
    });
    _this66.impl.appendChild(checkbox);

    var span = document.createElement("span");
    _this66.impl.appendChild(span);

    _this66.dom.appendChild(_this66.impl);

    _this66.Component.completed.connect(_this66, _this66.Component$onCompleted);
    _this66.textChanged.connect(_this66, _this66.$onTextChanged);
    _this66.colorChanged.connect(_this66, _this66.$onColorChanged);
    _this66.checkedChanged.connect(_this66, _this66.$onCheckedChanged);
    return _this66;
  }

  _createClass(QtQuick_Controls_CheckBox, [{
    key: "$onTextChanged",
    value: function $onTextChanged(newVal) {
      this.impl.children[1].innerHTML = newVal;
      this.implicitHeight = this.impl.offsetHeight;
      this.implicitWidth = this.impl.offsetWidth > 0 ? this.impl.offsetWidth + 4 : 0;
    }
  }, {
    key: "$onColorChanged",
    value: function $onColorChanged(newVal) {
      this.impl.children[1].style.color = newVal.$css;
    }
  }, {
    key: "$onCheckedChanged",
    value: function $onCheckedChanged() {
      this.impl.children[0].checked = this.checked;
    }
  }, {
    key: "Component$onCompleted",
    value: function Component$onCompleted() {
      this.implicitHeight = this.impl.offsetHeight;
      this.implicitWidth = this.impl.offsetWidth > 0 ? this.impl.offsetWidth + 4 : 0;
    }
  }]);

  return QtQuick_Controls_CheckBox;
}(QtQuick_Item);

QtQuick_Controls_CheckBox.properties = {
  text: "string",
  font: "font",
  checked: "bool",
  color: "color"
};

QmlWeb.registerQmlType(QtQuick_Controls_CheckBox);

// eslint-disable-next-line no-undef

var QtQuick_Controls_ComboBox = function (_QtQuick_Item12) {
  _inherits(QtQuick_Controls_ComboBox, _QtQuick_Item12);

  function QtQuick_Controls_ComboBox(meta) {
    _classCallCheck(this, QtQuick_Controls_ComboBox);

    var _this67 = _possibleConstructorReturn(this, (QtQuick_Controls_ComboBox.__proto__ || Object.getPrototypeOf(QtQuick_Controls_ComboBox)).call(this, meta));

    _this67.dom.style.pointerEvents = "auto";
    _this67.name = "QMLComboBox";

    // TODO change innerHTML to DOM
    _this67.dom.innerHTML = "<select></select>";
    _this67.impl = _this67.dom.firstChild;

    _this67.Component.completed.connect(_this67, _this67.Component$onCompleted);
    _this67.modelChanged.connect(_this67, _this67.$onModelChanged);
    _this67.currentIndexChanged.connect(_this67, _this67.$onCurrentIndexChanged);
    _this67.heightChanged.connect(_this67, _this67.$onHeightChanged);
    _this67.widthChanged.connect(_this67, _this67.$onWidthChanged);

    _this67.dom.onclick = function () {
      var index = _this67.dom.firstChild.selectedIndex;
      _this67.currentIndex = index;
      _this67.currentText = _this67.model[index];
      _this67.accepted();
      _this67.activated(index);
    };
    return _this67;
  }

  _createClass(QtQuick_Controls_ComboBox, [{
    key: "find",
    value: function find(text) {
      return this.model.indexOf(text);
    }
  }, {
    key: "selectAll",
    value: function selectAll() {
      // TODO
    }
  }, {
    key: "textAt",
    value: function textAt(index) {
      return this.model[index];
    }
  }, {
    key: "$updateImpl",
    value: function $updateImpl() {
      this.count = this.model.length;

      var k = this.count;var m = this.model;

      this.impl.options.length = k;
      for (var i = 0; i < k; i++) {
        this.impl.options[i] = new Option(m[i]);
      }

      // should call this, because width()/heights() invoke updateV(H)Geometry,
      // which in turn sets valid $useImplicitHeight flag
      var h = this.height;var w = this.width;

      this.implicitWidth = this.impl.offsetWidth;
      this.implicitHeight = this.impl.offsetHeight;

      this.$onHeightChanged(h);
      this.$onWidthChanged(w);

      this.impl.selectedIndex = this.currentIndex;
      this.$updateCurrentText();
    }
  }, {
    key: "Component$onCompleted",
    value: function Component$onCompleted() {
      this.$updateImpl();
    }
  }, {
    key: "$onModelChanged",
    value: function $onModelChanged() {
      this.$updateImpl();
    }
  }, {
    key: "$onCurrentIndexChanged",
    value: function $onCurrentIndexChanged() {
      var i = this.currentIndex;
      if (this.impl.selectedIndex !== i) {
        this.impl.selectedIndex = i;
        this.$updateCurrentText();
        this.activated(i);
      }
    }
  }, {
    key: "$updateCurrentText",
    value: function $updateCurrentText() {
      if (typeof this.currentIndex === "undefined" || !this.model) {
        this.currentText = undefined;
      } else if (this.currentIndex >= 0 && this.currentIndex < this.model.length) {
        this.currentText = this.model[this.currentIndex];
      }
    }
  }, {
    key: "$onHeightChanged",
    value: function $onHeightChanged() {
      if (this.height > 0 && this.impl && this.height !== this.impl.offsetHeight) {
        this.impl.style.height = this.height + "px";
      }
    }
  }, {
    key: "$onWidthChanged",
    value: function $onWidthChanged() {
      if (this.width > 0 && this.impl && this.width !== this.impl.offsetWidth) {
        this.impl.style.width = this.width + "px";
      }
    }
  }]);

  return QtQuick_Controls_ComboBox;
}(QtQuick_Item);

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

var QtQuick_Controls_ScrollView = function (_QtQuick_Item13) {
  _inherits(QtQuick_Controls_ScrollView, _QtQuick_Item13);

  function QtQuick_Controls_ScrollView(meta) {
    _classCallCheck(this, QtQuick_Controls_ScrollView);

    var _this68 = _possibleConstructorReturn(this, (QtQuick_Controls_ScrollView.__proto__ || Object.getPrototypeOf(QtQuick_Controls_ScrollView)).call(this, meta));

    _this68.css.pointerEvents = "auto";
    _this68.setupFocusOnDom(_this68.dom);

    _this68.contentItemChanged.connect(_this68, _this68.$onContentItemChanged);
    _this68.flickableItemChanged.connect(_this68, _this68.$onFlickableItemChanged);
    _this68.viewportChanged.connect(_this68, _this68.$onViewportChanged);
    _this68.frameVisibleChanged.connect(_this68, _this68.$onFrameVisibleChanged);
    _this68.highlightOnFocusChanged.connect(_this68, _this68.$onHighlightOnFocusChanged);
    _this68.horizontalScrollBarPolicyChanged.connect(_this68, _this68.$onHorizontalScrollBarPolicyChanged);
    _this68.verticalScrollBarPolicyChanged.connect(_this68, _this68.$onVerticalScrollBarPolicyChanged);
    _this68.styleChanged.connect(_this68, _this68.$onStyleChanged);
    _this68.childrenChanged.connect(_this68, _this68.$onChildrenChanged);
    _this68.focusChanged.connect(_this68, _this68.$onFocusChanged);

    _this68.width = _this68.implicitWidth = 240; // default QML ScrollView width
    _this68.height = _this68.implicitHeight = 150; // default QML ScrollView height
    _this68.width = _this68.implicitWidth;
    _this68.height = _this68.implicitHeight;

    var Qt = QmlWeb.Qt;
    _this68.contentItem = undefined;
    _this68.flickableItem = undefined;
    _this68.viewport = undefined;
    _this68.frameVisible = false;
    _this68.highlightOnFocus = false;

    _this68.verticalScrollBarPolicy = Qt.ScrollBarAsNeeded;
    _this68.horizontalScrollBarPolicy = Qt.ScrollBarAsNeeded;
    _this68.style = undefined;

    _this68.$onVerticalScrollBarPolicyChanged(_this68.verticalScrollBarPolicy);
    _this68.$onHorizontalScrollBarPolicyChanged(_this68.horizontalScrollBarPolicy);
    return _this68;
  }

  _createClass(QtQuick_Controls_ScrollView, [{
    key: "$onContentItemChanged",
    value: function $onContentItemChanged(newItem) {
      if (newItem) {
        newItem.parent = this;
      }
    }
  }, {
    key: "$onFlickableItemChanged",
    value: function $onFlickableItemChanged() {}
  }, {
    key: "$onHighlightOnFocusChanged",
    value: function $onHighlightOnFocusChanged() {}
  }, {
    key: "$onViewportChanged",
    value: function $onViewportChanged() {}
  }, {
    key: "$onFocusChanged",
    value: function $onFocusChanged(focus) {
      this.css.outline = this.highlight && focus ? "outline: lightblue solid 2px;" : "";
    }
  }, {
    key: "$onFrameVisibleChanged",
    value: function $onFrameVisibleChanged(visible) {
      this.css.border = visible ? "1px solid gray" : "hidden";
    }
  }, {
    key: "$onHorizontalScrollBarPolicyChanged",
    value: function $onHorizontalScrollBarPolicyChanged(newPolicy) {
      this.css.overflowX = this.$scrollBarPolicyToCssOverflow(newPolicy);
    }
  }, {
    key: "$onVerticalScrollBarPolicyChanged",
    value: function $onVerticalScrollBarPolicyChanged(newPolicy) {
      this.css.overflowY = this.$scrollBarPolicyToCssOverflow(newPolicy);
    }
  }, {
    key: "$onStyleChanged",
    value: function $onStyleChanged() {}
  }, {
    key: "$onChildrenChanged",
    value: function $onChildrenChanged() {
      if (typeof this.contentItem === "undefined" && this.children.length === 1) {
        this.contentItem = this.children[0];
      }
    }
  }, {
    key: "$scrollBarPolicyToCssOverflow",
    value: function $scrollBarPolicyToCssOverflow(policy) {
      var Qt = QmlWeb.Qt;
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
  }]);

  return QtQuick_Controls_ScrollView;
}(QtQuick_Item);

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

var QtQuick_Controls_TextField = function (_QtQuick_Item14) {
  _inherits(QtQuick_Controls_TextField, _QtQuick_Item14);

  function QtQuick_Controls_TextField(meta) {
    _classCallCheck(this, QtQuick_Controls_TextField);

    var _this69 = _possibleConstructorReturn(this, (QtQuick_Controls_TextField.__proto__ || Object.getPrototypeOf(QtQuick_Controls_TextField)).call(this, meta));

    var input = _this69.impl = document.createElement("input");
    input.type = "text";
    input.disabled = true;
    input.style.pointerEvents = "auto";
    input.style.margin = "0";
    input.style.width = "100%";
    _this69.dom.appendChild(input);
    _this69.setupFocusOnDom(input);
    input.disabled = false;

    _this69.Component.completed.connect(_this69, _this69.Component$onCompleted);
    _this69.textChanged.connect(_this69, _this69.$onTextChanged);
    _this69.echoModeChanged.connect(_this69, _this69.$onEchoModeChanged);
    _this69.maximumLengthChanged.connect(_this69, _this69.$onMaximumLengthChanged);
    _this69.readOnlyChanged.connect(_this69, _this69.$onReadOnlyChanged);
    _this69.Keys.pressed.connect(_this69, _this69.Keys$onPressed);

    _this69.impl.addEventListener("input", function () {
      return _this69.$updateValue();
    });
    return _this69;
  }

  _createClass(QtQuick_Controls_TextField, [{
    key: "Component$onCompleted",
    value: function Component$onCompleted() {
      this.implicitWidth = this.impl.offsetWidth;
      this.implicitHeight = this.impl.offsetHeight;
    }
  }, {
    key: "$onTextChanged",
    value: function $onTextChanged(newVal) {
      // See TextInput for comments
      if (this.impl.value !== newVal) {
        this.impl.value = newVal;
      }
    }
  }, {
    key: "$onEchoModeChanged",
    value: function $onEchoModeChanged(newVal) {
      var TextInput = this.TextInput;
      var input = this.impl;
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
  }, {
    key: "$onMaximumLengthChanged",
    value: function $onMaximumLengthChanged(newVal) {
      this.impl.maxLength = newVal < 0 ? null : newVal;
    }
  }, {
    key: "$onReadOnlyChanged",
    value: function $onReadOnlyChanged(newVal) {
      this.impl.disabled = newVal;
    }
  }, {
    key: "Keys$onPressed",
    value: function Keys$onPressed(e) {
      var Qt = QmlWeb.Qt;
      var submit = e.key === Qt.Key_Return || e.key === Qt.Key_Enter;
      if (submit && this.$testValidator()) {
        this.accepted();
        e.accepted = true;
      }
    }
  }, {
    key: "$testValidator",
    value: function $testValidator() {
      if (this.validator) {
        return this.validator.validate(this.text);
      }
      return true;
    }
  }, {
    key: "$updateValue",
    value: function $updateValue() {
      if (this.text !== this.impl.value) {
        this.$canEditReadOnlyProperties = true;
        this.text = this.impl.value;
        this.$canEditReadOnlyProperties = false;
      }
    }
  }]);

  return QtQuick_Controls_TextField;
}(QtQuick_Item);

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

var QtQuick_Layouts_ColumnLayout = function (_QtQuick_Item15) {
  _inherits(QtQuick_Layouts_ColumnLayout, _QtQuick_Item15);

  function QtQuick_Layouts_ColumnLayout() {
    _classCallCheck(this, QtQuick_Layouts_ColumnLayout);

    return _possibleConstructorReturn(this, (QtQuick_Layouts_ColumnLayout.__proto__ || Object.getPrototypeOf(QtQuick_Layouts_ColumnLayout)).apply(this, arguments));
  }

  return QtQuick_Layouts_ColumnLayout;
}(QtQuick_Item);

QtQuick_Layouts_ColumnLayout.versions = /^1\./;
QtQuick_Layouts_ColumnLayout.properties = {
  layoutDirection: "enum",
  spacing: "real"
};

QmlWeb.registerQmlType(QtQuick_Layouts_ColumnLayout);

// eslint-disable-next-line no-undef

var QtQuick_Layouts_GridLayout = function (_QtQuick_Item16) {
  _inherits(QtQuick_Layouts_GridLayout, _QtQuick_Item16);

  function QtQuick_Layouts_GridLayout() {
    _classCallCheck(this, QtQuick_Layouts_GridLayout);

    return _possibleConstructorReturn(this, (QtQuick_Layouts_GridLayout.__proto__ || Object.getPrototypeOf(QtQuick_Layouts_GridLayout)).apply(this, arguments));
  }

  return QtQuick_Layouts_GridLayout;
}(QtQuick_Item);

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

var QtQuick_Layouts_RowLayout = function (_QtQuick_Item17) {
  _inherits(QtQuick_Layouts_RowLayout, _QtQuick_Item17);

  function QtQuick_Layouts_RowLayout() {
    _classCallCheck(this, QtQuick_Layouts_RowLayout);

    return _possibleConstructorReturn(this, (QtQuick_Layouts_RowLayout.__proto__ || Object.getPrototypeOf(QtQuick_Layouts_RowLayout)).apply(this, arguments));
  }

  return QtQuick_Layouts_RowLayout;
}(QtQuick_Item);

QtQuick_Layouts_RowLayout.versions = /^1\./;
QtQuick_Layouts_RowLayout.properties = {
  layoutDirection: "enum",
  spacing: "real"
};

QmlWeb.registerQmlType(QtQuick_Layouts_RowLayout);

// eslint-disable-next-line no-undef

var QtQuick_Layouts_StackLayout = function (_QtQuick_Item18) {
  _inherits(QtQuick_Layouts_StackLayout, _QtQuick_Item18);

  function QtQuick_Layouts_StackLayout() {
    _classCallCheck(this, QtQuick_Layouts_StackLayout);

    return _possibleConstructorReturn(this, (QtQuick_Layouts_StackLayout.__proto__ || Object.getPrototypeOf(QtQuick_Layouts_StackLayout)).apply(this, arguments));
  }

  return QtQuick_Layouts_StackLayout;
}(QtQuick_Item);

QtQuick_Layouts_StackLayout.versions = /^1\./;
QtQuick_Layouts_StackLayout.properties = {
  count: "int",
  currentIndex: "int"
};

QmlWeb.registerQmlType(QtQuick_Layouts_StackLayout);

// eslint-disable-next-line no-undef

var QtQuick_Particles_Emitter = function (_QtQuick_Item19) {
  _inherits(QtQuick_Particles_Emitter, _QtQuick_Item19);

  function QtQuick_Particles_Emitter() {
    _classCallCheck(this, QtQuick_Particles_Emitter);

    return _possibleConstructorReturn(this, (QtQuick_Particles_Emitter.__proto__ || Object.getPrototypeOf(QtQuick_Particles_Emitter)).apply(this, arguments));
  }

  _createClass(QtQuick_Particles_Emitter, [{
    key: "burst",


    // TODO

    value: function burst() /*count, x, y*/{
      // TODO
    }
  }, {
    key: "pulse",
    value: function pulse(duration) {
      var _this75 = this;

      if (this.enabled) return;
      this.enabled = true;
      setTimeout(function () {
        _this75.enabled = false;
      }, duration);
    }
  }]);

  return QtQuick_Particles_Emitter;
}(QtQuick_Item);

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

var QtQuick_Particles_ParticlePainter = function (_QtQuick_Item20) {
  _inherits(QtQuick_Particles_ParticlePainter, _QtQuick_Item20);

  function QtQuick_Particles_ParticlePainter() {
    _classCallCheck(this, QtQuick_Particles_ParticlePainter);

    return _possibleConstructorReturn(this, (QtQuick_Particles_ParticlePainter.__proto__ || Object.getPrototypeOf(QtQuick_Particles_ParticlePainter)).apply(this, arguments));
  }

  return QtQuick_Particles_ParticlePainter;
}(QtQuick_Item);

QtQuick_Particles_ParticlePainter.versions = /^2\./;
QtQuick_Particles_ParticlePainter.properties = {
  groups: "list",
  system: "ParticleSystem"
};

QmlWeb.registerQmlType(QtQuick_Particles_ParticlePainter);

// eslint-disable-next-line no-undef, max-len

var QtQuick_Particles_CustomParticle = function (_QtQuick_Particles_Pa) {
  _inherits(QtQuick_Particles_CustomParticle, _QtQuick_Particles_Pa);

  function QtQuick_Particles_CustomParticle() {
    _classCallCheck(this, QtQuick_Particles_CustomParticle);

    return _possibleConstructorReturn(this, (QtQuick_Particles_CustomParticle.__proto__ || Object.getPrototypeOf(QtQuick_Particles_CustomParticle)).apply(this, arguments));
  }

  return QtQuick_Particles_CustomParticle;
}(QtQuick_Particles_ParticlePainter);

QtQuick_Particles_CustomParticle.versions = /^2\./;
QtQuick_Particles_CustomParticle.properties = {
  fragmentShader: "string",
  vertexShader: "string"
};

QmlWeb.registerQmlType(QtQuick_Particles_CustomParticle);

// eslint-disable-next-line no-undef

var QtQuick_Particles_ParticleSystem = function (_QtQuick_Item21) {
  _inherits(QtQuick_Particles_ParticleSystem, _QtQuick_Item21);

  function QtQuick_Particles_ParticleSystem() {
    _classCallCheck(this, QtQuick_Particles_ParticleSystem);

    return _possibleConstructorReturn(this, (QtQuick_Particles_ParticleSystem.__proto__ || Object.getPrototypeOf(QtQuick_Particles_ParticleSystem)).apply(this, arguments));
  }

  _createClass(QtQuick_Particles_ParticleSystem, [{
    key: "pause",


    // TODO

    value: function pause() {
      this.paused = true;
    }
  }, {
    key: "reset",
    value: function reset() {
      // TODO
    }
  }, {
    key: "restart",
    value: function restart() {
      this.running = false;
      this.running = true;
    }
  }, {
    key: "resume",
    value: function resume() {
      this.paused = false;
    }
  }, {
    key: "start",
    value: function start() {
      this.running = true;
    }
  }, {
    key: "stop",
    value: function stop() {
      this.running = false;
    }
  }]);

  return QtQuick_Particles_ParticleSystem;
}(QtQuick_Item);

QtQuick_Particles_ParticleSystem.versions = /^2\./;
QtQuick_Particles_ParticleSystem.properties = {
  empty: "bool",
  particleStates: "list",
  paused: "bool",
  running: { type: "bool", initialValue: true }
};

QmlWeb.registerQmlType(QtQuick_Particles_ParticleSystem);

// eslint-disable-next-line no-undef

var QtQuick_Window_Window = function (_QtQuick_Item22) {
  _inherits(QtQuick_Window_Window, _QtQuick_Item22);

  function QtQuick_Window_Window(meta) {
    _classCallCheck(this, QtQuick_Window_Window);

    var _this79 = _possibleConstructorReturn(this, (QtQuick_Window_Window.__proto__ || Object.getPrototypeOf(QtQuick_Window_Window)).call(this, meta));

    _this79.colorChanged.connect(_this79, _this79.$onColorChanged);
    return _this79;
  }

  _createClass(QtQuick_Window_Window, [{
    key: "$onColorChanged",
    value: function $onColorChanged(newVal) {
      this.dom.style.backgroundColor = newVal.$css;
    }
  }]);

  return QtQuick_Window_Window;
}(QtQuick_Item);

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

var QtQuick_Controls_2_ApplicationWindow = function (_QtQuick_Window_Windo) {
  _inherits(QtQuick_Controls_2_ApplicationWindow, _QtQuick_Window_Windo);

  function QtQuick_Controls_2_ApplicationWindow() {
    _classCallCheck(this, QtQuick_Controls_2_ApplicationWindow);

    return _possibleConstructorReturn(this, (QtQuick_Controls_2_ApplicationWindow.__proto__ || Object.getPrototypeOf(QtQuick_Controls_2_ApplicationWindow)).apply(this, arguments));
  }

  return QtQuick_Controls_2_ApplicationWindow;
}(QtQuick_Window_Window);

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

var QtQuick_Controls_ApplicationWindow = function (_QtQuick_Window_Windo2) {
  _inherits(QtQuick_Controls_ApplicationWindow, _QtQuick_Window_Windo2);

  function QtQuick_Controls_ApplicationWindow() {
    _classCallCheck(this, QtQuick_Controls_ApplicationWindow);

    return _possibleConstructorReturn(this, (QtQuick_Controls_ApplicationWindow.__proto__ || Object.getPrototypeOf(QtQuick_Controls_ApplicationWindow)).apply(this, arguments));
  }

  return QtQuick_Controls_ApplicationWindow;
}(QtQuick_Window_Window);

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

var QtQuick_BorderImage = function (_QtQuick_Item23) {
  _inherits(QtQuick_BorderImage, _QtQuick_Item23);

  function QtQuick_BorderImage(meta) {
    _classCallCheck(this, QtQuick_BorderImage);

    var _this82 = _possibleConstructorReturn(this, (QtQuick_BorderImage.__proto__ || Object.getPrototypeOf(QtQuick_BorderImage)).call(this, meta));

    _this82.border = new QmlWeb.QObject(_this82);
    QmlWeb.createProperties(_this82.border, {
      left: "int",
      right: "int",
      top: "int",
      bottom: "int"
    });

    var bg = _this82.impl = document.createElement("div");
    bg.style.pointerEvents = "none";
    bg.style.height = "100%";
    bg.style.boxSizing = "border-box";
    _this82.dom.appendChild(bg);

    _this82.$img = new Image();
    _this82.$img.addEventListener("load", function () {
      _this82.progress = 1;
      _this82.status = _this82.BorderImage.Ready;
    });
    _this82.$img.addEventListener("error", function () {
      _this82.status = _this82.BorderImage.Error;
    });

    _this82.sourceChanged.connect(_this82, _this82.$onSourceChanged);
    _this82.border.leftChanged.connect(_this82, _this82.$updateBorder);
    _this82.border.rightChanged.connect(_this82, _this82.$updateBorder);
    _this82.border.topChanged.connect(_this82, _this82.$updateBorder);
    _this82.border.bottomChanged.connect(_this82, _this82.$updateBorder);
    _this82.horizontalTileModeChanged.connect(_this82, _this82.$updateBorder);
    _this82.verticalTileModeChanged.connect(_this82, _this82.$updateBorder);
    _this82.smoothChanged.connect(_this82, _this82.$onSmoothChanged);
    return _this82;
  }

  _createClass(QtQuick_BorderImage, [{
    key: "$onSourceChanged",
    value: function $onSourceChanged(source) {
      this.progress = 0;
      this.status = this.BorderImage.Loading;
      var style = this.impl.style;
      var imageURL = QmlWeb.engine.$resolveImageURL(source);
      style.OBorderImageSource = "url(\"" + imageURL + "\")";
      style.borderImageSource = "url(\"" + imageURL + "\")";
      this.$img.src = imageURL;
      if (this.$img.complete) {
        this.progress = 1;
        this.status = this.BorderImage.Ready;
      }
    }
  }, {
    key: "$updateBorder",
    value: function $updateBorder() {
      var style = this.impl.style;
      var _border = this.border,
          right = _border.right,
          left = _border.left,
          top = _border.top,
          bottom = _border.bottom;

      var slice = top + " " + right + " " + bottom + " " + left + " fill";
      var width = top + "px " + right + "px " + bottom + "px " + left + "px";
      var repeat = this.horizontalTileMode + " " + this.verticalTileMode;
      style.OBorderImageSlice = slice;
      style.OBorderImageRepeat = repeat;
      style.OBorderImageWidth = width;
      style.borderImageSlice = slice;
      style.borderImageRepeat = repeat;
      style.borderImageWidth = width;
    }
  }, {
    key: "$onSmoothChanged",
    value: function $onSmoothChanged(val) {
      var style = this.impl.style;
      if (val) {
        style.imageRendering = "auto";
      } else {
        style.imageRendering = "-webkit-optimize-contrast";
        style.imageRendering = "-moz-crisp-edges";
        style.imageRendering = "crisp-edges";
        style.imageRendering = "pixelated";
      }
    }
  }]);

  return QtQuick_BorderImage;
}(QtQuick_Item);

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

var QtQuick_Canvas = function (_QtQuick_Item24) {
  _inherits(QtQuick_Canvas, _QtQuick_Item24);

  function QtQuick_Canvas() {
    _classCallCheck(this, QtQuick_Canvas);

    return _possibleConstructorReturn(this, (QtQuick_Canvas.__proto__ || Object.getPrototypeOf(QtQuick_Canvas)).apply(this, arguments));
  }

  _createClass(QtQuick_Canvas, [{
    key: "cancelRequestAnimationFrame",
    value: function cancelRequestAnimationFrame() /*handle*/{
      return false;
    }
  }, {
    key: "getContext",
    value: function getContext() /*context_id, ...args*/{
      return {};
    }
  }, {
    key: "isImageError",
    value: function isImageError() /*image*/{
      return true;
    }
  }, {
    key: "isImageLoaded",
    value: function isImageLoaded() /*image*/{
      return false;
    }
  }, {
    key: "isImageLoading",
    value: function isImageLoading() /*image*/{
      return false;
    }
  }, {
    key: "loadImage",
    value: function loadImage(image) {
      //loadImageAsync(image);
      if (this.isImageLoaded(image)) {
        this.imageLoaded();
      }
    }
  }, {
    key: "markDirty",
    value: function markDirty(area) {
      // if dirty
      this.paint(area);
    }
  }, {
    key: "requestAnimationFrame",
    value: function requestAnimationFrame() /*callback*/{
      return 0;
    }
  }, {
    key: "requestPaint",
    value: function requestPaint() {}
  }, {
    key: "save",
    value: function save() /*file_name*/{
      return false;
    }
  }, {
    key: "toDataURL",
    value: function toDataURL() /*mime_type*/{
      return "";
    }
  }, {
    key: "unloadImage",
    value: function unloadImage() /*image*/{}
  }]);

  return QtQuick_Canvas;
}(QtQuick_Item);

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

var QtQuick_DoubleValidator = function (_QtQuick_Item25) {
  _inherits(QtQuick_DoubleValidator, _QtQuick_Item25);

  function QtQuick_DoubleValidator(meta) {
    _classCallCheck(this, QtQuick_DoubleValidator);

    var _this84 = _possibleConstructorReturn(this, (QtQuick_DoubleValidator.__proto__ || Object.getPrototypeOf(QtQuick_DoubleValidator)).call(this, meta));

    _this84.$standardRegExp = /^(-|\+)?\s*[0-9]+(\.[0-9]+)?$/;
    _this84.$scientificRegExp = /^(-|\+)?\s*[0-9]+(\.[0-9]+)?(E(-|\+)?[0-9]+)?$/;
    return _this84;
  }

  _createClass(QtQuick_DoubleValidator, [{
    key: "getRegExpForNotation",
    value: function getRegExpForNotation(notation) {
      switch (notation) {
        case this.DoubleValidator.ScientificNotation:
          return this.$scientificRegExp;
        case this.DoubleValidator.StandardNotation:
          return this.$standardRegExp;
      }
      return null;
    }
  }, {
    key: "$getDecimalsForNumber",
    value: function $getDecimalsForNumber(number) {
      if (Math.round(number) === number) {
        return 0;
      }
      var str = "" + number;
      return (/\d*$/.exec(str)[0].length
      );
    }
  }, {
    key: "validate",
    value: function validate(string) {
      var regExp = this.getRegExpForNotation(this.notation);
      if (!regExp.test(string.trim())) {
        return false;
      }
      var value = parseFloat(string);
      return this.bottom <= value && this.top >= value && this.$getDecimalsForNumber(value) <= this.decimals;
    }
  }]);

  return QtQuick_DoubleValidator;
}(QtQuick_Item);

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

var QtQuick_FocusScope = function (_QtQuick_Item26) {
  _inherits(QtQuick_FocusScope, _QtQuick_Item26);

  function QtQuick_FocusScope() {
    _classCallCheck(this, QtQuick_FocusScope);

    return _possibleConstructorReturn(this, (QtQuick_FocusScope.__proto__ || Object.getPrototypeOf(QtQuick_FocusScope)).apply(this, arguments));
  }

  return QtQuick_FocusScope;
}(QtQuick_Item);

QmlWeb.registerQmlType(QtQuick_FocusScope);

// eslint-disable-next-line no-undef

var QtQuick_Image = function (_QtQuick_Item27) {
  _inherits(QtQuick_Image, _QtQuick_Item27);

  function QtQuick_Image(meta) {
    _classCallCheck(this, QtQuick_Image);

    var _this86 = _possibleConstructorReturn(this, (QtQuick_Image.__proto__ || Object.getPrototypeOf(QtQuick_Image)).call(this, meta));

    _this86.sourceSize = new QmlWeb.QObject(_this86);
    QmlWeb.createProperties(_this86.sourceSize, {
      width: "int",
      height: "int"
    });

    var bg = _this86.impl = document.createElement("div");
    bg.style.pointerEvents = "none";
    bg.style.height = "100%";
    _this86.dom.appendChild(bg);

    _this86.$img = new Image();
    _this86.$img.addEventListener("load", function () {
      var w = _this86.$img.naturalWidth;
      var h = _this86.$img.naturalHeight;
      _this86.sourceSize.width = w;
      _this86.sourceSize.height = h;
      _this86.implicitWidth = w;
      _this86.implicitHeight = h;
      _this86.progress = 1;
      _this86.status = _this86.Image.Ready;
    });
    _this86.$img.addEventListener("error", function () {
      _this86.status = _this86.Image.Error;
    });

    _this86.sourceChanged.connect(_this86, _this86.$onSourceChanged);
    _this86.mirrorChanged.connect(_this86, _this86.$onMirrorChanged);
    _this86.fillModeChanged.connect(_this86, _this86.$onFillModeChanged);
    _this86.smoothChanged.connect(_this86, _this86.$onSmoothChanged);
    return _this86;
  }

  _createClass(QtQuick_Image, [{
    key: "$updateFillMode",
    value: function $updateFillMode() {
      var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.fillMode;

      var style = this.impl.style;
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
  }, {
    key: "$onSourceChanged",
    value: function $onSourceChanged(source) {
      var _this87 = this;

      this.progress = 0;
      this.status = this.Image.Loading;
      var imageURL = QmlWeb.engine.$resolveImageURL(source);
      this.impl.style.backgroundImage = "url(\"" + imageURL + "\")";
      this.$img.src = imageURL;
      if (this.$img.complete) {
        setTimeout(function () {
          _this87.progress = 1;
          _this87.status = _this87.Image.Ready;
        }, 0);
      }
      this.$updateFillMode();
    }
  }, {
    key: "$onMirrorChanged",
    value: function $onMirrorChanged(val) {
      var transformRule = "scale(-1,1)";
      if (!val) {
        var index = this.transform.indexOf(transformRule);
        if (index >= 0) {
          this.transform.splice(index, 1);
        }
      } else {
        this.transform.push(transformRule);
      }
      this.$updateTransform();
    }
  }, {
    key: "$onFillModeChanged",
    value: function $onFillModeChanged(val) {
      this.$updateFillMode(val);
    }
  }, {
    key: "$onSmoothChanged",
    value: function $onSmoothChanged(val) {
      var style = this.impl.style;
      if (val) {
        style.imageRendering = "auto";
      } else {
        style.imageRendering = "-webkit-optimize-contrast";
        style.imageRendering = "-moz-crisp-edges";
        style.imageRendering = "crisp-edges";
        style.imageRendering = "pixelated";
      }
    }
  }]);

  return QtQuick_Image;
}(QtQuick_Item);

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

var QtQuick_AnimatedImage = function (_QtQuick_Image) {
  _inherits(QtQuick_AnimatedImage, _QtQuick_Image);

  function QtQuick_AnimatedImage() {
    _classCallCheck(this, QtQuick_AnimatedImage);

    return _possibleConstructorReturn(this, (QtQuick_AnimatedImage.__proto__ || Object.getPrototypeOf(QtQuick_AnimatedImage)).apply(this, arguments));
  }

  return QtQuick_AnimatedImage;
}(QtQuick_Image);

QmlWeb.registerQmlType(QtQuick_AnimatedImage);

// eslint-disable-next-line no-undef

var QtQuick_IntValidator = function (_QtQuick_Item28) {
  _inherits(QtQuick_IntValidator, _QtQuick_Item28);

  function QtQuick_IntValidator() {
    _classCallCheck(this, QtQuick_IntValidator);

    return _possibleConstructorReturn(this, (QtQuick_IntValidator.__proto__ || Object.getPrototypeOf(QtQuick_IntValidator)).apply(this, arguments));
  }

  _createClass(QtQuick_IntValidator, [{
    key: "validate",
    value: function validate(string) {
      var regExp = /^(-|\+)?\s*[0-9]+$/;
      var acceptable = regExp.test(string.trim());

      if (acceptable) {
        var value = parseInt(string, 10);
        acceptable = this.bottom <= value && this.top >= value;
      }
      return acceptable;
    }
  }]);

  return QtQuick_IntValidator;
}(QtQuick_Item);

QtQuick_IntValidator.properties = {
  bottom: { type: "int", initialValue: -2147483647 },
  top: { type: "int", initialValue: 2147483647 }
};

QmlWeb.registerQmlType(QtQuick_IntValidator);

// eslint-disable-next-line no-undef

var QtQuick_ListElement = function (_QtQml_QtObject17) {
  _inherits(QtQuick_ListElement, _QtQml_QtObject17);

  function QtQuick_ListElement(meta) {
    _classCallCheck(this, QtQuick_ListElement);

    var _this90 = _possibleConstructorReturn(this, (QtQuick_ListElement.__proto__ || Object.getPrototypeOf(QtQuick_ListElement)).call(this, meta));

    for (var i in meta.object) {
      if (i[0] !== "$") {
        QmlWeb.createProperty("variant", _this90, i);
      }
    }
    QmlWeb.applyProperties(meta.object, _this90, _this90, _this90.$context);
    return _this90;
  }

  return QtQuick_ListElement;
}(QtQml_QtObject);

QmlWeb.registerQmlType(QtQuick_ListElement);

// eslint-disable-next-line no-undef

var QtQml_Models_ListElement = function (_QtQuick_ListElement) {
  _inherits(QtQml_Models_ListElement, _QtQuick_ListElement);

  function QtQml_Models_ListElement() {
    _classCallCheck(this, QtQml_Models_ListElement);

    return _possibleConstructorReturn(this, (QtQml_Models_ListElement.__proto__ || Object.getPrototypeOf(QtQml_Models_ListElement)).apply(this, arguments));
  }

  return QtQml_Models_ListElement;
}(QtQuick_ListElement);

QtQml_Models_ListElement.versions = /^2\./;

QmlWeb.registerQmlType(QtQml_Models_ListElement);

// eslint-disable-next-line no-undef

var QtQuick_ListModel = function (_QtQml_QtObject18) {
  _inherits(QtQuick_ListModel, _QtQml_QtObject18);

  function QtQuick_ListModel(meta) {
    _classCallCheck(this, QtQuick_ListModel);

    var _this92 = _possibleConstructorReturn(this, (QtQuick_ListModel.__proto__ || Object.getPrototypeOf(QtQuick_ListModel)).call(this, meta));

    _this92.$firstItem = true;
    _this92.$itemsChanged.connect(_this92, _this92.$on$itemsChanged);
    _this92.$model = new QmlWeb.JSItemModel();
    _this92.$model.data = function (index, role) {
      return _this92.$items[index][role];
    };
    _this92.$model.rowCount = function () {
      return _this92.$items.length;
    };
    return _this92;
  }

  _createClass(QtQuick_ListModel, [{
    key: "$on$itemsChanged",
    value: function $on$itemsChanged(newVal) {
      this.count = this.$items.length;
      if (this.$firstItem && newVal.length > 0) {
        var QMLListElement = QmlWeb.getConstructor("QtQuick", "2.0", "ListElement");
        this.$firstItem = false;
        var roleNames = [];
        var dict = newVal[0];
        if (dict instanceof QMLListElement) {
          dict = dict.$properties;
        }
        for (var i in dict) {
          if (i !== "index") {
            roleNames.push(i);
          }
        }
        this.$model.setRoleNames(roleNames);
      }
    }
  }, {
    key: "append",
    value: function append(dict) {
      var index = this.$items.length;
      var c = 0;

      if (dict instanceof Array) {
        for (var key in dict) {
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
  }, {
    key: "clear",
    value: function clear() {
      this.$items.length = 0;
      this.count = 0;
      this.$model.modelReset();
    }
  }, {
    key: "get",
    value: function get(index) {
      return this.$items[index];
    }
  }, {
    key: "insert",
    value: function insert(index, dict) {
      this.$items.splice(index, 0, dict);
      this.$itemsChanged(this.$items);
      this.$model.rowsInserted(index, index + 1);
    }
  }, {
    key: "move",
    value: function move(from, to, n) {
      var vals = this.$items.splice(from, n);
      for (var i = 0; i < vals.length; i++) {
        this.$items.splice(to + i, 0, vals[i]);
      }
      this.$model.rowsMoved(from, from + n, to);
    }
  }, {
    key: "remove",
    value: function remove(index) {
      this.$items.splice(index, 1);
      this.$model.rowsRemoved(index, index + 1);
      this.count = this.$items.length;
    }
  }, {
    key: "set",
    value: function set(index, dict) {
      this.$items[index] = dict;
      this.$model.dataChanged(index, index);
    }
  }, {
    key: "setProperty",
    value: function setProperty(index, property, value) {
      this.$items[index][property] = value;
      this.$model.dataChanged(index, index);
    }
  }]);

  return QtQuick_ListModel;
}(QtQml_QtObject);

QtQuick_ListModel.properties = {
  count: "int",
  $items: "list"
};
QtQuick_ListModel.defaultProperty = "$items";

QmlWeb.registerQmlType(QtQuick_ListModel);

// eslint-disable-next-line no-undef

var QtQml_Models_ListModel = function (_QtQuick_ListModel) {
  _inherits(QtQml_Models_ListModel, _QtQuick_ListModel);

  function QtQml_Models_ListModel() {
    _classCallCheck(this, QtQml_Models_ListModel);

    return _possibleConstructorReturn(this, (QtQml_Models_ListModel.__proto__ || Object.getPrototypeOf(QtQml_Models_ListModel)).apply(this, arguments));
  }

  return QtQml_Models_ListModel;
}(QtQuick_ListModel);

QtQml_Models_ListModel.versions = /^2\./;
QtQml_Models_ListModel.defaultProperty = "$items";

QmlWeb.registerQmlType(QtQml_Models_ListModel);

// eslint-disable-next-line no-undef

var QtQuick_Loader = function (_QtQuick_Item29) {
  _inherits(QtQuick_Loader, _QtQuick_Item29);

  function QtQuick_Loader(meta) {
    _classCallCheck(this, QtQuick_Loader);

    var _this94 = _possibleConstructorReturn(this, (QtQuick_Loader.__proto__ || Object.getPrototypeOf(QtQuick_Loader)).call(this, meta));

    _this94.$sourceUrl = "";

    _this94.activeChanged.connect(_this94, _this94.$onActiveChanged);
    _this94.sourceChanged.connect(_this94, _this94.$onSourceChanged);
    _this94.sourceComponentChanged.connect(_this94, _this94.$onSourceComponentChanged);
    _this94.widthChanged.connect(_this94, _this94.$updateGeometry);
    _this94.heightChanged.connect(_this94, _this94.$updateGeometry);
    return _this94;
  }

  _createClass(QtQuick_Loader, [{
    key: "$onActiveChanged",
    value: function $onActiveChanged() {
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
  }, {
    key: "$onSourceChanged",
    value: function $onSourceChanged(fileName) {
      // TODO
      // if (fileName == this.$sourceUrl && this.item !== undefined) return;
      if (!this.active) return;
      this.$unload();

      if (!fileName) {
        this.sourceComponent = null;
        this.$sourceUrl = fileName;
        return;
      }

      var tree = QmlWeb.engine.loadComponent(fileName);
      var QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
      var meta = { object: tree, context: this.$context, parent: this };
      var qmlComponent = new QMLComponent(meta);
      qmlComponent.$basePath = QmlWeb.engine.extractBasePath(tree.$file);
      qmlComponent.$imports = tree.$imports;
      qmlComponent.$file = tree.$file;
      QmlWeb.engine.loadImports(tree.$imports, qmlComponent.$basePath, qmlComponent.importContextId);
      var loadedComponent = this.$createComponentObject(qmlComponent, this);
      this.sourceComponent = loadedComponent;
      this.$sourceUrl = fileName;
    }
  }, {
    key: "$onSourceComponentChanged",
    value: function $onSourceComponentChanged(newItem) {
      if (!this.active) return;
      this.$unload();

      if (!newItem) {
        this.item = null;
        return;
      }

      var QMLComponent = QmlWeb.getConstructor("QtQml", "2.0", "Component");
      var qmlComponent = newItem;
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
  }, {
    key: "setSource",
    value: function setSource(url, options) {
      this.$sourceUrl = url;
      this.props = options;
      this.source = url;
    }
  }, {
    key: "$unload",
    value: function $unload() {
      if (!this.item) return;
      this.item.$delete();
      this.item.parent = undefined;
      this.item = undefined;
    }
  }, {
    key: "$callOnCompleted",
    value: function $callOnCompleted(child) {
      child.Component.completed();
      var QMLBaseObject = QmlWeb.getConstructor("QtQml", "2.0", "QtObject");
      for (var i = 0; i < child.$tidyupList.length; i++) {
        if (child.$tidyupList[i] instanceof QMLBaseObject) {
          this.$callOnCompleted(child.$tidyupList[i]);
        }
      }
    }
  }, {
    key: "$createComponentObject",
    value: function $createComponentObject(qmlComponent, parent) {
      var newComponent = qmlComponent.createObject(parent);
      if (QmlWeb.engine.operationState !== QmlWeb.QMLOperationState.Init) {
        // We don't call those on first creation, as they will be called
        // by the regular creation-procedures at the right time.
        QmlWeb.engine.$initializePropertyBindings();
        this.$callOnCompleted(newComponent);
      }
      return newComponent;
    }
  }, {
    key: "$updateGeometry",
    value: function $updateGeometry() {
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
  }]);

  return QtQuick_Loader;
}(QtQuick_Item);

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

var QtQuick_MouseArea = function (_QtQuick_Item30) {
  _inherits(QtQuick_MouseArea, _QtQuick_Item30);

  function QtQuick_MouseArea(meta) {
    _classCallCheck(this, QtQuick_MouseArea);

    var _this95 = _possibleConstructorReturn(this, (QtQuick_MouseArea.__proto__ || Object.getPrototypeOf(QtQuick_MouseArea)).call(this, meta));

    _this95.dom.style.pointerEvents = "all";

    // IE does not handle mouse clicks to transparent divs, so we have
    // to set a background color and make it invisible using opacity
    // as that doesn't affect the mouse handling.
    _this95.dom.style.backgroundColor = "white";
    _this95.dom.style.opacity = 0;

    _this95.cursorShapeChanged.connect(_this95, _this95.$onCursorShapeChanged);

    _this95.dom.addEventListener("click", function (e) {
      return _this95.$handleClick(e);
    });
    _this95.dom.addEventListener("contextmenu", function (e) {
      return _this95.$handleClick(e);
    });
    var handleMouseMove = function handleMouseMove(e) {
      if (!_this95.enabled || !_this95.hoverEnabled && !_this95.pressed) return;
      _this95.$handlePositionChanged(e);
    };
    var handleMouseUp = function handleMouseUp(e) {
      var mouse = _this95.$eventToMouse(e);
      _this95.pressed = false;
      _this95.containsPress = false;
      _this95.pressedButtons = 0;
      _this95.released(mouse);
      document.removeEventListener("mouseup", handleMouseUp);
      _this95.$clientTransform = undefined;
      document.removeEventListener("mousemove", handleMouseMove);
    };
    _this95.dom.addEventListener("mousedown", function (e) {
      if (!_this95.enabled) return;
      // Handle scale and translate transformations
      var boundingRect = _this95.dom.getBoundingClientRect();
      _this95.$clientTransform = {
        x: boundingRect.left,
        y: boundingRect.top,
        xScale: _this95.width ? (boundingRect.right - boundingRect.left) / _this95.width : 1,
        yScale: _this95.height ? (boundingRect.bottom - boundingRect.top) / _this95.height : 1
      };
      var mouse = _this95.$eventToMouse(e);
      _this95.mouseX = mouse.x;
      _this95.mouseY = mouse.y;
      _this95.pressed = true;
      _this95.containsPress = true;
      _this95.pressedButtons = mouse.button;
      _this95.$Signals.pressed(mouse);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
    });
    _this95.dom.addEventListener("mouseover", function () {
      _this95.containsMouse = true;
      _this95.containsPress = _this95.pressed;
      _this95.entered();
    });
    _this95.dom.addEventListener("mouseout", function () {
      _this95.containsMouse = false;
      _this95.containsPress = false;
      _this95.exited();
    });
    // This is to emit positionChanged for `hoverEnabled` only. When `pressed`,
    // `positionChanged` is handled by a temporary `mousemove` event listener
    // on `document`.
    _this95.dom.addEventListener("mousemove", function (e) {
      if (!_this95.enabled || !_this95.hoverEnabled || _this95.pressed) return;
      _this95.$handlePositionChanged(e);
    });
    _this95.dom.addEventListener("wheel", function (e) {
      _this95.$handleWheel(e);
    });
    return _this95;
  }

  _createClass(QtQuick_MouseArea, [{
    key: "$onCursorShapeChanged",
    value: function $onCursorShapeChanged() {
      this.dom.style.cursor = this.$cursorShapeToCSS();
    }
  }, {
    key: "$handlePositionChanged",
    value: function $handlePositionChanged(e) {
      var mouse = this.$eventToMouse(e);
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.positionChanged(mouse);
    }
  }, {
    key: "$handleWheel",
    value: function $handleWheel(e) {
      var wheel = this.$eventToMouse(e);
      wheel.angleDelta = { x: e.deltaX, y: e.deltaY };
      wheel.accepted = false;

      this.wheel(wheel);

      if (wheel.accepted) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }, {
    key: "$handleClick",
    value: function $handleClick(e) {
      var mouse = this.$eventToMouse(e);
      if (this.enabled && this.acceptedButtons & mouse.button) {
        this.clicked(mouse);
      }
      // This decides whether to show the browser's context menu on right click or
      // not
      return !(this.acceptedButtons & QmlWeb.Qt.RightButton);
    }
  }, {
    key: "$eventToMouse",
    value: function $eventToMouse(e) {
      var Qt = QmlWeb.Qt;
      var mouse = {
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

  }, {
    key: "$cursorShapeToCSS",
    value: function $cursorShapeToCSS() {
      var Qt = QmlWeb.Qt;
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
  }]);

  return QtQuick_MouseArea;
}(QtQuick_Item);

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

var QtQuick_OpacityAnimator = function (_QtQuick_Animator) {
  _inherits(QtQuick_OpacityAnimator, _QtQuick_Animator);

  function QtQuick_OpacityAnimator() {
    _classCallCheck(this, QtQuick_OpacityAnimator);

    return _possibleConstructorReturn(this, (QtQuick_OpacityAnimator.__proto__ || Object.getPrototypeOf(QtQuick_OpacityAnimator)).apply(this, arguments));
  }

  return QtQuick_OpacityAnimator;
}(QtQuick_Animator);

QtQuick_OpacityAnimator.versions = /^2\./;

QmlWeb.registerQmlType(QtQuick_OpacityAnimator);

// eslint-disable-next-line no-undef

var QtQuick_ParallelAnimation = function (_QtQuick_Animation2) {
  _inherits(QtQuick_ParallelAnimation, _QtQuick_Animation2);

  function QtQuick_ParallelAnimation(meta) {
    _classCallCheck(this, QtQuick_ParallelAnimation);

    var _this97 = _possibleConstructorReturn(this, (QtQuick_ParallelAnimation.__proto__ || Object.getPrototypeOf(QtQuick_ParallelAnimation)).call(this, meta));

    _this97.$runningAnimations = 0;

    _this97.animationsChanged.connect(_this97, _this97.$onAnimationsChanged);

    QmlWeb.engine.$registerStart(function () {
      if (!_this97.running) return;
      self.running = false; // toggled back by start();
      self.start();
    });
    QmlWeb.engine.$registerStop(function () {
      return _this97.stop();
    });
    return _this97;
  }

  _createClass(QtQuick_ParallelAnimation, [{
    key: "$onAnimationsChanged",
    value: function $onAnimationsChanged() {
      var flags = QmlWeb.Signal.UniqueConnection;
      for (var i = 0; i < this.animations.length; i++) {
        var animation = this.animations[i];
        animation.runningChanged.connect(this, this.$animationFinished, flags);
      }
    }
  }, {
    key: "$animationFinished",
    value: function $animationFinished(newVal) {
      this.$runningAnimations += newVal ? 1 : -1;
      if (this.$runningAnimations === 0) {
        this.running = false;
      }
    }
  }, {
    key: "start",
    value: function start() {
      if (this.running) return;
      this.running = true;
      for (var i = 0; i < this.animations.length; i++) {
        this.animations[i].start();
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      if (!this.running) return;
      for (var i = 0; i < this.animations.length; i++) {
        this.animations[i].stop();
      }
      this.running = false;
    }
  }, {
    key: "complete",
    value: function complete() {
      this.stop();
    }
  }]);

  return QtQuick_ParallelAnimation;
}(QtQuick_Animation);

QtQuick_ParallelAnimation.enums = {
  Animation: { Infinite: Math.Infinite }
};
QtQuick_ParallelAnimation.properties = {
  animations: "list"
};
QtQuick_ParallelAnimation.defaultProperty = "animations";

QmlWeb.registerQmlType(QtQuick_ParallelAnimation);

// eslint-disable-next-line no-undef

var QtQuick_PauseAnimation = function (_QtQuick_Animation3) {
  _inherits(QtQuick_PauseAnimation, _QtQuick_Animation3);

  function QtQuick_PauseAnimation(meta) {
    _classCallCheck(this, QtQuick_PauseAnimation);

    var _this98 = _possibleConstructorReturn(this, (QtQuick_PauseAnimation.__proto__ || Object.getPrototypeOf(QtQuick_PauseAnimation)).call(this, meta));

    _this98.$at = 0;

    QmlWeb.engine.$addTicker(function () {
      return _this98.$ticker.apply(_this98, arguments);
    });
    _this98.runningChanged.connect(_this98, _this98.$onRunningChanged);
    return _this98;
  }

  _createClass(QtQuick_PauseAnimation, [{
    key: "$ticker",
    value: function $ticker(now, elapsed) {
      if (!this.running || this.paused) {
        return;
      }
      this.$at += elapsed / this.duration;
      if (this.$at >= 1) {
        this.complete();
      }
    }
  }, {
    key: "$onRunningChanged",
    value: function $onRunningChanged(newVal) {
      if (newVal) {
        this.$at = 0;
        this.paused = false;
      }
    }
  }, {
    key: "complete",
    value: function complete() {
      this.running = false;
    }
  }]);

  return QtQuick_PauseAnimation;
}(QtQuick_Animation);

QtQuick_PauseAnimation.properties = {
  duration: { type: "int", initialValue: 250 }
};

QmlWeb.registerQmlType(QtQuick_PauseAnimation);

// eslint-disable-next-line no-undef

var QtQuick_Positioner = function (_QtQuick_Item31) {
  _inherits(QtQuick_Positioner, _QtQuick_Item31);

  function QtQuick_Positioner(meta) {
    _classCallCheck(this, QtQuick_Positioner);

    var _this99 = _possibleConstructorReturn(this, (QtQuick_Positioner.__proto__ || Object.getPrototypeOf(QtQuick_Positioner)).call(this, meta));

    _this99.childrenChanged.connect(_this99, _this99.$onChildrenChanged);
    _this99.spacingChanged.connect(_this99, _this99.layoutChildren);
    _this99.childrenChanged.connect(_this99, _this99.layoutChildren);
    _this99.layoutChildren();
    return _this99;
  }

  _createClass(QtQuick_Positioner, [{
    key: "$onChildrenChanged",
    value: function $onChildrenChanged() {
      var flags = QmlWeb.Signal.UniqueConnection;
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        child.widthChanged.connect(this, this.layoutChildren, flags);
        child.heightChanged.connect(this, this.layoutChildren, flags);
        child.visibleChanged.connect(this, this.layoutChildren, flags);
      }
    }
  }, {
    key: "layoutChildren",
    value: function layoutChildren() {
      // noop, defined in individual positioners
    }
  }]);

  return QtQuick_Positioner;
}(QtQuick_Item);

QtQuick_Positioner.properties = {
  spacing: "int",
  padding: "int"
};

QmlWeb.registerQmlType(QtQuick_Positioner);

// eslint-disable-next-line no-undef

var QtQuick_Column = function (_QtQuick_Positioner) {
  _inherits(QtQuick_Column, _QtQuick_Positioner);

  function QtQuick_Column() {
    _classCallCheck(this, QtQuick_Column);

    return _possibleConstructorReturn(this, (QtQuick_Column.__proto__ || Object.getPrototypeOf(QtQuick_Column)).apply(this, arguments));
  }

  _createClass(QtQuick_Column, [{
    key: "layoutChildren",
    value: function layoutChildren() {
      var curPos = this.padding;
      var maxWidth = 0;
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
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
  }]);

  return QtQuick_Column;
}(QtQuick_Positioner);

QmlWeb.registerQmlType(QtQuick_Column);

// eslint-disable-next-line no-undef

var QtQuick_Flow = function (_QtQuick_Positioner2) {
  _inherits(QtQuick_Flow, _QtQuick_Positioner2);

  function QtQuick_Flow(meta) {
    _classCallCheck(this, QtQuick_Flow);

    var _this101 = _possibleConstructorReturn(this, (QtQuick_Flow.__proto__ || Object.getPrototypeOf(QtQuick_Flow)).call(this, meta));

    _this101.flowChanged.connect(_this101, _this101.layoutChildren);
    _this101.layoutDirectionChanged.connect(_this101, _this101.layoutChildren);
    _this101.widthChanged.connect(_this101, _this101.layoutChildren);
    _this101.heightChanged.connect(_this101, _this101.layoutChildren);
    _this101.layoutChildren();
    return _this101;
  }

  _createClass(QtQuick_Flow, [{
    key: "layoutChildren",
    value: function layoutChildren() {
      if (this.flow === undefined) {
        // Flow has not been fully initialized yet
        return;
      }

      var curHPos = 0;
      var curVPos = 0;
      var rowSize = 0;
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
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
  }]);

  return QtQuick_Flow;
}(QtQuick_Positioner);

QtQuick_Flow.enums = {
  Flow: { LeftToRight: 0, TopToBottom: 1 }
};
QtQuick_Flow.properties = {
  flow: "enum", // Flow.LeftToRight
  layoutDirection: "enum" // Flow.LeftToRight
};

QmlWeb.registerQmlType(QtQuick_Flow);

// eslint-disable-next-line no-undef

var QtQuick_Grid = function (_QtQuick_Positioner3) {
  _inherits(QtQuick_Grid, _QtQuick_Positioner3);

  function QtQuick_Grid(meta) {
    _classCallCheck(this, QtQuick_Grid);

    var _this102 = _possibleConstructorReturn(this, (QtQuick_Grid.__proto__ || Object.getPrototypeOf(QtQuick_Grid)).call(this, meta));

    _this102.columnsChanged.connect(_this102, _this102.layoutChildren);
    _this102.rowsChanged.connect(_this102, _this102.layoutChildren);
    _this102.flowChanged.connect(_this102, _this102.layoutChildren);
    _this102.layoutDirectionChanged.connect(_this102, _this102.layoutChildren);
    _this102.layoutChildren();
    return _this102;
  }

  _createClass(QtQuick_Grid, [{
    key: "layoutChildren",
    value: function layoutChildren() {
      // How many items are actually visible?
      var visibleItems = this.$getVisibleItems();

      // How many rows and columns do we need?

      var _$calculateSize = this.$calculateSize(visibleItems.length),
          _$calculateSize2 = _slicedToArray(_$calculateSize, 2),
          c = _$calculateSize2[0],
          r = _$calculateSize2[1];

      // How big are the colums/rows?


      var _$calculateGrid = this.$calculateGrid(visibleItems, c, r),
          _$calculateGrid2 = _slicedToArray(_$calculateGrid, 2),
          colWidth = _$calculateGrid2[0],
          rowHeight = _$calculateGrid2[1];

      // Do actual positioning
      // When layoutDirection is RightToLeft we need oposite order of coumns


      var step = this.layoutDirection === 1 ? -1 : 1;
      var startingPoint = this.layoutDirection === 1 ? c - 1 : 0;
      var endPoint = this.layoutDirection === 1 ? -1 : c;
      var curHPos = 0;
      var curVPos = 0;
      if (this.flow === 0) {
        for (var i = 0; i < r; i++) {
          for (var j = startingPoint; j !== endPoint; j += step) {
            var _item = visibleItems[i * c + j];
            if (!_item) {
              break;
            }
            _item.x = curHPos;
            _item.y = curVPos;

            curHPos += colWidth[j] + this.spacing;
          }
          curVPos += rowHeight[i] + this.spacing;
          curHPos = 0;
        }
      } else {
        for (var _i7 = startingPoint; _i7 !== endPoint; _i7 += step) {
          for (var _j = 0; _j < r; _j++) {
            var _item2 = visibleItems[_i7 * r + _j];
            if (!_item2) {
              break;
            }
            _item2.x = curHPos;
            _item2.y = curVPos;

            curVPos += rowHeight[_j] + this.spacing;
          }
          curHPos += colWidth[_i7] + this.spacing;
          curVPos = 0;
        }
      }

      // Set implicit size
      var gridWidth = -this.spacing;
      var gridHeight = -this.spacing;
      for (var _i8 in colWidth) {
        gridWidth += colWidth[_i8] + this.spacing;
      }
      for (var _i9 in rowHeight) {
        gridHeight += rowHeight[_i9] + this.spacing;
      }
      this.implicitWidth = gridWidth;
      this.implicitHeight = gridHeight;
    }
  }, {
    key: "$getVisibleItems",
    value: function $getVisibleItems() {
      return this.children.filter(function (child) {
        return child.visible && child.width && child.height;
      });
    }
  }, {
    key: "$calculateSize",
    value: function $calculateSize(length) {
      var cols = void 0;
      var rows = void 0;
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
  }, {
    key: "$calculateGrid",
    value: function $calculateGrid(visibleItems, cols, rows) {
      var colWidth = [];
      var rowHeight = [];

      if (this.flow === 0) {
        for (var i = 0; i < rows; i++) {
          for (var j = 0; j < cols; j++) {
            var _item3 = visibleItems[i * cols + j];
            if (!_item3) {
              break;
            }
            if (!colWidth[j] || _item3.width > colWidth[j]) {
              colWidth[j] = _item3.width;
            }
            if (!rowHeight[i] || _item3.height > rowHeight[i]) {
              rowHeight[i] = _item3.height;
            }
          }
        }
      } else {
        for (var _i10 = 0; _i10 < cols; _i10++) {
          for (var _j2 = 0; _j2 < rows; _j2++) {
            var _item4 = visibleItems[_i10 * rows + _j2];
            if (!_item4) {
              break;
            }
            if (!rowHeight[_j2] || _item4.height > rowHeight[_j2]) {
              rowHeight[_j2] = _item4.height;
            }
            if (!colWidth[_i10] || _item4.width > colWidth[_i10]) {
              colWidth[_i10] = _item4.width;
            }
          }
        }
      }

      return [colWidth, rowHeight];
    }
  }]);

  return QtQuick_Grid;
}(QtQuick_Positioner);

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

var QtQuick_PropertyAnimation = function (_QtQuick_Animation4) {
  _inherits(QtQuick_PropertyAnimation, _QtQuick_Animation4);

  function QtQuick_PropertyAnimation(meta) {
    _classCallCheck(this, QtQuick_PropertyAnimation);

    var _this103 = _possibleConstructorReturn(this, (QtQuick_PropertyAnimation.__proto__ || Object.getPrototypeOf(QtQuick_PropertyAnimation)).call(this, meta));

    _this103.easing = new QmlWeb.QObject(_this103);
    QmlWeb.createProperties(_this103.easing, {
      type: { type: "enum", initialValue: _this103.Easing.Linear },
      amplitude: { type: "real", initialValue: 1 },
      overshoot: { type: "real", initialValue: 1.70158 },
      period: { type: "real", initialValue: 0.3 },
      bezierCurve: "list"
    });

    _this103.easing.$valueForProgress = function (t) {
      return QmlWeb.$ease(this.type, this.period, this.amplitude, this.overshoot, t);
    };

    _this103.$props = [];
    _this103.$targets = [];
    _this103.$actions = [];

    _this103.targetChanged.connect(_this103, _this103.$redoTargets);
    _this103.targetsChanged.connect(_this103, _this103.$redoTargets);
    _this103.propertyChanged.connect(_this103, _this103.$redoProperties);
    _this103.propertiesChanged.connect(_this103, _this103.$redoProperties);

    if (meta.object.$on !== undefined) {
      _this103.property = meta.object.$on;
      _this103.target = _this103.$parent;
      _this103.running = true;
    }
    return _this103;
  }

  _createClass(QtQuick_PropertyAnimation, [{
    key: "$redoActions",
    value: function $redoActions() {
      this.$actions = [];
      for (var i = 0; i < this.$targets.length; i++) {
        for (var j in this.$props) {
          this.$actions.push({
            target: this.$targets[i],
            property: this.$props[j],
            from: this.from,
            to: this.to
          });
        }
      }
    }
  }, {
    key: "$redoProperties",
    value: function $redoProperties() {
      this.$props = this.properties.split(",");

      // Remove whitespaces
      for (var i = 0; i < this.$props.length; i++) {
        var matches = this.$props[i].match(/\w+/);
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
  }, {
    key: "$redoTargets",
    value: function $redoTargets() {
      this.$targets = this.targets.slice();
      if (this.target && this.$targets.indexOf(this.target) === -1) {
        this.$targets.push(this.target);
      }
    }
  }]);

  return QtQuick_PropertyAnimation;
}(QtQuick_Animation);

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

var QtQuick_NumberAnimation = function (_QtQuick_PropertyAnim) {
  _inherits(QtQuick_NumberAnimation, _QtQuick_PropertyAnim);

  function QtQuick_NumberAnimation(meta) {
    _classCallCheck(this, QtQuick_NumberAnimation);

    var _this104 = _possibleConstructorReturn(this, (QtQuick_NumberAnimation.__proto__ || Object.getPrototypeOf(QtQuick_NumberAnimation)).call(this, meta));

    _this104.$at = 0;
    _this104.$loop = 0;

    QmlWeb.engine.$addTicker(function () {
      return _this104.$ticker.apply(_this104, arguments);
    });
    _this104.runningChanged.connect(_this104, _this104.$onRunningChanged);
    return _this104;
  }

  _createClass(QtQuick_NumberAnimation, [{
    key: "$startLoop",
    value: function $startLoop() {
      for (var i in this.$actions) {
        var _action3 = this.$actions[i];
        _action3.from = _action3.from !== undefined ? _action3.from : _action3.target[_action3.property];
      }
      this.$at = 0;
    }
  }, {
    key: "$ticker",
    value: function $ticker(now, elapsed) {
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
      for (var i in this.$actions) {
        var _action4 = this.$actions[i];
        var value = _action4.from + (_action4.to - _action4.from) * this.easing.$valueForProgress(this.$at);
        var property = _action4.target.$properties[_action4.property];
        property.set(value, QmlWeb.QMLProperty.ReasonAnimation);
      }
    }
  }, {
    key: "$onRunningChanged",
    value: function $onRunningChanged(newVal) {
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
  }, {
    key: "complete",
    value: function complete() {
      for (var i in this.$actions) {
        var _action5 = this.$actions[i];
        var property = _action5.target.$properties[_action5.property];
        property.set(_action5.to, QmlWeb.QMLProperty.ReasonAnimation);
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
  }]);

  return QtQuick_NumberAnimation;
}(QtQuick_PropertyAnimation);

QmlWeb.registerQmlType(QtQuick_NumberAnimation);

// eslint-disable-next-line no-undef

var QtQuick_PropertyChanges = function (_QtQml_QtObject19) {
  _inherits(QtQuick_PropertyChanges, _QtQml_QtObject19);

  function QtQuick_PropertyChanges(meta) {
    _classCallCheck(this, QtQuick_PropertyChanges);

    var _this105 = _possibleConstructorReturn(this, (QtQuick_PropertyChanges.__proto__ || Object.getPrototypeOf(QtQuick_PropertyChanges)).call(this, meta));

    _this105.$actions = [];
    return _this105;
  }

  _createClass(QtQuick_PropertyChanges, [{
    key: "$setCustomData",
    value: function $setCustomData(property, value) {
      this.$actions.push({ property: property, value: value });
    }
  }]);

  return QtQuick_PropertyChanges;
}(QtQml_QtObject);

QtQuick_PropertyChanges.properties = {
  target: "QtObject",
  explicit: "bool",
  restoreEntryValues: { type: "bool", initialValue: true }
};

QmlWeb.registerQmlType(QtQuick_PropertyChanges);

// eslint-disable-next-line no-undef

var QtQuick_Rectangle = function (_QtQuick_Item32) {
  _inherits(QtQuick_Rectangle, _QtQuick_Item32);

  function QtQuick_Rectangle(meta) {
    _classCallCheck(this, QtQuick_Rectangle);

    var _this106 = _possibleConstructorReturn(this, (QtQuick_Rectangle.__proto__ || Object.getPrototypeOf(QtQuick_Rectangle)).call(this, meta));

    _this106.border = new QmlWeb.QObject(_this106);
    QmlWeb.createProperties(_this106.border, {
      color: { type: "color", initialValue: "black" },
      width: { type: "int", initialValue: 1 }
    });
    _this106.$borderActive = false;

    var bg = _this106.impl = document.createElement("div");
    bg.style.pointerEvents = "none";
    bg.style.position = "absolute";
    bg.style.left = bg.style.right = bg.style.top = bg.style.bottom = "0px";
    bg.style.borderWidth = "0px";
    bg.style.borderStyle = "solid";
    bg.style.borderColor = _this106.border.color.$css;
    bg.style.backgroundColor = _this106.color.$css;
    _this106.dom.appendChild(bg);

    _this106.colorChanged.connect(_this106, _this106.$onColorChanged);
    _this106.radiusChanged.connect(_this106, _this106.$onRadiusChanged);
    _this106.border.colorChanged.connect(_this106, _this106.border$onColorChanged);
    _this106.border.widthChanged.connect(_this106, _this106.border$onWidthChanged);
    _this106.widthChanged.connect(_this106, _this106.$updateBorder);
    _this106.heightChanged.connect(_this106, _this106.$updateBorder);
    return _this106;
  }

  _createClass(QtQuick_Rectangle, [{
    key: "$onColorChanged",
    value: function $onColorChanged(newVal) {
      this.impl.style.backgroundColor = newVal.$css;
    }
  }, {
    key: "border$onColorChanged",
    value: function border$onColorChanged(newVal) {
      this.$borderActive = true;
      this.impl.style.borderColor = newVal.$css;
      this.$updateBorder();
    }
  }, {
    key: "border$onWidthChanged",
    value: function border$onWidthChanged() {
      this.$borderActive = true;
      this.$updateBorder();
    }
  }, {
    key: "$onRadiusChanged",
    value: function $onRadiusChanged(newVal) {
      this.impl.style.borderRadius = newVal + "px";
    }
  }, {
    key: "$updateBorder",
    value: function $updateBorder() {
      var border = this.$borderActive ? Math.max(0, this.border.width) : 0;
      var style = this.impl.style;
      if (border * 2 > this.width || border * 2 > this.height) {
        // Border is covering the whole background
        style.borderWidth = "0px";
        style.borderTopWidth = this.height + "px";
      } else {
        style.borderWidth = border + "px";
      }
    }
  }]);

  return QtQuick_Rectangle;
}(QtQuick_Item);

QtQuick_Rectangle.properties = {
  color: { type: "color", initialValue: "white" },
  radius: "real"
};

QmlWeb.registerQmlType(QtQuick_Rectangle);

// eslint-disable-next-line no-undef

var QtQuick_RegExpValidator = function (_QtQuick_Item33) {
  _inherits(QtQuick_RegExpValidator, _QtQuick_Item33);

  function QtQuick_RegExpValidator() {
    _classCallCheck(this, QtQuick_RegExpValidator);

    return _possibleConstructorReturn(this, (QtQuick_RegExpValidator.__proto__ || Object.getPrototypeOf(QtQuick_RegExpValidator)).apply(this, arguments));
  }

  _createClass(QtQuick_RegExpValidator, [{
    key: "validate",
    value: function validate(string) {
      if (!this.regExp) return true;
      return this.regExp.test(string);
    }
  }]);

  return QtQuick_RegExpValidator;
}(QtQuick_Item);

QtQuick_RegExpValidator.properties = {
  regExp: "var"
};

QmlWeb.registerQmlType(QtQuick_RegExpValidator);

// eslint-disable-next-line no-undef

var QtQuick_Repeater = function (_QtQuick_Item34) {
  _inherits(QtQuick_Repeater, _QtQuick_Item34);

  function QtQuick_Repeater(meta) {
    _classCallCheck(this, QtQuick_Repeater);

    var _this108 = _possibleConstructorReturn(this, (QtQuick_Repeater.__proto__ || Object.getPrototypeOf(QtQuick_Repeater)).call(this, meta));

    _this108.parent = meta.parent;
    // TODO: some (all ?) of the components including Repeater needs to know own
    // parent at creation time. Please consider this major change.

    _this108.$completed = false;
    _this108.$items = []; // List of created items

    _this108.modelChanged.connect(_this108, _this108.$onModelChanged);
    _this108.delegateChanged.connect(_this108, _this108.$onDelegateChanged);
    _this108.parentChanged.connect(_this108, _this108.$onParentChanged);
    return _this108;
  }

  _createClass(QtQuick_Repeater, [{
    key: "container",
    value: function container() {
      return this.parent;
    }
  }, {
    key: "itemAt",
    value: function itemAt(index) {
      return this.$items[index];
    }
  }, {
    key: "$onModelChanged",
    value: function $onModelChanged() {
      this.$applyModel();
    }
  }, {
    key: "$onDelegateChanged",
    value: function $onDelegateChanged() {
      this.$applyModel();
    }
  }, {
    key: "$onParentChanged",
    value: function $onParentChanged() {
      this.$applyModel();
    }
  }, {
    key: "$getModel",
    value: function $getModel() {
      var QMLListModel = QmlWeb.getConstructor("QtQuick", "2.0", "ListModel");
      return this.model instanceof QMLListModel ? this.model.$model : this.model;
    }
  }, {
    key: "$applyModel",
    value: function $applyModel() {
      if (!this.delegate || !this.parent) {
        return;
      }
      var model = this.$getModel();
      if (model instanceof QmlWeb.JSItemModel) {
        var flags = QmlWeb.Signal.UniqueConnection;
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
  }, {
    key: "$callOnCompleted",
    value: function $callOnCompleted(child) {
      child.Component.completed();
      var QMLBaseObject = QmlWeb.getConstructor("QtQml", "2.0", "QtObject");
      for (var i = 0; i < child.$tidyupList.length; i++) {
        if (child.$tidyupList[i] instanceof QMLBaseObject) {
          this.$callOnCompleted(child.$tidyupList[i]);
        }
      }
    }
  }, {
    key: "$_onModelDataChanged",
    value: function $_onModelDataChanged(startIndex, endIndex, roles) {
      var model = this.$getModel();
      var roleNames = roles || model.roleNames;
      for (var index = startIndex; index <= endIndex; index++) {
        var _item5 = this.$items[index];
        var modelData = _item5.$properties.model;
        for (var i in roleNames) {
          var roleName = roleNames[i];
          var roleData = model.data(index, roleName);
          _item5.$properties[roleName].set(roleData, QmlWeb.QMLProperty.ReasonInit, _item5, this.model.$context);
          modelData[roleName] = roleData;
        }
        _item5.$properties.model.set(modelData, QmlWeb.QMLProperty.ReasonInit, _item5, this.model.$context);
      }
    }
  }, {
    key: "$_onRowsInserted",
    value: function $_onRowsInserted(startIndex, endIndex) {
      this.$insertChildren(startIndex, endIndex);
      this.count = this.$items.length;
    }
  }, {
    key: "$_onRowsMoved",
    value: function $_onRowsMoved(sourceStartIndex, sourceEndIndex, destinationIndex) {
      var vals = this.$items.splice(sourceStartIndex, sourceEndIndex - sourceStartIndex);
      for (var i = 0; i < vals.length; i++) {
        this.$items.splice(destinationIndex + i, 0, vals[i]);
      }
      var smallestChangedIndex = sourceStartIndex < destinationIndex ? sourceStartIndex : destinationIndex;
      for (var _i11 = smallestChangedIndex; _i11 < this.$items.length; _i11++) {
        this.$items[_i11].index = _i11;
      }
    }
  }, {
    key: "$_onRowsRemoved",
    value: function $_onRowsRemoved(startIndex, endIndex) {
      this.$removeChildren(startIndex, endIndex);
      for (var i = startIndex; i < this.$items.length; i++) {
        this.$items[i].index = i;
      }
      this.count = this.$items.length;
    }
  }, {
    key: "$_onModelReset",
    value: function $_onModelReset() {
      this.$applyModel();
    }
  }, {
    key: "$insertChildren",
    value: function $insertChildren(startIndex, endIndex) {
      if (endIndex <= 0) {
        this.count = 0;
        return;
      }

      var QMLOperationState = QmlWeb.QMLOperationState;
      var createProperty = QmlWeb.createProperty;
      var model = this.$getModel();
      var index = void 0;
      for (index = startIndex; index < endIndex; index++) {
        var newItem = this.delegate.$createObject(this.parent);
        createProperty("int", newItem, "index", { initialValue: index });

        if (typeof model === "number" || model instanceof Array) {
          if (typeof newItem.$properties.modelData === "undefined") {
            createProperty("variant", newItem, "modelData");
          }
          var value = model instanceof Array ? model[index] : typeof model === "number" ? index : "undefined";
          newItem.$properties.modelData.set(value, QmlWeb.QMLProperty.ReasonInit, newItem, model.$context);
        } else {
          // QML exposes a "model" property in the scope that contains all role
          // data.
          var modelData = {};
          for (var i = 0; i < model.roleNames.length; i++) {
            var roleName = model.roleNames[i];
            if (typeof newItem.$properties[roleName] === "undefined") {
              createProperty("variant", newItem, roleName);
            }
            var roleData = model.data(index, roleName);
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

      for (var _i12 = endIndex; _i12 < this.$items.length; _i12++) {
        this.$items[_i12].index = _i12;
      }
    }
  }, {
    key: "$removeChildren",
    value: function $removeChildren(startIndex, endIndex) {
      var removed = this.$items.splice(startIndex, endIndex - startIndex);
      for (var index in removed) {
        removed[index].$delete();
        this.$removeChildProperties(removed[index]);
      }
    }
  }, {
    key: "$removeChildProperties",
    value: function $removeChildProperties(child) {
      var signals = QmlWeb.engine.completedSignals;
      signals.splice(signals.indexOf(child.Component.completed), 1);
      for (var i = 0; i < child.children.length; i++) {
        this.$removeChildProperties(child.children[i]);
      }
    }
  }]);

  return QtQuick_Repeater;
}(QtQuick_Item);

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

var QtQuick_ListView = function (_QtQuick_Repeater) {
  _inherits(QtQuick_ListView, _QtQuick_Repeater);

  function QtQuick_ListView(meta) {
    _classCallCheck(this, QtQuick_ListView);

    var _this109 = _possibleConstructorReturn(this, (QtQuick_ListView.__proto__ || Object.getPrototypeOf(QtQuick_ListView)).call(this, meta));

    _this109.modelChanged.connect(_this109, _this109.$styleChanged);
    _this109.delegateChanged.connect(_this109, _this109.$styleChanged);
    _this109.orientationChanged.connect(_this109, _this109.$styleChanged);
    _this109.spacingChanged.connect(_this109, _this109.$styleChanged);
    _this109._childrenInserted.connect(_this109, _this109.$applyStyleOnItem);
    return _this109;
  }

  _createClass(QtQuick_ListView, [{
    key: "container",
    value: function container() {
      return this;
    }
  }, {
    key: "$applyStyleOnItem",
    value: function $applyStyleOnItem($item) {
      var Qt = QmlWeb.Qt;
      $item.dom.style.position = "initial";
      if (this.orientation === Qt.Horizontal) {
        $item.dom.style.display = "inline-block";
        if ($item !== this.$items[0]) {
          $item.dom.style["margin-left"] = this.spacing + "px";
        }
      } else {
        $item.dom.style.display = "block";
        if ($item !== this.$items[0]) {
          $item.dom.style["margin-top"] = this.spacing + "px";
        }
      }
    }
  }, {
    key: "$styleChanged",
    value: function $styleChanged() {
      for (var i = 0; i < this.$items.length; ++i) {
        this.$applyStyleOnItem(this.$items[i]);
      }
    }
  }]);

  return QtQuick_ListView;
}(QtQuick_Repeater);

QtQuick_ListView.properties = {
  orientation: "enum",
  spacing: "real"
};

QmlWeb.registerQmlType(QtQuick_ListView);

// eslint-disable-next-line no-undef

var QtQuick_Rotation = function (_QtQml_QtObject20) {
  _inherits(QtQuick_Rotation, _QtQml_QtObject20);

  function QtQuick_Rotation(meta) {
    _classCallCheck(this, QtQuick_Rotation);

    var _this110 = _possibleConstructorReturn(this, (QtQuick_Rotation.__proto__ || Object.getPrototypeOf(QtQuick_Rotation)).call(this, meta));

    _this110.axis = new QmlWeb.QObject(_this110);
    QmlWeb.createProperties(_this110.axis, {
      x: "real",
      y: "real",
      z: { type: "real", initialValue: 1 }
    });

    _this110.origin = new QmlWeb.QObject(_this110);
    QmlWeb.createProperties(_this110.origin, {
      x: "real",
      y: "real"
    });

    _this110.angleChanged.connect(_this110.$parent, _this110.$parent.$updateTransform);
    _this110.axis.xChanged.connect(_this110.$parent, _this110.$parent.$updateTransform);
    _this110.axis.yChanged.connect(_this110.$parent, _this110.$parent.$updateTransform);
    _this110.axis.zChanged.connect(_this110.$parent, _this110.$parent.$updateTransform);
    _this110.origin.xChanged.connect(_this110, _this110.$updateOrigin);
    _this110.origin.yChanged.connect(_this110, _this110.$updateOrigin);
    _this110.$parent.$updateTransform();
    return _this110;
  }

  _createClass(QtQuick_Rotation, [{
    key: "$updateOrigin",
    value: function $updateOrigin() {
      var style = this.$parent.dom.style;
      style.transformOrigin = this.origin.x + "px " + this.origin.y + "px";
      style.webkitTransformOrigin = this.origin.x + "px " + this.origin.y + "px";
    }
  }]);

  return QtQuick_Rotation;
}(QtQml_QtObject);

QtQuick_Rotation.properties = {
  angle: "real"
};

QmlWeb.registerQmlType(QtQuick_Rotation);

// eslint-disable-next-line no-undef

var QtQuick_RotationAnimator = function (_QtQuick_Animator2) {
  _inherits(QtQuick_RotationAnimator, _QtQuick_Animator2);

  function QtQuick_RotationAnimator() {
    _classCallCheck(this, QtQuick_RotationAnimator);

    return _possibleConstructorReturn(this, (QtQuick_RotationAnimator.__proto__ || Object.getPrototypeOf(QtQuick_RotationAnimator)).apply(this, arguments));
  }

  return QtQuick_RotationAnimator;
}(QtQuick_Animator);

QtQuick_RotationAnimator.versions = /^2\./;

QmlWeb.registerQmlType(QtQuick_RotationAnimator);

// eslint-disable-next-line no-undef

var QtQuick_Row = function (_QtQuick_Positioner4) {
  _inherits(QtQuick_Row, _QtQuick_Positioner4);

  function QtQuick_Row(meta) {
    _classCallCheck(this, QtQuick_Row);

    var _this112 = _possibleConstructorReturn(this, (QtQuick_Row.__proto__ || Object.getPrototypeOf(QtQuick_Row)).call(this, meta));

    _this112.layoutDirectionChanged.connect(_this112, _this112.layoutChildren);
    _this112.layoutChildren();
    return _this112;
  }

  _createClass(QtQuick_Row, [{
    key: "layoutChildren",
    value: function layoutChildren() {
      var curPos = this.padding;
      var maxHeight = 0;
      // When layoutDirection is RightToLeft we need oposite order
      var i = this.layoutDirection === 1 ? this.children.length - 1 : 0;
      var endPoint = this.layoutDirection === 1 ? -1 : this.children.length;
      var step = this.layoutDirection === 1 ? -1 : 1;
      for (; i !== endPoint; i += step) {
        var child = this.children[i];
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
  }]);

  return QtQuick_Row;
}(QtQuick_Positioner);

QtQuick_Row.properties = {
  layoutDirection: "enum"
};

QmlWeb.registerQmlType(QtQuick_Row);

// eslint-disable-next-line no-undef

var QtQuick_Scale = function (_QtQml_QtObject21) {
  _inherits(QtQuick_Scale, _QtQml_QtObject21);

  function QtQuick_Scale(meta) {
    _classCallCheck(this, QtQuick_Scale);

    var _this113 = _possibleConstructorReturn(this, (QtQuick_Scale.__proto__ || Object.getPrototypeOf(QtQuick_Scale)).call(this, meta));

    _this113.origin = new QmlWeb.QObject(_this113);
    QmlWeb.createProperties(_this113.origin, {
      x: "real",
      y: "real"
    });

    _this113.xScaleChanged.connect(_this113.$parent, _this113.$parent.$updateTransform);
    _this113.yScaleChanged.connect(_this113.$parent, _this113.$parent.$updateTransform);
    _this113.origin.xChanged.connect(_this113, _this113.$updateOrigin);
    _this113.origin.yChanged.connect(_this113, _this113.$updateOrigin);

    /* QML default origin is top-left, while CSS default origin is centre, so
     * $updateOrigin must be called to set the initial transformOrigin. */
    _this113.$updateOrigin();
    return _this113;
  }

  _createClass(QtQuick_Scale, [{
    key: "$updateOrigin",
    value: function $updateOrigin() {
      var style = this.$parent.dom.style;
      style.transformOrigin = this.origin.x + "px " + this.origin.y + "px";
      style.webkitTransformOrigin = this.origin.x + "px " + this.origin.y + "px";
    }
  }]);

  return QtQuick_Scale;
}(QtQml_QtObject);

QtQuick_Scale.properties = {
  xScale: { type: "real", initialValue: 1 },
  yScale: { type: "real", initialValue: 1 }
};

QmlWeb.registerQmlType(QtQuick_Scale);

// eslint-disable-next-line no-undef

var QtQuick_ScaleAnimator = function (_QtQuick_Animator3) {
  _inherits(QtQuick_ScaleAnimator, _QtQuick_Animator3);

  function QtQuick_ScaleAnimator() {
    _classCallCheck(this, QtQuick_ScaleAnimator);

    return _possibleConstructorReturn(this, (QtQuick_ScaleAnimator.__proto__ || Object.getPrototypeOf(QtQuick_ScaleAnimator)).apply(this, arguments));
  }

  return QtQuick_ScaleAnimator;
}(QtQuick_Animator);

QtQuick_ScaleAnimator.versions = /^2\./;

QmlWeb.registerQmlType(QtQuick_ScaleAnimator);

// eslint-disable-next-line no-undef

var QtQuick_SequentialAnimation = function (_QtQuick_Animation5) {
  _inherits(QtQuick_SequentialAnimation, _QtQuick_Animation5);

  function QtQuick_SequentialAnimation(meta) {
    _classCallCheck(this, QtQuick_SequentialAnimation);

    var _this115 = _possibleConstructorReturn(this, (QtQuick_SequentialAnimation.__proto__ || Object.getPrototypeOf(QtQuick_SequentialAnimation)).call(this, meta));

    _this115.animationsChanged.connect(_this115, _this115.$onAnimatonsChanged);

    QmlWeb.engine.$registerStart(function () {
      if (!_this115.running) return;
      _this115.running = false; // toggled back by start();
      _this115.start();
    });
    QmlWeb.engine.$registerStop(function () {
      return self.stop();
    });
    return _this115;
  }

  _createClass(QtQuick_SequentialAnimation, [{
    key: "$onAnimatonsChanged",
    value: function $onAnimatonsChanged() {
      var flags = QmlWeb.Signal.UniqueConnection;
      for (var i = 0; i < this.animations.length; i++) {
        var animation = this.animations[i];
        animation.runningChanged.connect(this, this.$nextAnimation, flags);
      }
    }
  }, {
    key: "$nextAnimation",
    value: function $nextAnimation(proceed) {
      if (this.running && !proceed) {
        this.$curIndex++;
        if (this.$curIndex < this.animations.length) {
          var anim = this.animations[this.$curIndex];
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
  }, {
    key: "start",
    value: function start() {
      if (this.running) return;
      this.running = true;
      this.$curIndex = -1;
      this.$passedLoops = 0;
      this.$nextAnimation();
    }
  }, {
    key: "stop",
    value: function stop() {
      if (!this.running) return;
      this.running = false;
      if (this.$curIndex < this.animations.length) {
        this.animations[this.$curIndex].stop();
      }
    }
  }, {
    key: "complete",
    value: function complete() {
      if (!this.running) return;
      if (this.$curIndex < this.animations.length) {
        // Stop current animation
        this.animations[this.$curIndex].stop();
      }
      this.running = false;
    }
  }]);

  return QtQuick_SequentialAnimation;
}(QtQuick_Animation);

QtQuick_SequentialAnimation.properties = {
  animations: "list"
};
QtQuick_SequentialAnimation.defaultProperty = "animations";

QmlWeb.registerQmlType(QtQuick_SequentialAnimation);

// eslint-disable-next-line no-undef

var QtQuick_ShaderEffect = function (_QtQuick_Item35) {
  _inherits(QtQuick_ShaderEffect, _QtQuick_Item35);

  function QtQuick_ShaderEffect() {
    _classCallCheck(this, QtQuick_ShaderEffect);

    return _possibleConstructorReturn(this, (QtQuick_ShaderEffect.__proto__ || Object.getPrototypeOf(QtQuick_ShaderEffect)).apply(this, arguments));
  }

  return QtQuick_ShaderEffect;
}(QtQuick_Item);

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

var QtQuick_ShaderEffectSource = function (_QtQuick_Item36) {
  _inherits(QtQuick_ShaderEffectSource, _QtQuick_Item36);

  function QtQuick_ShaderEffectSource() {
    _classCallCheck(this, QtQuick_ShaderEffectSource);

    return _possibleConstructorReturn(this, (QtQuick_ShaderEffectSource.__proto__ || Object.getPrototypeOf(QtQuick_ShaderEffectSource)).apply(this, arguments));
  }

  _createClass(QtQuick_ShaderEffectSource, [{
    key: "scheduleUpdate",


    // TODO

    value: function scheduleUpdate() {
      // TODO
    }
  }]);

  return QtQuick_ShaderEffectSource;
}(QtQuick_Item);

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

var QtQuick_State = function (_QtQml_QtObject22) {
  _inherits(QtQuick_State, _QtQml_QtObject22);

  function QtQuick_State(meta) {
    _classCallCheck(this, QtQuick_State);

    var _this118 = _possibleConstructorReturn(this, (QtQuick_State.__proto__ || Object.getPrototypeOf(QtQuick_State)).call(this, meta));

    _this118.$item = _this118.$parent;

    _this118.whenChanged.connect(_this118, _this118.$onWhenChanged);
    return _this118;
  }

  _createClass(QtQuick_State, [{
    key: "$getAllChanges",
    value: function $getAllChanges() {
      var _this119 = this;

      if (this.extend) {
        /* ECMAScript 2015. TODO: polyfill Array?
        const base = this.$item.states.find(state => state.name === this.extend);
        */
        var states = this.$item.states;
        var base = states.filter(function (state) {
          return state.name === _this119.extend;
        })[0];
        if (base) {
          return base.$getAllChanges().concat(this.changes);
        }
        console.error("Can't find the state to extend!");
      }
      return this.changes;
    }
  }, {
    key: "$onWhenChanged",
    value: function $onWhenChanged(newVal) {
      if (newVal) {
        this.$item.state = this.name;
      } else if (this.$item.state === this.name) {
        this.$item.state = "";
      }
    }
  }]);

  return QtQuick_State;
}(QtQml_QtObject);

QtQuick_State.properties = {
  name: "string",
  changes: "list",
  extend: "string",
  when: "bool"
};
QtQuick_State.defaultProperty = "changes";

QmlWeb.registerQmlType(QtQuick_State);

var platformsDetectors = [
//{ name: "W8", regexp: /Windows NT 6\.2/ },
//{ name: "W7", regexp: /Windows NT 6\.1/ },
//{ name: "Windows", regexp: /Windows NT/ },
{ name: "OSX", regexp: /Macintosh/ }];

var systemPalettes = {};

// eslint-disable-next-line no-undef

var QtQuick_SystemPalette = function (_QtQml_QtObject23) {
  _inherits(QtQuick_SystemPalette, _QtQml_QtObject23);

  function QtQuick_SystemPalette(meta) {
    _classCallCheck(this, QtQuick_SystemPalette);

    var _this120 = _possibleConstructorReturn(this, (QtQuick_SystemPalette.__proto__ || Object.getPrototypeOf(QtQuick_SystemPalette)).call(this, meta));

    _this120.colorGroupChanged.connect(_this120, _this120.$onColorGroupChanged);

    _this120.$platform = "OSX";
    // Detect OS
    for (var i = 0; i < platformsDetectors.length; ++i) {
      if (platformsDetectors[i].regexp.test(navigator.userAgent)) {
        _this120.$platform = platformsDetectors[i].name;
        break;
      }
    }

    _this120.$onColorGroupChanged(_this120.colorGroup);
    return _this120;
  }

  _createClass(QtQuick_SystemPalette, [{
    key: "$onColorGroupChanged",
    value: function $onColorGroupChanged(newVal) {
      var _this121 = this;

      var name = ["active", "disabled", "inactive"][newVal];
      var pallete = systemPalettes[this.$platform][name];
      this.$canEditReadOnlyProperties = true;
      Object.keys(pallete).forEach(function (key) {
        _this121[key] = pallete[key];
      });
      delete this.$canEditReadOnlyProperties;
    }
  }]);

  return QtQuick_SystemPalette;
}(QtQml_QtObject);

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

var QtQuick_Text = function (_QtQuick_Item37) {
  _inherits(QtQuick_Text, _QtQuick_Item37);

  function QtQuick_Text(meta) {
    _classCallCheck(this, QtQuick_Text);

    var _this122 = _possibleConstructorReturn(this, (QtQuick_Text.__proto__ || Object.getPrototypeOf(QtQuick_Text)).call(this, meta));

    var fc = _this122.impl = document.createElement("span");
    fc.style.pointerEvents = "none";
    fc.style.width = "100%";
    fc.style.height = "100%";
    fc.style.whiteSpace = "pre";
    _this122.dom.style.textAlign = "left";
    _this122.dom.appendChild(fc);

    _this122.colorChanged.connect(_this122, _this122.$onColorChanged);
    _this122.textChanged.connect(_this122, _this122.$onTextChanged);
    _this122.textFormatChanged.connect(_this122, _this122.$onTextFormatChanged);
    _this122.lineHeightChanged.connect(_this122, _this122.$onLineHeightChanged);
    _this122.wrapModeChanged.connect(_this122, _this122.$onWrapModeChanged);
    _this122.horizontalAlignmentChanged.connect(_this122, _this122.$onHorizontalAlignmentChanged);
    _this122.styleChanged.connect(_this122, _this122.$onStyleChanged);
    _this122.styleColorChanged.connect(_this122, _this122.$onStyleColorChanged);

    _this122.widthChanged.connect(_this122, _this122.$onWidthChanged);
    _this122.fontChanged.connect(_this122, _this122.$onFontChanged);

    _this122.Component.completed.connect(_this122, _this122.Component$onCompleted);
    return _this122;
  }

  _createClass(QtQuick_Text, [{
    key: "$redrawText",
    value: function $redrawText() {
      var text = this.text;
      var format = this.textFormat;
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
  }, {
    key: "$onColorChanged",
    value: function $onColorChanged(newVal) {
      this.impl.style.color = newVal.$css;
    }
  }, {
    key: "$onTextChanged",
    value: function $onTextChanged() {
      this.$redrawText();
    }
  }, {
    key: "$onTextFormatChanged",
    value: function $onTextFormatChanged() {
      this.$redrawText();
    }
  }, {
    key: "$onWidthChanged",
    value: function $onWidthChanged() {
      this.$updateImplicit();
    }
  }, {
    key: "$onLineHeightChanged",
    value: function $onLineHeightChanged(newVal) {
      this.impl.style.lineHeight = newVal + "px";
      this.$updateImplicit();
    }
  }, {
    key: "$onStyleChanged",
    value: function $onStyleChanged(newVal) {
      this.$updateShadow(newVal, this.styleColor.$css);
    }
  }, {
    key: "$onStyleColorChanged",
    value: function $onStyleColorChanged(newVal) {
      this.$updateShadow(this.style, newVal.$css);
    }
  }, {
    key: "$onWrapModeChanged",
    value: function $onWrapModeChanged(newVal) {
      var style = this.impl.style;
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
  }, {
    key: "$onHorizontalAlignmentChanged",
    value: function $onHorizontalAlignmentChanged(newVal) {
      var textAlign = null;
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
  }, {
    key: "$onFontChanged",
    value: function $onFontChanged() {
      this.$updateImplicit();
    }
  }, {
    key: "Component$onCompleted",
    value: function Component$onCompleted() {
      this.$updateImplicit();
    }
  }, {
    key: "$updateImplicit",
    value: function $updateImplicit() {
      if (!this.text || !this.dom) {
        this.implicitHeight = this.implicitWidth = 0;
        return;
      }

      if (!this.$isUsingImplicitWidth) {
        this.implicitWidth = this.impl.offsetWidth;
        this.implicitHeight = this.impl.offsetHeight;
        return;
      }

      var fc = this.impl;
      var engine = QmlWeb.engine;
      // Need to move the child out of it's parent so that it can properly
      // recalculate it's "natural" offsetWidth/offsetHeight
      if (engine.dom === document.body && engine.dom !== engine.domTarget) {
        // Can't use document.body here, as it could have Shadow DOM inside
        // The root is document.body, though, so it's probably not hidden
        engine.domTarget.appendChild(fc);
      } else {
        document.body.appendChild(fc);
      }
      var height = fc.offsetHeight;
      var width = fc.offsetWidth;
      this.dom.appendChild(fc);

      this.implicitHeight = height;
      this.implicitWidth = width;
    }
  }, {
    key: "$updateShadow",
    value: function $updateShadow(textStyle, styleColor) {
      var style = this.impl.style;
      switch (textStyle) {
        case 0:
          style.textShadow = "none";
          break;
        case 1:
          style.textShadow = ["1px 0 0 " + styleColor, "-1px 0 0 " + styleColor, "0 1px 0 " + styleColor, "0 -1px 0 " + styleColor].join(",");
          break;
        case 2:
          style.textShadow = "1px 1px 0 " + styleColor;
          break;
        case 3:
          style.textShadow = "-1px -1px 0 " + styleColor;
          break;
      }
    }
  }, {
    key: "$updateJustifyWhiteSpace",
    value: function $updateJustifyWhiteSpace() {
      var style = this.impl.style;
      // AlignJustify doesn't work with pre/pre-wrap, so we decide the lesser of
      // the two evils to be ignoring "\n"s inside the text.
      if (this.horizontalAlignment === this.Text.AlignJustify) {
        style.whiteSpace = "normal";
      }
      this.$updateImplicit();
    }
  }]);

  return QtQuick_Text;
}(QtQuick_Item);

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

var QtQuick_Controls_2_Label = function (_QtQuick_Text) {
  _inherits(QtQuick_Controls_2_Label, _QtQuick_Text);

  function QtQuick_Controls_2_Label() {
    _classCallCheck(this, QtQuick_Controls_2_Label);

    return _possibleConstructorReturn(this, (QtQuick_Controls_2_Label.__proto__ || Object.getPrototypeOf(QtQuick_Controls_2_Label)).apply(this, arguments));
  }

  return QtQuick_Controls_2_Label;
}(QtQuick_Text);

QtQuick_Controls_2_Label.versions = /^2\./;
QtQuick_Controls_2_Label.properties = {
  background: "Item",
  palette: "palette"
};

QmlWeb.registerQmlType(QtQuick_Controls_2_Label);

// eslint-disable-next-line no-undef

var QtQuick_TextEdit = function (_QtQuick_Item38) {
  _inherits(QtQuick_TextEdit, _QtQuick_Item38);

  function QtQuick_TextEdit(meta) {
    _classCallCheck(this, QtQuick_TextEdit);

    // Undo / Redo stacks;
    var _this124 = _possibleConstructorReturn(this, (QtQuick_TextEdit.__proto__ || Object.getPrototypeOf(QtQuick_TextEdit)).call(this, meta));

    _this124.undoStack = [];
    _this124.undoStackPosition = -1;
    _this124.redoStack = [];
    _this124.redoStackPosition = -1;

    var textarea = _this124.impl = document.createElement("textarea");
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
    _this124.dom.appendChild(textarea);

    _this124.Component.completed.connect(_this124, _this124.Component$onCompleted);
    _this124.textChanged.connect(_this124, _this124.$onTextChanged);
    _this124.colorChanged.connect(_this124, _this124.$onColorChanged);

    _this124.impl.addEventListener("input", function () {
      return _this124.$updateValue();
    });
    return _this124;
  }

  _createClass(QtQuick_TextEdit, [{
    key: "append",
    value: function append(text) {
      this.text += text;
    }
  }, {
    key: "copy",
    value: function copy() {
      // TODO
    }
  }, {
    key: "cut",
    value: function cut() {
      this.text = this.text(0, this.selectionStart) + this.text(this.selectionEnd, this.text.length);
      // TODO
    }
  }, {
    key: "deselect",
    value: function deselect() {
      //this.selectionStart = -1;
      //this.selectionEnd = -1;
      //this.selectedText = null;
      // TODO
    }
  }, {
    key: "getFormattedText",
    value: function getFormattedText(start, end) {
      var text = this.text.slice(start, end);
      // TODO
      // process text
      return text;
    }
  }, {
    key: "getText",
    value: function getText(start, end) {
      return this.text.slice(start, end);
    }
  }, {
    key: "insert",
    value: function insert() /*position, text*/{
      // TODO
    }
  }, {
    key: "isRightToLeft",
    value: function isRightToLeft() /*start, end*/{
      // TODO
    }
  }, {
    key: "linkAt",
    value: function linkAt() /*x, y*/{
      // TODO
    }
  }, {
    key: "moveCursorSelection",
    value: function moveCursorSelection() /*x, y*/{
      // TODO
    }
  }, {
    key: "paste",
    value: function paste() {
      // TODO
    }
  }, {
    key: "positionAt",
    value: function positionAt() /*x, y*/{
      // TODO
    }
  }, {
    key: "positionToRectangle",
    value: function positionToRectangle() /*position*/{
      // TODO
    }
  }, {
    key: "redo",
    value: function redo() {
      // TODO
    }
  }, {
    key: "remove",
    value: function remove() /*start, end*/{
      // TODO
    }
  }, {
    key: "select",
    value: function select() /*start, end*/{
      // TODO
    }
  }, {
    key: "selectAll",
    value: function selectAll() {
      // TODO
    }
  }, {
    key: "selectWord",
    value: function selectWord() {
      // TODO
    }
  }, {
    key: "undo",
    value: function undo() {
      // TODO
    }
  }, {
    key: "Component$onCompleted",
    value: function Component$onCompleted() {
      this.selectByKeyboard = !this.readOnly;
      this.impl.readOnly = this.readOnly;
      this.$updateValue();
      this.implicitWidth = this.offsetWidth;
      this.implicitHeight = this.offsetHeight;
    }
  }, {
    key: "$onTextChanged",
    value: function $onTextChanged(newVal) {
      this.impl.value = newVal;
    }
  }, {
    key: "$onColorChanged",
    value: function $onColorChanged(newVal) {
      this.impl.style.color = newVal.$css;
    }
  }, {
    key: "$updateValue",
    value: function $updateValue() {
      if (this.text !== this.impl.value) {
        this.text = this.impl.value;
      }
      this.length = this.text.length;
      this.lineCount = this.$getLineCount();
      this.$updateCss();
    }
    // Transfer dom style to firstChild,
    // then clear corresponding dom style

  }, {
    key: "$updateCss",
    value: function $updateCss() {
      var supported = ["border", "borderRadius", "borderWidth", "borderColor", "backgroundColor"];
      var style = this.impl.style;
      for (var n = 0; n < supported.length; n++) {
        var o = supported[n];
        var v = this.css[o];
        if (v) {
          style[o] = v;
          this.css[o] = null;
        }
      }
    }
  }, {
    key: "$getLineCount",
    value: function $getLineCount() {
      return this.text.split(/\n/).length;
    }
  }]);

  return QtQuick_TextEdit;
}(QtQuick_Item);

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

var QtQuick_Controls_TextArea = function (_QtQuick_TextEdit) {
  _inherits(QtQuick_Controls_TextArea, _QtQuick_TextEdit);

  function QtQuick_Controls_TextArea(meta) {
    _classCallCheck(this, QtQuick_Controls_TextArea);

    var _this125 = _possibleConstructorReturn(this, (QtQuick_Controls_TextArea.__proto__ || Object.getPrototypeOf(QtQuick_Controls_TextArea)).call(this, meta));

    var textarea = _this125.impl;
    textarea.style.padding = "5px";
    textarea.style.borderWidth = "1px";
    textarea.style.backgroundColor = "#fff";
    return _this125;
  }

  return QtQuick_Controls_TextArea;
}(QtQuick_TextEdit);

QmlWeb.registerQmlType(QtQuick_Controls_TextArea);

// eslint-disable-next-line no-undef

var QtQuick_TextInput = function (_QtQuick_Item39) {
  _inherits(QtQuick_TextInput, _QtQuick_Item39);

  function QtQuick_TextInput(meta) {
    _classCallCheck(this, QtQuick_TextInput);

    var _this126 = _possibleConstructorReturn(this, (QtQuick_TextInput.__proto__ || Object.getPrototypeOf(QtQuick_TextInput)).call(this, meta));

    var input = _this126.impl = document.createElement("input");
    input.type = "text";
    input.disabled = true;
    input.style.pointerEvents = "auto";
    // In some browsers text-inputs have a margin by default, which distorts
    // the positioning, so we need to manually set it to 0.
    input.style.margin = "0";
    input.style.padding = "0";
    input.style.width = "100%";
    input.style.height = "100%";
    _this126.dom.appendChild(input);
    _this126.setupFocusOnDom(input);
    input.disabled = false;

    _this126.Component.completed.connect(_this126, _this126.Component$onCompleted);
    _this126.textChanged.connect(_this126, _this126.$onTextChanged);
    _this126.echoModeChanged.connect(_this126, _this126.$onEchoModeChanged);
    _this126.maximumLengthChanged.connect(_this126, _this126.$onMaximumLengthChanged);
    _this126.readOnlyChanged.connect(_this126, _this126.$onReadOnlyChanged);
    _this126.Keys.pressed.connect(_this126, _this126.Keys$onPressed);

    _this126.impl.addEventListener("input", function () {
      return _this126.$updateValue();
    });
    return _this126;
  }

  _createClass(QtQuick_TextInput, [{
    key: "Component$onCompleted",
    value: function Component$onCompleted() {
      this.implicitWidth = this.impl.offsetWidth;
      this.implicitHeight = this.impl.offsetHeight;
    }
  }, {
    key: "$onTextChanged",
    value: function $onTextChanged(newVal) {
      // We have to check if value actually changes.
      // If we do not have this check, then after user updates text input
      // following occurs: user updates gui text -> updateValue gets called ->
      // textChanged gets called -> gui value updates again -> caret position
      // moves to the right!
      if (this.impl.value !== newVal) {
        this.impl.value = newVal;
      }
    }
  }, {
    key: "$onEchoModeChanged",
    value: function $onEchoModeChanged(newVal) {
      var TextInput = this.TextInput;
      var input = this.impl;
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
  }, {
    key: "$onMaximumLengthChanged",
    value: function $onMaximumLengthChanged(newVal) {
      this.impl.maxLength = newVal < 0 ? null : newVal;
    }
  }, {
    key: "$onReadOnlyChanged",
    value: function $onReadOnlyChanged(newVal) {
      this.impl.disabled = newVal;
    }
  }, {
    key: "Keys$onPressed",
    value: function Keys$onPressed(e) {
      var Qt = QmlWeb.Qt;
      var submit = e.key === Qt.Key_Return || e.key === Qt.Key_Enter;
      if (submit && this.$testValidator()) {
        this.accepted();
        e.accepted = true;
      }
    }
  }, {
    key: "$testValidator",
    value: function $testValidator() {
      if (this.validator) {
        return this.validator.validate(this.text);
      }
      return true;
    }
  }, {
    key: "$updateValue",
    value: function $updateValue() {
      if (this.text !== this.impl.value) {
        this.$canEditReadOnlyProperties = true;
        this.text = this.impl.value;
        this.$canEditReadOnlyProperties = false;
      }
    }
  }]);

  return QtQuick_TextInput;
}(QtQuick_Item);

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

var QtQuick_Transition = function (_QtQml_QtObject24) {
  _inherits(QtQuick_Transition, _QtQml_QtObject24);

  function QtQuick_Transition(meta) {
    _classCallCheck(this, QtQuick_Transition);

    var _this127 = _possibleConstructorReturn(this, (QtQuick_Transition.__proto__ || Object.getPrototypeOf(QtQuick_Transition)).call(this, meta));

    _this127.$item = _this127.$parent;
    return _this127;
  }

  _createClass(QtQuick_Transition, [{
    key: "$start",
    value: function $start(actions) {
      for (var i = 0; i < this.animations.length; i++) {
        var animation = this.animations[i];
        animation.$actions = [];
        var $targets = animation.$targets,
            $props = animation.$props,
            $actions = animation.$actions;

        for (var j in actions) {
          var _action6 = actions[j];
          if (($targets.length === 0 || $targets.indexOf(_action6.target) !== -1) && ($props.length === 0 || $props.indexOf(_action6.property) !== -1)) {
            $actions.push(_action6);
          }
        }
        animation.start();
      }
    }
  }, {
    key: "$stop",
    value: function $stop() {
      for (var i = 0; i < this.animations.length; i++) {
        this.animations[i].stop();
      }
    }
  }]);

  return QtQuick_Transition;
}(QtQml_QtObject);

QtQuick_Transition.properties = {
  animations: "list",
  from: { type: "string", initialValue: "*" },
  to: { type: "string", initialValue: "*" },
  reversible: "bool"
};
QtQuick_Transition.defaultProperty = "animations";

QmlWeb.registerQmlType(QtQuick_Transition);

// eslint-disable-next-line no-undef

var QtQuick_Translate = function (_QtQml_QtObject25) {
  _inherits(QtQuick_Translate, _QtQml_QtObject25);

  function QtQuick_Translate(meta) {
    _classCallCheck(this, QtQuick_Translate);

    var _this128 = _possibleConstructorReturn(this, (QtQuick_Translate.__proto__ || Object.getPrototypeOf(QtQuick_Translate)).call(this, meta));

    _this128.xChanged.connect(_this128.$parent, _this128.$parent.$updateTransform);
    _this128.yChanged.connect(_this128.$parent, _this128.$parent.$updateTransform);
    return _this128;
  }

  return QtQuick_Translate;
}(QtQml_QtObject);

QtQuick_Translate.properties = {
  x: "real",
  y: "real"
};

QmlWeb.registerQmlType(QtQuick_Translate);

// eslint-disable-next-line no-undef

var QtQuick_UniformAnimator = function (_QtQuick_Animator4) {
  _inherits(QtQuick_UniformAnimator, _QtQuick_Animator4);

  function QtQuick_UniformAnimator() {
    _classCallCheck(this, QtQuick_UniformAnimator);

    return _possibleConstructorReturn(this, (QtQuick_UniformAnimator.__proto__ || Object.getPrototypeOf(QtQuick_UniformAnimator)).apply(this, arguments));
  }

  return QtQuick_UniformAnimator;
}(QtQuick_Animator);

QtQuick_UniformAnimator.versions = /^2\./;
QtQuick_UniformAnimator.properties = {
  uniform: "string"
};

QmlWeb.registerQmlType(QtQuick_UniformAnimator);

// eslint-disable-next-line no-undef

var QtQuick_XAnimator = function (_QtQuick_Animator5) {
  _inherits(QtQuick_XAnimator, _QtQuick_Animator5);

  function QtQuick_XAnimator() {
    _classCallCheck(this, QtQuick_XAnimator);

    return _possibleConstructorReturn(this, (QtQuick_XAnimator.__proto__ || Object.getPrototypeOf(QtQuick_XAnimator)).apply(this, arguments));
  }

  return QtQuick_XAnimator;
}(QtQuick_Animator);

QtQuick_XAnimator.versions = /^2\./;

QmlWeb.registerQmlType(QtQuick_XAnimator);

// eslint-disable-next-line no-undef

var QtQuick_YAnimator = function (_QtQuick_Animator6) {
  _inherits(QtQuick_YAnimator, _QtQuick_Animator6);

  function QtQuick_YAnimator() {
    _classCallCheck(this, QtQuick_YAnimator);

    return _possibleConstructorReturn(this, (QtQuick_YAnimator.__proto__ || Object.getPrototypeOf(QtQuick_YAnimator)).apply(this, arguments));
  }

  return QtQuick_YAnimator;
}(QtQuick_Animator);

QtQuick_YAnimator.versions = /^2\./;

QmlWeb.registerQmlType(QtQuick_YAnimator);

// eslint-disable-next-line no-undef

var QtTest_SignalSpy = function (_QtQuick_Item40) {
  _inherits(QtTest_SignalSpy, _QtQuick_Item40);

  function QtTest_SignalSpy() {
    _classCallCheck(this, QtTest_SignalSpy);

    return _possibleConstructorReturn(this, (QtTest_SignalSpy.__proto__ || Object.getPrototypeOf(QtTest_SignalSpy)).apply(this, arguments));
  }

  _createClass(QtTest_SignalSpy, [{
    key: "clear",


    // TODO

    value: function clear() {
      this.count = 0;
      this.signalArguments.length = 0;
      //this.valid = false;
    }

    /*
    wait(timeout = 5000) {
    }
    */

  }]);

  return QtTest_SignalSpy;
}(QtQuick_Item);

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

var QtTest_TestCase = function (_QtQuick_Item41) {
  _inherits(QtTest_TestCase, _QtQuick_Item41);

  function QtTest_TestCase(meta) {
    _classCallCheck(this, QtTest_TestCase);

    var _this133 = _possibleConstructorReturn(this, (QtTest_TestCase.__proto__ || Object.getPrototypeOf(QtTest_TestCase)).call(this, meta));

    _this133.Component.completed.connect(_this133, _this133.Component$onCompleted);

    var engine = QmlWeb.engine;
    if (!engine.tests) {
      QmlWeb.engine.tests = {
        name: engine.name || "Run_" + Math.random().toString(36).slice(2, 10),
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

    _this133.console = {
      assert: function assert() {
        var _console;

        return (_console = console).assert.apply(_console, arguments);
      },
      error: function error() {
        var _console2;

        for (var _len26 = arguments.length, a = Array(_len26), _key27 = 0; _key27 < _len26; _key27++) {
          a[_key27] = arguments[_key27];
        }

        return (_console2 = console).error.apply(_console2, ["QSYSTEM: " + _this133.$testId + " qml:"].concat(a));
      },
      info: function info() {
        var _console3;

        for (var _len27 = arguments.length, a = Array(_len27), _key28 = 0; _key28 < _len27; _key28++) {
          a[_key28] = arguments[_key28];
        }

        return (_console3 = console).info.apply(_console3, ["QINFO  : " + _this133.$testId + " qml:"].concat(a));
      },
      log: function log() {
        var _console4;

        for (var _len28 = arguments.length, a = Array(_len28), _key29 = 0; _key29 < _len28; _key29++) {
          a[_key29] = arguments[_key29];
        }

        return (_console4 = console).log.apply(_console4, ["QDEBUG : " + _this133.$testId + " qml:"].concat(a));
      },
      time: function time() {
        var _console5;

        return (_console5 = console).time.apply(_console5, arguments);
      },
      timeEnd: function timeEnd() {
        var _console6;

        return (_console6 = console).timeEnd.apply(_console6, arguments);
      },
      trace: function trace() {
        var _console7;

        return (_console7 = console).trace.apply(_console7, arguments);
      },
      warn: function warn() {
        var _console8;

        for (var _len29 = arguments.length, a = Array(_len29), _key30 = 0; _key30 < _len29; _key30++) {
          a[_key30] = arguments[_key30];
        }

        return (_console8 = console).warn.apply(_console8, ["QWARN  : " + _this133.$testId + " qml:"].concat(a));
      }
    };
    return _this133;
  }

  _createClass(QtTest_TestCase, [{
    key: "Component$onCompleted",
    value: function Component$onCompleted() {
      var _this134 = this;

      var info = QmlWeb.engine.tests;
      if (!info.started) {
        console.log("********* Start testing of " + info.name + " *********");
        console.log("Config: Using QmlWeb, " + window.navigator.userAgent);
        info.started = true;
      }

      var keys = Object.keys(this);
      var tests = keys.filter(function (key) {
        return key.lastIndexOf("test_", 0) === 0;
      }).filter(function (key) {
        return key.indexOf("_data", key.length - 5) === -1;
      }).sort();

      tests.unshift("initTestCase");
      tests.push("cleanupTestCase");
      tests.forEach(function (test) {
        _this134.$testId = info.name + "::" + _this134.name + "::" + test + "()";
        var special = test === "initTestCase" || test === "cleanupTestCase";

        var dstart = performance.now();
        var data = void 0;
        if (_this134[test + "_data"] && !special) {
          data = _this134[test + "_data"]();
          if (!data || !data.length) {
            _this134.warn("no data supplied for " + test + "() by " + test + "_data()");
            data = [];
          }
        } else if (_this134.init_data && !special) {
          data = _this134.init_data();
          if (!data || !data.length) {
            data = undefined;
          }
        }
        if (!data) {
          data = [null];
        }
        var dend = performance.now();
        info.duration += dend - dstart;

        data.forEach(function (row) {
          var arg = row ? row.tag : "";
          _this134.$testId = info.name + "::" + _this134.name + "::" + test + "(" + arg + ")";
          var start = performance.now();
          var error = void 0;
          try {
            if (!special) {
              _this134.init();
            }
            _this134[test](row);
          } catch (e) {
            error = e;
          } finally {
            if (!special) {
              _this134.cleanup();
            }
          }
          var end = performance.now();
          info.duration += end - start;
          if (error && error.skip) {
            info.stats.skip++;
            console.log("SKIP   : " + _this134.$testId + " " + error.message);
          } else if (error) {
            info.stats.fail++;
            info.errors.push(_this134.$testId + " " + error.message);
            console.log("FAIL!  : " + _this134.$testId + " " + error.message);
            if ("actual" in error) {
              console.log("   Actual   (): " + error.actual);
            }
            if ("expected" in error) {
              console.log("   Expected (): " + error.expected);
            }
          } else {
            info.stats.pass++;
            console.log("PASS   : " + _this134.$testId);
          }
        });

        _this134.$testId = info.name + "::UnknownTestFunc()";
      });

      // TODO: benchmarks

      info.completed++;
      if (info.completed === info.total) {
        info.finished = true;
        var _info$stats = info.stats,
            pass = _info$stats.pass,
            fail = _info$stats.fail,
            skip = _info$stats.skip;

        var duration = Math.round(info.duration * 100) / 100;
        console.log("Totals: " + pass + " passed, " + fail + " failed, " + skip + " skipped, " + duration + "ms");
        console.log("********* Finished testing of " + info.name + " *********");
      }
    }

    // No-ops

  }, {
    key: "init",
    value: function init() {}
  }, {
    key: "initTestCase",
    value: function initTestCase() {}
  }, {
    key: "cleanup",
    value: function cleanup() {}
  }, {
    key: "cleanupTestCase",
    value: function cleanupTestCase() {}

    // API

  }, {
    key: "compare",
    value: function compare(actual, expected) {
      var message = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

      if (actual !== expected) {
        var err = new Error(message);
        err.actual = actual;
        err.expected = expected;
        throw err;
      }
    }
  }, {
    key: "verify",
    value: function verify(condition) {
      var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

      if (!condition) {
        throw new Error("'" + message + "' returned FALSE. ()");
      }
    }
  }, {
    key: "fail",
    value: function fail() {
      var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

      throw new Error(message);
    }
  }, {
    key: "warn",
    value: function warn(message) {
      console.warn("WARNING: " + this.$testId + " " + message);
    }
  }, {
    key: "skip",
    value: function skip() {
      var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

      var err = new Error(message);
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

  }]);

  return QtTest_TestCase;
}(QtQuick_Item);

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

var QtWebSockets_WebSocket = function (_QtQml_QtObject26) {
  _inherits(QtWebSockets_WebSocket, _QtQml_QtObject26);

  function QtWebSockets_WebSocket(meta) {
    _classCallCheck(this, QtWebSockets_WebSocket);

    var _this135 = _possibleConstructorReturn(this, (QtWebSockets_WebSocket.__proto__ || Object.getPrototypeOf(QtWebSockets_WebSocket)).call(this, meta));

    _this135.$socket = undefined;
    _this135.$reconnect = false;

    _this135.statusChanged.connect(_this135, _this135.$onStatusChanged);
    _this135.activeChanged.connect(_this135, _this135.$reconnectSocket);
    _this135.urlChanged.connect(_this135, _this135.$reconnectSocket);
    return _this135;
  }

  _createClass(QtWebSockets_WebSocket, [{
    key: "$onStatusChanged",
    value: function $onStatusChanged(status) {
      if (status !== this.WebSocket.Error) {
        this.errorString = "";
      }
    }
  }, {
    key: "$connectSocket",
    value: function $connectSocket() {
      var _this136 = this;

      this.$reconnect = false;

      if (!this.url || !this.active) {
        return;
      }

      this.status = this.WebSocket.Connecting;
      this.$socket = new WebSocket(this.url);
      this.$socket.onopen = function () {
        _this136.status = _this136.WebSocket.Open;
      };
      this.$socket.onclose = function () {
        _this136.status = _this136.WebSocket.Closed;
        if (_this136.$reconnect) {
          _this136.$connectSocket();
        }
      };
      this.$socket.onerror = function (error) {
        _this136.errorString = error.message;
        _this136.status = _this136.WebSocket.Error;
      };
      this.$socket.onmessage = function (message) {
        _this136.textMessageReceived(message.data);
      };
    }
  }, {
    key: "$reconnectSocket",
    value: function $reconnectSocket() {
      this.$reconnect = true;
      if (this.status === this.WebSocket.Open) {
        this.status = this.WebSocket.Closing;
        this.$socket.close();
      } else if (this.status !== this.WebSocket.Closing) {
        this.$connectSocket();
      }
    }
  }, {
    key: "sendTextMessage",
    value: function sendTextMessage(message) {
      if (this.status === this.WebSocket.Open) {
        this.$socket.send(message);
      }
    }
  }, {
    key: "sendBinaryMessage",
    value: function sendBinaryMessage(message) {
      if (this.status === this.WebSocket.Open) {
        this.$socket.send(message);
      }
    }
  }]);

  return QtWebSockets_WebSocket;
}(QtQml_QtObject);

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

var QtWebView_WebView = function (_QtQuick_Item42) {
  _inherits(QtWebView_WebView, _QtQuick_Item42);

  function QtWebView_WebView(meta) {
    _classCallCheck(this, QtWebView_WebView);

    var _this137 = _possibleConstructorReturn(this, (QtWebView_WebView.__proto__ || Object.getPrototypeOf(QtWebView_WebView)).call(this, meta));

    _this137.urlChanged.connect(_this137, _this137.$onUrlChanged);

    var iframe = _this137.impl = document.createElement("iframe");
    iframe.style.display = "block";
    iframe.style.position = "absolute";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.borderWidth = "0";
    iframe.style.pointerEvents = "auto";
    _this137.dom.appendChild(iframe);

    iframe.onload = function () {
      try {
        _this137.title = iframe.contentDocument.title;
      } catch (e) {
        console.log("CSP prevents us from reading title for " + _this137.url);
        _this137.title = "";
      }
      _this137.loadProgress = 100;
      _this137.loading = false;
    };
    iframe.onerror = function () {
      _this137.title = "";
      _this137.loadProgress = 0;
      _this137.loading = false;
    };
    return _this137;
  }

  _createClass(QtWebView_WebView, [{
    key: "$onUrlChanged",
    value: function $onUrlChanged(newVal) {
      this.loadProgress = 0;
      this.loading = true;
      this.impl.src = newVal;
    }
  }]);

  return QtWebView_WebView;
}(QtQuick_Item);

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

var QtWebEngine_WebEngineView = function (_QtWebView_WebView) {
  _inherits(QtWebEngine_WebEngineView, _QtWebView_WebView);

  function QtWebEngine_WebEngineView() {
    _classCallCheck(this, QtWebEngine_WebEngineView);

    return _possibleConstructorReturn(this, (QtWebEngine_WebEngineView.__proto__ || Object.getPrototypeOf(QtWebEngine_WebEngineView)).apply(this, arguments));
  }

  return QtWebEngine_WebEngineView;
}(QtWebView_WebView);

QtWebEngine_WebEngineView.versions = /^5\./;
QtWebEngine_WebEngineView.properties = {
  // TODO
};
QtWebEngine_WebEngineView.signals = {
  // TODO
};

QmlWeb.registerQmlType(QtWebEngine_WebEngineView);

// eslint-disable-next-line no-undef

var QtWebKit_WebView = function (_QtWebView_WebView2) {
  _inherits(QtWebKit_WebView, _QtWebView_WebView2);

  function QtWebKit_WebView() {
    _classCallCheck(this, QtWebKit_WebView);

    return _possibleConstructorReturn(this, (QtWebKit_WebView.__proto__ || Object.getPrototypeOf(QtWebKit_WebView)).apply(this, arguments));
  }

  return QtWebKit_WebView;
}(QtWebView_WebView);

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



//# sourceMappingURL=qt.js.map
