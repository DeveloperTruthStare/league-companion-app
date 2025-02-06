# League Companion App

This project's purpose is for me to learn Typescript, React, electron and other front end tools/frameworks. I plan to add features that I believe other programs/sites would benefit from, however due to the requirement of an external server to access riot api's there is no planned release of this.

## Current Status as of 2025/02/06

![Status as of February 6th 2025](/assets/status_02_05_2025.png)

## What is each project here

### [league-companion-app_backend_electron](/league-companion-app_backend_electron/)

This is the electron code which manages the window and the state of data using typescript. This creates the window displays a webpage (the react frontend compiled into static html/js/css) and makes calls to the client running on the same computer using the league client api.

### [league-companion-app_frontend_react](/league-companion-app_frontend_react/)

This is the main UI code, built using react and typescript. This is compiled into static html/css/javascript code and then used by electron.

### [league-companion-app_server_go](/league-companion-app_server_go/)

This is basically a proxy server which holds the RIOT_API_KEY. This limits the calls to ensure riot guidelines are being followed, as well as caches games and data to reduce total calls to riot server.

## Inspiration

I recently began using [We will teach you League](https://weteachleague.com/)'s auto recording program, and have found a few ways in which I believe it could be inproved.

## Planned Features

- [ ] Auto recording league of legends games
- [ ] Easy way to look through VODs to find games
- [ ] Note taking features
- [ ] Mark which champions a given note is relavent for
- [ ] Bring previously taken notes to the forefront when the relavent champions are in the current game

### The plan

Currently in WTL Auto Recorder in order to find a game you look througha list of icons which show

- Champion played
- Champion of your direct role opponent
- Queue Type (Ranked, Custom, ect)
- Thumbnail of the game

When using the program I found this combination of information to be not the most optimal for finding a specific game, especially when I play 10+ games a day, and often play against the same champion.

My plan is to implement a system more similar to u.gg, op.gg, or the league client where it shows

- Icon of champion played
- Items bought
- Runes taken
- Summoner Spells taken
- Q type
- Teammates Champion icons
- Enemy Champion icons
- KDA
- CS and Vision scores
- Game Duration
- Time since game was played

Where sites like op.gg and u.gg have a button to open a drop down menu showing more stats, I plan to have a vido player displaying the vod of the game.

## Other notes

### Champion Names vs Player Names

Next to the icons of the champion, I have decided for the time being to display the champion name, rather than the player name. I don't believe knowing the player name is helpful to the player in a learning journey, but a champion name can be a good way to search through games using ctrl+f.

### Users with multiple accounts

One thing WTL does well that is not mentioned here is how it handles multiple accounts. Because the user is identified by their discord account, it can link multiple accounts to that discord account, just be detecting them on the computer when they are logged in allowing for no other action required by the user.

# Work(s) in progress

## VOD Recording

The main part of this program is that it should automatically record games of league from the player's perspective. To do this we need to detect when a game has started, and begin a window capture of the game.

### Subtasks

- [x] ❌ Detect when game has been started
- [x] ✅ Detect League Game window
- [ ] Save capture to a file
- [ ] Get game ID for file name
- [ ] Get timestamps for kills/deaths/assists

### ❌ Blockers ❌

Currently I can detect if a league game is "InProgress" This is the state of the game after champ select has concluded and includes load screen time. Ideally I'd like to detect when the game loads in.

# TODO (eventually)

### Move static resources from go server to electron backend

Currently the static icon assets are being served from the go "proxy" server to the front end, but this adds unneccesary network calls, when these can be loaded locally from the electron window.

# References

## 1. WTL Auto Recorder

![WTL Home Screen](/assets/1_1_wtl_home_screen.png)
1.1 WTL Home Screen
![WTL Home Screen](/assets/1_2_wtl_vod_library.png)
1.2 WTL VOD Libary
![WTL Home Screen](/assets/1_3_wtl_vod_playback.png)
1.3 WTL VOD Playback screen
![WTL Home Screen](/assets/1_4_wtl_profile_screen.png)
1.4 WTL Profile Screen

## 2. u.gg

![u.gg](/assets/2_1_u_gg_match_history.png)
2.1 u.gg's representation of a player's match history

## 3. op.gg

![op.gg match history](/assets/3_1_op_gg_match_history.png)
3.1 op.gg's representation of a player's match history

## 4. League Client

![League Client match History](/assets/4_1_league_client_match_history.png)
4.1 Official League Client's representation of a player's match history
