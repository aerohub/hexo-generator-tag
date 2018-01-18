'use strict';

var pagination = require('hexo-pagination');

module.exports = function(locals) {
  var config = this.config;
  var perPage = config.topic_generator.per_page;
  var paginationDir = config.pagination_dir || 'page';
  var topics = locals.topics;
  var topicDir;

  var pages = topics.reduce(function(result, topic) {
    if (!topic.length) return result;

    var posts = topic.posts.sort('-date');
    var data = pagination(topic.path, posts, {
      perPage: perPage,
      layout: ['topic', 'archive', 'index'],
      format: paginationDir + '/%d/',
      data: {
        topic: topic.name
      }
    });

    return result.concat(data);
  }, []);

  // generate topic index page, usually /topics/index.html
  if (config.topic_generator.enable_index_page) {
    topicDir = config.topic_dir;
    if (topicDir[topicDir.length - 1] !== '/') {
      topicDir += '/';
    }

    pages.push({
      path: topicDir,
      layout: ['topic-index', 'topic', 'archive', 'index'],
      posts: locals.posts,
      data: {
        base: topicDir,
        total: 1,
        current: 1,
        current_url: topicDir,
        posts: locals.posts,
        prev: 0,
        prev_link: '',
        next: 0,
        next_link: '',
        topics: topics
      }
    });
  }

  return pages;
};
