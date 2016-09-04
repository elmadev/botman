# botman - the [ElastoMania Discord](http://tinyurl.com/elmadiscord) bot

Project includes a multi-purpose Discord bot based on [discord.js](https://github.com/hydrabolt/discord.js/) and (eventually) a stats website built on [Meteor](https://meteor.com).

Feel free to contribute.

## Feedback and suggestions
Use [Trello](https://trello.com/b/WyGGKT38/elma-discord) to report bugs and suggest new features or improvements, share ideas, etc.

## Commands
Format: `!command [optional argument] [multiple | choice | argument] <required argument>`

###`!log <item>`
Logs an item. Shorthands for common items available such as: `!bear`, `!cofe`, etc. - see !loggables

###`!loggables`
Shows the list of items available to log using an `!<item>` shorthand command

###`![today | week | month]` <item>
Shows the top loggers of the specified item in the specified time period

###`!draw [name]`
Shows the link to drawing game with optionally the provided room name included in the link

###`!github`
Shows the link to this repository

###`!trello[-invite]`
Shows the link to the Trello board, optionally making it an invite link

###`!playlist`
Shows the link to the Google Spreadsheet containing links to songs for the Music Bot's autoplaylist

###`!set <setting> <value>`
Set or update a profile setting such as:
- `eol`: EOL nickname
- `lastfm`: Last.fm username
- `imdb`: Link to personal IMDB vote list
- `steam`: Link to Steam profile
- `rocket`: Link to Rocket League Rank profile
- `games`: List of games looking for players you want to be notified about (worms, csgo, rocketleague)

###`!lastfm [username]`
Shows last song played on Last.fm

###`!rand [min] [max]`
Returns a random number between 0-100 or optionally between specified min and max

###`!worm`
Lets other players know you want to play Worms Armageddon

###`!rocket`
Lets other players know you want to play Rocket League

###`!csgo`
Lets other players know you want to play Counter-Strike: Global Offensive

## Coming soon
- EOL battle notifications and posting of results
- EOL chat feed in Discord and messaging from Discord to EOL chat
- Stats website
- Profile management in the website

## Contribution guidelines
Let's try to keep it [JavaScript Standard Style](http://standardjs.com/) compliant. Project structure roughly follows [Mantra](https://github.com/kadirahq/mantra) suggestions.

Separation of concerns:
- Put various settings, simple response lists and helper functions in separate files whenever possible and import them where needed, to improve readability in the main bot file (`bot.js`)
- Let `Meteor.methods` deal with all database operations
