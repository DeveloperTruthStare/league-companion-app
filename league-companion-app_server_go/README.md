The go server is currently 50% created by ChatGPT.

The /riot/ endpoints are handled by the ChatGPT code, but it needs a lot of work done, but it is functional for now.

### /riot/ issues

- Cacheing does not work as intended, but the end result for the user is as expected
- Rate limiter values are not tuned to official api limits
- Rate limiter values not tuned per endpoint

### /static/ issues

- [ x ] All good here

### Running

// Install packages
`go mod tidy`

// run the program
`go run ./src/`
// must run from the root project directory so that it has access to the assets/ folder
