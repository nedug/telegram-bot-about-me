const TelegramApi = require('node-telegram-bot-api');
const {gameOptions, againOptions, contactMeOptions} = require('./options');
// const sequelize = require('./db');
// const UserModel = require('./models');
require('dotenv').config();


const token = process.env.TG_TOKEN;

const bot = new TelegramApi(token, {polling: true});

const chats = {};


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`);
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
};


const start = async () => {

    // try {
    //     await sequelize.authenticate()
    //     await sequelize.sync()
    // } catch (e) {
    //     console.log('Подключение к бд сломалось', e)
    // }

    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/contactme', description: 'Моя контактная информация'},
        {command: '/aboutyou', description: 'Информация о тебе'},
        {command: '/game', description: 'Игра угадай цифру'},

    ]);

    bot.on('message', async msg => {

        // console.log(msg)

        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                // await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://chpic.su/_data/stickers/e/EatPrayCode/EatPrayCode_001.webp');
                await bot.sendMessage(chatId, `<b>${msg.from.first_name}</b>, добро пожаловать в мой телеграм бот!`, {parse_mode: 'HTML'});
                await bot.sendMessage(chatId, `Меня зовут <b>Александр</b> и я начинающий фронтенд разработчик! 🖥`, {parse_mode: 'HTML'});
                return bot.sendMessage(chatId, `Tут вы найдете информацию о моих навыках, портфолио, контактах и многое другое.`, {parse_mode: 'HTML'});
            }

            if (text === '/contactme') {
                // await UserModel.create({chatId})
                return bot.sendMessage(chatId, 'Вы можете связаться со мной через:', contactMeOptions);
            }

            if (text === '/aboutyou') {
                // const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.username}!`);
                // return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong}`);
            }

            if (text === '/game') {
                return startGame(chatId);
            }

            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!)');

        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая-то ошибочка!)');
        }

    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === '/again') {
            return startGame(chatId)
        }
        if (data === '/email') {
            return bot.sendMessage(chatId, `ru55nedug@gmail.com`, {disable_web_page_preview: true, parse_mode: 'HTML'});
        }
        if (data === '/telegram') {
            return bot.sendMessage(chatId, `https://t.me/polkaj`, {disable_web_page_preview: true, parse_mode: 'HTML'});
        }
        if (data === '/linkedin') {
            return bot.sendMessage(chatId, `https://www.linkedin.com/in/alexander-rusin-789760226`, {disable_web_page_preview: true, parse_mode: 'HTML'});
        }
        if (data === '/github') {
            return bot.sendMessage(chatId, `https://github.com/nedug`, {disable_web_page_preview: true, parse_mode: 'HTML'});
        }

        // const user = await UserModel.findOne({chatId})
        if (data == chats[chatId]) {
            // user.right += 1;
            await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions);
        } else {
            // user.wrong += 1;
            await bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions);
        }
        // await user.save();
    })
};


start();