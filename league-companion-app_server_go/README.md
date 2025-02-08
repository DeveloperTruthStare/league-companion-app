The go server is currently 90% created by ChatGPT.

Because the required endpoints are sometimes under americas.api.riotgames.com and other times under na1.api.riotgames.com I have the base route being either americas or na1 which then gets passed into the same proxyHandler function which handles the proxy.

ChatGPT wrote this proxy because at the moment I am focusing on learning react and could not be bothered to take the time to write the best code for this. What ChatGPT came up with works well enough for testing the front end, so I'm leaving it as is for the time being.

### Issues (that I'll probably never get to as long as this is just a personal project)

- Cacheing does not work as intended, but the end result for the user is as expected
- Rate limiter values are not tuned to official api limits
- Rate limiter values not tuned per endpoint

TBH I don't even know if the caching or rate limiter does anything, ChatGPT wrote that part and while this remains a personal project I am not concerned with either of these requirements.

### Running

// Install packages
`go mod tidy`

// run the program
`go run ./src/`
// must run from the root project directory so that it has access to the assets/ folder
