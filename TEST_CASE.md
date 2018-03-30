# hiproxy test case structural planning

* hosts
  - [ ] find hosts files
  - [x] parse hosts rules
  - [x] add hosts files
  - [x] add hosts rule
  - [x] get hosts rule
  - [ ] rule order

* rewrite
  - [ ] find rewrite files
  - [x] add rewrite files
  - [x] add rewrite rule
  - [x] get rewrite rule
  - [ ] rule order
  - [ ] rule merge
  - [ ] built-in variables

* hiproxy core
  - [x] server create
    - [x] HTTP server
    - [x] HTTPS server
    - [x] specified port
    - [x] random port
    - [x] callbacks
  - [ ] server api
    - [x] start
    - [x] stop
    - [x] restart
    - [ ] openBrowser
    - [x] addCallback
    - [x] addRule
    - [x] enableConfFile
    - [x] disableConfFile
    - [x] addRewriteFile
    - [x] addHostsFile
  * proxy
    - [x] GET requests
      - [x] method
      - [x] query string
    - [x] POST requests
      - [x] method
      - [x] query string
      - [x] body
      - [x] content length
      - [x] Chinese characters
      - [x] Emoji characters
      - [x] application/json
      - [x] multipart/form-data
      - [x] application/x-www-form-urlencoded
      - [x] file upload
    - [x] request headers
    - [x] response headers
    - [ ] built-in variables 
    - [x] HTTP requsts
      - [x] reverse proxy
    - [ ] HTTPS requests
      - [x] reverse proxy
      - [x] certificate auto generation
      - [x] certificate cache
      - [x] Tunnel proxy
      - [ ] ...
    - [x] HTTPS to HTTP
    - [x] HTTP to HTTPS
    - [ ] proxy rule order
  * events
    * request
      * request start
      * request end
      * before proxy send
      * proxy start
      * proxy end
    * response
      * data
      * response
  * callback
    * onBeforeRequest
    * onData
    * onBeforeResponse
  * router
    * system page
    * api router
    * source image

* directives
  - [ ] request
    - [ ] proxy_set_header
      - [x] set header
      - [ ] array value
      - [ ] joined together with ', '
    - [x] proxy_hide_header
      - [x] hide header
      - [x] ignore case of field name
    - [ ] proxy_set_cookie
    - [ ] proxy_hide_cookie
    - [ ] proxy_method
    - [ ] proxy_set_body
    - [ ] proxy_append_body
    - [ ] proxy_replace_body
    - [x] proxy_timeout
      - [x] timeout
      - [x] discard invalid value
  * response
    * set_header
    * set_cookie
    * hide_header
    * hide_cookie
    * echo
    * send_file
    * sub_filter
    * sub_filter_once
  * domain
    * set
    * ssl_certificate
    * ssl_certificate_key
  * global
    * set
  * location
    * set
    * proxy_pass
    * alias
    * root

* web api
  * open browser
  * start server
  * stop server
  * disable/enable config file
  * update config file

* plugins
  * plugin find
  * plugin load
