(function() {
  $(document).ready(function() {
    module("Backbone.Events");
    test("Events: bind and trigger", function() {
      var obj;
      obj = new Backbone.Events();
      obj.counter = 0;
      obj.bind('event', function() {
        return obj.counter += 1;
      });
      obj.trigger('event');
      equals(obj.counter, 1, 'counter should be incremented.');
      obj.trigger('event');
      obj.trigger('event');
      obj.trigger('event');
      obj.trigger('event');
      return equals(obj.counter, 5, 'counter should be incremented five times.');
    });
    test("Events: bind, then unbind all functions", function() {
      var callback, obj;
      obj = new Backbone.Events();
      obj.counter = 0;
      callback = function() {
        return obj.counter += 1;
      };
      obj.bind('event', callback);
      obj.trigger('event');
      obj.unbind('event');
      obj.trigger('event');
      return equals(obj.counter, 1, 'counter should have only been incremented once.');
    });
    test("Events: bind two callbacks, unbind only one", function() {
      var callback, obj;
      obj = new Backbone.Events();
      obj.counterA = 0;
      obj.counterB = 0;
      callback = function() {
        return obj.counterA += 1;
      };
      obj.bind('event', callback);
      obj.bind('event', function() {
        return obj.counterB += 1;
      });
      obj.trigger('event');
      obj.unbind('event', callback);
      obj.trigger('event');
      equals(obj.counterA, 1, 'counterA should have only been incremented once.');
      return equals(obj.counterB, 2, 'counterB should have been incremented twice.');
    });
    test("Events: unbind a callback in the midst of it firing", function() {
      var callback, obj;
      obj = new Backbone.Events();
      obj.counter = 0;
      callback = function() {
        obj.counter += 1;
        return obj.unbind('event', callback);
      };
      obj.bind('event', callback);
      obj.trigger('event');
      obj.trigger('event');
      obj.trigger('event');
      return equals(obj.counter, 1, 'the callback should have been unbound.');
    });
    return test("Events: two binds that unbind themeselves", function() {
      var incrA, incrB, obj;
      obj = new Backbone.Events();
      obj.counterA = 0;
      obj.counterB = 0;
      incrA = function() {
        obj.counterA += 1;
        return obj.unbind('event', incrA);
      };
      incrB = function() {
        obj.counterB += 1;
        return obj.unbind('event', incrB);
      };
      obj.bind('event', incrA);
      obj.bind('event', incrB);
      obj.trigger('event');
      obj.trigger('event');
      obj.trigger('event');
      equals(obj.counterA, 1, 'counterA should have only been incremented once.');
      return equals(obj.counterB, 1, 'counterB should have only been incremented once.');
    });
  });
}).call(this);
