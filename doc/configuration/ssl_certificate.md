# Get And Install SSL Certificate

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
>
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

hiporxy会自己生成一个根证书，扮演CA的角色（Hiproxy Custom CA）。hiproxy在代理https请求的时候，会自动生成证书并使用hiproxy的根证书签名。

由于系统是不信任hiproxy根证书的，所以需要我们自己手动安装信任hiproxy的根证书。

## 下载证书

启动hiproxy服务之后（假设端口号是`5525`)，可以访问`http://127.0.0.1:5525/ssl-certificate`获取**Hiproxy Custom CA**的根证书。

这个地址，可以在`http://127.0.0.1:5525/`中找到，如下图：

<img src="../images/hiproxy_start_page.png" width="500" />

## 安装证书

下面将分别介绍OSX、iOS、Windows和Android中如何安装根证书。

### OSX系统

1. 下载完成根证书之后，双击`Hiproxy_Custom_CA_Certificate.pem`导入证书到钥匙串。

2. 在弹出的对话框中输入用户密码。

3. 此时证书是不受信任状态，双击刚才导入的证书。

<img src="../images/import_root_cert.png" width="680" />

4. 在**信任** > **使用此证书时**下面选择**始终信任**。

<img src="../images/trust_root_cert.png" width="680" />

5. 关闭对话框，此时证书已经是被信任状态。

<img src="../images/root_cert_trusted.png" width="680" />


### iOS系统

### Windows

### Android


根证书下载及安装的具体操作步骤如下。
## 下载根证书。
在登录页面右上角，单击“下载根证书”。 
系统弹出如图7-1所示对话框。
图7-1  文件下载-安全警告 

单击“打开”。 
系统显示如图7-2所示页面。
图7-2  证书 

## 安装根证书。
单击“安装证书...”。 
系统显示如图7-3所示页面。
图7-3  欢迎使用证书导入向导 

单击“下一步”。 
系统显示如图7-4所示页面。
图7-4  证书导入向导 

选择“将所有的证书放入下列存储区”，单击“浏览”。 
系统弹出如图7-5所示对话框。
图7-5  选择证书存储 

选择“受信任的根证书颁发机构”，单击“确定”。
单击“下一步”。根据页面提示完成根证书安装。
关闭IE浏览器后重新启动。
