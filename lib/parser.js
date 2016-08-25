// parser.js

const err = require("./err.js");
const lexer = require("./lexer.js");
const ast = require("./ast.js");

const openParen = "(";
const closeParen = ")";
const openBracket = "[";
const closeBracket = "]";
const openBrace = "{";
const closeBrace = "}";


class Parser {
  constructor(uri, text) {
    this._tokens = lexer.lex(uri, text);
    this._i = 0;
    this._thisClass = null;
  }
  peek() {
    return this._tokens[this._i];
  }
  at(type) {
    return this.peek().type === type;
  }
  next() {
    const token = this.peek();
    this._i++;
    return token;
  }
  consume(type) {
    if (this.at(type)) {
      return this.next();
    }
  }
  expect(type) {
    if (!this.at(type)) {
      throw new err.CompileError(
          "Expected " + type + " but got " + this.peek(), [this.peek()]);
    }
    return this.next();
  }

  parseModule() {
    const classes = [];
    const interfaces = [];
    while (!this.at("EOF")) {
      const token = this.peek();
      let access = "public";
      if (this.at("public") || this.at("private")) {
        access = this.next().type;
      }

      if (this.at("class")) {
        classes.push(this.parseClass(token, access));
      } else if (this.at("interface")) {
        interfaces.push(this.parseInterface(token, access));
      } else {
        throw new err.CompileError(
            "Expected class or interface", [this.peek()]);
      }
    }
    return new ast.Program(classes, interfaces);
  }

  parseInterface(token, access) {
    this.expect("interface");
    const name = this.expect("TYPENAME").data;
    const bases = [];
    if (this.consume("extends")) {
      bases.push(this.expect("TYPENAME").data);
      while (this.consume(",")) {
        bases.push(this.expect("TYPENAME").data);
      }
    }
    this.expect(openBrace);
    const methodStubs = [];
    while (!this.consume(closeBrace)) {
      methodStubs.push(this.parseMethodStub());
    }
    return new ast.Interface(token, access, name, bases, methodStubs);
  }

  parseMethodStub() {
    const token = this.peek();
    let access = "public";
    if (this.at("public") || this.at("private")) {
      access = this.next().type;
    }
    if (access === "private") {
      throw new err.CompileError(
          "interface methods can't be private", [token]);
    }
    const returnType = this.expect("TYPENAME").data;
    const name = this.expect("NAME").data;
    const args = this.parseArgumentList();
    this.expect(";");
    return new ast.MethodStub(token, access, returnType, name, args);
  }

  parseArgumentList() {
    const args = [];
    this.expect(openParen);
    while (!this.consume(closeParen)) {
      const token = this.peek();
      const type = this.expect("TYPENAME").data;
      const name = this.expect("NAME").data;
      args.push(new ast.Argument(token, type, name));
      if (!this.at(closeParen)) {
        this.expect(",");
      }
    }
    return args;
  }

  parseClass(token, access) {
    this.expect("class");
    const name = this.expect("TYPENAME").data;
    this._thisClass = name;
    let base = "Object";
    if (this.consume("extends")) {
      base = this.expect("TYPENAME").data;
    }
    const interfaces = [];
    if (this.consume("implements")) {
      interfaces.push(this.expect("TYPENAME").data);
      while (this.consume(",")) {
        interfaces.push(this.expect("TYPENAME").data);
      }
    }
    this.expect(openBrace);
    const fields = [];
    const methods = [];
    while (!this.consume(closeBrace)) {
      const token = this.peek();
      let access = "public";
      if (this.at("public") || this.at("private")) {
        access = this.next().type;
      }
      let isStatic = !!this.consume("static");
      let type = this.expect("TYPENAME").data;
      const name = this.expect("NAME").data;
      if (this.at(openParen)) {
        methods.push(this.parseMethod(token, access, isStatic, type, name));
      } else {
        fields.push(this.parseField(token, access, isStatic, type, name));
      }
    }
    this._thisClass = null;
    return new ast.Class(
        token, access, name, base, interfaces, fields, methods);
  }

  parseField(token, access, isStatic, type, name) {
    let value = null;
    if (this.consume("=")) {
      value = this.parseExpression();
    }
    this.expect(";");
    return new ast.Field(token, access, isStatic, type, name, value);
  }

  parseMethod(token, access, isStatic, type, name) {
    const args = this.parseArgumentList();
    const body = this.parseBlock();
    return new ast.Method(token, access, isStatic, type, name, args, body);
  }

  parseBlock() {
    const token = this.expect(openBrace);
    const statements = [];
    while (!this.consume(closeBrace)) {
      statements.push(this.parseStatement());
    }
    return new ast.Block(token, statements);
  }

  parseStatement() {
    if (this.at(openBrace)) {
      return this.parseBlock();
    } else {
      const token = this.peek();
      const expression = this.parseExpression();
      this.expect(";");
      return new ast.ExpressionStatement(token, expression);
    }
  }

  parseExpression() {
    return this.parsePostfixExpression();
  }

  parsePostfixExpression() {
    let expr = this.parsePrimaryExpression();
    while (true) {
      const token = this.peek();
      if (this.consume(".")) {
        const name = this.expect("NAME").data;
        if (this.at(openParen)) {
          const args = this.parseArgumentList();
          expr = new ast.MethodCall(token, expr, name, args);
        } else if (this.consume("=")) {
          const value = this.parseExpression();
          expr = new ast.SetField(token, expr, name, value);
        } else {
          expr = new ast.GetField(token, expr, name);
        }
      } else {
        break;
      }
    }
    return expr;
  }

  parsePrimaryExpression() {
    const token = this.peek();
    if (this.consume("this")) {
      return new ast.This(token);
    }
    if (this.consume("true")) {
      return new ast.Bool(token, true);
    }
    if (this.consume("false")) {
      return new ast.Bool(token, false);
    }
    if (this.consume("null")) {
      return new ast.Null(token);
    }
    if (this.at("INT")) {
      return new ast.Int(token, parseInt(this.expect("INT").data));
    }
    if (this.at("FLOAT")) {
      return new ast.Float(token, parseFloat(this.expect("FLOAT").data));
    }
    if (this.at("STRING")) {
      return new ast.String(token, this.expect("STRING").data);
    }
    if (this.at("NAME")) {
      const name = this.expect("NAME").data;
      if (this.at(openParen)) {
        // TODO: Create a separate Ast node that will resolve later
        // to either StaticMethodCall or MethodCall.
        // For now, assume static method call.
        const args = this.parseExpressionList();
        return new ast.StaticMethodCall(token, this._thisClass, name, args);
      } else if (this.at("=")) {
        const value = this.parseExpression();
        return new ast.Assign(token, name, value);
      } else {
        return new ast.Name(token, name);
      }
    }
    throw new err.CompileError("Expected expression", [this.peek()]);
  }

  parseExpressionList() {
    const exprs = [];
    this.expect(openParen);
    while (!this.consume(closeParen)) {
      exprs.push(this.parseExpression());
      if (!this.at(closeParen)) {
        this.expect(",");
      }
    }
    return exprs;
  }
}

function parse(uri, text) {
  const parser = new Parser(uri, text);
  return parser.parseModule();
}

exports.Parser = Parser;
exports.parse = parse;


