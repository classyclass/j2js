// lexer.js

const err = require("./err.js");

const keywords = [
  "class", "interface", "final", "static", "native", "private", "public",
  "this",
  "abstract",
  "return",
  "for", "if", "else", "while", "break", "continue",
  "true", "false",
  "null",
  "var", "const", "goto",
  "package", "import",
];
const symbols = [
  "(", ")", "[", "]", "{", "}", ",", ".", "...",
  ";", "#", "$", "=",
  "+", "-", "*", "/", "%", "++", "--",
  "&&", "||", "?", ":",
  "==", "!=", "<", ">", "<=", ">=", "!",
  "+=", "-=", "*=", "/=", "%=",
].sort().reverse();
const openParen = "(";
const closeParen = ")";
const openBracket = "[";
const closeBracket = "]";
const openBrace = "{";
const closeBrace = "}";

function isKeyword(name) {
  return keywords.indexOf(name) !== -1;
}

function isPrimitive(name) {
  return ["void", "boolean", "char", "int", "float"].indexOf(name) !== -1;
}

function isTypename(name) {
  return isPrimitive(name) ||
         name[0].toUpperCase() === name[0] &&
         name[0].toLowerCase() !== name[0] &&
         name.slice(1).toUpperCase() !== name.slice(1);
}

function isDigit(ch) {
  return /\d/.test(ch);
}

function isNameChar(ch) {
  return /\w/.test(ch);
}

class Lexer {
  constructor(source) {
    this._source = source;
    this._uri = source.uri;
    this._text = source.text;
    this._pos = 0;
    this._peek = this._extract();
  }
  peek() {
    return this._peek;
  }
  next() {
    const token = this._peek;
    this._peek = this._extract();
    return token;
  }
  _ch(dx) {
    const text = this._text;
    const pos = this._pos + (dx || 0);
    return pos < text.length ? text[pos] : "";
  }
  _startsWith(prefix) {
    return this._text.startsWith(prefix, this._pos);
  }
  _skipWhitespaceAndComments() {
    while (this._ch() !== "" &&
           (" \r\n\t".indexOf(this._ch()) !== -1 ||
            this._startsWith("//") ||
            this._startsWith("/*"))) {
      if (this._startsWith("//")) {
        while (this._ch() !== "" && this._ch() !== "\n") {
          this._pos++;
        }
      } else if (this._startsWith("/*")) {
        const start = this._pos;
        this._pos += 2;
        while (this._ch() !== "" && !this._startsWith("*/")) {
          this._pos++;
        }
        if (this._ch() === "") {
          throw new err.CompileError(
              "Unterminated multiline comment",
              [new err.Token(this._source, start, "ERROR")]);
        }
        this._pos += 2;
      } else {
        this._pos++;
      }
    }
  }
  _extract() {
    this._skipWhitespaceAndComments();
    if (this._ch() === "") {
      return new err.Token(this._source, this._pos, "EOF");
    }
    const start = this._pos;
    // STRING
    if (this._startsWith('r"') || this._startsWith('"') ||
        this._startsWith("r'") || this._startsWith("'")) {
      let raw = false;
      if (this._ch() === "r") {
        raw = true;
        this._pos++;
      }
      let quote = this._ch();
      if (this._startsWith(quote.repeat(3))) {
        quote = quote.repeat(3);
      }
      this._pos += quote.length;
      let str = "";
      while (this._ch() !== "" && !this._startsWith(quote)) {
        if (!raw && this._ch() === "\\") {
          this._pos++;
          switch(this._ch()) {
          case "t": str += "\t"; break;
          case "n": str += "\n"; break;
          case "f": str += "\f"; break;
          case "r": str += "\r"; break;
          case "\\": str += "\\"; break;
          case "'": str += "'"; break;
          case '"': str += '"'; break;
          default:
            throw new err.CompileError(
                "Unrecognized string escape",
                [new err.Token(this._source, this._pos, "ERROR")]);
          }
          this._pos++;
        } else {
          str += this._ch();
          this._pos++;
        }
      }
      this._pos += quote.length;
      return new err.Token(this._source, start, "STRING", str);
    }
    // INT/FLOAT
    let foundDigit = false, foundDot = false;
    while (isDigit(this._ch())) {
      this._pos++;
      foundDigit = true;
    }
    if (this._ch() === ".") {
      this._pos++;
      foundDot = true;
    }
    while (isDigit(this._ch())) {
      this._pos++;
      foundDigit = true;
    }
    if (foundDigit) {
      const val = this._text.slice(start, this._pos);
      if (foundDot) {
        return new err.Token(this._source, start, "FLOAT", val);
      } else {
        return new err.Token(this._source, start, "INT", val);
      }
    } else {
      this._pos = start;
    }
    // NAME/TYPENAME/KEYWORD
    while (isNameChar(this._ch())) {
      this._pos++;
    }
    if (start !== this._pos) {
      const name = this._text.slice(start, this._pos);
      const type =
          isKeyword(name) ? name :
          isTypename(name) ? "TYPENAME" :
          "NAME";
      return new err.Token(
          this._source, start, type, type === name ? undefined : name);
    }
    // SYMBOL
    for (const symbol of symbols) {
      if (this._startsWith(symbol)) {
        this._pos += symbol.length;
        return new err.Token(this._source, start, symbol);
      }
    }
    // ERROR
    const token = new err.Token(this._source, start, "ERROR");
    throw new err.CompileError("Unrecognized token", [token]);
  }
}

function lex(uri, text) {
  const lexer = new Lexer(new err.Source(uri, text));
  const tokens = [];
  while (lexer.peek().type !== "EOF") {
    tokens.push(lexer.next());
  }
  tokens.push(lexer.peek());
  return tokens;
}

exports.lex = lex;


