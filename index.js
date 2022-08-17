const TelegramApi = require('node-telegram-bot-api');
const {gameOptions, againOptions, contactMeOptions, portfolioOptions} = require('./options');
const axios = require('axios');
const UserModel = require('./models');
const mongoose = require('mongoose');
require('dotenv').config();


const token = process.env.TG_TOKEN;
const JOKE_API = 'https://v2.jokeapi.dev/joke/Programming?type=single';


const bot = new TelegramApi(token, {polling: true});

const chats = {};


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`);
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
};


const start = async () => {

    try {
        await new mongoose.connect(process.env.DB_URL); /* Обращаемся к MongoDB */
    } catch (e) {
        console.log('Подключение к бд сломалось', e);
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/portfolio', description: 'Моё CV и Портфолио'},
        {command: '/skills', description: 'Мои навыки разработки'},
        {command: '/contacts', description: 'Моя контактная информация'},
        {command: '/game', description: 'Игра угадай цифру'},
        {command: '/joke', description: 'Случайная шутка о программировании'},
    ]);

    bot.on('message', async msg => {

        // console.log(msg)

        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                const user = await UserModel.findOne({chatId});

                if (!user) {
                    await UserModel.create({chatId});
                }

                await bot.sendSticker(chatId, 'https://chpic.su/_data/stickers/e/EatPrayCode/EatPrayCode_001.webp');
                await bot.sendMessage(chatId, `<b>${msg.from.first_name}</b>, добро пожаловать в мой телеграм бот!`, {parse_mode: 'HTML'});
                await bot.sendMessage(chatId, `Меня зовут <b>Александр</b>!
И я начинающий фронтенд разработчик!  🖥`, {parse_mode: 'HTML'});
                return bot.sendMessage(chatId, `Tут вы найдете информацию о моих навыках, портфолио, контактах и многое другое.`, {parse_mode: 'HTML'});
            }
            if (text === '/portfolio') {
                return bot.sendMessage(chatId, 'Моё CV и Портфолио:', portfolioOptions);
            }
            if (text === '/skills') {
                return bot.sendMessage(chatId, `<b>HTML, CSS + SСSS
JavaScript + TypeScript
React + REDUX + REDUX Toolkit 
NODE.js + Express + MongoDB 
GIT + GitHub + Heroku
Axios + REST API + Postman
UNIT TEST (TDD, Jest) + StoryBook
Module CSS + Styled-components + Tailwind + Material UI
</b>`, {disable_web_page_preview: true, parse_mode: 'HTML'});
            }
            if (text === '/contacts') {
                return bot.sendMessage(chatId, 'Вы можете связаться со мной через:', contactMeOptions);
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            if (text === '/joke') {
                try {
                    const response = await axios(JOKE_API);
                    return bot.sendMessage(chatId, response.data.joke);
                } catch (e) {
                    console.log(e)
                    return bot.sendMessage(chatId, 'Произошла какая-то ошибочка!)');
                }
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
            return bot.sendMessage(chatId, `ru55nedug@gmail.com`, {disable_web_page_preview: true,});
        }
        if (data === '/telegram') {
            return bot.sendMessage(chatId, `https://t.me/polkaj`, {disable_web_page_preview: true,});
        }
        if (data === '/linkedin') {
            return bot.sendMessage(chatId, `https://www.linkedin.com/in/alexander-rusin-789760226`, {disable_web_page_preview: true,});
        }
        if (data === '/github') {
            return bot.sendMessage(chatId, `https://github.com/nedug`, {disable_web_page_preview: true,});
        }
        if (data === '/cv') {
            return bot.sendMessage(chatId, `https://drive.google.com/file/d/1mD977Y3Er8u_9zgPc350KDWF6A1grWAA/view`,);
        }
        if (data === '/portfoliocv') {
            return bot.sendMessage(chatId, `https://nedug.github.io/cv-alexander-r`,);
        }

        const user = await UserModel.findOne({chatId});

        if (data === chats[chatId]) {
            user.right += 1;
            await user.save();
            await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`);
            return bot.sendMessage(chatId, `В игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong}, 
процент выйгрыша ${(user.right / (user.right + user.wrong) * 100).toFixed(1)}`, againOptions);
        } else {
            user.wrong += 1;
            await user.save();
            await bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`);
            return bot.sendMessage(chatId, `В игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong}, 
процент выйгрыша ${(user.right / (user.right + user.wrong) * 100).toFixed(1)}`, againOptions);
        }
    })
};


start();