const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const route = require("./routes/indexroute.js");

dotenv.config()
const port = process.env.port
const app = express()
app.set("view engine", "ejs");
app.use(cors())
app.use(express.json())
app.use('/images',express.static("images"))

route(app);

app.get('/',(req,res)=>{
    res.send(`server is running on ${process.env.port}`)
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
