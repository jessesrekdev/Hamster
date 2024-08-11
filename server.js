const TelegramBot = require('node-telegram-bot-api');
const token = '7255359923:AAGGREouIJYn1B2oCQ2fqhBFb5y19sIRuxw';
const bot = new TelegramBot(token, { polling: true });

// Object to store users who have already been congratulated
let congratulatedUsers = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;

    // Store the user's message ID
    const userMessageId = msg.message_id;

    const welcomeMessage = `Hello ${firstName} 👋, Welcome to 🐹 Hamster Free Key Generator 🔑 \n\nYou can Generate codes to claim Keys in Hamster Kombat Game for free using me! 😜\n\nTo continue, press the "Generate Keys 🔑" button!`;

    const generate_keys_button = {
        inline_keyboard: [
            [{ text: 'Generate Keys 🔑', callback_data: 'generate_keys' }] // Inline button with callback data
        ]
    };

    // Send the welcome message with the inline keyboard and store the message_id
    bot.sendMessage(chatId, welcomeMessage, { reply_markup: generate_keys_button }).then((sentMessage) => {
        const welcomeMessageId = sentMessage.message_id;

        // Flag to ensure the message is sent only once
        let hasResponded = false;

        // Handle callback queries
        bot.on('callback_query', (query) => {
            const userChatId = query.message.chat.id; // The chat ID of the user who clicked the button
            const userFirstName = query.from.first_name; // The first name of the user who clicked the button

            if (query.data === 'generate_keys' && !hasResponded) {
                hasResponded = true; // Set the flag to true after the first response

                // Delete the welcome message and the user's message
                bot.deleteMessage(userChatId, welcomeMessageId);
                bot.deleteMessage(userChatId, userMessageId);

                // Send the response message with the join community and verify buttons
                const responseMessage = `First, join our community to continue using our services 😜`;
                const buttons = {
                    inline_keyboard: [
                        [{ text: 'Join Community ✨️', url: 'https://t.me/jesse_pro' }],
                        [{ text: 'Verify 😎', callback_data: 'verify_membership' }]
                    ]
                };

                bot.sendMessage(userChatId, responseMessage, { reply_markup: buttons }).then((resMsg) => {
                    const responseMessageId = resMsg.message_id;

                    // Handle membership verification
                    bot.on('callback_query', (verifyQuery) => {
                        const verifyUserChatId = verifyQuery.message.chat.id;

                        if (verifyQuery.data === 'verify_membership') {
                            // Check if the user is a member of the channel
                            bot.getChatMember('@jesse_pro', verifyQuery.from.id).then((member) => {
                                if (['member', 'administrator', 'creator'].includes(member.status)) {
                                    // Check if the user has already been congratulated
                                    if (!congratulatedUsers[verifyQuery.from.id]) {
                                        // User is a member and has not been congratulated yet
                                        bot.deleteMessage(verifyUserChatId, responseMessageId);

                                        const congratsMessage = `Congrats 🥳  ${verifyUserChatId}, You can now Generate Keys 🔑 for Hamster Kombat 🐹 directly on Telegram!`;

                                        const congratsButtons = {
                                            inline_keyboard: [
                                                [{ text: 'Generate Keys 🔑', url: 'https://hamsterkombat.jesse-network.com/' }],
                                                [{ text: '🐹 Daily Combo ⏰️', url: 'https://t.me/tapswap_bot_codes' }],
                                                [{ text: '🐹 Launch Hamster Kombat 🐹', url: 'https://t.me/hAmster_kombat_bot/start?startapp=kentId5869356940' }]
                                            ]
                                        };

                                        bot.sendMessage(verifyUserChatId, congratsMessage, { reply_markup: congratsButtons });

                                        // Mark the user as congratulated
                                        congratulatedUsers[verifyQuery.from.id] = true;
                                    }
                                } else {
                                    // User is not a member, edit the responseMessage to show a warning
                                    const warningMessage = `⚠️ Please make sure you joined the channel and come back and click Verify 😎 to continue!`;

                                    bot.editMessageText(warningMessage, {
                                        chat_id: verifyUserChatId,
                                        message_id: responseMessageId,
                                        reply_markup: buttons
                                    });
                                }
                            }).catch((error) => {
                                console.error(error);
                                bot.sendMessage(verifyUserChatId, 'There was an error verifying your membership. Please try again.');
                            });
                        }
                    });
                });
            }
        });
    });
});

console.log('Bot is running...');
