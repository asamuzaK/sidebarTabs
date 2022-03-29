var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/css/lib/parse/index.js
var require_parse = __commonJS({
  "node_modules/css/lib/parse/index.js"(exports, module) {
    var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
    module.exports = function(css, options) {
      options = options || {};
      var lineno = 1;
      var column = 1;
      function updatePosition(str) {
        var lines = str.match(/\n/g);
        if (lines)
          lineno += lines.length;
        var i = str.lastIndexOf("\n");
        column = ~i ? str.length - i : column + str.length;
      }
      function position() {
        var start = { line: lineno, column };
        return function(node) {
          node.position = new Position(start);
          whitespace();
          return node;
        };
      }
      function Position(start) {
        this.start = start;
        this.end = { line: lineno, column };
        this.source = options.source;
      }
      Position.prototype.content = css;
      var errorsList = [];
      function error(msg) {
        var err = new Error(options.source + ":" + lineno + ":" + column + ": " + msg);
        err.reason = msg;
        err.filename = options.source;
        err.line = lineno;
        err.column = column;
        err.source = css;
        if (options.silent) {
          errorsList.push(err);
        } else {
          throw err;
        }
      }
      function stylesheet() {
        var rulesList = rules();
        return {
          type: "stylesheet",
          stylesheet: {
            source: options.source,
            rules: rulesList,
            parsingErrors: errorsList
          }
        };
      }
      function open() {
        return match(/^{\s*/);
      }
      function close() {
        return match(/^}/);
      }
      function rules() {
        var node;
        var rules2 = [];
        whitespace();
        comments(rules2);
        while (css.length && css.charAt(0) != "}" && (node = atrule() || rule())) {
          if (node !== false) {
            rules2.push(node);
            comments(rules2);
          }
        }
        return rules2;
      }
      function match(re) {
        var m = re.exec(css);
        if (!m)
          return;
        var str = m[0];
        updatePosition(str);
        css = css.slice(str.length);
        return m;
      }
      function whitespace() {
        match(/^\s*/);
      }
      function comments(rules2) {
        var c;
        rules2 = rules2 || [];
        while (c = comment()) {
          if (c !== false) {
            rules2.push(c);
          }
        }
        return rules2;
      }
      function comment() {
        var pos = position();
        if (css.charAt(0) != "/" || css.charAt(1) != "*")
          return;
        var i = 2;
        while (css.charAt(i) != "" && (css.charAt(i) != "*" || css.charAt(i + 1) != "/"))
          ++i;
        i += 2;
        if (css.charAt(i - 1) === "") {
          return error("End of comment missing");
        }
        var str = css.slice(2, i - 2);
        column += 2;
        updatePosition(str);
        css = css.slice(i);
        column += 2;
        return pos({
          type: "comment",
          comment: str
        });
      }
      function selector() {
        var m = match(/^([^{]+)/);
        if (!m)
          return;
        return trim(m[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m2) {
          return m2.replace(/,/g, "\u200C");
        }).split(/\s*(?![^(]*\)),\s*/).map(function(s) {
          return s.replace(/\u200C/g, ",");
        });
      }
      function declaration() {
        var pos = position();
        var prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
        if (!prop)
          return;
        prop = trim(prop[0]);
        if (!match(/^:\s*/))
          return error("property missing ':'");
        var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
        var ret = pos({
          type: "declaration",
          property: prop.replace(commentre, ""),
          value: val ? trim(val[0]).replace(commentre, "") : ""
        });
        match(/^[;\s]*/);
        return ret;
      }
      function declarations() {
        var decls = [];
        if (!open())
          return error("missing '{'");
        comments(decls);
        var decl;
        while (decl = declaration()) {
          if (decl !== false) {
            decls.push(decl);
            comments(decls);
          }
        }
        if (!close())
          return error("missing '}'");
        return decls;
      }
      function keyframe() {
        var m;
        var vals = [];
        var pos = position();
        while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
          vals.push(m[1]);
          match(/^,\s*/);
        }
        if (!vals.length)
          return;
        return pos({
          type: "keyframe",
          values: vals,
          declarations: declarations()
        });
      }
      function atkeyframes() {
        var pos = position();
        var m = match(/^@([-\w]+)?keyframes\s*/);
        if (!m)
          return;
        var vendor = m[1];
        var m = match(/^([-\w]+)\s*/);
        if (!m)
          return error("@keyframes missing name");
        var name = m[1];
        if (!open())
          return error("@keyframes missing '{'");
        var frame;
        var frames = comments();
        while (frame = keyframe()) {
          frames.push(frame);
          frames = frames.concat(comments());
        }
        if (!close())
          return error("@keyframes missing '}'");
        return pos({
          type: "keyframes",
          name,
          vendor,
          keyframes: frames
        });
      }
      function atsupports() {
        var pos = position();
        var m = match(/^@supports *([^{]+)/);
        if (!m)
          return;
        var supports = trim(m[1]);
        if (!open())
          return error("@supports missing '{'");
        var style = comments().concat(rules());
        if (!close())
          return error("@supports missing '}'");
        return pos({
          type: "supports",
          supports,
          rules: style
        });
      }
      function athost() {
        var pos = position();
        var m = match(/^@host\s*/);
        if (!m)
          return;
        if (!open())
          return error("@host missing '{'");
        var style = comments().concat(rules());
        if (!close())
          return error("@host missing '}'");
        return pos({
          type: "host",
          rules: style
        });
      }
      function atmedia() {
        var pos = position();
        var m = match(/^@media *([^{]+)/);
        if (!m)
          return;
        var media = trim(m[1]);
        if (!open())
          return error("@media missing '{'");
        var style = comments().concat(rules());
        if (!close())
          return error("@media missing '}'");
        return pos({
          type: "media",
          media,
          rules: style
        });
      }
      function atcustommedia() {
        var pos = position();
        var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
        if (!m)
          return;
        return pos({
          type: "custom-media",
          name: trim(m[1]),
          media: trim(m[2])
        });
      }
      function atpage() {
        var pos = position();
        var m = match(/^@page */);
        if (!m)
          return;
        var sel = selector() || [];
        if (!open())
          return error("@page missing '{'");
        var decls = comments();
        var decl;
        while (decl = declaration()) {
          decls.push(decl);
          decls = decls.concat(comments());
        }
        if (!close())
          return error("@page missing '}'");
        return pos({
          type: "page",
          selectors: sel,
          declarations: decls
        });
      }
      function atdocument() {
        var pos = position();
        var m = match(/^@([-\w]+)?document *([^{]+)/);
        if (!m)
          return;
        var vendor = trim(m[1]);
        var doc = trim(m[2]);
        if (!open())
          return error("@document missing '{'");
        var style = comments().concat(rules());
        if (!close())
          return error("@document missing '}'");
        return pos({
          type: "document",
          document: doc,
          vendor,
          rules: style
        });
      }
      function atfontface() {
        var pos = position();
        var m = match(/^@font-face\s*/);
        if (!m)
          return;
        if (!open())
          return error("@font-face missing '{'");
        var decls = comments();
        var decl;
        while (decl = declaration()) {
          decls.push(decl);
          decls = decls.concat(comments());
        }
        if (!close())
          return error("@font-face missing '}'");
        return pos({
          type: "font-face",
          declarations: decls
        });
      }
      var atimport = _compileAtrule("import");
      var atcharset = _compileAtrule("charset");
      var atnamespace = _compileAtrule("namespace");
      function _compileAtrule(name) {
        var re = new RegExp("^@" + name + "\\s*([^;]+);");
        return function() {
          var pos = position();
          var m = match(re);
          if (!m)
            return;
          var ret = { type: name };
          ret[name] = m[1].trim();
          return pos(ret);
        };
      }
      function atrule() {
        if (css[0] != "@")
          return;
        return atkeyframes() || atmedia() || atcustommedia() || atsupports() || atimport() || atcharset() || atnamespace() || atdocument() || atpage() || athost() || atfontface();
      }
      function rule() {
        var pos = position();
        var sel = selector();
        if (!sel)
          return error("selector missing");
        comments();
        return pos({
          type: "rule",
          selectors: sel,
          declarations: declarations()
        });
      }
      return addParent(stylesheet());
    };
    function trim(str) {
      return str ? str.replace(/^\s+|\s+$/g, "") : "";
    }
    function addParent(obj, parent) {
      var isNode = obj && typeof obj.type === "string";
      var childParent = isNode ? obj : parent;
      for (var k in obj) {
        var value = obj[k];
        if (Array.isArray(value)) {
          value.forEach(function(v) {
            addParent(v, childParent);
          });
        } else if (value && typeof value === "object") {
          addParent(value, childParent);
        }
      }
      if (isNode) {
        Object.defineProperty(obj, "parent", {
          configurable: true,
          writable: true,
          enumerable: false,
          value: parent || null
        });
      }
      return obj;
    }
  }
});
export default require_parse();
//# sourceMappingURL=css-parser.js.map
