###
  Backbone.js 0.3.3
  (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
  Backbone may be freely distributed under the MIT license.
  For all details and documentation:
  http://documentcloud.github.com/backbone
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
Backbone.VERSION = '0.3.3'

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
    @_callbacks or= {}
    @_callbacks[ev] or= []
    @_callbacks[ev].push(callback)
    return @

  ###
    Remove one or many callbacks. If `callback` is null, removes all
    callbacks for the event. If `ev` is null, removes all bound callbacks
    for all events.
  ###
  unbind: (ev, callback) ->
    if not ev
      @_callbacks = {}
    else if @_callbacks
      if not callback
        @_callbacks[ev] = []
      else
        for i in [0..@_callbacks[ev].length-1]
          if callback is @_callbacks[ev][i]
            @_callbacks[ev].splice(i, 1)
            break

    return @

  ###
    Trigger an event, firing all bound callbacks. Callbacks are passed the
    same arguments as `trigger` is, apart from the event name.
    Listening for `"all"` passes the true event name as the first argument.
  ###
  trigger: (ev, options...) ->
    if not @_callbacks
      return @

    if @_callbacks[ev]?
      for callback in @_callbacks[ev]
        if callback
          callback.apply(@, options)

    if @_callbacks['all']?
      for callback in @_callbacks['all']
        callback.apply(@, arguments)

    return @


###
  Backbone.Model
  --------------
###

class Backbone.Model extends Backbone.Events
  ###
    Create a new model, with defined attributes. A client id (`cid`)
    is automatically generated and assigned for you.
  ###
  constructor: (attributes={}, options) ->
    if @defaults
      attributes = _.extend({}, @defaults, attributes)
    @attributes = {}
    @_escapedAttributes = {}
    @cid = _.uniqueId('c')
    @set(attributes, {silent: true})
    @_previousAttributes = _.clone(@attributes)
    if options? and options.collection?
      @collection = options.collection
    @initialize(attributes, options)

  ###
    A snapshot of the model's previous attributes, taken immediately
    after the last `"change"` event was fired.
  ###
  _previousAttributes: null

  ###
    Has the item been changed since the last `"change"` event?
  ###
  _changed: false

  ###
    Initialize is an empty function by default. Override it with your own
    initialization logic.
  ###
  initialize: () ->

  ###
    Return a copy of the model's `attributes` object.
  ###
  toJSON: () ->
    _.clone(@attributes)

  ###
    Get the value of an attribute.
  ###
  get: (attr) ->
    @attributes[attr]

  ###
    Get the HTML-escaped value of an attribute.
  ###
  escape: (attr) ->
    if @_escapedAttributes[attr]
      return @_escapedAttributes[attr]
    val = @attributes[attr] or ''
    @_escapedAttributes[attr] = Backbone.Helpers::escapeHTML(val)

  ###
    Set a hash of model attributes on the object, firing `"change"` unless you
    choose to silence it.
  ###
  set: (attrs, options={}) ->
    # Extract attributes and options.
    return @ if not attrs
    attrs = attrs.attributes if attrs.attributes?

    # Run validation.
    if not options.silent and @validate and not @_performValidation(attrs, options)
      return false

    # Check for changes of `id`.
    @id = attrs.id if attrs.id?

    # Update attributes.
    for attr of attrs
      val = attrs[attr]
      if not _.isEqual(@attributes[attr], val)
        @attributes[attr] = val
        delete @_escapedAttributes[attr]
        if not options.silent
          @_changed = true
          @trigger('change:' + attr, @, val, options)

    # Fire the `"change"` event, if the model has been changed.
    @change(options) if not options.silent and @_changed
    return @

  ###
    Remove an attribute from the model, firing `"change"` unless you choose
    to silence it.
  ###
  unset: (attr, options={}) ->
    value = @attributes[attr]

    # Run validation.
    validObj = {}
    validObj[attr] = null
    if not options.silent and @validate and not @_performValidation(validObj, options)
      return false

    # Remove the attribute.
    delete @attributes[attr]
    delete @_escapedAttributes[attr]
    if not options.silent
      @_changed = true
      @trigger('change:' + attr, @, null, options)
      @change(options)

    return @

  ###
    Clear all attributes on the model, firing `"change"` unless you choose
    to silence it.
  ###
  clear: (options={}) ->
    # Run validation.
    validObj = _.clone(@attributes)
    for attr of validObj
      validObj[attr] = null

    if not options.silent and @validate and not @_performValidation(validObj, options)
      return false

    @attributes = {}
    @_escapedAttributes = {}

    if not options.silent
      @_changed = true
      for attr of validObj
        @trigger('change:' + attr, @, null, options)
      @change(options)

    return @

  ###
    Fetch the model from the server. If the server's representation of the
    model differs from its current attributes, they will be overriden,
    triggering a `"change"` event.
  ###
  fetch: (options={}) ->
    model = @
    success = (resp) ->
      if not model.set(model.parse(resp), options)
        return false
      if options.success
        options.success(model, resp)

    error = Backbone.Helpers::wrapError(options.error, model, options)
    (@sync || Backbone.sync)('read', @, success, error)

    return @

  ###
    Set a hash of model attributes, and sync the model to the server.
    If the server returns an attributes hash that differs, the model's
    state will be `set` again.
  ###
  save: (attrs, options={}) ->
    if attrs and not @set(attrs, options)
      return false
    model = @
    success = (resp) ->
      if not model.set(model.parse(resp), options)
        return false
      if options.success
        options.success(model, resp)

    error = Backbone.Helpers::wrapError(options.error, model, options)
    method = if @isNew() then 'create' else 'update'
    (@sync || Backbone.sync)(method, @, success, error)

    return @

  ###
    Destroy this model on the server. Upon success, the model is removed
    from its collection, if it has one.
  ###
  destroy: (options={}) ->
    model = @
    success = (resp) ->
      if model.collection
        model.collection.remove(model)
      if options.success
        options.success(model, resp)

    error = Backbone.Helpers::wrapError(options.error, model, options)
    (@sync || Backbone.sync)('delete', @, success, error)

    return @

  ###
    Default URL for the model's representation on the server -- if you're
    using Backbone's restful methods, override this to change the endpoint
    that will be called.
  ###
  url: () ->
    base = Backbone.Helpers::getUrl(@collection)
    return base if @isNew()
    return base + (if base[base.length-1] is '/' then '' else '/') + @id

  ###
    **parse** converts a response into the hash of attributes to be `set` on
    the model. The default implementation is just to pass the response along.
  ###
  parse: (resp) ->
    return resp

  ###
    Create a new model with identical attributes to this one.
  ###
  clone: () ->
    return new @constructor(@)

  ###
    A model is new if it has never been saved to the server, and has a negative
    ID.
  ###
  isNew: () ->
    return not @id

  ###
    Call this method to manually fire a `change` event for this model.
    Calling this will cause all objects observing the model to update.
  ###
  change: (options) ->
    @trigger('change', @, options)
    @_previousAttributes = _.clone(@attributes)
    @_changed = false

  ###
    Determine if the model has changed since the last `"change"` event.
    If you specify an attribute name, determine if that attribute has changed.
  ###
  hasChanged: (attr) ->
    if attr
      return @_previousAttributes[attr] isnt @attributes[attr]
    return @_changed

  ###
    Return an object containing all the attributes that have changed, or false
    if there are no changed attributes. Useful for determining what parts of a
    view need to be updated and/or what attributes need to be persisted to
    the server.
  ###
  changedAttributes: (now=@attributes) ->
    old = @_previousAttributes
    changed = false
    for attr of now
      if not _.isEqual(old[attr], now[attr])
        changed or= {}
        changed[attr] = now[attr]

    return changed

  ###
    Get the previous value of an attribute, recorded at the time the last
    `"change"` event was fired.
  ###
  previous: (attr) ->
    return null if not attr or not @_previousAttributes
    return @_previousAttributes[attr]

  ###
    Get all of the attributes of the model at the time of the previous
    `"change"` event.
  ###
  previousAttributes: () ->
    return _.clone(@_previousAttributes)

  ###
    Run validation against a set of incoming attributes, returning `true`
    if all is well. If a specific `error` callback has been passed,
    call that instead of firing the general `"error"` event.
  ###
  _performValidation: (attrs, options) ->
    error = @validate(attrs)
    if error
      if options.error
        options.error(@, error)
      else
        @trigger('error', @, error, options)
      return false
    return true


###
  Backbone.Collection
  -------------------
###

class Backbone.Collection extends Backbone.Events
  ###
    Provides a standard collection class for our sets of models, ordered
    or unordered. If a `comparator` is specified, the Collection will maintain
    its models in sort order, as they're added and removed.
  ###
  constructor: (models, options={}) ->
    if options.comparator?
      @comparator = options.comparator
      delete options.comparator

    @_reset()
    if models
      @refresh(models, {silent: true})
    @initialize(models, options)

  ###
    The default model for a collection is just a **Backbone.Model**.
    This should be overridden in most cases.
  ###
  model: Backbone.Model

  ###
    Initialize is an empty  by default. Override it with your own
    initialization logic.
  ###
  initialize: () ->

  ###
    The JSON representation of a Collection is an array of the
    models' attributes.
  ###
  toJSON: () ->
    return @map((model) ->
      return model.toJSON()
    )

  ###
    Add a model, or list of models to the set. Pass **silent** to avoid
    firing the `added` event for every new model.
  ###
  add: (models, options) ->
    if _.isArray(models)
      for model in models
        @_add(model, options)
    else
      @_add(models, options)

    return @

  ###
    Remove a model, or a list of models from the set. Pass silent to avoid
    firing the `removed` event for every model removed.
  ###
  remove: (models, options) ->
    if _.isArray(models)
      for model in models
        @_remove(model, options)
    else
      @_remove(models, options)

    return @

  ###
    Get a model from the set by id.
  ###
  get: (id) ->
    return null if not id?
    return @_byId[if id.id? then id.id else id]

  ###
    Get a model from the set by client id.
  ###
  getByCid: (cid) ->
    return cid and @_byCid[cid.cid or cid]

  ###
    Get the model at the given index.
  ###
  at: (index) ->
    return @models[index]

  ###
    Force the collection to re-sort itself. You don't need to call this under normal
    circumstances, as the set will maintain sort order as each item is added.
  ###
  sort: (options={}) ->
    if not @comparator?
      throw new Error('Cannot sort a set without a comparator')
    @models = @sortBy(@comparator)
    if not options.silent
      @trigger('refresh', @, options)

    return @


  ###
    Pluck an attribute from each model in the collection.
  ###
  pluck: (attr) ->
    return _.map(@models, (model) ->
      return model.get(attr)
    )

  ###
    When you have more items than you want to add or remove individually,
    you can refresh the entire set with a new list of models, without firing
    any `added` or `removed` events. Fires `refresh` when finished.
  ###
  refresh: (models=[], options={}) ->
    @_reset()
    @add(models, {silent: true})
    if not options.silent
      @trigger('refresh', @, options)

    return @

  ###
    Fetch the default set of models for this collection, refreshing the
    collection when they arrive.
  ###
  fetch: (options={}) ->
    collection = @
    success = (resp) ->
      collection.refresh(collection.parse(resp))
      if options.success
        options.success(collection, resp)

    error = Backbone.Helpers::wrapError(options.error, collection, options)
    (@sync || Backbone.sync)('read', @, success, error)

    return @

  ###
    Create a new instance of a model in this collection. After the model
    has been created on the server, it will be added to the collection.
  ###
  create: (model, options={}) ->
    collection = @
    if model instanceof Backbone.Model
      model.collection = collection
    else
      model = new @model(model, {collection: collection})

    success = (nextModel, resp) ->
      collection.add(nextModel)
      if options.success
        options.success(nextModel, resp)

    return model.save(null, {success : success, error : options.error})

  ###
    **parse** converts a response into a list of models to be added to the
    collection. The default implementation is just to pass it through.
  ###
  parse: (resp) ->
    return resp

  ###
    Proxy to _'s chain. Can't be proxied the same way the rest of the
    underscore methods are proxied because it relies on the underscore
    constructor.
  ###
  chain: () ->
    return _(@models).chain()

  ###
    Reset all internal state. Called when the collection is refreshed.
  ###
  _reset: (options) ->
    @length = 0
    @models = []
    @_byId  = {}
    @_byCid = {}

  ###
    Internal implementation of adding a single model to the set, updating
    hash indexes for `id` and `cid` lookups.
  ###
  _add: (model, options={}) ->
    if model not instanceof Backbone.Model
      model = new @model(model, {collection: @})

    already = @getByCid(model)
    if already?
      throw new Error(["Can't add the same model to a set twice", already.id])

    @_byId[model.id] = model
    @_byCid[model.cid] = model

    model.collection = @
    index = if @comparator? then @sortedIndex(model, @comparator) else @length
    @models.splice(index, 0, model)
    model.bind('all', @_onModelEvent)
    @length++
    if not options.silent
      model.trigger('add', model, @, options)
    return model

  ###
    Internal implementation of removing a single model from the set, updating
    hash indexes for `id` and `cid` lookups.
  ###
  _remove: (model, options={}) ->
    model = @getByCid(model) or @get(model)
    return null if not model?
    delete @_byId[model.id]
    delete @_byCid[model.cid]
    delete model.collection
    @models.splice(@indexOf(model), 1)
    @length--
    if not options.silent
      model.trigger('remove', model, @, options)
    model.unbind('all', @_onModelEvent)
    return model

  ###
    Internal method called every time a model in the set fires an event.
    Sets need to update their indexes when models change ids. All other
    events simply proxy through.
  ###
  _onModelEvent: (ev, model) =>
    if ev is 'change:id'
      delete @_byId[model.previous('id')]
      @_byId[model.id] = model

    @trigger.apply(@, arguments)

###
  Underscore methods that we want to implement on the Collection.
###
methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
           'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
           'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size',
           'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty']

###
  Mix in each Underscore method as a proxy to `Collection#models`.
###
_.each(methods, (method) ->
  Backbone.Collection::[method] = (others...) ->
    return _[method].apply(_, [@models].concat(_.toArray(others)))
)


###
  Backbone.Controller
  -------------------

  Controllers map faux-URLs to actions, and fire events when routes are
  matched. Creating a new one sets its `routes` hash, if not set statically.
###
class Backbone.Controller extends Backbone.Events
  constructor: (options={}) ->
    @routes = options.routes if options.routes
    @_bindRoutes()
    @initialize(options)

  ###
    Cached regular expressions for matching named param parts and splatted
    parts of route strings.
  ###
  namedParam: /:([\w\d]+)/g
  splatParam: /\*([\w\d]+)/g

  ###
    Initialize is an empty  by default. Override it with your own
    initialization logic.
  ###
  initialize: () ->

  ###
    Manually bind a single named route to a callback. For example:

        @route('search/:query/p:num', 'search', (query, num) {
          ...
        })
  ###
  route: (route, name, callback) ->
    Backbone.history or= new Backbone.History
    route = @_routeToRegExp(route) if not _.isRegExp(route)
    Backbone.history.route(route, (fragment) =>
      args = @_extractParameters(route, fragment)
      callback.apply(@, args)
      @trigger.apply(@, ['route:' + name].concat(args))
    )

  ###
    Simple proxy to `Backbone.history` to save a fragment into the history,
    without triggering routes.
  ###
  saveLocation: (fragment) ->
    Backbone.history.saveLocation(fragment)

  ###
    Bind all defined routes to `Backbone.history`.
  ###
  _bindRoutes: () ->
    return if not @routes
    for route of @routes
      name = @routes[route]
      @route(route, name, this[name])

  ###
    Convert a route string into a regular expression, suitable for matching
    against the current location fragment.
  ###
  _routeToRegExp: (route) ->
    route = route
        .replace(@namedParam, "([^\/]*)")
        .replace(@splatParam, "(.*?)")
    return new RegExp('^' + route + '$')

  ###
    Given a route, and a URL fragment that it matches, return the array of
    extracted parameters.
  ###
  _extractParameters: (route, fragment) ->
    return route.exec(fragment).slice(1)


###
  Backbone.History
  ----------------

  Handles cross-browser history management, based on URL hashes. If the
  browser does not support `onhashchange`, falls back to polling.
###
class Backbone.History
  constructor: () ->
    @handlers = []
    @fragment = @getFragment()

  ###
    Cached regex for cleaning hashes.
  ###
  hashStrip: /^#*/

  ###
    The default interval to poll for hash changes, if necessary, is
    twenty times a second.
  ###
  interval: 50

  ###
    Get the cross-browser normalized URL fragment.
  ###
  getFragment: (loc=window.location) ->
    return loc.hash.replace(@hashStrip, '')

  ###
    Start the hash change handling, returning `true` if the current URL matches
    an existing route, and `false` otherwise.
  ###
  start: () ->
    docMode = document.documentMode
    oldIE = $.browser.msie and (!docMode or docMode <= 7)
    if oldIE
      @iframe = $('<iframe src="javascript:0" tabindex="-1" />')
        .hide()
        .appendTo('body')[0]
        .contentWindow

    if 'onhashchange' in window and not oldIE
      $(window).bind('hashchange', @checkUrl)
    else
      setInterval(@checkUrl, @interval)

    return @loadUrl()

  ###
    Add a route to be tested when the hash changes. Routes are matched in the
    order they are added.
  ###
  route: (route, callback) ->
    @handlers.push({route : route, callback : callback})

  ###
    Checks the current URL to see if it has changed, and if it has,
    calls `loadUrl`, normalizing across the hidden iframe.
  ###
  checkUrl: () =>
    current = @getFragment()
    if current is @fragment and @iframe
      current = @getFragment(@iframe.location)

    if current is @fragment or current is decodeURIComponent(@fragment)
      return false

    if @iframe
      window.location.hash = @iframe.location.hash = current

    @loadUrl()

  ###
    Attempt to load the current URL fragment. If a route succeeds with a
    match, returns `true`. If no defined routes matches the fragment,
    returns `false`.
  ###
  loadUrl: () ->
    fragment = @fragment = @getFragment()
    return _.any(@handlers, (handler) ->
      if handler.route.test(fragment)
        handler.callback(fragment)
        return true
    )

  ###
    Save a fragment into the hash history. You are responsible for properly
    URL-encoding the fragment in advance. This does not trigger
    a `hashchange` event.
  ###
  saveLocation: (fragment='') ->
    fragment = fragment.replace(@hashStrip, '')
    if @fragment is fragment
      return
    window.location.hash = @fragment = fragment
    if @iframe and fragment isnt @getFragment(@iframe.location)
      @iframe.document.open().close()
      @iframe.location.hash = fragment


  ###
    Bind all defined routes to `Backbone.history`.
  ###
  _bindRoutes: () ->
    return if @routes?
    for route of @routes
      name = @routes[route]
      @route(route, name, @[name])

  ###
    Convert a route string into a regular expression, suitable for matching
    against the current location fragment.
  ###
  _routeToRegExp: (route) ->
    route = route
      .replace(@namedParam, "([^\/]*)")
      .replace(@splatParam, "(.*?)")
    return new RegExp('^' + route + '$')

  ###
    Given a route, and a URL fragment that it matches, return the array of
    extracted parameters.
  ###
  _extractParameters : (route, fragment) ->
    return route.exec(fragment).slice(1)


###
  Backbone.View
  -------------

  Creating a Backbone.View creates its initial element outside of the DOM,
  if an existing element is not provided...
###
class Backbone.View extends Backbone.Events
  constructor: (options={}) ->
    @_configure(options)
    @_ensureElement()
    @delegateEvents()
    @initialize(options)

  ###
    Element lookup, scoped to DOM elements within the current view.
    This should be prefered to global lookups, if you're dealing with
    a specific view.
  ###
  $: (selector) ->
    return $(selector, @el)

  ###
    Cached regex to split keys for `delegate`.
  ###
  eventSplitter: /^(\w+)\s*(.*)$/

  ###
    The default `tagName` of a View's element is `"div"`.
  ###
  tagName: 'div'

  ###
    Initialize is an empty  by default. Override it with your own
    initialization logic.
  ###
  initialize: () ->

  ###
    **render** is the core  that your view should override, in order
    to populate its element (`@el`), with the appropriate HTML. The
    convention is for **render** to always return `@`.
  ###
  render: () ->
    return @

  ###
    Remove @ view from the DOM. Note that the view isn't present in the
    DOM by default, so calling @ method may be a no-op.
  ###
  remove: () ->
    $(@el).remove()
    return @

  ###
    For small amounts of DOM Elements, where a full-blown template isn't
    needed, use **make** to manufacture elements, one at a time.

      el = @make('li', {'class': 'row'}, @model.escape('title'))
  ###
  make: (tagName, attributes, content) ->
    el = document.createElement(tagName)
    $(el).attr(attributes) if attributes?
    $(el).html(content) if content?
    return el

  ###
    Set callbacks, where `@callbacks` is a hash of

    *{"event selector": "callback"}*
      {
        'mousedown .title':  'edit',
        'click .button':     'save'
      }

    pairs. Callbacks will be bound to the view, with `@` set properly.
    Uses event delegation for efficiency.
    Omitting the selector binds the event to `@el`.
    This only works for delegate-able events: not `focus`, `blur`, and
    not `change`, `submit`, and `reset` in Internet Explorer.
  ###
  delegateEvents: (events=@events) ->
    return if not events?
    $(@el).unbind()
    for key of events
      methodName = events[key]
      match = key.match(@eventSplitter)
      [eventName, selector] = [match[1], match[2]]
      method = _.bind(@[methodName], @)
      if selector is ''
        $(@el).bind(eventName, method)
      else
        $(@el).delegate(selector, eventName, method)

  ###
    Performs the initial configuration of a View with a set of options.
    Keys with special meaning *(model, collection, id, className)*, are
    attached directly to the view.
  ###
  _configure: (options) ->
    options     = _.extend({}, @options, options) if @options
    @model      = options.model                   if options.model
    @collection = options.collection              if options.collection
    @el         = options.el                      if options.el
    @id         = options.id                      if options.id
    @className  = options.className               if options.className
    @tagName    = options.tagName                 if options.tagName
    @options    = options

  ###
    Ensure that the View has a DOM element to render into.
  ###
  _ensureElement: () ->
    return if @el
    attrs = {}
    attrs.id = @id if @id
    attrs["class"] = @className if @className
    @el = @make(@tagName, attrs)


###
  Backbone.sync
  -------------

  Override @  to change the manner in which Backbone persists
  models to the server. You will be passed the type of request, and the
  model in question. By default, uses makes a RESTful Ajax request
  to the model's `url()`. Some possible customizations could be:
 
  * Use `setTimeout` to batch rapid-fire updates into a single request.
  * Send up the models as XML instead of JSON.
  * Persist models via WebSockets instead of Ajax.
 
  Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  as `POST`, with a `_method` parameter containing the true HTTP method,
  as well as all requests with the body as `application/x-www-form-urlencoded`
  instead of `application/json` with the model in a param named `model`.
  Useful when interfacing with server-side languages like **PHP** that make
  it difficult to read the body of `PUT` requests.
###
class Backbone.sync
  constructor: (method, model, success, error) ->
    ###
      Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    ###
    methodMap =
      create: 'POST'
      update: 'PUT'
      delete: 'DELETE'
      read  : 'GET'

    type = methodMap[method]
    modelJSON = JSON.stringify(model.toJSON()) if method in ['update', 'create']

    ###
      Default JSON-request options.
    ###
    params =
      url:          Backbone.Helpers::getUrl(model)
      type:         type
      contentType:  'application/json'
      data:         modelJSON
      dataType:     'json'
      processData:  false
      success:      success
      error:        error

    ###
      For older servers, emulate JSON by encoding the request into an HTML-form.
    ###
    if Backbone.emulateJSON
      params.contentType = 'application/x-www-form-urlencoded'
      params.processData = true
      params.data        = if modelJSON then {model : modelJSON} else {}

    ###
      For older servers, emulate HTTP by mimicking the HTTP method with `_method`
      And an `X-HTTP-Method-Override` header.
    ###
    if Backbone.emulateHTTP
      if type in ['PUT', 'DELETE']
        params.data._method = type if Backbone.emulateJSON
        params.type = 'POST'
        params.beforeSend = (xhr) ->
          xhr.setRequestHeader("X-HTTP-Method-Override", type)

    ###
      Make the request.
    ###
    $.ajax(params)



###
  Backbone.Helpers
  -------
###

class Backbone.Helpers
  ###
    Helpers function to get a URL from a Model or Collection as a property
    or as a function.
  ###
  getUrl: (object) ->
    if not (object and object.url)
      throw new Error("A 'url' property or @ must be specified")
    return if _.isFunction(object.url) then object.url() else object.url

  ###
    Wrap an optional error callback with a fallback error event.
  ###
  wrapError: (onError, model, options) ->
    return (resp) ->
      if onError
        onError(model, resp)
      else
        model.trigger('error', model, resp, options)

  ###
    Helpers  to escape a string for HTML rendering.
  ###
  escapeHTML: (string) ->
    return string
      .replace(/&(?!\w+)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
