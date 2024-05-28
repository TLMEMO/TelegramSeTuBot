# TelegramSeTuBot
一个在Telegram应用中返回色图的Bot。使用gelbooru的API来随机获取图片。可根据标签自定义返回的图片。
### 如何安装
```
1. 安装nodejs (开发使用20.11)
2. git clone https://github.com/TLMEMO/TelegramSeTuBot
3. cd ./TelegramSeTuBot
4. npm install
5. 获取gelbooru的APIkey和TelegramBot的APIkey来修改config.js
6. node app.js
```

### 如何使用
```
指令一览：
/setu 
获取一张图片

/settags tag1 tag2 
设置返回图片的标签

/setpicmode 图片分级
分级列表：
default:所有评级的图片均会被随机返回。
general:仅返回评级为General的图片（G 级内容。完全可以安全用于工作的内容。没有任何色情或不适合在别人面前观看的内容。）
sensitive:仅返回评级为Sensitive的图片（色情、性感、暗示性或轻度色情内容。暴露的衣服、泳衣、内衣、专注于乳房或臀部的图像，以及任何其他可能不适合工作的内容。）
questionable:仅返回评级为Questionable的图片（隐晦色情。简单的裸体或近乎裸体，但没有露骨的性爱或暴露的生殖器。）
explicit:仅返回评级为Explicit的图片（公然的性内容。露骨的性行为、暴露的生殖器和性液。）
由于这里会自动在标签后面根据分级加上分级标签rating:
所以说在设置标签的时候不要额外加上分级标签

/init
将个人配置初始化

/getconfig
查看目前配置信息
```