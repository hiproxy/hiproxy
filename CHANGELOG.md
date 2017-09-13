# Change Log
## [1.2.1] - 2017-09-12

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

### Fixed

* Response 404 when use `alias` and the request has query string.