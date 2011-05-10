$(document).ready () ->

  module("Backbone.Model")

  # Variable to catch the last request.
  window.lastRequest = null

  window.originalSync = Backbone.sync

  # Stub out Backbone.request...
  class Backbone.sync
    constructor: (others...) ->
      window.lastRequest = others

  attrs =
    id     : '1-the-tempest'
    title  : "The Tempest"
    author : "Bill Shakespeare"
    length : 123

  doc = new Backbone.Model(attrs)

  class klass extends Backbone.Collection
    url: () ->
      return '/collection'

  collection = new klass()
  collection.add(doc)

  test "Model: initialize", () ->
    class Model extends Backbone.Model
      initialize: () ->
        @one = 1
        equals(@collection, collection)

    model = new Model({}, {collection: collection})
    equals(model.one, 1)
    equals(model.collection, collection)

  test "Model: initialize with attributes and options", () ->
    class Model extends Backbone.Model
      initialize: (attributes, options) ->
        @one = options.one

    model = new Model({}, {one: 1})
    equals(model.one, 1)

  test "Model: url", () ->
    equals(doc.url(), '/collection/1-the-tempest')
    doc.collection.url = '/collection/'
    equals(doc.url(), '/collection/1-the-tempest')
    doc.collection = null
    failed = false
    try
      doc.url()
    catch e
      failed = true
    equals(failed, true)
    doc.collection = collection

  test "Model: clone", () ->
    attrs =
      'foo': 1
      'bar': 2
      'baz': 3
    a = new Backbone.Model(attrs)
    b = a.clone()
    equals(a.get('foo'), 1)
    equals(a.get('bar'), 2)
    equals(a.get('baz'), 3)
    equals(b.get('foo'), a.get('foo'), "Foo should be the same on the clone.")
    equals(b.get('bar'), a.get('bar'), "Bar should be the same on the clone.")
    equals(b.get('baz'), a.get('baz'), "Baz should be the same on the clone.")
    a.set({foo : 100})
    equals(a.get('foo'), 100)
    equals(b.get('foo'), 1, "Changing a parent attribute does not change the clone.")

  test "Model: isNew", () ->
    attrs =
      'foo': 1
      'bar': 2
      'baz': 3
    a = new Backbone.Model(attrs)
    ok(a.isNew(), "it should be new")
    attrs =
      'foo': 1
      'bar': 2
      'baz': 3
      'id': -5
    ok(a.isNew(), "any defined ID is legal, negative or positive")

  test "Model: get", () ->
    equals(doc.get('title'), 'The Tempest')
    equals(doc.get('author'), 'Bill Shakespeare')

  test "Model: escape", () ->
    equals(doc.escape('title'), 'The Tempest')
    doc.set({audience: 'Bill & Bob'})
    equals(doc.escape('audience'), 'Bill &amp; Bob')
    doc.set({audience: 'Tim > Joan'})
    equals(doc.escape('audience'), 'Tim &gt; Joan')
    doc.unset('audience')
    equals(doc.escape('audience'), '')

  test "Model: set and unset", () ->
    attrs =
      'foo': 1
      'bar': 2
      'baz': 3
    a = new Backbone.Model(attrs)
    changeCount = 0
    a.bind("change:foo", () ->
      changeCount += 1
    )
    a.set({'foo': 2})
    ok(a.get('foo') is 2, "Foo should have changed.")
    ok(changeCount is 1, "Change count should have incremented.")
    # set with value that is not new shouldn't fire change event
    a.set({'foo': 2})
    ok(a.get('foo') is 2, "Foo should NOT have changed, still 2")
    ok(changeCount is 1, "Change count should NOT have incremented.")

    a.unset('foo')
    ok(not a.get('foo')?, "Foo should have changed")
    ok(changeCount is 2, "Change count should have incremented for unset.")

  test "Model: set an empty string", () ->
    model = new Backbone.Model({name : "Model"})
    model.set({name : ''})
    equals(model.get('name'), '')

  test "Model: clear", () ->
    changed = false
    model = new Backbone.Model({name : "Model"})
    model.bind("change:name", () ->
      changed = true
    )
    model.clear()
    equals(changed, true)
    equals(model.get('name'), undefined)

  test "Model: defaults", () ->
    class Defaulted extends Backbone.Model
      defaults:
        'one': 1
        'two': 2
    model = new Defaulted({two: null})
    equals(model.get('one'), 1)
    equals(model.get('two'), null)

  test "Model: change, hasChanged, changedAttributes, previous, previousAttributes", () ->
    model = new Backbone.Model({name : "Tim", age : 10})
    model.bind('change', () ->
      ok(model.hasChanged('name'), 'name changed')
      ok(!model.hasChanged('age'), 'age did not')
      ok(_.isEqual(model.changedAttributes(), {name : 'Rob'}),
         'changedAttributes returns the changed attrs')
      equals(model.previous('name'), 'Tim')
      ok(_.isEqual(model.previousAttributes(), {name : "Tim", age : 10}),
         'previousAttributes is correct')
    )
    model.set({name : 'Rob'}, {silent : true})
    model.change()
    equals(model.get('name'), 'Rob')

  test "Model: change with options", () ->
    model = new Backbone.Model({name: 'Rob'})
    value = null
    model.bind('change', (model, options) ->
      value = options.prefix + model.get('name')
    )
    model.set({name: 'Bob'}, {silent: true})
    model.change({prefix: 'Mr. '})
    equals(value, 'Mr. Bob')
    model.set({name: 'Sue'}, {prefix: 'Ms. '})
    equals(value, 'Ms. Sue')

  test "Model: save within change event", () ->
    model = new Backbone.Model({firstName : "Taylor", lastName: "Swift"})
    model.bind('change', () ->
      model.save()
      ok(_.isEqual(window.lastRequest[1], model))
    )
    model.set({lastName: 'Hicks'})

  test "Model: save", () ->
    doc.save({title : "Henry V"})
    equals(window.lastRequest[0], 'update')
    ok(_.isEqual(window.lastRequest[1], doc))

  test "Model: fetch", () ->
    doc.fetch()
    ok(window.lastRequest[0], 'read')
    ok(_.isEqual(window.lastRequest[1], doc))
