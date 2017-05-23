# Command Line Commands and Options

## Global Commands

The global `hiproxy` command without any options will display a welcome message like this:

```bash
> hiproxy
  _     _
 | |   (_)
 | |__  _  welcome to use hiproxy
 | '_ \| | current version is 1.1.2
 | | | | | You can try `hiproxy --help` for more info
 |_| |_|_|
```

If you specify the option `--help` or `-h`, you will see the complete help information.

```bash
> hiproxy --help

  Usage:

    hiproxy [command] [option]

  Commands:

    start   Start a local proxy server
    stop    Stop the local proxy server
    reload  Restart the local proxy server (In development)
    state   Show all the servers state
    open    Open browser and set proxy

  Options:

    -v, --version     显示版本信息
    -h, --help        显示帮助信息
    -D, --daemon      后台运行
    --log-dir <dir>   后台运行时日志存放路径（绝对路径），默认为用户目录
    --log-time        显示日志时间
    --log-level       过滤日志级别，只有指定级别的日志才会显示
    --grep <content>  过滤日志内容，只有保护过滤字符串的日志才会显示
```

## start

This command will start a local proxy service on the specified port. You can specify whether the service is running in the background, if running in the background, all the log of the service will be rediret to the log files.

The log file is located in the user's home directory by default. Of course, you can specify the log file's path via the option `--log-dir <dir>`.

```bash
> hiproxy start --help

  USAGE:

    start [--port <port>] [-xodD]

  DESCRIBE:

    Start a local proxy server

  OPTIONS:

    -h, --help                    show help info
    -s, --https                   启动https代理服务
    -m, --middle-man-port <port>  https中间人端口号
    -o, --open [browser]          打开浏览器窗口
    --pac-proxy                   是否使用自动代理，如果使用，不在hosts或者rewrite规则中的域名不会走代理
    -p, --port <port>             http代理服务端口号
```

## stop

If the proxy service is running in the background, hiproxy provides a `stop` command to stop the service

```bash
> hiproxy stop
```

## open

The `open` command can open a browser window and automatically set up the browser's proxy info based on the currently started proxy service.


```bash
> hiproxy open --help

  USAGE:

    open [option]

  DESCRIBE:

    Open browser and set proxy

  OPTIONS:

    -h, --help               show help info
    -b, --browser <browser>  浏览器名称，默认：chrome，可选值：chrome,firefox,opera
    --pac-proxy              是否使用自动代理，如果使用，不在hosts或者rewrite规则中的域名不会走代理
```

## state

This command will display the basic status information of the currently started proxy service.

## reload