// lexer-test.js
const chai = require('chai');
const lexer = require('../lib/lexer.js');
const expect = chai.expect;

describe('lexer', () => {
  it('parse simple example', () => {
    const tokens = lexer.lex('<test>', "aa Bb class 1 2.4 'hi' ++");
    const types = tokens.map(token => token.type).join(",");
    expect(types).to.equal("NAME,TYPENAME,class,INT,FLOAT,STRING,++,EOF");
  });
});




