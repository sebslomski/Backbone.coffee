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
