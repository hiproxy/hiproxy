# Change Log

## [2.0.0] - 2019-08-??

上次更新到现在已经很长时间了.对不起，我迟到了。

hiproxy 2.0版本更新了很多功能细节，修复了很多问题，对代码进行了重构，重新规划、编写了自动化测试用例，也更新了一部分文档。

这需要耗费相对较多的时间，除了写代码，我业余时间还需要拍一些照片，这是我新的爱好！

hiproxy现在基本功能已经算是稳定，但是hiproxy还能做很多事情，需要继续优化的也还有很多。希望喜爱hiproxy的人能一起参与，为hiproxy做出一些贡献。

如果你愿意为hiproxy贡献一份自己的力量，请提出你的issue。

It has been a long time since the last update. Sorry, I am late.

The hiproxy 2.0 version updates a lot of feature details, fixes a lot of problems, refactors the code, re-plans, writes automated test cases, and updates some of the documentation.

This takes a relatively long time. In addition to writing code, I still need to take some photos in my spare time. This is my new hobby!

Hiproxy is now basically stable, but hiproxy can do a lot of things, and there are still many things that need to be optimized. I hope that people who love hiproxy can participate and contribute to hiproxy.

If you are willing to contribute a power to hiproxy, please submit your issue.

### Added

* Support multiple hiproxy certificates for the same device, see [#57](https://github.com/hiproxy/hiproxy/issues/57).
* Support plugins installed by yarn, see [#53](https://github.com/hiproxy/hiproxy/pull/53) 增加yarn全局插件检测.
* Support `onError()` callback.
* Support `onBeforeRequest()` callback.
* Support `onData()` callback.
* Support `onBeforeResponse()` callback;
* Add `addCallback()` api for hiproxy.
* Ignore duplicate hosts rules(TODO ? keep this or remove it? #b3d0a3bfa9c47565e9ab37e5ba1fcaf247fe546e).
* Add default `Host` header.
* The `send_file` directive now send `Content-Type` header.
* The `proxy_append_body` directive now will auto detect `JSON` and `form` data.
* The `proxy_replace_body` directive now support flag `igm`.
* Add new directive `proxy_timeout timeout`.
* Add direcitive `sub_filter_last_modified on|off`.
* Add directive `sub_filter_types types`.
* Add directive `sub_filter_once on|off`.
* hiproxy home page use <https://hi.proxy/>.

### Fixed

* Fix [#59](https://github.com/hiproxy/hiproxy/issues/59) haeder设置重复.
* Fix: Empty rewrite file error when starting hiproxy.
* Fix: hosts domain https request error.
* Fix: content by echo directive has no proxy log.
* Fix: hiproxy home page charset.
* Fix: file upload and Non-text file damaged.
* Fix: windows 7 hosts parse error.

### Updated

* Update hiproxy log prefix label.
* CLI add `--error`/`--warn`/`--detail`/`--debug` opts, and remove `--log-level` opt.
* Update event params format, user object instead.
* `res.headers` now can get values setted by `res.setHeader()`.
* The validity period of the certificate is changed from **1 year** to **5 years**.








## [1.3.1] - 2018-03-26

### Fixed

* fix bug [#45](https://github.com/hiproxy/hiproxy/issues/45).


## [1.3.0] - 2018-03-15

### Added

* Add new request directives: 
  * [proxy-method](http://hiproxy.org/rewrite/directives.html#proxy-method) : set the request method.
  * [proxy-set-body](http://hiproxy.org/rewrite/directives.html#proxy-set-body) : set the request body content.
  * [proxy-append-body](http://hiproxy.org/rewrite/directives.html#proxy-append-body) : append content to the body.
  * [proxy-replace-body](http://hiproxy.org/rewrite/directives.html#proxy-replace-body) : replace part of the body.

* Add new response directives: 
  * [status](http://hiproxy.org/rewrite/directives.html#status) : Set the response status code and status message.

* Add more test case.

## [1.2.13] - 2018-03-14

### Added

* Support for automatic selection of available port numbers when creating services. See [API](http://hiproxy.org/api/#new-ProxyServer-options) for more details.
* Add more test case.

## [1.2.12] - 2018-02-26

### Added

* Add `requestend` event. 
* Add `requestId` and `_startTime` for CONNECT request.
* Start HTTPS service by default.


## [1.2.11] - 2018-01-09

### Added

* Auto find config file from current dir.
* Add current config files log. 

## [1.2.10] - 2017-12-21

### Bugfix

* fix(command/start): can't found cli.js module on daemon mode [#43](https://github.com/hiproxy/hiproxy/pull/43)

Thanks to [raccoon-lee](https://github.com/raccoon-lee)

## [1.2.9] - 2017-11-08

### Bugfix

* Fixbug: window下无法创建名为*.xx.xx的证书 #40


## [1.2.8] - 2017-10-30

### Bugfix

* Fix plugin name for windows.

## [1.2.7] - 2017-10-24

### Added

* New hiproxy home page 🍺🍺🍺 👏👏👏
![](./hiproxy-home.png)

## [1.2.6] - 2017-10-19

### Bugfix

* Fix `hosts proxy` log error

### Added

* Directive can return promise or non-promise value now 
* Add `clearFiles()` api for `hiproxyServer.hosts` and `hiproxyServer.rewrite`
* Add `addRule()` api for hiproxy server instance
* Support custom `hosts` and `rewrite` snippets
* Add `hiproxy` global variable
* Add `dataProvider` module for plugins

### Updated

* change proxy log format


## [1.2.5] - 2017-10-10

### Bugfix

* Fix `alias` directive proxy log
* Change some log color from 'blue' to 'cyan'

### Added

* Domain block support multiple domain

## [1.2.4] - 2017-10-09

### Bugfix

* Fix error on windows
* Fix sub-command tips in help info

## [1.2.3] - 2017-09-21

### Added

* Add `requestId` for each request
* Show doc site url in `hiproxy` cmd and show new issue url in error msg

### Bugfix

* Response `data` event not emitted when use gzip

## [1.2.2] - 2017-09-18

### Added

* Change Hiproxy_Custom_CA_Certificate ext from pem to crt
* Add sub-command tips in help info

### Bugfix

* Plugins load error message has `undefined`

## [1.2.1] - 2017-09-12

### Added

* add `hiproxy init` CLI command
* Use `Hiproxy Custom CA` root certificate to issue `localhost` certificate

### Bugfix

* `send_file` directive bug

## [1.2.0] - 2017-09-04

### Added

* Regular expressions can omit the first `/` and last `/`
* Update proxy log format
* Use a more powerful syntax parser, and support main syntax error hints



## [1.1.9] - 2017-08-07

### Added

* Add built-in variable `$base_name` and `$dir_name`
* Add built-in API `enableConfFile` and `disableConfFile`

### Bugfix

* Response 404 when use `alias` and the request has query string.
