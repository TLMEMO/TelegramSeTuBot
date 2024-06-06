const config = require('./config');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('userconf.db'); 
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS configs (
      chatid TEXT PRIMARY KEY,
      tags TEXT,
      picmode TEXT,
      excludetags TEXT
    )
  `);
});


const getConfig = (chatid, callback) => {
  db.get("SELECT * FROM configs WHERE chatid = ?", [chatid], (err, row) => {
    if (err) {
      console.error(err);
      callback(null);
    } else {
      if (!row) {
        // 如果没有配置，则初始化一个新的配置
        const newConfig = { chatid: chatid, tags: JSON.stringify([]), picmode: 'default' , excludetags: JSON.stringify([]) };
        db.run("INSERT INTO configs (chatid, tags, picmode ,excludetags) VALUES (?, ?, ?, ?)",
          [newConfig.chatid, newConfig.tags, newConfig.picmode,newConfig.excludetags],
          (err) => {
            if (err) {
              console.error(err);
              callback(null);
            } else {
              callback(newConfig);
            }
          });
      } else {
        row.tags = JSON.parse(row.tags);
        row.excludetags = JSON.parse(row.excludetags);
        callback(row);
      }
    }
  });
};

// 更新配置中的tags
const setTags = (chatid, tags) => {
  db.run("UPDATE configs SET tags = ? WHERE chatid = ?", [JSON.stringify(tags), chatid], (err) => {
    if (err) {
      console.error(err);
    }
  });
};
// 更新配置中的排除tags
const excludeTags = (chatid, tags) => {
  db.run("UPDATE configs SET excludetags = ? WHERE chatid = ?", [JSON.stringify(tags), chatid], (err) => {
    if (err) {
      console.error(err);
    }
  });
};

// 更新配置中的picmode
const setPicMode = (chatid, picmode) => {
  db.run("UPDATE configs SET picmode = ? WHERE chatid = ?", [picmode, chatid], (err) => {
    if (err) {
      console.error(err);
    }
  });
};

// 发送用户/群组数据库的数据
const sendConfig = (chatid, callback) => {
  getConfig(chatid, (config) => {
    if (config) {
      // console.log(config);
      const configMessage = `目前使用配置:\nTags: ${config.tags}\n图片筛选种类: ${config.picmode}\n排除标签：${config.excludetags}`;
      callback(configMessage);
    } else {
      callback('找不到配置');
    }

  });
};

// 初始化用户/群组数据库配置
const initConfig = (chatid, callback) => {
  const newConfig = { chatid: chatid, tags: JSON.stringify([]), picmode: 'default', excludetags:JSON.stringify([]) };
  db.run("REPLACE INTO configs (chatid, tags, picmode, excludetags) VALUES (?, ?, ?, ?)",
    [newConfig.chatid, newConfig.tags, newConfig.picmode,newConfig.excludetags],
    (err) => {
      if (err) {
        console.error(err);
        callback('初始化配置失败');
      } else {
        callback('初始化配置成功');
      }
    });
};

//计算该标签图片总数
const fetchTotalPosts = async (tags) => {
  const baseUrl = 'https://gelbooru.com/index.php';
  const params = {
    page: 'dapi',
    s: 'post',
    q: 'index',
    tags: tags,
    limit: 1,
    api_key: config.gelbooru_APIkey,
    user_id: config.gelbooru_userid,
    json: 1
  };

  try {
    const response = await axios.get(baseUrl, { params });
    return response.data['@attributes'].count;




  } catch (error) {
    console.error('出现错误:', error);
    return null;
  };
};
//根据标签返回图片
const getRandomPic = async (tags) => {
  const baseUrl = 'https://gelbooru.com/index.php';
  const params = {
    page: 'dapi',
    s: 'post',
    q: 'index',
    tags: "sort:random "+tags,
    limit: 1,
    pid: 1,
    api_key: config.gelbooru_APIkey,
    user_id: config.gelbooru_userid,
    json: 1
  };

  try {
    const response = await axios.get(baseUrl, { params });
    return [response.data.post[0].file_url, response.data.post[0].tags];
  } catch (error) {
    console.error( error);
    return null;
  };
};

//获取色图主函数
const returnPic = async (config, callback) => {
  let tags = config.tags;
  let extags = config.excludetags;
  // console.log(config.picmode);
  if (!Array.isArray(tags)) {
    tags = [];
  }
  switch (config.picmode) {
    case "default":
      break;
    case "general":
      tags.push("rating:general")
      break;
    case "sensitive":
      tags.push("rating:sensitive")
      break;
    case "questionable":
      tags.push("rating:questionable")
      break;
    case "explicit":
      tags.push("rating:explicit")
      break;
  }
  if (Array.isArray(extags) && extags.length > 0) {
    extags.forEach(item => {
      tags.push("-" + item);
  });
  };

  if (Array.isArray(tags) && tags.length > 0) {
    tags = tags.join(' ');
  }
  // console.log(tags);
  const totalPic = await fetchTotalPosts(tags);
  if (totalPic !== 0 && totalPic !== null) {
    const getPic = await getRandomPic(totalPic, tags);
    if (getPic != null) {
      callback(getPic);
    }
    else {
      callback(null);
    }
  }
  else {
    callback(null);
  };
};

module.exports = { getConfig, setTags, setPicMode, sendConfig, initConfig, returnPic,excludeTags };
