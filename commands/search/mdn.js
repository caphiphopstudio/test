const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const Turndown = require('turndown');

module.exports = class MDNCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'mdn',
			aliases: ['mozilla-developer-network'],
			group: 'search',
			memberName: 'mdn',
			description: 'Searches MDN for your query.',
			patterns: [/^(?:mdn,) (.+)/i],
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					key: 'query',
					prompt: 'What article would you like to search for?',
					type: 'string',
					parse: query => query.replace(/#/g, '.prototype.')
				}
			]
		});
	}

	async run(msg, { query }, pattern) {
		if (pattern) [, query] = msg.patternMatches;
		try {
			const { body } = await request
				.get('https://mdn.topkek.pw/search')
				.query({ q: query });
			if (!body.URL || !body.Title || !body.Summary) return msg.say('Could not find any results.');
			const turndown = new Turndown();
			turndown.addRule('hyperlink', {
				filter: 'a',
				replacement: (text, node) => `[${text}](https://developer.mozilla.org${node.href})`
			});
			const embed = new MessageEmbed()
				.setColor(0x066FAD)
				.setAuthor('MDN', 'https://i.imgur.com/DFGXabG.png', 'https://developer.mozilla.org/')
				.setURL(`https://developer.mozilla.org${body.URL}`)
				.setTitle(body.Title)
				.setDescription(turndown.turndown(body.Summary));
			return msg.embed(embed);
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
