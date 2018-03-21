/**
 * @file
 * @author zdying
 */

'use strict';

/**
 * 作用域指令列表
 * @type {Object}
 */
module.exports = {
  request: [
    'proxy_set_header',
    'proxy_hide_header',
    'proxy_set_cookie',
    'proxy_hide_cookie',
    'proxy_method',
    'proxy_set_body',
    'proxy_append_body',
    'proxy_replace_body'
  ],
  beforeResponse: [
    'status',
    'set_header',
    'set_cookie',
    'hide_header',
    'hide_cookie',
    'echo',
    'send_file'
  ],
  response: [
    'sub_filter',
    'sub_filter_types',
    'sub_filter_once',
    'sub_filter_last_modified'
  ],
  domain: [
    'set',
    'ssl_certificate',
    'ssl_certificate_key'
  ],
  global: ['set'],
  location: [
    'set',
    'proxy_pass',
    'alias',
    'root'
  ]
};
