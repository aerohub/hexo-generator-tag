'use strict';

var should = require('chai').should(); // eslint-disable-line
var Hexo = require('hexo');

describe('Topic generator', function() {
  var hexo = new Hexo(__dirname, {silent: true});
  var Post = hexo.model('Post');
  var generator = require('../lib/generator').bind(hexo);
  var posts;
  var locals;

  // Default config
  hexo.config.topic_generator = {
    per_page: 10
  };

  before(function() {
    return Post.insert([
      {source: 'foo', slug: 'foo', date: 1e8},
      {source: 'bar', slug: 'bar', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', date: 1e8 - 1},
      {source: 'boo', slug: 'boo', date: 1e8 + 2}
    ]).then(function(data) {
      posts = data;

      return posts[0].setTopics(['foo']).then(function() {
        return posts[1].setTopics(['bar']);
      }).then(function() {
        return posts[2].setTopics(['foo']);
      }).then(function() {
        return posts[3].setTopics(['foo']);
      });
    }).then(function() {
      locals = hexo.locals.toObject();
    });
  });

  describe('Disable index page', function() {
    it('pagination enabled', function() {
      hexo.config.topic_generator.per_page = 2;

      var result = generator(locals);

      result.length.should.eql(3);

      for (var i = 0, len = result.length; i < len; i++) {
        result[i].layout.should.eql(['topic', 'archive', 'index']);
      }

      result[0].path.should.eql('topics/foo/');
      result[0].data.base.should.eql('topics/foo/');
      result[0].data.total.should.eql(2);
      result[0].data.current.should.eql(1);
      result[0].data.current_url.should.eql('topics/foo/');
      result[0].data.posts.eq(0)._id.should.eql(posts[3]._id);
      result[0].data.posts.eq(1)._id.should.eql(posts[0]._id);
      result[0].data.prev.should.eql(0);
      result[0].data.prev_link.should.eql('');
      result[0].data.next.should.eql(2);
      result[0].data.next_link.should.eql('topics/foo/page/2/');
      result[0].data.topic.should.eql('foo');

      result[1].path.should.eql('topics/foo/page/2/');
      result[1].data.base.should.eql('topics/foo/');
      result[1].data.total.should.eql(2);
      result[1].data.current.should.eql(2);
      result[1].data.current_url.should.eql('topics/foo/page/2/');
      result[1].data.posts.eq(0)._id.should.eql(posts[2]._id);
      result[1].data.prev.should.eql(1);
      result[1].data.prev_link.should.eql('topics/foo/');
      result[1].data.next.should.eql(0);
      result[1].data.next_link.should.eql('');
      result[1].data.topic.should.eql('foo');

      result[2].path.should.eql('topics/bar/');
      result[2].data.base.should.eql('topics/bar/');
      result[2].data.total.should.eql(1);
      result[2].data.current.should.eql(1);
      result[2].data.current_url.should.eql('topics/bar/');
      result[2].data.posts.eq(0)._id.should.eql(posts[1]._id);
      result[2].data.prev.should.eql(0);
      result[2].data.prev_link.should.eql('');
      result[2].data.next.should.eql(0);
      result[2].data.next_link.should.eql('');
      result[2].data.topic.should.eql('bar');

      // Restore config
      hexo.config.topic_generator.per_page = 10;
    });

    it('pagination disabled', function() {
      hexo.config.topic_generator.per_page = 0;

      var result = generator(locals);

      result.length.should.eql(2);

      for (var i = 0, len = result.length; i < len; i++) {
        result[i].layout.should.eql(['topic', 'archive', 'index']);
      }

      result[0].path.should.eql('topics/foo/');
      result[0].data.base.should.eql('topics/foo/');
      result[0].data.total.should.eql(1);
      result[0].data.current.should.eql(1);
      result[0].data.current_url.should.eql('topics/foo/');
      result[0].data.posts.eq(0)._id.should.eql(posts[3]._id);
      result[0].data.posts.eq(1)._id.should.eql(posts[0]._id);
      result[0].data.posts.eq(2)._id.should.eql(posts[2]._id);
      result[0].data.prev.should.eql(0);
      result[0].data.prev_link.should.eql('');
      result[0].data.next.should.eql(0);
      result[0].data.next_link.should.eql('');
      result[0].data.topic.should.eql('foo');

      result[1].path.should.eql('topics/bar/');
      result[1].data.base.should.eql('topics/bar/');
      result[1].data.total.should.eql(1);
      result[1].data.current.should.eql(1);
      result[1].data.current_url.should.eql('topics/bar/');
      result[1].data.posts.eq(0)._id.should.eql(posts[1]._id);
      result[1].data.prev.should.eql(0);
      result[1].data.prev_link.should.eql('');
      result[1].data.next.should.eql(0);
      result[1].data.next_link.should.eql('');
      result[1].data.topic.should.eql('bar');

      // Restore config
      hexo.config.topic_generator.per_page = 10;
    });

    it('custom pagination_dir', function() {
      hexo.config.topic_generator.per_page = 2;
      hexo.config.pagination_dir = 'yo';

      var result = generator(locals);

      result.map(function(item) {
        return item.path;
      }).should.eql(['topics/foo/', 'topics/foo/yo/2/', 'topics/bar/']);

      // Restore config
      hexo.config.topic_generator.per_page = 10;
      hexo.config.pagination_dir = 'page';
    });
  });

  describe('Enable index page', function() {
    it('pagination enabled', function() {
      hexo.config.topic_generator.per_page = 2;
      hexo.config.topic_generator.enable_index_page = true;

      var result = generator(locals);

      result.length.should.eql(4);

      for (var i = 0, len = result.length - 1; i < len; i++) {
        result[i].layout.should.eql(['topic', 'archive', 'index']);
      }

      result[3].layout.should.eql(['topic-index', 'topic', 'archive', 'index']);

      result[0].path.should.eql('topics/foo/');
      result[0].data.base.should.eql('topics/foo/');
      result[0].data.total.should.eql(2);
      result[0].data.current.should.eql(1);
      result[0].data.current_url.should.eql('topics/foo/');
      result[0].data.posts.eq(0)._id.should.eql(posts[3]._id);
      result[0].data.posts.eq(1)._id.should.eql(posts[0]._id);
      result[0].data.prev.should.eql(0);
      result[0].data.prev_link.should.eql('');
      result[0].data.next.should.eql(2);
      result[0].data.next_link.should.eql('topics/foo/page/2/');
      result[0].data.topic.should.eql('foo');

      result[1].path.should.eql('topics/foo/page/2/');
      result[1].data.base.should.eql('topics/foo/');
      result[1].data.total.should.eql(2);
      result[1].data.current.should.eql(2);
      result[1].data.current_url.should.eql('topics/foo/page/2/');
      result[1].data.posts.eq(0)._id.should.eql(posts[2]._id);
      result[1].data.prev.should.eql(1);
      result[1].data.prev_link.should.eql('topics/foo/');
      result[1].data.next.should.eql(0);
      result[1].data.next_link.should.eql('');
      result[1].data.topic.should.eql('foo');

      result[2].path.should.eql('topics/bar/');
      result[2].data.base.should.eql('topics/bar/');
      result[2].data.total.should.eql(1);
      result[2].data.current.should.eql(1);
      result[2].data.current_url.should.eql('topics/bar/');
      result[2].data.posts.eq(0)._id.should.eql(posts[1]._id);
      result[2].data.prev.should.eql(0);
      result[2].data.prev_link.should.eql('');
      result[2].data.next.should.eql(0);
      result[2].data.next_link.should.eql('');
      result[2].data.topic.should.eql('bar');

      result[3].path.should.eql('topics/');
      result[3].data.base.should.eql('topics/');
      result[3].data.total.should.eql(1);
      result[3].data.current.should.eql(1);
      result[3].data.current_url.should.eql('topics/');
      // just all posts
      result[3].data.posts.should.eql(locals.posts);
      result[3].data.prev.should.eql(0);
      result[3].data.prev_link.should.eql('');
      result[3].data.next.should.eql(0);
      result[3].data.next_link.should.eql('');
      // no topic, topics instead
      (result[3].data.topic === undefined).should.be.true;
      result[3].data.topics.should.eql(locals.topics);

      // Restore config
      hexo.config.topic_generator.per_page = 10;
    });

    it('pagination disabled', function() {
      hexo.config.topic_generator.per_page = 0;
      hexo.config.topic_generator.enable_index_page = true;

      var result = generator(locals);

      result.length.should.eql(3);

      for (var i = 0, len = result.length - 1; i < len; i++) {
        result[i].layout.should.eql(['topic', 'archive', 'index']);
      }

      result[2].layout.should.eql(['topic-index', 'topic', 'archive', 'index']);

      result[0].path.should.eql('topics/foo/');
      result[0].data.base.should.eql('topics/foo/');
      result[0].data.total.should.eql(1);
      result[0].data.current.should.eql(1);
      result[0].data.current_url.should.eql('topics/foo/');
      result[0].data.posts.eq(0)._id.should.eql(posts[3]._id);
      result[0].data.posts.eq(1)._id.should.eql(posts[0]._id);
      result[0].data.posts.eq(2)._id.should.eql(posts[2]._id);
      result[0].data.prev.should.eql(0);
      result[0].data.prev_link.should.eql('');
      result[0].data.next.should.eql(0);
      result[0].data.next_link.should.eql('');
      result[0].data.topic.should.eql('foo');

      result[1].path.should.eql('topics/bar/');
      result[1].data.base.should.eql('topics/bar/');
      result[1].data.total.should.eql(1);
      result[1].data.current.should.eql(1);
      result[1].data.current_url.should.eql('topics/bar/');
      result[1].data.posts.eq(0)._id.should.eql(posts[1]._id);
      result[1].data.prev.should.eql(0);
      result[1].data.prev_link.should.eql('');
      result[1].data.next.should.eql(0);
      result[1].data.next_link.should.eql('');
      result[1].data.topic.should.eql('bar');

      result[2].path.should.eql('topics/');
      result[2].data.base.should.eql('topics/');
      result[2].data.total.should.eql(1);
      result[2].data.current.should.eql(1);
      result[2].data.current_url.should.eql('topics/');
      result[2].data.posts.should.eql(locals.posts);
      result[2].data.prev.should.eql(0);
      result[2].data.prev_link.should.eql('');
      result[2].data.next.should.eql(0);
      result[2].data.next_link.should.eql('');
      (result[2].data.topic === undefined).should.be.true;
      result[2].data.topics.should.eql(locals.topics);

      // Restore config
      hexo.config.topic_generator.per_page = 10;
    });

    it('custom pagination_dir', function() {
      hexo.config.topic_generator.per_page = 2;
      hexo.config.pagination_dir = 'yo';
      hexo.config.topic_generator.enable_index_page = true;

      var result = generator(locals);

      result.map(function(item) {
        return item.path;
      }).should.eql(['topics/foo/', 'topics/foo/yo/2/', 'topics/bar/', 'topics/']);

      // Restore config
      hexo.config.topic_generator.per_page = 10;
      hexo.config.pagination_dir = 'page';
    });
  });
});
