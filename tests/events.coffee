$(document).ready () ->

  module("Backbone.Events")

  test "Events: bind and trigger", () ->
    obj = new Backbone.Events()
    obj.counter = 0
    obj.bind('event', () ->
      obj.counter += 1
    )
    obj.trigger('event')
    equals(obj.counter,1,'counter should be incremented.')
    obj.trigger('event')
    obj.trigger('event')
    obj.trigger('event')
    obj.trigger('event')
    equals(obj.counter, 5, 'counter should be incremented five times.')

  test "Events: bind, then unbind all functions", () ->
    obj = new Backbone.Events()
    obj.counter = 0
    callback = () ->
      obj.counter += 1
    obj.bind('event', callback)
    obj.trigger('event')
    obj.unbind('event')
    obj.trigger('event')
    equals(obj.counter, 1, 'counter should have only been incremented once.')

  test "Events: bind two callbacks, unbind only one", () ->
    obj = new Backbone.Events()
    obj.counterA = 0
    obj.counterB = 0
    callback = () ->
      obj.counterA += 1
    obj.bind('event', callback)
    obj.bind('event', () ->
      obj.counterB += 1
    )
    obj.trigger('event')
    obj.unbind('event', callback)
    obj.trigger('event')
    equals(obj.counterA, 1, 'counterA should have only been incremented once.')
    equals(obj.counterB, 2, 'counterB should have been incremented twice.')

  test "Events: unbind a callback in the midst of it firing", () ->
    obj = new Backbone.Events()
    obj.counter = 0
    callback = () ->
      obj.counter += 1
      obj.unbind('event', callback)

    obj.bind('event', callback)
    obj.trigger('event')
    obj.trigger('event')
    obj.trigger('event')
    equals(obj.counter, 1, 'the callback should have been unbound.')

  test "Events: two binds that unbind themeselves", () ->
    obj = new Backbone.Events()
    obj.counterA = 0
    obj.counterB = 0

    incrA = () ->
      obj.counterA += 1
      obj.unbind('event', incrA)
    incrB = () ->
      obj.counterB += 1
      obj.unbind('event', incrB)

    obj.bind('event', incrA)
    obj.bind('event', incrB)
    obj.trigger('event')
    obj.trigger('event')
    obj.trigger('event')
    equals(obj.counterA, 1, 'counterA should have only been incremented once.')
    equals(obj.counterB, 1, 'counterB should have only been incremented once.')
