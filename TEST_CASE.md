# hiproxy test case structural planning

* hosts
  - [ ] find hosts files
  - [x] parse hosts rules
  - [x] add hosts files
  - [x] add hosts rule
  - [x] get hosts rule

* rewrite
  - [ ] find rewrite files
  - [x] add rewrite files
  - [x] add rewrite rule
  - [x] get rewrite rule

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
    * GET requests
      * query string
    * POST requests
      * query string
      * body
      * content length
    * POST to GET
    * GET to POST
    * HTTP requsts
      * reverse proxy
    * HTTPS requests
      * certificate auto generation
      * certificate cache
      * Tunnel proxy
      * Reverse proxy
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
  * request
    * proxy_set_header
    * proxy_hide_header
    * proxy_set_cookie
    * proxy_hide_cookie
    * proxy_method
    * proxy_set_body
    * proxy_append_body
    * proxy_replace_body
    * proxy_timeout
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
