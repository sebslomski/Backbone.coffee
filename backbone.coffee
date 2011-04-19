###
  Backbone.js 0.3.3
  (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
  Backbone may be freely distributed under the MIT license.
  For all details and documentation:
  http:#documentcloud.github.com/backbone
###


###
  Initial Setup
  -------------

  The top-level namespace. All public Backbone classes and modules will
  be attached to this. Exported for both CommonJS and the browser.
###
if exports?
  Backbone = exports
else
  Backbone = @Backbone = {}

###
  Current version of the library. Keep in sync with `package.json`.
###
Backbone.VERSION = '0.3.3';

###
  Require Underscore, if we're on the server, and it's not already present.
###
_ = if not _ and require? then require('underscore')._ else @_

###
  Turn on `emulateHTTP` to use support legacy HTTP servers. Setting this option will
  fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and set a
  `X-Http-Method-Override` header.
###
Backbone.emulateHTTP = false

###
  Turn on `emulateJSON` to support legacy servers that can't deal with direct
  `application/json` requests ... will encode the body as
  `application/x-www-form-urlencoded` instead and will send the model in a
  form param named `model`.
###
Backbone.emulateJSON = false


###
  Backbone.Events
  -----------------

  A module that can be mixed in to *any object* in order to provide it with
  custom events. You may `bind` or `unbind` a callback function to an event;
  `trigger`-ing an event fires all callbacks in succession.

      var object = {};
      _.extend(object, Backbone.Events);
      object.bind('expand', function(){ alert('expanded'); });
      object.trigger('expand');
###
class Backbone.Events

  ###
    Bind an event, specified by a string name, `ev`, to a `callback` function.
    Passing `"all"` will bind the callback to all events fired.
  ###
  bind: (ev, callback) ->
    calls = @_callbacks or (@_callbacks = {})
    list  = @_callbacks[ev] or (@_callbacks[ev] = [])
    list.push(callback)
    return @

  ###
    Remove one or many callbacks. If `callback` is null, removes all
    callbacks for the event. If `ev` is null, removes all bound callbacks
    for all events.
  ###
  unbind: (ev, callback) ->
    if not ev
      @_callbacks = {}
    else
      calls = @_callbacks
      if not callback
        calls[ev] = []
      else
        list = calls[ev]
        if not list
          return @

        for i in [0..list.length]
          if callback == list[i]
            list.splice(i, 1)
            break

    return @

  ###
    Trigger an event, firing all bound callbacks. Callbacks are passed the
    same arguments as `trigger` is, apart from the event name.
    Listening for `"all"` passes the true event name as the first argument.
  ###
  trigger: (ev) ->
    if not @_callbacks
      return @

    for callback in @_callbacks[ev]
        callback.apply(@, Array.prototype.slice.call(arguments, 1))

    for callback in @_callbacks['all']
      callback.apply(@, arguments)

    return @


###
  Backbone.Collection
  -------------------

  Provides a standard collection class for our sets of models, ordered
  or unordered. If a `comparator` is specified, the Collection will maintain
  its models in sort order, as they're added and removed.
###
class Backbone.Collection extends Backbone.Events

  constructor: (models, options={}) ->
    if options.comparator?
      @comparator = options.comparator
      delete options.comparator

    @_boundOnModelEvent = _.bind(@_onModelEvent, @)
    @_reset()

    if models?
      @refresh(models, {silent: true})

    @initalize(models, options)

  ###
    The default model for a collection is just a **Backbone.Model**.
    This should be overridden in most cases.
  ###
  model: Backbone.Model

  ###
    Initialize is an empty function by default. Override it with your own
    initialization logic.
  ###
  initialize: () ->

  ###
    The JSON representation of a Collection is an array of the
    models' attributes.
  ###
  toJSON: () ->
    return @map((model) -> model.toJSON())

  ###
    Add a model, or list of models to the set. Pass **silent** to avoid
    firing the `added` event for every new model.
  ###
  add: (models, options) ->
    if not _.isArray(models)
      models = [models]

    for model in models
      @_add(model, options)

    return @

  ###
    Remove a model, or a list of models from the set. Pass silent to avoid
    firing the `removed` event for every model removed.
  ###
  remove: (models, options) ->
    if not _.isArray(models)
      models = [models]

    for model in models
      @_remove(model, options)

    return @

  ###
    Get a model from the set by id.
  ###
  get: (id) ->
    if id?
      return null
    else
      return @_byId[if not id.id? then id.id else id]

  ###
    Get a model from the set by client id.
  ###
  getByCid: (cid) ->
    if cid?
      return null
    else
      return @_byCid[if not cid.cid? then cid.cid else cid]


  ###
    Get the model at the given index.
  ###
  at: (index) ->
    return @models[index]
