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
    var view;
    module("Backbone.View");
    view = new Backbone.View({
      id: 'test-view',
      className: 'test-view'
    });
    test("View: constructor", function() {
      equals(view.el.id, 'test-view');
      equals(view.el.className, 'test-view');
      equals(view.options.id, 'test-view');
      return equals(view.options.className, 'test-view');
    });
    test("View: jQuery", function() {
      view.el = document.body;
      return equals(view.$('#qunit-header a').get(0).innerHTML, ' Backbone Test Suite');
    });
    test("View: make", function() {
      var div;
      div = view.make('div', {
        id: 'test-div'
      }, "one two three");
      equals(div.tagName.toLowerCase(), 'div');
      equals(div.id, 'test-div');
      return equals($(div).text(), 'one two three');
    });
    test("View: initialize", function() {
      var View;
      View = (function() {
        function View() {
          View.__super__.constructor.apply(this, arguments);
        }
        __extends(View, Backbone.View);
        View.prototype.initialize = function() {
          return this.one = 1;
        };
        return View;
      })();
      view = new View();
      return equals(view.one, 1);
    });
    test("View: delegateEvents", function() {
      var counter, events;
      counter = 0;
      view.el = document.body;
      view.increment = function() {
        return ++counter;
      };
      events = {
        "click #qunit-banner": "increment"
      };
      view.delegateEvents(events);
      $('#qunit-banner').trigger('click');
      equals(counter, 1);
      $('#qunit-banner').trigger('click');
      equals(counter, 2);
      view.delegateEvents(events);
      $('#qunit-banner').trigger('click');
      return equals(counter, 3);
    });
    return test("View: _ensureElement", function() {
      var ViewClass;
      ViewClass = (function() {
        function ViewClass() {
          ViewClass.__super__.constructor.apply(this, arguments);
        }
        __extends(ViewClass, Backbone.View);
        ViewClass.prototype.el = document.body;
        return ViewClass;
      })();
      view = new ViewClass();
      return equals(view.el, document.body);
    });
  });
}).call(this);
