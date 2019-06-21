const express = require('express');
const connectDB = require('./config/db')

const app = express();

PORT = process.env.PORT || 5000;

connectDB();
// Middleware
app.use(express.json({
extended:false
}));

app.get("/",(require,response)=>{
   console.dir(require)
    response.send(require) 
})

app.use('/api/users', require('./routers/api/users'));
app.use('/api/profile', require('./routers/api/profile'));
app.use('/api/post', require('./routers/api/post'));
app.use('/api/auth', require('./routers/api/auth'));

app.listen(PORT, ()=>{
    console.log(`Server start on port: ${PORT}`);
    
});