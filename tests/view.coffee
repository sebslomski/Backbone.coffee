$(document).ready () ->

  module("Backbone.View")

  view = new Backbone.View({
    id        : 'test-view'
    className : 'test-view'
  })

  test "View: constructor", () ->
    equals(view.el.id, 'test-view')
    equals(view.el.className, 'test-view')
    equals(view.options.id, 'test-view')
    equals(view.options.className, 'test-view')

  test "View: jQuery", () ->
    view.el = document.body
    equals(view.$('#qunit-header a').get(0).innerHTML, ' Backbone Test Suite')

  test "View: make", () ->
    div = view.make('div', {id: 'test-div'}, "one two three")
    equals(div.tagName.toLowerCase(), 'div')
    equals(div.id, 'test-div')
    equals($(div).text(), 'one two three')

  test "View: initialize", () ->
    class View extends Backbone.View
      initialize: () ->
        @one = 1
    view = new View()
    equals(view.one, 1)

  test "View: delegateEvents", () ->
    counter = 0
    view.el = document.body
    view.increment = () ->
      return ++counter

    events = {"click #qunit-banner": "increment"}
    view.delegateEvents(events)
    $('#qunit-banner').trigger('click')
    equals(counter, 1)
    $('#qunit-banner').trigger('click')
    equals(counter, 2)
    view.delegateEvents(events)
    $('#qunit-banner').trigger('click')
    equals(counter, 3)

  test "View: _ensureElement", () ->
    class ViewClass extends Backbone.View
      el: document.body

    view = new ViewClass()
    equals(view.el, document.body)
