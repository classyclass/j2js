// err.js

class CompileError extends Error {
  constructor(message, tokens) {
    super(message + tokens.map(token => token.getLocationMessage()).join(""));
  }
}

class Token {
  constructor(source, pos, type, data) {
    this.source = source;
    this.pos = pos;
    this.type = type;
    this.data = data;
  }
  getLineNumber() {
    let ln = 1;
    const text = this.source.text;
    for (let i = 0; i < this.pos; i++) {
      if (text[i] === "\n") {
        ln++;
      }
    }
    return ln;
  }
  getColumnNumber() {
    let cn = 1;
    const text = this.source.text;
    for (let i = this.pos; i > 0 && text[i-1] !== "\n"; i--) {
      cn++;
    }
    return cn;
  }
  getLine() {
    let start = this.pos, end = this.pos;
    const text = this.source.text;
    while (start > 0 && text[start-1] !== "\n") {
      start--;
    }
    while (end < text.length && text[end] !== "\n") {
      end++;
    }
    return text.slice(start, end);
  }
  getLocationMessage() {
    return "\nin " + this.source.uri + ", line " + this.getLineNumber() +
           "\n" + this.getLine() +
           "\n" + " ".repeat(this.getColumnNumber()-1) + "*";
  }
  toString() {
    return "Token(" + this.type + ", " + this.data + ")";
  }
  inspect() {
    return this.toString();
  }
}

class Source {
  constructor(uri, text) {
    this.uri = uri;
    this.text = text;
  }
}

exports.CompileError = CompileError;
exports.Token = Token;
exports.Source = Source;

