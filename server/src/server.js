const http = require('http')

const app = require('./app')

const PORT = process.env.PORT || 8000

const server = http.createServer(app)

console.log("PORT = ", PORT);
server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}...`);
    
})


