(function() {
  /*
    Backbone.js 0.3.3
    (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
    Backbone may be freely distributed under the MIT license.
    For all details and documentation:
    http://documentcloud.github.com/backbone
  */
  /*
    Initial Setup
    -------------

    The top-level namespace. All public Backbone classes and modules will
    be attached to this. Exported for both CommonJS and the browser.
  */  var Backbone, methods, _;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  if (typeof exports != "undefined" && exports !== null) {
    Backbone = exports;
  } else {
    Backbone = this.Backbone = {};
  }
  /*
    Current version of the library. Keep in sync with `package.json`.
  */
  Backbone.VERSION = '0.3.3';
  /*
    Require Underscore, if we're on the server, and it's not already present.
  */
  _ = !_ && (typeof require != "undefined" && require !== null) ? require('underscore')._ : this._;
  /*
    Turn on `emulateHTTP` to use support legacy HTTP servers. Setting this option will
    fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and set a
    `X-Http-Method-Override` header.
  */
  Backbone.emulateHTTP = false;
  /*
    Turn on `emulateJSON` to support legacy servers that can't deal with direct
    `application/json` requests ... will encode the body as
    `application/x-www-form-urlencoded` instead and will send the model in a
    form param named `model`.
  */
  Backbone.emulateJSON = false;
  /*
    Backbone.Events
    -----------------

    A module that can be mixed in to *any object* in order to provide it with
    custom events. You may `bind` or `unbind` a callback function to an event;
    `trigger`-ing an event fires all callbacks in succession.

        var object = {};
        _.extend(object, Backbone.Events);
        object.bind('expand', function(){ alert('expanded'); });
        object.trigger('expand');
  */
  Backbone.Events = (function() {
    function Events() {}
    /*
      Bind an event, specified by a string name, `ev`, to a `callback` function.
      Passing `"all"` will bind the callback to all events fired.
    */
    Events.prototype.bind = function(ev, callback) {
      var _base;
      this._callbacks || (this._callbacks = {});
      (_base = this._callbacks)[ev] || (_base[ev] = []);
      this._callbacks[ev].push(callback);
      return this;
    };
    /*
      Remove one or many callbacks. If `callback` is null, removes all
      callbacks for the event. If `ev` is null, removes all bound callbacks
      for all events.
    */
    Events.prototype.unbind = function(ev, callback) {
      var i, _ref;
      if (!ev) {
        this._callbacks = {};
      } else if (this._callbacks) {
        if (!callback) {
          this._callbacks[ev] = [];
        } else {
          for (i = 0, _ref = this._callbacks[ev].length - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
            if (callback === this._callbacks[ev][i]) {
              this._callbacks[ev].splice(i, 1);
              break;
            }
          }
        }
      }
      return this;
    };
    /*
      Trigger an event, firing all bound callbacks. Callbacks are passed the
      same arguments as `trigger` is, apart from the event name.
      Listening for `"all"` passes the true event name as the first argument.
    */
    Events.prototype.trigger = function() {
      var callback, ev, options, _i, _j, _len, _len2, _ref, _ref2;
      ev = arguments[0], options = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!this._callbacks) {
        return this;
      }
      if (this._callbacks[ev] != null) {
        _ref = this._callbacks[ev];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          callback = _ref[_i];
          if (callback) {
            callback.apply(this, options);
          }
        }
      }
      if (this._callbacks['all'] != null) {
        _ref2 = this._callbacks['all'];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          callback = _ref2[_j];
          callback.apply(this, arguments);
        }
      }
      return this;
    };
    return Events;
  })();
  /*
    Backbone.Model
    --------------
  */
  Backbone.Model = (function() {
    __extends(Model, Backbone.Events);
    /*
      Create a new model, with defined attributes. A client id (`cid`)
      is automatically generated and assigned for you.
    */
    function Model(attributes, options) {
      if (attributes == null) {
        attributes = {};
      }
      if (this.defaults) {
        attributes = _.extend({}, this.defaults, attributes);
      }
      this.attributes = {};
      this._escapedAttributes = {};
      this.cid = _.uniqueId('c');
      this.set(attributes, {
        silent: true
      });
      this._previousAttributes = _.clone(this.attributes);
      if ((options != null) && (options.collection != null)) {
        this.collection = options.collection;
      }
      this.initialize(attributes, options);
    }
    /*
      A snapshot of the model's previous attributes, taken immediately
      after the last `"change"` event was fired.
    */
    Model.prototype._previousAttributes = null;
    /*
      Has the item been changed since the last `"change"` event?
    */
    Model.prototype._changed = false;
    /*
      Initialize is an empty function by default. Override it with your own
      initialization logic.
    */
    Model.prototype.initialize = function() {};
    /*
      Return a copy of the model's `attributes` object.
    */
    Model.prototype.toJSON = function() {
      return _.clone(this.attributes);
    };
    /*
      Get the value of an attribute.
    */
    Model.prototype.get = function(attr) {
      return this.attributes[attr];
    };
    /*
      Get the HTML-escaped value of an attribute.
    */
    Model.prototype.escape = function(attr) {
      var val;
      if (this._escapedAttributes[attr]) {
        return this._escapedAttributes[attr];
      }
      val = this.attributes[attr] || '';
      return this._escapedAttributes[attr] = Backbone.Helpers.prototype.escapeHTML(val);
    };
    /*
      Set a hash of model attributes on the object, firing `"change"` unless you
      choose to silence it.
    */
    Model.prototype.set = function(attrs, options) {
      var attr, val;
      if (options == null) {
        options = {};
      }
      if (!attrs) {
        return this;
      }
      if (attrs.attributes != null) {
        attrs = attrs.attributes;
      }
      if (!options.silent && this.validate && !this._performValidation(attrs, options)) {
        return false;
      }
      if (attrs.id != null) {
        this.id = attrs.id;
      }
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(this.attributes[attr], val)) {
          this.attributes[attr] = val;
          delete this._escapedAttributes[attr];
          if (!options.silent) {
            this._changed = true;
            this.trigger('change:' + attr, this, val, options);
          }
        }
      }
      if (!options.silent && this._changed) {
        this.change(options);
      }
      return this;
    };
    /*
      Remove an attribute from the model, firing `"change"` unless you choose
      to silence it.
    */
    Model.prototype.unset = function(attr, options) {
      var validObj, value;
      if (options == null) {
        options = {};
      }
      value = this.attributes[attr];
      validObj = {};
      validObj[attr] = null;
      if (!options.silent && this.validate && !this._performValidation(validObj, options)) {
        return false;
      }
      delete this.attributes[attr];
      delete this._escapedAttributes[attr];
      if (!options.silent) {
        this._changed = true;
        this.trigger('change:' + attr, this, null, options);
        this.change(options);
      }
      return this;
    };
    /*
      Clear all attributes on the model, firing `"change"` unless you choose
      to silence it.
    */
    Model.prototype.clear = function(options) {
      var attr, validObj;
      if (options == null) {
        options = {};
      }
      validObj = _.clone(this.attributes);
      for (attr in validObj) {
        validObj[attr] = null;
      }
      if (!options.silent && this.validate && !this._performValidation(validObj, options)) {
        return false;
      }
      this.attributes = {};
      this._escapedAttributes = {};
      if (!options.silent) {
        this._changed = true;
        for (attr in validObj) {
          this.trigger('change:' + attr, this, null, options);
        }
        this.change(options);
      }
      return this;
    };
    /*
      Fetch the model from the server. If the server's representation of the
      model differs from its current attributes, they will be overriden,
      triggering a `"change"` event.
    */
    Model.prototype.fetch = function(options) {
      var error, model, success;
      if (options == null) {
        options = {};
      }
      model = this;
      success = function(resp) {
        if (!model.set(model.parse(resp), options)) {
          return false;
        }
        if (options.success) {
          return options.success(model, resp);
        }
      };
      error = Backbone.Helpers.prototype.wrapError(options.error, model, options);
      (this.sync || Backbone.sync)('read', this, success, error);
      return this;
    };
    /*
      Set a hash of model attributes, and sync the model to the server.
      If the server returns an attributes hash that differs, the model's
      state will be `set` again.
    */
    Model.prototype.save = function(attrs, options) {
      var error, method, model, success;
      if (options == null) {
        options = {};
      }
      if (attrs && !this.set(attrs, options)) {
        return false;
      }
      model = this;
      success = function(resp) {
        if (!model.set(model.parse(resp), options)) {
          return false;
        }
        if (options.success) {
          return options.success(model, resp);
        }
      };
      error = Backbone.Helpers.prototype.wrapError(options.error, model, options);
      method = this.isNew() ? 'create' : 'update';
      (this.sync || Backbone.sync)(method, this, success, error);
      return this;
    };
    /*
      Destroy this model on the server. Upon success, the model is removed
      from its collection, if it has one.
    */
    Model.prototype.destroy = function(options) {
      var error, model, success;
      if (options == null) {
        options = {};
      }
      model = this;
      success = function(resp) {
        if (model.collection) {
          model.collection.remove(model);
        }
        if (options.success) {
          return options.success(model, resp);
        }
      };
      error = Backbone.Helpers.prototype.wrapError(options.error, model, options);
      (this.sync || Backbone.sync)('delete', this, success, error);
      return this;
    };
    /*
      Default URL for the model's representation on the server -- if you're
      using Backbone's restful methods, override this to change the endpoint
      that will be called.
    */
    Model.prototype.url = function() {
      var base;
      base = Backbone.Helpers.prototype.getUrl(this.collection);
      if (this.isNew()) {
        return base;
      }
      return base + (base[base.length - 1] === '/' ? '' : '/') + this.id;
    };
    /*
      **parse** converts a response into the hash of attributes to be `set` on
      the model. The default implementation is just to pass the response along.
    */
    Model.prototype.parse = function(resp) {
      return resp;
    };
    /*
      Create a new model with identical attributes to this one.
    */
    Model.prototype.clone = function() {
      return new this.constructor(this);
    };
    /*
      A model is new if it has never been saved to the server, and has a negative
      ID.
    */
    Model.prototype.isNew = function() {
      return !this.id;
    };
    /*
      Call this method to manually fire a `change` event for this model.
      Calling this will cause all objects observing the model to update.
    */
    Model.prototype.change = function(options) {
      this.trigger('change', this, options);
      this._previousAttributes = _.clone(this.attributes);
      return this._changed = false;
    };
    /*
      Determine if the model has changed since the last `"change"` event.
      If you specify an attribute name, determine if that attribute has changed.
    */
    Model.prototype.hasChanged = function(attr) {
      if (attr) {
        return this._previousAttributes[attr] !== this.attributes[attr];
      }
      return this._changed;
    };
    /*
      Return an object containing all the attributes that have changed, or false
      if there are no changed attributes. Useful for determining what parts of a
      view need to be updated and/or what attributes need to be persisted to
      the server.
    */
    Model.prototype.changedAttributes = function(now) {
      var attr, changed, old;
      now || (now = this.attributes);
      old = this._previousAttributes;
      changed = false;
      for (attr in now) {
        if (!_.isEqual(old[attr], now[attr])) {
          changed || (changed = {});
          changed[attr] = now[attr];
        }
      }
      return changed;
    };
    /*
      Get the previous value of an attribute, recorded at the time the last
      `"change"` event was fired.
    */
    Model.prototype.previous = function(attr) {
      if (!attr || !this._previousAttributes) {
        return null;
      }
      return this._previousAttributes[attr];
    };
    /*
      Get all of the attributes of the model at the time of the previous
      `"change"` event.
    */
    Model.prototype.previousAttributes = function() {
      return _.clone(this._previousAttributes);
    };
    /*
      Run validation against a set of incoming attributes, returning `true`
      if all is well. If a specific `error` callback has been passed,
      call that instead of firing the general `"error"` event.
    */
    Model.prototype._performValidation = function(attrs, options) {
      var error;
      error = this.validate(attrs);
      if (error) {
        if (options.error) {
          options.error(this, error);
        } else {
          this.trigger('error', this, error, options);
        }
        return false;
      }
      return true;
    };
    return Model;
  })();
  /*
    Backbone.Collection
    -------------------
  */
  Backbone.Collection = (function() {
    __extends(Collection, Backbone.Events);
    /*
      Provides a standard collection class for our sets of models, ordered
      or unordered. If a `comparator` is specified, the Collection will maintain
      its models in sort order, as they're added and removed.
    */
    function Collection(models, options) {
      if (options == null) {
        options = {};
      }
      this._onModelEvent = __bind(this._onModelEvent, this);;
      if (options.comparator != null) {
        this.comparator = options.comparator;
        delete options.comparator;
      }
      this._reset();
      if (models) {
        this.refresh(models, {
          silent: true
        });
      }
      this.initialize(models, options);
    }
    /*
      The default model for a collection is just a **Backbone.Model**.
      This should be overridden in most cases.
    */
    Collection.prototype.model = Backbone.Model;
    /*
      Initialize is an empty  by default. Override it with your own
      initialization logic.
    */
    Collection.prototype.initialize = function() {};
    /*
      The JSON representation of a Collection is an array of the
      models' attributes.
    */
    Collection.prototype.toJSON = function() {
      return this.map(function(model) {
        return model.toJSON();
      });
    };
    /*
      Add a model, or list of models to the set. Pass **silent** to avoid
      firing the `added` event for every new model.
    */
    Collection.prototype.add = function(models, options) {
      var model, _i, _len;
      if (_.isArray(models)) {
        for (_i = 0, _len = models.length; _i < _len; _i++) {
          model = models[_i];
          this._add(model, options);
        }
      } else {
        this._add(models, options);
      }
      return this;
    };
    /*
      Remove a model, or a list of models from the set. Pass silent to avoid
      firing the `removed` event for every model removed.
    */
    Collection.prototype.remove = function(models, options) {
      var model, _i, _len;
      if (_.isArray(models)) {
        for (_i = 0, _len = models.length; _i < _len; _i++) {
          model = models[_i];
          this._remove(model, options);
        }
      } else {
        this._remove(models, options);
      }
      return this;
    };
    /*
      Get a model from the set by id.
    */
    Collection.prototype.get = function(id) {
      if (!(id != null)) {
        return null;
      }
      return this._byId[id.id != null ? id.id : id];
    };
    /*
      Get a model from the set by client id.
    */
    Collection.prototype.getByCid = function(cid) {
      return cid && this._byCid[cid.cid || cid];
    };
    /*
      Get the model at the given index.
    */
    Collection.prototype.at = function(index) {
      return this.models[index];
    };
    /*
      Force the collection to re-sort itself. You don't need to call this under normal
      circumstances, as the set will maintain sort order as each item is added.
    */
    Collection.prototype.sort = function(options) {
      if (options == null) {
        options = {};
      }
      if (!(this.comparator != null)) {
        throw new Error('Cannot sort a set without a comparator');
      }
      this.models = this.sortBy(this.comparator);
      if (!options.silent) {
        this.trigger('refresh', this, options);
      }
      return this;
    };
    /*
      Pluck an attribute from each model in the collection.
    */
    Collection.prototype.pluck = function(attr) {
      return _.map(this.models, function(model) {
        return model.get(attr);
      });
    };
    /*
      When you have more items than you want to add or remove individually,
      you can refresh the entire set with a new list of models, without firing
      any `added` or `removed` events. Fires `refresh` when finished.
    */
    Collection.prototype.refresh = function(models, options) {
      if (models == null) {
        models = [];
      }
      if (options == null) {
        options = {};
      }
      this._reset();
      this.add(models, {
        silent: true
      });
      if (!options.silent) {
        this.trigger('refresh', this, options);
      }
      return this;
    };
    /*
      Fetch the default set of models for this collection, refreshing the
      collection when they arrive.
    */
    Collection.prototype.fetch = function(options) {
      var collection, error, success;
      if (options == null) {
        options = {};
      }
      collection = this;
      success = function(resp) {
        collection.refresh(collection.parse(resp));
        if (options.success) {
          return options.success(collection, resp);
        }
      };
      error = Backbone.Helpers.prototype.wrapError(options.error, collection, options);
      (this.sync || Backbone.sync)('read', this, success, error);
      return this;
    };
    /*
      Create a new instance of a model in this collection. After the model
      has been created on the server, it will be added to the collection.
    */
    Collection.prototype.create = function(model, options) {
      var collection, success;
      if (options == null) {
        options = {};
      }
      collection = this;
      if (model instanceof Backbone.Model) {
        model.collection = collection;
      } else {
        model = new this.model(model, {
          collection: collection
        });
      }
      success = function(nextModel, resp) {
        collection.add(nextModel);
        if (options.success) {
          return options.success(nextModel, resp);
        }
      };
      return model.save(null, {
        success: success,
        error: options.error
      });
    };
    /*
      **parse** converts a response into a list of models to be added to the
      collection. The default implementation is just to pass it through.
    */
    Collection.prototype.parse = function(resp) {
      return resp;
    };
    /*
      Proxy to _'s chain. Can't be proxied the same way the rest of the
      underscore methods are proxied because it relies on the underscore
      constructor.
    */
    Collection.prototype.chain = function() {
      return _(this.models).chain();
    };
    /*
      Reset all internal state. Called when the collection is refreshed.
    */
    Collection.prototype._reset = function(options) {
      this.length = 0;
      this.models = [];
      this._byId = {};
      return this._byCid = {};
    };
    /*
      Internal implementation of adding a single model to the set, updating
      hash indexes for `id` and `cid` lookups.
    */
    Collection.prototype._add = function(model, options) {
      var already, index;
      if (options == null) {
        options = {};
      }
      if (!(model instanceof Backbone.Model)) {
        model = new this.model(model, {
          collection: this
        });
      }
      already = this.getByCid(model);
      if (already != null) {
        throw new Error(["Can't add the same model to a set twice", already.id]);
      }
      this._byId[model.id] = model;
      this._byCid[model.cid] = model;
      model.collection = this;
      index = this.comparator != null ? this.sortedIndex(model, this.comparator) : this.length;
      this.models.splice(index, 0, model);
      model.bind('all', this._onModelEvent);
      this.length++;
      if (!options.silent) {
        model.trigger('add', model, this, options);
      }
      return model;
    };
    /*
      Internal implementation of removing a single model from the set, updating
      hash indexes for `id` and `cid` lookups.
    */
    Collection.prototype._remove = function(model, options) {
      if (options == null) {
        options = {};
      }
      model = this.getByCid(model) || this.get(model);
      if (!(model != null)) {
        return null;
      }
      delete this._byId[model.id];
      delete this._byCid[model.cid];
      delete model.collection;
      this.models.splice(this.indexOf(model), 1);
      this.length--;
      if (!options.silent) {
        model.trigger('remove', model, this, options);
      }
      model.unbind('all', this._onModelEvent);
      return model;
    };
    /*
      Internal method called every time a model in the set fires an event.
      Sets need to update their indexes when models change ids. All other
      events simply proxy through.
    */
    Collection.prototype._onModelEvent = function(ev, model) {
      if (ev === 'change:id') {
        delete this._byId[model.previous('id')];
        this._byId[model.id] = model;
      }
      return this.trigger.apply(this, arguments);
    };
    return Collection;
  })();
  /*
    Underscore methods that we want to implement on the Collection.
  */
  methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size', 'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];
  /*
    Mix in each Underscore method as a proxy to `Collection#models`.
  */
  _.each(methods, function(method) {
    return Backbone.Collection.prototype[method] = function() {
      var others;
      others = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return _[method].apply(_, [this.models].concat(_.toArray(others)));
    };
  });
  /*
    Backbone.Controller
    -------------------

    Controllers map faux-URLs to actions, and fire events when routes are
    matched. Creating a new one sets its `routes` hash, if not set statically.
  */
  Backbone.Controller = (function() {
    __extends(Controller, Backbone.Events);
    function Controller(options) {
      if (options == null) {
        options = {};
      }
      if (options.routes) {
        this.routes = options.routes;
      }
      this._bindRoutes();
      this.initialize(options);
    }
    /*
      Cached regular expressions for matching named param parts and splatted
      parts of route strings.
    */
    Controller.prototype.namedParam = /:([\w\d]+)/g;
    Controller.prototype.splatParam = /\*([\w\d]+)/g;
    /*
      Initialize is an empty  by default. Override it with your own
      initialization logic.
    */
    Controller.prototype.initialize = function() {};
    /*
      Manually bind a single named route to a callback. For example:

          @route('search/:query/p:num', 'search', (query, num) {
            ...
          })
    */
    Controller.prototype.route = function(route, name, callback) {
      Backbone.history || (Backbone.history = new Backbone.History);
      if (!_.isRegExp(route)) {
        route = this._routeToRegExp(route);
      }
      return Backbone.history.route(route, __bind(function(fragment) {
        var args;
        args = this._extractParameters(route, fragment);
        callback.apply(this, args);
        return this.trigger.apply(this, ['route:' + name].concat(args));
      }, this));
    };
    /*
      Simple proxy to `Backbone.history` to save a fragment into the history,
      without triggering routes.
    */
    Controller.prototype.saveLocation = function(fragment) {
      return Backbone.history.saveLocation(fragment);
    };
    /*
      Bind all defined routes to `Backbone.history`.
    */
    Controller.prototype._bindRoutes = function() {
      var name, route, _results;
      if (!this.routes) {
        return;
      }
      _results = [];
      for (route in this.routes) {
        name = this.routes[route];
        _results.push(this.route(route, name, this[name]));
      }
      return _results;
    };
    /*
      Convert a route string into a regular expression, suitable for matching
      against the current location fragment.
    */
    Controller.prototype._routeToRegExp = function(route) {
      route = route.replace(this.namedParam, "([^\/]*)").replace(this.splatParam, "(.*?)");
      return new RegExp('^' + route + '$');
    };
    /*
      Given a route, and a URL fragment that it matches, return the array of
      extracted parameters.
    */
    Controller.prototype._extractParameters = function(route, fragment) {
      return route.exec(fragment).slice(1);
    };
    return Controller;
  })();
  /*
    Backbone.History
    ----------------

    Handles cross-browser history management, based on URL hashes. If the
    browser does not support `onhashchange`, falls back to polling.
  */
  Backbone.History = (function() {
    function History() {
      this.checkUrl = __bind(this.checkUrl, this);;      this.handlers = [];
      this.fragment = this.getFragment();
    }
    /*
      Cached regex for cleaning hashes.
    */
    History.prototype.hashStrip = /^#*/;
    /*
      The default interval to poll for hash changes, if necessary, is
      twenty times a second.
    */
    History.prototype.interval = 50;
    /*
      Get the cross-browser normalized URL fragment.
    */
    History.prototype.getFragment = function(loc) {
      if (loc == null) {
        loc = window.location;
      }
      return loc.hash.replace(this.hashStrip, '');
    };
    /*
      Start the hash change handling, returning `true` if the current URL matches
      an existing route, and `false` otherwise.
    */
    History.prototype.start = function() {
      var docMode, oldIE;
      docMode = document.documentMode;
      oldIE = $.browser.msie && (!docMode || docMode <= 7);
      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
      }
      if (__indexOf.call(window, 'onhashchange') >= 0 && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else {
        setInterval(this.checkUrl, this.interval);
      }
      return this.loadUrl();
    };
    /*
      Add a route to be tested when the hash changes. Routes are matched in the
      order they are added.
    */
    History.prototype.route = function(route, callback) {
      return this.handlers.push({
        route: route,
        callback: callback
      });
    };
    /*
      Checks the current URL to see if it has changed, and if it has,
      calls `loadUrl`, normalizing across the hidden iframe.
    */
    History.prototype.checkUrl = function() {
      var current;
      current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.iframe.location);
      }
      if (current === this.fragment || current === decodeURIComponent(this.fragment)) {
        return false;
      }
      if (this.iframe) {
        window.location.hash = this.iframe.location.hash = current;
      }
      return this.loadUrl();
    };
    /*
      Attempt to load the current URL fragment. If a route succeeds with a
      match, returns `true`. If no defined routes matches the fragment,
      returns `false`.
    */
    History.prototype.loadUrl = function() {
      var fragment;
      fragment = this.fragment = this.getFragment();
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    };
    /*
      Save a fragment into the hash history. You are responsible for properly
      URL-encoding the fragment in advance. This does not trigger
      a `hashchange` event.
    */
    History.prototype.saveLocation = function(fragment) {
      if (fragment == null) {
        fragment = '';
      }
      fragment = fragment.replace(this.hashStrip, '');
      if (this.fragment === fragment) {
        return;
      }
      window.location.hash = this.fragment = fragment;
      if (this.iframe && fragment !== this.getFragment(this.iframe.location)) {
        this.iframe.document.open().close();
        return this.iframe.location.hash = fragment;
      }
    };
    /*
      Bind all defined routes to `Backbone.history`.
    */
    History.prototype._bindRoutes = function() {
      var name, route, _results;
      if (this.routes != null) {
        return;
      }
      _results = [];
      for (route in this.routes) {
        name = this.routes[route];
        _results.push(this.route(route, name, this[name]));
      }
      return _results;
    };
    /*
      Convert a route string into a regular expression, suitable for matching
      against the current location fragment.
    */
    History.prototype._routeToRegExp = function(route) {
      route = route.replace(this.namedParam, "([^\/]*)").replace(this.splatParam, "(.*?)");
      return new RegExp('^' + route + '$');
    };
    /*
      Given a route, and a URL fragment that it matches, return the array of
      extracted parameters.
    */
    History.prototype._extractParameters = function(route, fragment) {
      return route.exec(fragment).slice(1);
    };
    return History;
  })();
  /*
    Backbone.View
    -------------

    Creating a Backbone.View creates its initial element outside of the DOM,
    if an existing element is not provided...
  */
  Backbone.View = (function() {
    __extends(View, Backbone.Events);
    function View(options) {
      if (options == null) {
        options = {};
      }
      this._configure(options);
      this._ensureElement();
      this.delegateEvents();
      this.initialize(options);
    }
    /*
      Element lookup, scoped to DOM elements within the current view.
      This should be prefered to global lookups, if you're dealing with
      a specific view.
    */
    View.prototype.$ = function(selector) {
      return $(selector, this.el);
    };
    /*
      Cached regex to split keys for `delegate`.
    */
    View.prototype.eventSplitter = /^(\w+)\s*(.*)$/;
    /*
      The default `tagName` of a View's element is `"div"`.
    */
    View.prototype.tagName = 'div';
    /*
      Initialize is an empty  by default. Override it with your own
      initialization logic.
    */
    View.prototype.initialize = function() {};
    /*
      **render** is the core  that your view should override, in order
      to populate its element (`@el`), with the appropriate HTML. The
      convention is for **render** to always return `@`.
    */
    View.prototype.render = function() {
      return this;
    };
    /*
      Remove @ view from the DOM. Note that the view isn't present in the
      DOM by default, so calling @ method may be a no-op.
    */
    View.prototype.remove = function() {
      $(this.el).remove();
      return this;
    };
    /*
      For small amounts of DOM Elements, where a full-blown template isn't
      needed, use **make** to manufacture elements, one at a time.

        el = @make('li', {'class': 'row'}, @model.escape('title'))
    */
    View.prototype.make = function(tagName, attributes, content) {
      var el;
      el = document.createElement(tagName);
      if (attributes != null) {
        $(el).attr(attributes);
      }
      if (content != null) {
        $(el).html(content);
      }
      return el;
    };
    /*
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
    */
    View.prototype.delegateEvents = function(events) {
      var eventName, key, match, method, methodName, selector, _ref, _results;
      if (events == null) {
        events = this.events;
      }
      if (!(events != null)) {
        return;
      }
      $(this.el).unbind();
      _results = [];
      for (key in events) {
        methodName = events[key];
        match = key.match(this.eventSplitter);
        _ref = [match[1], match[2]], eventName = _ref[0], selector = _ref[1];
        method = _.bind(this[methodName], this);
        _results.push(selector === '' ? $(this.el).bind(eventName, method) : $(this.el).delegate(selector, eventName, method));
      }
      return _results;
    };
    /*
      Performs the initial configuration of a View with a set of options.
      Keys with special meaning *(model, collection, id, className)*, are
      attached directly to the view.
    */
    View.prototype._configure = function(options) {
      if (this.options) {
        options = _.extend({}, this.options, options);
      }
      if (options.model) {
        this.model = options.model;
      }
      if (options.collection) {
        this.collection = options.collection;
      }
      if (options.el) {
        this.el = options.el;
      }
      if (options.id) {
        this.id = options.id;
      }
      if (options.className) {
        this.className = options.className;
      }
      if (options.tagName) {
        this.tagName = options.tagName;
      }
      return this.options = options;
    };
    /*
      Ensure that the View has a DOM element to render into.
    */
    View.prototype._ensureElement = function() {
      var attrs;
      if (this.el) {
        return;
      }
      attrs = {};
      if (this.id) {
        attrs.id = this.id;
      }
      if (this.className) {
        attrs["class"] = this.className;
      }
      return this.el = this.make(this.tagName, attrs);
    };
    return View;
  })();
  /*
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
  */
  Backbone.sync = (function() {
    function sync(method, model, success, error) {
      /*
        Map from CRUD to HTTP for our default `Backbone.sync` implementation.
      */      var methodMap, modelJSON, params, type;
      methodMap = {
        create: 'POST',
        update: 'PUT',
        "delete": 'DELETE',
        read: 'GET'
      };
      type = methodMap[method];
      if (method === 'update' || method === 'create') {
        modelJSON = JSON.stringify(model.toJSON());
      }
      /*
        Default JSON-request options.
      */
      params = {
        url: Backbone.Helpers.prototype.getUrl(model),
        type: type,
        contentType: 'application/json',
        data: modelJSON,
        dataType: 'json',
        processData: false,
        success: success,
        error: error
      };
      /*
        For older servers, emulate JSON by encoding the request into an HTML-form.
      */
      if (Backbone.emulateJSON) {
        params.contentType = 'application/x-www-form-urlencoded';
        params.processData = true;
        params.data = modelJSON ? {
          model: modelJSON
        } : {};
      }
      /*
        For older servers, emulate HTTP by mimicking the HTTP method with `_method`
        And an `X-HTTP-Method-Override` header.
      */
      if (Backbone.emulateHTTP) {
        if (type === 'PUT' || type === 'DELETE') {
          if (Backbone.emulateJSON) {
            params.data._method = type;
          }
          params.type = 'POST';
          params.beforeSend = function(xhr) {
            return xhr.setRequestHeader("X-HTTP-Method-Override", type);
          };
        }
      }
      /*
        Make the request.
      */
      $.ajax(params);
    }
    return sync;
  })();
  /*
    Backbone.Helpers
    -------
  */
  Backbone.Helpers = (function() {
    function Helpers() {}
    /*
      Helpers function to get a URL from a Model or Collection as a property
      or as a function.
    */
    Helpers.prototype.getUrl = function(object) {
      if (!(object && object.url)) {
        throw new Error("A 'url' property or @ must be specified");
      }
      if (_.isFunction(object.url)) {
        return object.url();
      } else {
        return object.url;
      }
    };
    /*
      Wrap an optional error callback with a fallback error event.
    */
    Helpers.prototype.wrapError = function(onError, model, options) {
      return function(resp) {
        if (onError) {
          return onError(model, resp);
        } else {
          return model.trigger('error', model, resp, options);
        }
      };
    };
    /*
      Helpers  to escape a string for HTML rendering.
    */
    Helpers.prototype.escapeHTML = function(string) {
      return string.replace(/&(?!\w+)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    return Helpers;
  })();
}).call(this);
