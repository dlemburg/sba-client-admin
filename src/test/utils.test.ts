import 'core-js/es7/reflect';
import 'mocha';
//import * as Chai from 'chai';
//let expect = Chai.expect;
import { expect } from 'chai';
import { Utils } from '../utils/utils';

describe('generateRandomString()', () => {
  it('should generate a random string with a length of arg- defaults to length 8', () => {
    const test = Utils.generateRandomString(6);
    expect(test.length).to.equal(6);
  });
});


describe('generateRandomNumber()', () => {
  it('should generate a random number with a length of arg- defaults to length 4', () => {
    let test = Utils.generateRandomNumber(4).toString()
    expect(test.length).to.equal(4);
  });
});

describe('roundAndAppendZero()', () => {
  it('should round to 2 places and append a zero if javascript cuts off second decimal place zero', () => {
    let test: string = Utils.roundAndAppendZero(4.1986)
    expect(test).to.equal("4.20");
  });
});
