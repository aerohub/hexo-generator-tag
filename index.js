/* global hexo */
'use strict';

var assign = require('object-assign');

hexo.config.topic_generator = assign({
  per_page: hexo.config.per_page == null ? 10 : hexo.config.per_page
}, hexo.config.topic_generator);

hexo.extend.generator.register('topic', require('./lib/generator'));
