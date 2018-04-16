/**
 * @file parse hosts file to javascript object
 * @author zdying
 */

/**
 * parse hosts file to javascript object
 *
 * input:
 *   127.0.0.1:8800 hiipack.com hii.com
 *   127.0.0.1 example.com example.com.cn
 *
 * output:
 *   {
 *     "hiipack.com": "127.0.0.1:8800",
 *     "hii.com": "127.0.0.1:8800",
 *     "example.com": "127.0.0.1",
 *     "example.com.cn": "127.0.0.1"
 *   }
 * @param source
 * @returns {{}}
 */
module.exports = function parseHosts (source) {
  var hostRules = {};
  var hosts = source;

  hosts.toString().split(/\n\r?/).forEach(function (line) {
    // TODO why does this NOT work in windows ???
    // line = line.replace(/#.*$/, '');
    line = line.split('#')[0];

    if (line.trim() === '') {
      return;
    }

    var arr = line.split(/\s+/);

    if (arr.length < 2 || line.indexOf('/') !== -1) {
      log.warn('hosts -', line.bold.yellow, 'ignored');
    } else {
      for (var i = 1, len = arr.length; i < len; i++) {
        if (!(arr[i] in hostRules)) {
          hostRules[arr[i]] = arr[0];
        }
      }
    }
  });

  log.debug('hosts - hosts file parsed: ', JSON.stringify(hostRules));

  return hostRules;
};
