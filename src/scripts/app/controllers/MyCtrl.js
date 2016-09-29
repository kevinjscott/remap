'use strict';

var mCtrls = require('./_mCtrls'),
    debug = require('debug'),
    log = debug('Ctrls'),
    fixy = require('fixy'),
    loader = require('../../utilities/loader');

mCtrls.controller('MyCtrl', function ($scope) {
    log('test');
    $scope.test = 'test2';
    console.log(loader.getLoader('main').getResult('app-data'));

    $scope.indata = _.repeat('1234567890', 8);

    $scope.calculateOutdata = function() {
      var indata = $scope.indata;
      console.log(indata);
      $scope.outdata = indata + indata;
    }
});
