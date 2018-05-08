# hiproxy test case structural planning

* hosts
  - [ ] find hosts files
  - [x] parse hosts rules
  - [x] add hosts files
  - [x] add hosts rule
  - [x] get hosts rule
  - [x] rule order

* rewrite
  - [ ] find rewrite files
  - [x] add rewrite files
  - [x] add rewrite rule
  - [x] get rewrite rule
  - [ ] rule order
  - [ ] rule merge
  - [x] built-in variables

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
      - [x] send server headers to client
    - [ ] response headers
      - [x] send server headers to client
      - [x] content length
    - [x] built-in variables 
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
    - [x] emoji
    - [x] CJK Unified Ideographs
    - others
      - [ ] default Host header
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
    * call multiple times res.end()
    * call multiple times res.write()
  - [x] router
    - [x] system page
    - [x] api router
    - [x] source image
  - [x] data provider
    - [x] get
    - [x] set

* directives
  - [ ] request
    - [ ] proxy_set_header
      - [x] set header
      - [x] array value
      - [x] joined together with ', '
      - [x] over written value
      - [ ] use variables
    - [x] proxy_hide_header
      - [x] hide header
      - [x] ignore case of field name
      - [x] hide all matched headers
    - [x] proxy_set_cookie
      - [x] set cookie
    - [x] proxy_hide_cookie
      - [x] hide cookie
      - [x] hide all matched fields
      - [x] hide `cookie` header
    - [ ] proxy_method
      - [x] GET to POST
      - [x] GET to POST and body (form)
      - [x] GET to POST and body (json)
      - [x] POST to GET
      - [x] POST to GET and query string
      - [ ] to HEAD
    - [ ] proxy_set_body
      - [x] cover original body
      - [x] set body multi-times
      - [x] support json
      - [x] support form
      - [ ] support file upload
      - [ ] use variables
    - [ ] proxy_append_body
      - [x] merge body (form)
      - [x] merge body (json)
      - [ ] object key path(`a.b.c`)
      - [ ] use variables
    - [x] proxy_replace_body
      - [x] replace body content
      - [x] replace all
      - [x] replace once
      - [x] ignore case
      - [ ] use variables
    - [x] proxy_timeout
      - [x] timeout
      - [x] discard invalid value
  * response
    - [ ] set_header
      - [x] set header
      - [x] array value
      - [x] over written value
      - [ ] over written default header value
      - [ ] use variables
    - [x] hide_header
      - [x] hide header
      - [x] ignore case of field name
      - [x] hide all matched headers
    - [x] set_cookie
      - [x] set cookie
    - [ ] hide_cookie
      - [x] hide cookie
      - [x] hide all matched fields
      - [ ] hide `cookie` header
    - [x] echo
      - [x] write normal string
      - [x] write html
      - [x] multiple echo
      - [x] use variables
    - [x] send_file
      - [x] send file content
      - [x] content type detect
      - [x] absolte path
      - [x] relative path
      - [x] work with `proxy_pass`
      - [x] work with `echo`
      - [x] 404
      - [x] 500
    - [x] sub_filter
    - [x] sub_filter_once
  - [x] domain
    - [x] set
    - [x] ssl_certificate
    - [x] ssl_certificate_key
  - [x] global
    - [x] set
  - [x] location
    - [x] set
    - [x] proxy_pass
    - [x] alias
      - [x] basic
      - [x] relative path
      - [x] absolute path
      - [x] default file
      - [x] content-type
      - [x] error handle
      - [x] work with `echo`
      - [x] ignore `proxy_pass`
    - [x] root
  * execute
    - [ ] exec scope directives
    - [ ] call multiple times res.end()
    - [ ] call multiple times res.write()

* web api
  * open browser
  * start server
  * stop server
  * disable/enable config file
  * update config file

* plugins
  - [x] plugin find
  - [x] plugin load
    - [x] add directives
    - [x] add page router
    - [x] add cli command
