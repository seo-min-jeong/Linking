import '../../App.css'
import React, {useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "./Sidebar"
import Arrow from "./Arrow"
import MyTodo from "./MyTodo"
import Chat from "./Chat"
import Noti from "./Noti"
import Dot from "./Dot"

function Header(props) {
  const{ isLoggedIn, projectList, onValueDate, ownerId, setOwnerId, setIsLoggedIn, onValueProjectList } = props
  const [projectName, setProjectName] = useState('L I N K I N G')
  const [projectId, setProjectId] = useState(0)
  const [beginDate, setBeginDate] = useState()
  const [dueDate, setDueDate] = useState()
  const [partList, setPartList] = useState([])

  const navigate = useNavigate();

    useEffect(() => {
      if (projectList.length > 0) {
        setProjectName(projectList[0].projectName)
        setProjectId(projectList[0].projectId)
        setBeginDate(projectList[0].beginDate) 
        setDueDate(projectList[0].dueDate)
        setPartList(projectList[0].partList)
      }
    }, [projectList])

    const [isRegister, setIsRegister] = useState(true)
    const handleChange = (inputName, newValue) => {
      if (inputName === 'projectName') {
        setProjectName(newValue)
        } else if (inputName === 'projectId') {
        setProjectId(newValue)
        } else if (inputName === 'beginDate') {
          setBeginDate(newValue)
          onValueDate('beginDate', newValue)
        } else if (inputName === 'dueDate') {
          setDueDate(newValue)
          onValueDate('dueDate', newValue)
        } else if (inputName === 'partList') {
          setPartList(newValue)
        } else if (inputName === 'ownerId') {
          setOwnerId(newValue)
        } else if (inputName === 'isRegister') {
          setIsRegister(newValue)
        }
  }
  
  const [group, setGroup] = useState([]);
  const handleDocuments = (newValue) => {
    setGroup(newValue);
  }

  const[isNo, setIsNo] = useState(false)
  const handleDeleteProject = (newValue) => {
    console.log(newValue)
    if(newValue.length === 0) {
      navigate(process.env.PUBLIC_URL + '/linking')
      setProjectName('L I N K I N G')
      setIsLoggedIn(false)
    } else {
      setProjectName(newValue[0].projectName)
      setProjectId(newValue[0].projectId)
      setBeginDate(newValue[0].beginDate) 
      setDueDate(newValue[0].dueDate)
      setPartList(newValue[0].partList)
      onValueProjectList(newValue)
    }
  }

  const [isOpen, setMenu] = useState(false); 

  //myTodo 상태변경
  const handleTodoRatio = (inputName, newValue) => {
    if (inputName === 'ratio') {
      onValueDate('ratio', newValue)
      } else if (inputName === 'todo') {
        onValueDate('todo', newValue)
      } else if (inputName === 'monthList') {
        onValueDate('monthList', newValue)
      }
  }

    return (
      <div className="App">
        <div className="head" style={{ minWidth: '660px'}}>
          {isLoggedIn && 
          <>
          <Sidebar className="side-bar" data={projectName} projectId={projectId} isOpen={isOpen} setMenu={setMenu} beginDate={beginDate} dueDate={dueDate} partList={partList} /> 
          </>
          }
          <div className={isLoggedIn ? "titleBox" : "title-hide-box"}>
            <span className="linking-txt">{ projectName }</span>
            {isLoggedIn && <Arrow onValueChange={handleChange} onValueDocument={handleDocuments} projectList={projectList} setMenu={setMenu} />}
          </div>
          {isLoggedIn && <MyTodo projectId={projectId} onValueTodo={handleTodoRatio}/>}
          {isLoggedIn && <Noti />}
          {isLoggedIn && <Chat projectId={projectId} isRegister={isRegister} setIsRegister={setIsRegister}/>}
          {isLoggedIn && <Dot projectId={projectId} onValueProject={handleDeleteProject} ownerId={ownerId}/>}
        </div>
      </div>
    )
  }
  
  export default Header