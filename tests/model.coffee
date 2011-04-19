$(document).ready () ->

  module("Backbone.Model")

  # Variable to catch the last request.
  window.lastRequest = null

  window.originalSync = Backbone.sync

  # Stub out Backbone.request...
  class Backbone.sync
    constructor: () ->
      lastRequest = _.toArray(arguments)

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

  test "Model: url when using urlRoot, and uri encoding", () ->
    class Model extends Backbone.Model
      urlRoot: '/collection'

    model = new Model()
    equals(model.url(), '/collection')
    model.set({id: '+1+'})
    equals(model.url(), '/collection/%2B1%2B')
