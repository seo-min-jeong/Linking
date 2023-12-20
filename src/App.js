import Header from "./component/header/Header"
import Login from "./component/login/Login"
import SignUp from "./component/login/SignUp"
import Home from "./home/Home"
import CreateWork from "./component/CreateWork"
import UpdateWork from "./component/UpdateWork"
import Document from "./component/Document"
import BlankPage from "./component/BlankPage"
import LinkingHome from "./LinkingHome"
import WorkAllTable from "./component/WorkAllTable"

import './App.css'
import { useState } from "react"
import { HashRouter as Route, Routes } from "react-router-dom"
import api from './utils/api'

function App() {
  let now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  let day = now.getDate()

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projectList, setProjectList] = useState([])
  const [todoList, setTodoList] = useState([])
  const [todoMonthly, setTodoMonthly] = useState([])
  const [beginDate, setBeginDate] = useState()
  const [dueDate, setDueDate] = useState()
  const [graph, setGraph] = useState([])
  const [ownerId, setOwnerId] = useState()
  const [firstProjectId, setFirstProjectId] = useState()
  const [monthList, setMonthList] = useState([])

  const handleProjectList = (newValue) => {
    setProjectList(newValue)
    setFirstProjectId(newValue[0].projectId)

    api.get('/todos/list/monthly/project/' + newValue[0].projectId + '/' + year + '/' + month)
    .then(response => {
      setTodoMonthly(response.data.data)
    })
    .catch(error => {
        console.error(error)
    })

    api.get('/todos/list/today/project/' + newValue[0].projectId + '/urgent')
      .then(response => {
        setTodoList(response.data.data)
      })
      .catch(error => {
        console.error(error);
      })

      setBeginDate(newValue[0].beginDate)
      setDueDate(newValue[0].dueDate)

      api.get('/assigns/ratio/project/' + newValue[0].projectId)
      .then(response => {
        setGraph(response.data.data)
      })
      .catch(error => {
        console.error(error)
      })

      api.get('/projects/' + newValue[0].projectId)
      .then(response => {
        setOwnerId(response.data.data.ownerId)
      })
      .catch(error => {
        console.error(error)
      })

  }

  const handleDate = (inputName, newValue) => {
    if (inputName === 'beginDate') {
      setBeginDate(newValue)
    } else if (inputName === 'dueDate') {
      setDueDate(newValue)
    } else if (inputName === 'ratio') {
      setGraph(newValue)
    } else if (inputName === 'todo') {
      setTodoList(newValue)
    } else if (inputName === 'monthList') {
      setMonthList(newValue)
    }
  }

  return (
    <div className="App">
      <Header 
      isLoggedIn={isLoggedIn} 
      projectList={projectList} 
      onValueDate={handleDate} 
      ownerId={ownerId} 
      setOwnerId={setOwnerId} 
      setIsLoggedIn={setIsLoggedIn}
      onValueProjectList={handleProjectList}
      />
      <Routes>          
          <Route path={process.env.PUBLIC_URL + "/"} element={<Login setIsLoggedIn={setIsLoggedIn} onValueProjectList={handleProjectList} />} />
          <Route path={process.env.PUBLIC_URL + "/signUp"} element={<SignUp />} />
          {isLoggedIn && 
            <Route 
            path={process.env.PUBLIC_URL + "/home"} 
            element=
            {<Home 
            todoList={todoList} 
            setTodoList={setTodoList} 
            setTodoMonthly={setTodoMonthly} 
            todoMonthly={todoMonthly} 
            beginDate={beginDate} 
            dueDate={dueDate} 
            setBeginDate={setBeginDate} 
            setDueDate={setDueDate} 
            graph={graph} 
            setGraph={setGraph} 
            projectId={firstProjectId} 
            setProjectId={setFirstProjectId}
            />} 
          />
          }
          {isLoggedIn && <Route path={process.env.PUBLIC_URL + "/calendar"} element={<WorkAllTable newMonthList={monthList}/>} />}
          {isLoggedIn && <Route path={process.env.PUBLIC_URL + "/createWork"} element={<CreateWork />} />}
          {isLoggedIn && <Route path={process.env.PUBLIC_URL + "/updateWork"} element={<UpdateWork />} />}
          {isLoggedIn && <Route path={process.env.PUBLIC_URL + "/document/:pageId"} element={<Document />} />}
          {isLoggedIn && <Route path={process.env.PUBLIC_URL + "/blankPage/:pageId"} element={<BlankPage />} />}
          <Route 
          path={process.env.PUBLIC_URL + "/linking"} 
          element={
          <LinkingHome 
          onValueProjectList={handleProjectList}
          setIsLoggedIn={setIsLoggedIn}
          />} 
          />
      </Routes>
    </div>
  )
}

export default App
