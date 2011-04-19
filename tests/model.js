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
    var attrs, collection, doc, klass;
    module("Backbone.Model");
    window.lastRequest = null;
    window.originalSync = Backbone.sync;
    Backbone.sync = (function() {
      function sync() {
        var lastRequest;
        lastRequest = _.toArray(arguments);
      }
      return sync;
    })();
    attrs = {
      id: '1-the-tempest',
      title: "The Tempest",
      author: "Bill Shakespeare",
      length: 123
    };
    doc = new Backbone.Model(attrs);
    klass = (function() {
      function klass() {
        klass.__super__.constructor.apply(this, arguments);
      }
      __extends(klass, Backbone.Collection);
      klass.prototype.url = function() {
        return '/collection';
      };
      return klass;
    })();
    collection = new klass();
    collection.add(doc);
    test("Model: initialize", function() {
      var Model, model;
      Model = (function() {
        function Model() {
          Model.__super__.constructor.apply(this, arguments);
        }
        __extends(Model, Backbone.Model);
        Model.prototype.initialize = function() {
          this.one = 1;
          return equals(this.collection, collection);
        };
        return Model;
      })();
      model = new Model({}, {
        collection: collection
      });
      equals(model.one, 1);
      return equals(model.collection, collection);
    });
    test("Model: initialize with attributes and options", function() {
      var Model, model;
      Model = (function() {
        function Model() {
          Model.__super__.constructor.apply(this, arguments);
        }
        __extends(Model, Backbone.Model);
        Model.prototype.initialize = function(attributes, options) {
          return this.one = options.one;
        };
        return Model;
      })();
      model = new Model({}, {
        one: 1
      });
      return equals(model.one, 1);
    });
    test("Model: url", function() {
      var failed;
      equals(doc.url(), '/collection/1-the-tempest');
      doc.collection.url = '/collection/';
      equals(doc.url(), '/collection/1-the-tempest');
      doc.collection = null;
      failed = false;
      try {
        doc.url();
      } catch (e) {
        failed = true;
      }
      equals(failed, true);
      return doc.collection = collection;
    });
    return test("Model: url when using urlRoot, and uri encoding", function() {
      var Model, model;
      Model = (function() {
        function Model() {
          Model.__super__.constructor.apply(this, arguments);
        }
        __extends(Model, Backbone.Model);
        Model.prototype.urlRoot = '/collection';
        return Model;
      })();
      model = new Model();
      equals(model.url(), '/collection');
      model.set({
        id: '+1+'
      });
      return equals(model.url(), '/collection/%2B1%2B');
    });
  });
}).call(this);
