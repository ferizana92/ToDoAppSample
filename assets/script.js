
/*--Starts at the beggining--*/
let allTasks=[]
let selectedTasks = [];
const url = window.location.href;
const idx = url.indexOf("/",8)
const err = url.substring(idx+1)
switch (err) {
  case "not-found":
    alert("Email does not exist!")
    window.location.href = "./";
    break;
  case "not-matched":
    alert("Password is incorrect!")
    window.location.href = "./";
    break;
  case "exists":
    alert("This email already exists!")
    window.location.href = "./";
    break;
  default:
    break;
}


/*--signup start--*/
function checkPassword() {
  document.getElementById("passAlert").style.display = "none";
  document.getElementById("signUpBtn").disabled = false;
  const signUpPass = document.getElementById("signUpInputPassword").value;
  const signUpPass2 = document.getElementById("signUpInputRePassword").value;
  if (!(signUpPass === signUpPass2)) {
    console.log(!signUpPass === signUpPass2);
    document.getElementById("passAlert").style.display = "block";
    document.getElementById("signUpBtn").disabled = true;
  }
  return;
}
/*--signup end--*/

function taskState(taskId){
  const xhttp = new XMLHttpRequest();
  const url = window.location.pathname
  const urlSplit = url.split('/')
  let userId = urlSplit[3];
  const task= document.getElementById(taskId);
  const checkbox = document.getElementById(`task${taskId}`)
  xhttp.onload=()=>{
    if (xhttp.status >= 200 && xhttp.status < 300){
      // const response = JSON.parse(xhttp.response)
      if (checkbox.checked === true){
        task.classList.add("done");
      } 
      else{
        task.classList.remove("done")
      }
    }
    
  }
  xhttp.open("Post", `/api/data/${userId}/${taskId}`,true)

  xhttp.setRequestHeader("content-type", "application/json")
  xhttp.send(JSON.stringify({finished:checkbox.checked}));
}
/*--get tasks starts--*/
function getTasks(){
  const xhttp= new XMLHttpRequest()
  const url = window.location.pathname
  const urlSplit = url.split('/')
  let userId = urlSplit[3];
  xhttp.onload=()=>{
    if (xhttp.status >= 200 && xhttp.status < 300){
      const response = JSON.parse(xhttp.response) 
      allTasks=[...response];
      const view = localStorage.getItem("view");
      renderTasks(allTasks,view);

    }
  }
  xhttp.open("GET", `/api/data/${userId}`,true)
  xhttp.send();
}

/*--get tasks ends--*/

/*--logout start--*/
const logout = ()=>{
  window.location.href = "../../";
}
/*--logout ends--*/


/*--render task & filter start--*/



const renderTasks = (arr,id) =>{
  if(!arr){
    arr = [...allTasks]
  }
  /*--filter --*/

  switch (id) {
    case "all":
      selectedTasks = [...arr];
      console.log(selectedTasks);
      localStorage.setItem("view", id)
      break;

    case "weekly":
      const day = new Date().getDate();
      selectedTasks = arr.filter((task) => Math.abs(task.due.day - day) <= 7 && task.finished === false);
      console.log(selectedTasks);
      localStorage.setItem("view", id)
      break;

    case "monthly":
      const month = new Date().getMonth() + 1;
      selectedTasks = arr.filter((task) => task.due.month === month && task.finished === false);
      console.log(selectedTasks);
      localStorage.setItem("view", id)
      break;
    
    default:
      selectedTasks = [...arr];

      break;
  }

/*--render task --*/


  const ul=document.getElementById("tasks-section")
  ul.innerText=""
  selectedTasks.forEach(task=>{
    const li=document.createElement("li");
    li.classList.add("list-group-item");
    li.classList.add("d-flex");
    li.innerHTML=`<div class="task d-flex align-content-center align-self-center ">
                    <input id="task${task.id}" class="form-check-input me-1 align-self-center ${task.finished===true && "done"}" type="checkbox" value="true" onclick="taskState(${task.id})" aria-label="..." ${task.finished===true && "checked"}>
                    <div for="${task.id}" class="ms-2">
                      <div class="task-title d-flex">
                        <span><strong>Title:</strong></span>
                        <div class="mx-1">
                          ${task.title}
                        </div>
                      </div>

                      <div class="task-due d-flex">
                        <span><strong>Due Date:</strong></span>
                        <div class="mx-1" >
                          <span>${task.due.day} -</span>
                          <span>${task.due.month} -</span>
                          <span>${task.due.year}</span>
                        </div>
                      </div>

                      <div class="task-des d-flex">
                        <span><strong>Description:</strong></span>
                        <div class="mx-1" >
                          ${task.description}
                        </div>
                      </div>
                      
                    </div>
                  </div>`
    li.setAttribute("id",task.id);
    ul.appendChild(li);
    })
}

/*--render task & filter end--*/