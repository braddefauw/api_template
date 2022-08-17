const express = require("express");
//require basicAuth
const basicAuth = require('express-basic-auth');
//require bcrypt
const bcrypt = require('bcrypt');
// set salt
const saltRounds = 2;

const {User, Item} = require('./models');
const { use } = require("bcrypt/promises");

// initialise Express
const app = express();

// specify out request bodies are json
app.use(express.json());

// configure basicAuth
app.use(basicAuth({
  authorizer : dbAuthorizer,
  authorizeAsync : true,
  unauthorizedResponse : () => "You do not have access to this content"
}));

// compare username and password with db content
// return boolean indicating password match
async function dbAuthorizer(username, password, callback) {
  try{
    // get matching user from db
    const user = await User.findOne({where: {name: username}})
    // if username is valid compare passwords
    let isValid = ( user != null ) ? await bcrypt.compare(password, user.password) : false;
    callback(null, isValid)
  }catch(err){
    //if authorizer fails, show error
    console.log("Error: ", err)
    callback(null, false)
  }
}

// routes go here
app.get('/', (req, res) => {
  res.send('<h1>App Running</h1>')
})

//get all users
app.get('/users', async(req, res) => {
  let users = await User.findAll()
  res.json({users})
})

//get specific user by id
app.get('/users/:id', async(req, res) => {
  let user = await User.findByPk(req.params.id)
  res.json({user})
})

//post a new user
app.post('/users', async (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
   bcrypt.hash(password, saltRounds, async function (err,hash){
    const newUser = await User.create({"name": name, "password": hash});
    res.json({newUser});
  })
})

//create new session
// app.post('/session', async (req, res) => {
//   const thisUser = await User.findOne({
//     where: {name: req.body.name}
//   })
//   if(!thisUser){
//     res.send("User not found")
//   }else{
//     bcrypt.compare(req.body.password, thisUser.password, async (err, result) => {
//       if(result){
//         res.json(thisUser)
//       }else{
//         res.send("passwords do not match");
//       }
//     })
//   }
// })
 
//read all items
app.get('/items', async(req, res) => {
  let items = await Item.findAll()
  res.json({items})
})

//get specific item by id
app.get('/items/:id', async(req, res) => {
  let item = await Item.findByPk(req.params.id)
  res.json({item})
})

//delete item
app.delete('/items/:id', async(req, res) => {
  await Item.destroy({where: {i: req.params.id}})
})

//create item
app.post('/items', async (req, res) => {
  let newItem = await Item.create(req.body);
  res.json({newItem})
}) 

//update item
app.put('/items/:id', async (req, res) => {
  let updatedItem = await Item.update(req.body, {
    where: {id: req.params.id}
  });
  res.json({updatedItem});
})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});