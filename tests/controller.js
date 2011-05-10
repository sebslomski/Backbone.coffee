(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  $(document).ready(function() {
    var Controller, controller;
    module("Backbone.Controller");
    Controller = (function() {
      function Controller() {
        Controller.__super__.constructor.apply(this, arguments);
      }
      __extends(Controller, Backbone.Controller);
      Controller.prototype.routes = {
        "search/:query": "search",
        "search/:query/p:page": "search",
        "splat/*args/end": "splat",
        "*first/complex-:part/*rest": "complex"
      };
      Controller.prototype.initialize = function(options) {
        return this.testing = options.testing;
      };
      Controller.prototype.search = function(query, page) {
        this.query = query;
        return this.page = page;
      };
      Controller.prototype.splat = function(args) {
        return this.args = args;
      };
      Controller.prototype.complex = function(first, part, rest) {
        this.first = first;
        this.part = part;
        return this.rest = rest;
      };
      return Controller;
    })();
    controller = new Controller({
      testing: 101
    });
    Backbone.history.interval = 9;
    Backbone.history.start();
    test("Controller: initialize", function() {
      return equals(controller.testing, 101);
    });
    asyncTest("Controller: routes (simple)", 2, function() {
      window.location.hash = 'search/news';
      return setTimeout(function() {
        equals(controller.query, 'news');
        equals(controller.page, null);
        return start();
      }, 10);
    });
    asyncTest("Controller: routes (two part)", 2, function() {
      window.location.hash = 'search/nyc/p10';
      return setTimeout(function() {
        equals(controller.query, 'nyc');
        equals(controller.page, '10');
        return start();
      }, 10);
    });
    asyncTest("Controller: routes (splats)", function() {
      window.location.hash = 'splat/long-list/of/splatted_99args/end';
      return setTimeout(function() {
        equals(controller.args, 'long-list/of/splatted_99args');
        return start();
      }, 10);
    });
    return asyncTest("Controller: routes (complex)", 3, function() {
      window.location.hash = 'one/two/three/complex-part/four/five/six/seven';
      return setTimeout(function() {
        equals(controller.first, 'one/two/three');
        equals(controller.part, 'part');
        equals(controller.rest, 'four/five/six/seven');
        start();
        return window.location.hash = '';
      }, 10);
    });
  });
}).call(this);
