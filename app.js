const config = require('./config');
const TelegramBot = require('node-telegram-bot-api');
const token = config.TG_API_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const { getConfig, setTags, setPicMode, sendConfig, initConfig,returnPic } = require('./def_model')

// 处理 /settags 命令
bot.onText(/\/settags (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const tags = match[1].split(' ');
  getConfig(chatId, (config) => {
    if (config) {
      setTags(chatId, tags);
      bot.sendMessage(chatId, `已设置tags为: ${tags.join(', ')}`);
    }
  });
});

// 处理 /setpicmode 命令
bot.onText(/\/setpicmode (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const picmode = match[1].trim();
  console.log(picmode)
  getConfig(chatId, (config) => {
    if (config) {
      switch (picmode.toLowerCase()) {
        case "default":
          setPicMode(chatId, "default");
          bot.sendMessage(chatId, `当前图片返回模式为: ${picmode} \n所有评级的图片均会被随机返回。`);
          return;
        case "general":
          setPicMode(chatId, "general");
          bot.sendMessage(chatId, `当前图片返回模式为: ${picmode} \n仅返回评级为General的图片(G 级内容。完全可以安全用于工作的内容。没有任何色情或不适合在别人面前观看的内容。)`);
          return;
        case "Sensitive":
          setPicMode(chatId, "sensitive");
          bot.sendMessage(chatId, `当前图片返回模式为: ${picmode} \n仅返回评级为Sensitive的图片（色情、性感、暗示性或轻度色情内容。暴露的衣服、泳衣、内衣、专注于乳房或臀部的图像，以及任何其他可能不适合工作的内容。）`);
          return;
        case "questionable":
          setPicMode(chatId, "questionable");
          bot.sendMessage(chatId, `当前图片返回模式为: ${picmode} \n仅返回评级为Questionable的图片（隐晦色情。简单的裸体或近乎裸体，但没有露骨的性爱或暴露的生殖器。）`);
          return;
        case "explicit":
          setPicMode(chatId, "explicit");
          bot.sendMessage(chatId, `当前图片返回模式为: ${picmode} \n仅返回评级为Explicit的图片（公然的性内容。露骨的性行为、暴露的生殖器和性液。）`);
          return;
        default:
          bot.sendMessage(chatId, `请输入正确的图片评级`);
          return;
      }
    }
  });
});

// 处理 /getconfig 命令
bot.onText(/\/getconfig/, (msg) => {
  const chatId = msg.chat.id;
  sendConfig(chatId, (response) => {
    bot.sendMessage(chatId, response);
  });
});

// 处理 /init 命令
bot.onText(/\/init/, (msg) => {
  const chatId = msg.chat.id;
  initConfig(chatId, (response) => {
    bot.sendMessage(chatId, response);
  });
});

bot.onText(/\/setu/, (msg) => {
  const chatId = msg.chat.id;
  getConfig(chatId, (config) => {
    if (config) {
      returnPic(config, (response) => {
        if(response === null)
          {
          bot.sendMessage(chatId, '未找到包含所选tags的图片，请更改tags后重试');
          return;
          }
        else{
          bot.sendPhoto(chatId, response[0], { caption: `Tags:${response[1]}` })
          // console.log(response)
        }
        bot.sendMessage(chatId, response);
      });
    }
  })
});

// bot.on("polling_error", console.log);

