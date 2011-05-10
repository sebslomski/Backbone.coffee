$(document).ready () ->

  module("Backbone.sync")

  # Variable to catch the last request.
  window.lastRequest = null

  # Stub out jQuery.ajax...
  $.ajax = (obj) ->
    window.lastRequest = obj

  class Library extends Backbone.Collection
    url: () -> '/library'

  library = new Library()

  attrs =
    title  : "The Tempest"
    author : "Bill Shakespeare"
    length : 123

  test "sync: read", () ->
    Backbone.sync = originalSync
    library.fetch()
    equals(lastRequest.url, '/library')
    equals(lastRequest.type, 'GET')
    equals(lastRequest.dataType, 'json')
    ok(_.isEmpty(lastRequest.data))

  test "sync: create", () ->
    library.add(library.create(attrs))
    equals(lastRequest.url, '/library')
    equals(lastRequest.type, 'POST')
    equals(lastRequest.dataType, 'json')
    data = JSON.parse(lastRequest.data)
    equals(data.title, 'The Tempest')
    equals(data.author, 'Bill Shakespeare')

  test "sync: update", () ->
    library.first().save({id: '1-the-tempest', author: 'William Shakespeare'})
    equals(lastRequest.url, '/library/1-the-tempest')
    equals(lastRequest.type, 'PUT')
    equals(lastRequest.dataType, 'json')
    data = JSON.parse(lastRequest.data)
    equals(data.id, '1-the-tempest')
    equals(data.title, 'The Tempest')
    equals(data.author, 'William Shakespeare')
    equals(data.length, 123)

  test "sync: update with emulateHTTP and emulateJSON", () ->
    Backbone.emulateHTTP = Backbone.emulateJSON = true
    library.first().save({id: '2-the-tempest', author: 'Tim Shakespeare'})
    equals(lastRequest.url, '/library/2-the-tempest')
    equals(lastRequest.type, 'POST')
    equals(lastRequest.dataType, 'json')
    equals(lastRequest.data._method, 'PUT')
    data = JSON.parse(lastRequest.data.model)
    equals(data.id, '2-the-tempest')
    equals(data.author, 'Tim Shakespeare')
    equals(data.length, 123)
    Backbone.emulateHTTP = Backbone.emulateJSON = false

  test "sync: update with just emulateHTTP", () ->
    Backbone.emulateHTTP = true
    library.first().save({id: '2-the-tempest', author: 'Tim Shakespeare'})
    equals(lastRequest.url, '/library/2-the-tempest')
    equals(lastRequest.type, 'POST')
    equals(lastRequest.contentType, 'application/json')
    data = JSON.parse(lastRequest.data)
    equals(data.id, '2-the-tempest')
    equals(data.author, 'Tim Shakespeare')
    equals(data.length, 123)
    Backbone.emulateHTTP = false
