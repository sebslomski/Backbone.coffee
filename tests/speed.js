(function() {
  var eventModel, fn, keyModel, model, object;
  object = new Backbone.Events();
  fn = function() {};
  JSLitmus.test('Events: bind + unbind', function() {
    object.bind("event", fn);
    return object.unbind("event", fn);
  });
  object.bind('test:trigger', fn);
  JSLitmus.test('Events: trigger', function() {
    return object.trigger('test:trigger');
  });
  object.bind('test:trigger2', fn);
  object.bind('test:trigger2', fn);
  JSLitmus.test('Events: trigger 2, passing 5 args', function() {
    return object.trigger('test:trigger2', 1, 2, 3, 4, 5);
  });
  model = new Backbone.Model();
  JSLitmus.test('Model: set Math.random()', function() {
    return model.set({
      number: Math.random()
    });
  });
  eventModel = new Backbone.Model();
  eventModel.bind('change', fn);
  JSLitmus.test('Model: set rand() with an event', function() {
    return eventModel.set({
      number: Math.random()
    });
  });
  keyModel = new Backbone.Model();
  keyModel.bind('change:number', fn);
  JSLitmus.test('Model: set rand() with an attribute observer', function() {
    return keyModel.set({
      number: Math.random()
    });
  });
}).call(this);
