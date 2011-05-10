(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  $(document).ready(function() {
    var Library, attrs, library;
    module("Backbone.sync");
    window.lastRequest = null;
    $.ajax = function(obj) {
      return window.lastRequest = obj;
    };
    Library = (function() {
      function Library() {
        Library.__super__.constructor.apply(this, arguments);
      }
      __extends(Library, Backbone.Collection);
      Library.prototype.url = function() {
        return '/library';
      };
      return Library;
    })();
    library = new Library();
    attrs = {
      title: "The Tempest",
      author: "Bill Shakespeare",
      length: 123
    };
    test("sync: read", function() {
      Backbone.sync = originalSync;
      library.fetch();
      equals(lastRequest.url, '/library');
      equals(lastRequest.type, 'GET');
      equals(lastRequest.dataType, 'json');
      return ok(_.isEmpty(lastRequest.data));
    });
    test("sync: create", function() {
      var data;
      library.add(library.create(attrs));
      equals(lastRequest.url, '/library');
      equals(lastRequest.type, 'POST');
      equals(lastRequest.dataType, 'json');
      data = JSON.parse(lastRequest.data);
      equals(data.title, 'The Tempest');
      return equals(data.author, 'Bill Shakespeare');
    });
    test("sync: update", function() {
      var data;
      library.first().save({
        id: '1-the-tempest',
        author: 'William Shakespeare'
      });
      equals(lastRequest.url, '/library/1-the-tempest');
      equals(lastRequest.type, 'PUT');
      equals(lastRequest.dataType, 'json');
      data = JSON.parse(lastRequest.data);
      equals(data.id, '1-the-tempest');
      equals(data.title, 'The Tempest');
      equals(data.author, 'William Shakespeare');
      return equals(data.length, 123);
    });
    test("sync: update with emulateHTTP and emulateJSON", function() {
      var data;
      Backbone.emulateHTTP = Backbone.emulateJSON = true;
      library.first().save({
        id: '2-the-tempest',
        author: 'Tim Shakespeare'
      });
      equals(lastRequest.url, '/library/2-the-tempest');
      equals(lastRequest.type, 'POST');
      equals(lastRequest.dataType, 'json');
      equals(lastRequest.data._method, 'PUT');
      data = JSON.parse(lastRequest.data.model);
      equals(data.id, '2-the-tempest');
      equals(data.author, 'Tim Shakespeare');
      equals(data.length, 123);
      return Backbone.emulateHTTP = Backbone.emulateJSON = false;
    });
    return test("sync: update with just emulateHTTP", function() {
      var data;
      Backbone.emulateHTTP = true;
      library.first().save({
        id: '2-the-tempest',
        author: 'Tim Shakespeare'
      });
      equals(lastRequest.url, '/library/2-the-tempest');
      equals(lastRequest.type, 'POST');
      equals(lastRequest.contentType, 'application/json');
      data = JSON.parse(lastRequest.data);
      equals(data.id, '2-the-tempest');
      equals(data.author, 'Tim Shakespeare');
      equals(data.length, 123);
      return Backbone.emulateHTTP = false;
    });
  });
}).call(this);
