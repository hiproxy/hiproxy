# CLI options

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
>
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

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

    start    Start a local proxy server
    stop     Stop the local proxy server (Only works in daemon mode)
    restart  Restart the local proxy service (Only works in daemon mode)
    state    Show all the servers state (Only works in daemon mode)
    open     Open browser and set proxy
    hello    A test command that say hello to you.

  Options:

    -v, --version     Display version information
    -h, --help        Display help information
    --log-dir <dir>   The log directory when run in background, default: user home directory
    --log-time        Show time info before every log message
    --log-level       The log levels, format: <level1>[,<lavel2[,...]]
    --grep <content>  Filter the log data
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
    -D, --daemon                  Run hiproxy in background
    -c, --hosts-file <files>      hosts files, format: <file1>[,<file2>[,...]]
    -s, --https                   Enable HTTPS proxy
    -m, --middle-man-port <port>  The Man-In-The-MiddleHTTPS proxy port, default: 10010
    -o, --open [browser]          Open a browser window and use hiproxy proxy
    --pac-proxy                   Use Proxy auto-configuration (PAC)
    -p, --port <port>             HTTP proxy port, default: 5525
    -r, --rewrite-file <files>    rewrite config files, format: <file1>[,<file2>[,...]]
    --sys-proxy <path>            Your own proxy server path, format: <ip>[:port], only works when use PAC
    -w, --workspace <dir>         The workspace
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

    open [options]

  DESCRIBE:

    Open browser and set proxy

  OPTIONS:

    -h, --help               show help info
    -b, --browser <browser>  Browser name, default: chrome. Valid alues: chrome,firefox,opera
    --pac-proxy              Use Proxy auto-configuration (PAC)
```

## state

This command will display the basic status information of the currently started proxy service.

## restart

This command will restart the proxy service.
