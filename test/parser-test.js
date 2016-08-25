// lexer-test.js
const chai = require("chai");
const parser = require("../lib/parser.js");
const expect = chai.expect;

describe("parser", () => {
  it("parse an interface", () => {
    const program = parser.parse("<test>", `
    public interface MyInterface {
      public void myMethodStub(String message);
      public String stub2(int x, float y);
    }
    `);
    expect(program.interfaces.length).to.equal(1);
    const iface = program.interfaces[0];
    expect(iface.name).to.equal("MyInterface");
    expect(iface.methodStubs.length).to.equal(2);
    {
      const methodStub = iface.methodStubs[0];
      expect(methodStub.name).to.equal("myMethodStub");
      expect(methodStub.returnType).to.equal("void");
      expect(methodStub.args.length).to.equal(1);
      expect(methodStub.args[0].type).to.equal("String");
      expect(methodStub.args[0].name).to.equal("message");
    }
    {
      const methodStub = iface.methodStubs[1];
      expect(methodStub.name).to.equal("stub2");
      expect(methodStub.returnType).to.equal("String");
      expect(methodStub.args.length).to.equal(2);
      expect(methodStub.args[0].type).to.equal("int");
      expect(methodStub.args[0].name).to.equal("x");
      expect(methodStub.args[1].type).to.equal("float");
      expect(methodStub.args[1].name).to.equal("y");
    }
  });
  it("parse a class", () => {
    const program = parser.parse("<test>", `
    public class MyClass {
      public static void main() {
        print("Hi");
        this.someMethod();
      }
    }
    `);
    expect(program.classes.length).to.equal(1);
    const cls = program.classes[0];
    expect(cls.name).to.equal("MyClass");
    expect(cls.methods.length).to.equal(1);
    {
      const method = cls.methods[0];
      expect(method.name).to.equal("main");
      expect(method.isStatic).to.equal(true);
      expect(method.returnType).to.equal("void");
      expect(method.args.length).to.equal(0);
    }
  });
});




