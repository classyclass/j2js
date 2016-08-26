// ast.js

class Program {
  constructor(classes, interfaces) {
    this.classes = classes;  // [Class]
    this.interfaces = interfaces;  // [Interface]
  }
}

class Ast {
  constructor(token) {
    this.token = token;
  }
  toString() {
    let str = this.constructor.name + "(";
    let first = true;
    for (const key in this) {
      if (!first) {
        str += ", ";
      }
      str += key + "=" + this[key];
      first = false;
    }
    str += ")";
    return str;
  }
  inspect() {
    return this.toString();
  }
}

class Class extends Ast {
  constructor(token, access, name, base, interfaces, fields, methods) {
    super(token);
    this.access = access;  // "private"|"public"
    this.name = name;  // string
    this.base = base;  // string
    this.interfaces = interfaces;  // [string]
    this.fields = fields;  // [Field]
    this.methods = methods;  // [Method]
  }
}

class Interface extends Ast {
  constructor(token, access, name, bases, methodStubs) {
    super(token);
    this.access = access;  // "private"|"public"
    this.name = name;  // string
    this.bases = bases;  // [string]
    this.methodStubs = methodStubs;  // [MethodStub]
  }
}

class Field extends Ast {
  constructor(token, access, isStatic, type, name) {
    super(token);
    this.access = access;  // "private"|"public"
    this.isStatic = isStatic;  // bool
    this.type = type;  // string
    this.name = name;  // string
  }
}

class MethodStub extends Ast {
  constructor(token, access, returnType, name, args) {
    super(token);
    this.access = access;  // "private"|"public"
    this.returnType = returnType;  // string
    this.name = name;  // string
    this.args = args;  // [Argument]
  }
}

class Method extends Ast {
  constructor(token, access, isStatic, returnType, name, args, body) {
    super(token);
    this.access = access;  // "private"|"public"
    this.isStatic = isStatic;  // bool
    this.returnType = returnType;  // string
    this.name = name;  // string
    this.args = args;  // [Argument]
    this.body = body;  // Block
  }
}

class Argument extends Ast {
  constructor(token, type, name) {
    super(token);
    this.type = type;  // string
    this.name = name;  // string
  }
}

class Statement extends Ast {}

class Block extends Statement {
  constructor(token, statements) {
    super(token);
    this.statements = statements;  // Block
  }
}

class If extends Statement {
  constructor(token, condition, body, other) {
    super(token);
    this.condition = condition;  // Expression
    this.body = body;  // Block
    this.other = other;  // null|If|Block
  }
}

class For extends Statement {
  constructor(token, initialize, condition, increment, body) {
    super(token);
    this.initialize = initialize;  // null|Declaration|ExpressionStatement
    this.condition = condition;  // null|Expression
    this.increment = increment;  // null|Expression
    this.body = body;  // Block
  }
}

class While extends Statement {
  constructor(token, condition, body) {
    super(token);
    this.condition = condition;  // Expression
    this.body = body;  // Block
  }
}

class Break extends Statement {}
class Continue extends Statement {}

class Declaration extends Statement {
  constructor(token, type, name, expression) {
    super(token);
    this.type = type;  // string
    this.name = name;  // string
    this.expression = expression;  // null|Expression
  }
}

class Return extends Statement {
  constructor(token, expression) {
    super(token);
    this.expression = expression;  // null|Expression
  }
}

class ExpressionStatement extends Statement {
  constructor(token, expression) {
    super(token);
    this.expression = expression;  // Expression
  }
}

class Expression extends Ast {}

class This extends Expression {}

class Null extends Expression {}

class Bool extends Expression {
  constructor(token, value) {
    super(token);
    this.value = value;  // bool
  }
}

class Int extends Expression {
  constructor(token, value) {
    super(token);
    this.value = value;  // number
  }
}

class Float extends Expression {
  constructor(token, value) {
    super(token);
    this.value = value;  // number
  }
}

class String extends Expression {
  constructor(token, value) {
    super(token);
    this.value = value;  // string
  }
}

class Name extends Expression {
  constructor(token, name) {
    super(token);
    this.name = name;  // string
  }
}

class Operator extends Expression {
  constructor(token, operator, args) {
    super(token);
    this.operator = operator;  // '+ - % * / ! && || ?: == < <= > >='
    this.args = args;  // [Expression]
  }
}

class GetField extends Expression {
  constructor(token, owner, name) {
    super(token);
    this.owner = owner;  // Expression
    this.name = name;  // string
  }
}

class GetStaticField extends Expression {
  constructor(token, type, name) {
    super(token);
    this.type = type;  // string
    this.name = name;  // string
  }
}

class SetStaticField extends Expression {
  constructor(token, type, name, value) {
    super(token);
    this.type = type;  // string
    this.name = name;  // string
    this.value = value;  // Expression
  }
}

class MethodCall extends Expression {
  constructor(token, owner, name, args) {
    super(token);
    this.owner = owner;  // Expression
    this.name = name;  // string
    this.args = args;  // [Expression]
  }
}

class StaticMethodCall extends Expression {
  constructor(token, type, name, args) {
    super(token);
    this.type = type;  // string
    this.name = name;  // string
    this.args = args;  // [Expression]
  }
}

class New extends Expression {
  constructor(token, type, args) {
    super(token);
    this.type = type;  // string
    this.args = args;  // [Expression]
  }
}


exports.Program = Program;
exports.Ast = Ast;
exports.Class = Class;
exports.Interface = Interface;
exports.Field = Field;
exports.MethodStub = MethodStub;
exports.Method = Method;
exports.Argument = Argument;
exports.Statement = Statement;
exports.Block = Block;
exports.If = If;
exports.For = For;
exports.While = While;
exports.Break = Break;
exports.Continue = Continue;
exports.Declaration = Declaration;
exports.Return = Return;
exports.ExpressionStatement = ExpressionStatement;
exports.Expression = Expression;
exports.This = This;
exports.Null = Null;
exports.Bool = Bool;
exports.Int = Int;
exports.Float = Float;
exports.String = String;
exports.Name = Name;
exports.Operator = Operator;
exports.GetField = GetField;
exports.GetStaticField = GetStaticField;
exports.MethodCall = MethodCall;
exports.StaticMethodCall = StaticMethodCall;
exports.New = New;



