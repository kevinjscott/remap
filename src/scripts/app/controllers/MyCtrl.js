'use strict';

var mCtrls = require('./_mCtrls'),
    // debug = require('debug'),
    // log = debug('Ctrls'),
    _ = require('lodash'),
    // loader = require('../../utilities/loader'),
    fixy = require('fixy');

mCtrls.controller('MyCtrl', function ($scope) {
    // log('test');
    // $scope.test = 'test2';
    // console.log(loader.getLoader('main').getResult('app-data'));
    // console.log(_.VERSION);

    // $scope.indata = _.repeat('0123456789', 8);
    $scope.indata = 'YES21ABC\nYES22DEF\nNOO23GHI\nYES24JKL';
    $scope.lineselector = '^YES';
    $scope.maps = [ 
        {
            'name': 'Age',
            'inwidth': 2,
            'instart': 4,
            'type': 'int',
            'transform': null, // todo
            'outwidth': 7,
            'padding_position': 'end',
            'padding_symbol': '-'
        }, {
            'name': 'Initials',
            'inwidth': 3,
            'instart': 6,
            'type': 'string',
            'transform': null, // todo
            'outwidth': 10,
            'padding_position': 'end',
            'padding_symbol': '_'
        }
    ];

    $scope.calculateOutdata = function () {
        var keyMapping, maps, datawidth;
        var predata = _.split($scope.indata, '\n');

        keyMapping = {
            'name': 'name',
            'inwidth': 'width',
            'instart': 'start',
            'type': 'type'
        };
        maps = _.map($scope.maps, function (currentObject) {
            return _.transform(currentObject, function (result, value, key) {
                if (keyMapping[key] && value) {
                    result[keyMapping[key]] = value * 1 ? value * 1 : value;
                }
            });
        });

        // console.log(maps);
        // console.log(predata);
        predata = _.filter(predata, function (str) {
            var re = $scope.lineselector;

            re = new RegExp(re, '');
            return (re.exec(str));
        });

        // console.log(predata);

        datawidth = predata[0] ? predata[0].length : 0;
        // $scope.erroralert = "damn";
        predata = _.join(predata, '\n');

        var nativedata = fixy.parse({
            map: maps,
            options: {
                fullwidth: datawidth, // todo: check each line, warn on length, error when lines are excluded
                skiplines: [], // todo
                format: 'json'
            }
        }, predata);

        keyMapping = {
            'name': 'name',
            'outwidth': 'width',
            'padding_position': 'padding_position',
            'padding_symbol': 'padding_symbol'
        };
        maps = _.map($scope.maps, function (currentObject) {
            return _.transform(currentObject, function (result, value, key) {
                if (keyMapping[key] && value) {
                    result[keyMapping[key]] = value * 1 ? value * 1 : value;
                }
            });
        });
        // console.log(maps);

        var result = fixy.unparse(maps, nativedata);

        $scope.outdata = result;
    };

});
