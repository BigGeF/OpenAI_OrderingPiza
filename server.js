require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const path = require('path'); // 引入path模块来处理文件路径
const app = express();
const port = 3000;
const fs = require('fs');
const { fillFormWithSelenium } = require('./test');

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 使用环境变量
});

app.post('/', async (req, res) => {
  const text = req.body.text;
  console.log('Received text:', text); // 打印接收到的文本

  // 添加指导性的上下文或指令
  const promptText = `Extract the following details from the order: name, phone number, email, state, city, address, size, comment, and toppings. Please provide the information in English . No need to provide the full details; simply include what is available \n\n${text}`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: promptText },
        {
          role: 'assistant',
          content: 'Only display useful order-related information ',
        },
        {
          role: 'user',
          content:
           'show me the simple order, 用|符号区别不订单数据,if order data is not privaded just leave it empty,关于size,大中小号,分别为sm, md,lg, order. order name and order data have to be lower case in englishe.这些是toppings的option， Pepperoni， Mushrooms， Onions， Sausage， Bacon， Extra Cheese Black Olives， Green Bell Peppers， 只要客户toppings 分析类似内容，如果信息和toppings里的内容模糊相似的那么就可以使用该信息，如果輸入的topping和這裏的不同那麽就告訴用戶。',
        },
        {
          role: 'assistant',
          content:
            '回答要超级简洁,do not show anything if data not privaded,不需要告诉我缺少了什么，不需要 please confirm the order and let me know the total cost including delivery charges. ',
        },
        {
          role: 'assistant',
          content:
            '如果信息是一封邮件,需要鉴别出邮件中的name:phoneNumber:email:state:city:address:size:comment:toppings:. 分析类似内容如果又模糊相似的那么就可以使用该信息',
        },
      ],
    });

    // 获取AI生成的内容
    const generatedContent = chatCompletion.choices[0].message.content;
  generatedContent.toLocaleLowerCase();
    console.log(generatedContent);
    const extractContent = (content, key) => {
      const regex = new RegExp(
        `${key}:\\s*(.*?)(?=(\\w+\\s*:\\s*|$)|\\|)`,
        'i'
      );
      const match = content.match(regex);
      return match ? match[1].trim() : ``;
    };

    const details = {
      name: extractContent(generatedContent, 'Name'),
      phoneNumber: extractContent(generatedContent, 'phone number'),
      email: extractContent(generatedContent, 'email'),
      state: extractContent(generatedContent, 'state'),
      city: extractContent(generatedContent, 'city'),
      address: extractContent(generatedContent, 'address'),
      size: extractContent(generatedContent, 'size'),
      comment: extractContent(generatedContent, 'comment'),
      toppings: extractContent(generatedContent, 'toppings'),
    };

    console.log(details);
    // 将details对象转换为易于阅读的字符串格式
    const detailsString = Object.keys(details)
      .map((key) => `${key}: ${details[key]}`)
      .join(',\n');
    console.log("name is "+details['name']);

    // 写入文件
    fs.writeFile('orderDetails.txt', detailsString, (err) => {
      if (err) throw err;
      console.log('Order details saved!');
    });
    // 将内容转换为小写
    const lowerCaseContent = generatedContent.toLowerCase();

    // 将小写内容发送给客户端
    res.json({ orderDetails: lowerCaseContent });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 为根URL`/`添加GET路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
function parseOrderDetails(content) {
  const details = {};
  const lines = content.split('\n');
  lines.forEach(line => {
    const [key, value] = line.split(': ');
    if (key && value) {
      details[key.trim().toLowerCase()] = value.trim().replace(/,$/, '');
    }
  });
  return details;
}