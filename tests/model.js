(function() {
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
        var others;
        others = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        window.lastRequest = others;
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
    test("Model: clone", function() {
      var a, b;
      attrs = {
        'foo': 1,
        'bar': 2,
        'baz': 3
      };
      a = new Backbone.Model(attrs);
      b = a.clone();
      equals(a.get('foo'), 1);
      equals(a.get('bar'), 2);
      equals(a.get('baz'), 3);
      equals(b.get('foo'), a.get('foo'), "Foo should be the same on the clone.");
      equals(b.get('bar'), a.get('bar'), "Bar should be the same on the clone.");
      equals(b.get('baz'), a.get('baz'), "Baz should be the same on the clone.");
      a.set({
        foo: 100
      });
      equals(a.get('foo'), 100);
      return equals(b.get('foo'), 1, "Changing a parent attribute does not change the clone.");
    });
    test("Model: isNew", function() {
      var a;
      attrs = {
        'foo': 1,
        'bar': 2,
        'baz': 3
      };
      a = new Backbone.Model(attrs);
      ok(a.isNew(), "it should be new");
      attrs = {
        'foo': 1,
        'bar': 2,
        'baz': 3,
        'id': -5
      };
      return ok(a.isNew(), "any defined ID is legal, negative or positive");
    });
    test("Model: get", function() {
      equals(doc.get('title'), 'The Tempest');
      return equals(doc.get('author'), 'Bill Shakespeare');
    });
    test("Model: escape", function() {
      equals(doc.escape('title'), 'The Tempest');
      doc.set({
        audience: 'Bill & Bob'
      });
      equals(doc.escape('audience'), 'Bill &amp; Bob');
      doc.set({
        audience: 'Tim > Joan'
      });
      equals(doc.escape('audience'), 'Tim &gt; Joan');
      doc.unset('audience');
      return equals(doc.escape('audience'), '');
    });
    test("Model: set and unset", function() {
      var a, changeCount;
      attrs = {
        'foo': 1,
        'bar': 2,
        'baz': 3
      };
      a = new Backbone.Model(attrs);
      changeCount = 0;
      a.bind("change:foo", function() {
        return changeCount += 1;
      });
      a.set({
        'foo': 2
      });
      ok(a.get('foo') === 2, "Foo should have changed.");
      ok(changeCount === 1, "Change count should have incremented.");
      a.set({
        'foo': 2
      });
      ok(a.get('foo') === 2, "Foo should NOT have changed, still 2");
      ok(changeCount === 1, "Change count should NOT have incremented.");
      a.unset('foo');
      ok(!(a.get('foo') != null), "Foo should have changed");
      return ok(changeCount === 2, "Change count should have incremented for unset.");
    });
    test("Model: set an empty string", function() {
      var model;
      model = new Backbone.Model({
        name: "Model"
      });
      model.set({
        name: ''
      });
      return equals(model.get('name'), '');
    });
    test("Model: clear", function() {
      var changed, model;
      changed = false;
      model = new Backbone.Model({
        name: "Model"
      });
      model.bind("change:name", function() {
        return changed = true;
      });
      model.clear();
      equals(changed, true);
      return equals(model.get('name'), void 0);
    });
    test("Model: defaults", function() {
      var Defaulted, model;
      Defaulted = (function() {
        function Defaulted() {
          Defaulted.__super__.constructor.apply(this, arguments);
        }
        __extends(Defaulted, Backbone.Model);
        Defaulted.prototype.defaults = {
          'one': 1,
          'two': 2
        };
        return Defaulted;
      })();
      model = new Defaulted({
        two: null
      });
      equals(model.get('one'), 1);
      return equals(model.get('two'), null);
    });
    test("Model: change, hasChanged, changedAttributes, previous, previousAttributes", function() {
      var model;
      model = new Backbone.Model({
        name: "Tim",
        age: 10
      });
      model.bind('change', function() {
        ok(model.hasChanged('name'), 'name changed');
        ok(!model.hasChanged('age'), 'age did not');
        ok(_.isEqual(model.changedAttributes(), {
          name: 'Rob'
        }), 'changedAttributes returns the changed attrs');
        equals(model.previous('name'), 'Tim');
        return ok(_.isEqual(model.previousAttributes(), {
          name: "Tim",
          age: 10
        }), 'previousAttributes is correct');
      });
      model.set({
        name: 'Rob'
      }, {
        silent: true
      });
      model.change();
      return equals(model.get('name'), 'Rob');
    });
    test("Model: change with options", function() {
      var model, value;
      model = new Backbone.Model({
        name: 'Rob'
      });
      value = null;
      model.bind('change', function(model, options) {
        return value = options.prefix + model.get('name');
      });
      model.set({
        name: 'Bob'
      }, {
        silent: true
      });
      model.change({
        prefix: 'Mr. '
      });
      equals(value, 'Mr. Bob');
      model.set({
        name: 'Sue'
      }, {
        prefix: 'Ms. '
      });
      return equals(value, 'Ms. Sue');
    });
    test("Model: save within change event", function() {
      var model;
      model = new Backbone.Model({
        firstName: "Taylor",
        lastName: "Swift"
      });
      model.bind('change', function() {
        model.save();
        return ok(_.isEqual(window.lastRequest[1], model));
      });
      return model.set({
        lastName: 'Hicks'
      });
    });
    test("Model: save", function() {
      doc.save({
        title: "Henry V"
      });
      equals(window.lastRequest[0], 'update');
      return ok(_.isEqual(window.lastRequest[1], doc));
    });
    return test("Model: fetch", function() {
      doc.fetch();
      ok(window.lastRequest[0], 'read');
      return ok(_.isEqual(window.lastRequest[1], doc));
    });
  });
}).call(this);
