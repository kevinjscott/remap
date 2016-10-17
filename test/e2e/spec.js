/* eslint-env protractor */

'use strict';

describe('HOME PAGE', function () {
    beforeEach(function () {
        browser.get('');
    });

    it('Should have a title', function () {
        expect(browser.getTitle()).toEqual(jasmine.any(String));
    });

    it('Title should be correct', function () {
        expect(browser.getTitle()).toEqual('Remap data_');
    });
});

describe('HOME PAGE', function () {
    beforeEach(function () {
        browser.get('');
    });

    it('Should have a title', function () {
        expect(browser.getTitle()).toEqual(jasmine.any(String));
    });

    it('Title should be correct', function () {
        expect(browser.getTitle()).toEqual('Remap data');
    });
});
