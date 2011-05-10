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
    var setup;
    module("Backbone.Collection");
    window.lastRequest = null;
    Backbone.sync = (function() {
      function sync() {
        var others;
        others = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        window.lastRequest = others;
      }
      return sync;
    })();
    setup = function() {
      var a, b, c, d;
      a = new Backbone.Model({
        id: 3,
        label: 'a'
      });
      b = new Backbone.Model({
        id: 2,
        label: 'b'
      });
      c = new Backbone.Model({
        id: 1,
        label: 'c'
      });
      d = new Backbone.Model({
        id: 0,
        label: 'd'
      });
      return [new Backbone.Collection([a, b, c, d]), [a, b, c, d]];
    };
    test("Collection: new and sort", function() {
      var a, b, c, col, d, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      equals(col.first(), a, "a should be first");
      equals(col.last(), d, "d should be last");
      col.comparator = function(model) {
        return model.id;
      };
      col.sort();
      equals(col.first(), d, "d should be first");
      equals(col.last(), a, "a should be last");
      return equals(col.length, 4);
    });
    test("Collection: get, getByCid", function() {
      var a, b, c, col, d, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      equals(col.get(0), d);
      equals(col.get(2), b);
      return equals(col.getByCid(col.first().cid), col.first());
    });
    test("Collection: update index when id changes", function() {
      var a, b, c, col, d, one, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      col = new Backbone.Collection();
      col.add([
        {
          id: 0,
          name: 'one'
        }, {
          id: 1,
          name: 'two'
        }
      ]);
      one = col.get(0);
      equals(one.get('name'), 'one');
      one.set({
        id: 101
      });
      equals(col.get(0), null);
      return equals(col.get(101).get('name'), 'one');
    });
    test("Collection: at", function() {
      var a, b, c, col, d, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      return equals(col.at(2), c);
    });
    test("Collection: pluck", function() {
      var a, b, c, col, d, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      return equals(col.pluck('label').join(' '), 'a b c d');
    });
    test("Collection: add", function() {
      var a, added, b, c, col, d, e, opts, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      added = opts = null;
      col.bind('add', function(model, collection, options) {
        added = model.get('label');
        return opts = options;
      });
      e = new Backbone.Model({
        id: 10,
        label: 'e'
      });
      col.add(e, {
        amazing: true
      });
      equals(added, 'e');
      equals(col.length, 5);
      equals(col.last(), e);
      return ok(opts.amazing);
    });
    test("Collection: remove", function() {
      var a, b, c, col, d, removed, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      removed = null;
      col.bind('remove', function(model) {
        return removed = model.get('label');
      });
      col.remove(d);
      equals(removed, 'd');
      equals(col.length, 3);
      return equals(col.first(), a);
    });
    test("Collection: remove in multiple collections", function() {
      var a, b, c, col, colE, colF, d, e, f, modelData, passed, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      modelData = {
        id: 5,
        title: 'Othello'
      };
      passed = false;
      e = new Backbone.Model(modelData);
      f = new Backbone.Model(modelData);
      f.bind('remove', function() {
        return passed = true;
      });
      colE = new Backbone.Collection([e]);
      colF = new Backbone.Collection([f]);
      ok(e !== f);
      ok(colE.length === 1);
      ok(colF.length === 1);
      colE.remove(e);
      equals(passed, false);
      ok(colE.length === 0);
      colF.remove(e);
      ok(colF.length === 0);
      return equals(passed, true);
    });
    test("Collection: fetch", function() {
      var a, b, c, col, d, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      col.fetch();
      equals(lastRequest[0], 'read');
      return equals(lastRequest[1], col);
    });
    test("Collection: create", function() {
      var a, b, c, col, d, model, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      model = col.create({
        label: 'f'
      });
      equals(lastRequest[0], 'create');
      equals(lastRequest[1], model);
      equals(model.get('label'), 'f');
      return equals(model.collection, col);
    });
    test("collection: initialize", function() {
      var Collection, coll;
      Collection = (function() {
        function Collection() {
          Collection.__super__.constructor.apply(this, arguments);
        }
        __extends(Collection, Backbone.Collection);
        Collection.prototype.initialize = function() {
          return this.one = 1;
        };
        return Collection;
      })();
      coll = new Collection();
      return equals(coll.one, 1);
    });
    test("Collection: toJSON", function() {
      var a, b, c, col, d, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      return equals(JSON.stringify(col), '[{"id":3,"label":"a"},{"id":2,"label":"b"},{"id":1,"label":"c"},{"id":0,"label":"d"}]');
    });
    test("Collection: Underscore methods", function() {
      var a, b, c, col, d, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      equals(col.map(function(model) {
        return model.get('label');
      }).join(' '), 'a b c d');
      equals(col.any(function(model) {
        return model.id === 100;
      }), false);
      equals(col.any(function(model) {
        return model.id === 0;
      }), true);
      equals(col.indexOf(b), 1);
      equals(col.size(), 4);
      equals(col.rest().length, 3);
      ok(!_.include(col.rest()), a);
      ok(!_.include(col.rest()), d);
      ok(!col.isEmpty());
      ok(!_.include(col.without(d)), d);
      equals(col.max(function(model) {
        return model.id;
      }).id, 3);
      equals(col.min(function(model) {
        return model.id;
      }).id, 0);
      return same(col.chain().filter(function(o) {
        return o.id % 2 === 0;
      }).map(function(o) {
        return o.id * 2;
      }).value(), [4, 0]);
    });
    return test("Collection: refresh", function() {
      var a, b, c, col, d, models, refreshed, _ref, _ref2;
      _ref = setup(), col = _ref[0], _ref2 = _ref[1], a = _ref2[0], b = _ref2[1], c = _ref2[2], d = _ref2[3];
      refreshed = 0;
      models = col.models;
      col.bind('refresh', function() {
        return refreshed += 1;
      });
      col.refresh([]);
      equals(refreshed, 1);
      equals(col.length, 0);
      equals(col.last() != null, false);
      col.refresh(models);
      equals(refreshed, 2);
      equals(col.length, 4);
      equals(col.last(), d);
      col.refresh(_.map(models, function(m) {
        return m.attributes;
      }));
      equals(refreshed, 3);
      equals(col.length, 4);
      ok(col.last() !== a);
      return ok(_.isEqual(col.last().attributes, d.attributes));
    });
  });
}).call(this);
