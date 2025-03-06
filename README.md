# League Companion App

This is a simple, lightweight League of Legends Companion App written in Typescript using React and Electron.

## Features

- [x] View Match history
- [x] Multiple Account Support (Kind of working)
- [ ] Auto recording league of legends games
- [ ] Matchup Notes

## Preview as of 2025/03/06

![Status as of March 6th 2025](/assets/status_03_06_2025.png)

## Directory Structure/Explanation

### [league-companion-app_backend_electron](/league-companion-app_backend_electron/)

This is the electron code which manages the window and caches data like match history using typescript/sqlite.

### [league-companion-app_frontend_react](/league-companion-app_frontend_react/)

This is the main UI code, built using react and typescript. This is later compiled into static html/css/javascript code and then referenced by electron.

### [league-companion-app_server_go](/league-companion-app_server_go/)

This is simply a proxy server which holds the RIOT_API_KEY in a .env file. Because you can't distribute an Api Key to end users, this needs to exist as a middle man to hold and secure your Riot Api Key. (Currently only a dev key)

## Why

I began using We Teach League's Auto recording software a couple months ago and thought it was really nice, but had some areas to improve. The main area being that when you go to the VOD library it is very difficult to find a specific game you're looking for. The VODS show an image of the game start, which is impossible to tell what champs are in the game as they haven't spawned in yet, and a title of PLayerChampion Versus EnemyLaneOpponent. I had a few issues with the text is, if I play one champ every game then it's hard to tell which game is which, especially if I play, say, three games against a Miss Fortune then three against Jinx, which one was my support trolling, and which one do I need to review for my own mistakes. So I decided to make something similar but with different icons to view the vod, and I thought something like op.gg/u.gg/mobalytics would work perfect for this.

# Design References

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
