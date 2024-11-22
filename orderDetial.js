const { Builder, By } = require('selenium-webdriver');
const fs = require('fs');

async function fillFormWithSelenium() {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('https://earwig.greenriverdev.com/pizzaform/');

    // 从文件中读取订单详情
    const orderDetails = fs
      .readFileSync('orderDetails.txt', 'utf8')
      .split('\n');

    // 解析文本文件中的键值对
    const details = orderDetails.reduce((acc, line) => {
      let [key, value] = line.split(': ');
      if (key && value) {
        // 移除值末尾的逗号
        value = value.replace(/,$/, '').trim();
        acc[key.trim()] = value;
      }
      return acc;
    }, {});

    // 使用details中的值来填充表单
    await driver.findElement(By.id('name')).sendKeys(details['name'] || '');
    await driver
      .findElement(By.id('phoneNumber'))
      .sendKeys(details['phoneNumber'] || '');
      console.log(details['phoneNumber']);
    await driver.findElement(By.id('email')).sendKeys(details['email'] || '');
    await driver.findElement(By.id('state')).sendKeys(details['state'] || '');
    await driver.findElement(By.id('city')).sendKeys(details['city'] || '');
    await driver
      .findElement(By.id('address'))
      .sendKeys(details['address'] || '');

    if (details['size']) {
      await driver
        .findElement(By.css(`input[name='size'][value='${details['size']}']`))
        .click();
    }

    await driver
      .findElement(By.id('comment'))
      .sendKeys(details['comment'] || '');

    // 处理配料，假设是复选框，并且配料是以逗号分隔
    if (details['toppings']) {
      // 将配料字符串转换为小写，并按逗号分割
      const toppings = details['toppings'].toLowerCase().split(',');

      for (let topping of toppings) {
        // 去除配料名称中的所有空格
        topping = topping.replace(/\s+/g, '');
        try {
          await driver
            .findElement(By.css(`input[name='topping[]'][value='${topping}']`))
            .click();
        } catch (error) {
          // 找不到元素时弹出对话框或打印消息
          // console.log(`Topping ${topping} not found.`);
          // 如果您希望在浏览器中显示一个对话框，可以使用下面的代码
          // await driver.executeScript('alert("Topping not found: ' + topping + '");');
          // 等待用户关闭对话框
          // await driver.switchTo().alert().accept();
        }
      }
    }

    // 提交表单
    // await driver.findElement(By.css('button[type="submit"]')).click();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // 关闭浏览器
    // await driver.quit();
  }
}

fillFormWithSelenium();
