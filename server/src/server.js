const http = require('http')
const {loadPlanetsData} = require('./models/planets-model')
const app = require('./app')

const PORT = process.env.PORT || 8000

const server = http.createServer(app)

console.log("PORT = ", PORT);

async function startServer() {
    await loadPlanetsData()
    server.listen(PORT, () => {
        console.log(`Listening on PORT ${PORT}...`);
        
    })
}

startServer()

