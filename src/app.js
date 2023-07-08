const express = require("express");
const { parse } = require("path");
const port = 3000;
const path = require("path");
const app = express();
const {load , save} = require("./utils");


app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.listen(port, () => {
  console.log(`The server is running succesfully on the http://localhost:${port}. `);
});

// serving the static files
app.use(express.static(path.join(__dirname, "public")));


// serving the / route
app.get("/", (req, res) => {
  res.sendFile("./public/index.html", { root: __dirname });
});

// sing up and login logics
app.post("/" ,(req,res)=>{
  const data = JSON.parse(load()); // getting the data from db
  const content = req.body;
  if(!(content.hasOwnProperty('name'))){
    //login process
    const person =data.find(person =>person.email===content.email.toLowerCase().trim())
    if (person=== undefined){
      const err = "not-found"
      res.redirect(`/${err}`)

    }else{
      if (person.password===content.pass){
        res.redirect(`./pages/tasks.html/${person.id}`)

      }else{
        const err = "not-matched"
        res.redirect(`/${err}`)

      }
    } 
  }
  else{
    //signup process
    const exists = data.find(person=> person.email === content.email)
    if(exists === undefined){
      data.push({
        id: data.length + 1,
        name: content.name,
        email: content.email.toLowerCase().trim(),
        password: content.pass,
        tasks: []
      })
      save(data);
      const personId = data.length;
      res.redirect(`./pages/tasks.html/${personId}`)
    }
    else{
      const err = "exists"
      res.redirect(`/${err}`)
    }
  }
})

app.get("/pages/tasks.html/:id", (req,res)=>{

  // getting the id from url
  const personId = parseInt(req.params.id);
  // getting persons tasks
  res.sendFile("./public/pages/tasks.html", { root: __dirname })
})

// Add Task
app.post("/pages/tasks.html/:id",function(req,res){
  const userTask= req.body;
  const date= new Date(userTask.date);
  let day= date.getDate()
  let month= date.getMonth()+1
  let year= date.getFullYear()
  const data = JSON.parse(load());
  const personId = parseInt(req.params.id);  
  const person =data.find(person=>person.id===personId)
  person.tasks.push({
    id:person.tasks.length+1,
    title:userTask.title,
    description:userTask.des,
    finished: false,
    due:{
      day:day,
      month:month,
      year:year
    }
  })
  data.splice(data.indexOf(person), 1, person);
  save(data)
  res.redirect(`./${personId}`)
})

//getting the tasks from the db and sending them to the ui
app.get("/api/data/:id", (req,res)=>{
  const personId = parseInt(req.params.id);
  const data = JSON.parse(load());
  const person = data.find(person=> person.id === personId);
  const tasks = person.tasks;
  res.json(tasks);
})

//gettin the state of the finished tasks from the ui adn sending and saving them on the db
app.post("/api/data/:id/:task", (req,res)=>{
  const personId = parseInt(req.params.id);
  const taskId = parseInt(req.params.task);
  const data = JSON.parse(load());
  const content = req.body;
  const person =data.find(person=>person.id===personId)
  person.tasks[taskId-1].finished = content.finished;

  data.splice(data.indexOf(person), 1, person);
  save(data);
  res.send();
})

// Error handling for signup and login
app.get("/:err", (req,res)=>{
  res.sendFile("./public/index.html", { root: __dirname })
})

app.use((req, res) => {
  res.send("Error 404: Not Found!");
});