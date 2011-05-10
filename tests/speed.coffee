object = new Backbone.Events()
fn = () ->

JSLitmus.test 'Events: bind + unbind', () ->
  object.bind("event", fn)
  object.unbind("event", fn)

object.bind('test:trigger', fn)

JSLitmus.test 'Events: trigger', () ->
  object.trigger('test:trigger')

object.bind('test:trigger2', fn)
object.bind('test:trigger2', fn)

JSLitmus.test 'Events: trigger 2, passing 5 args', () ->
  object.trigger('test:trigger2', 1, 2, 3, 4, 5)

model = new Backbone.Model()

JSLitmus.test 'Model: set Math.random()', () ->
  model.set({number: Math.random()})

eventModel = new Backbone.Model()
eventModel.bind('change', fn)

JSLitmus.test 'Model: set rand() with an event', () ->
  eventModel.set({number: Math.random()})

keyModel = new Backbone.Model()
keyModel.bind('change:number', fn)

JSLitmus.test 'Model: set rand() with an attribute observer', () ->
  keyModel.set({number: Math.random()})
