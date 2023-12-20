import React, { useState, useRef, useEffect } from "react"
import Modal from 'react-modal'
import './ProjectModal.css'
import AddTeam from "./AddTeam"
import api from "../utils/api"
import { useNavigate } from "react-router-dom"
import DeleteTeam from "./DeleteTeam"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { ko } from "date-fns/esm/locale"

import dot from "../icon/dot.png"
import crown from "../icon/crown.png"

function UpdateProjectModal(props) {
    const { isOpen, setIsUpdate, onClose, data, onValueProject } = props
    const user = JSON.parse(localStorage.getItem('user'))

    const [projectId, setProjectId] = useState(data.projectId)
    const [beginDate, setBeginDate] = useState(new Date(data.beginDate))
    const [dueDate, setDueDate] = useState(new Date(data.dueDate))
    const [projectName, setProjectName] = useState(data.projectName)
    const [partLists, setPartLists] = useState(data.partList.map(part => part.userId))
    const [partList, setPartList] = useState(data.partList);

    const [project, setProject] = useState({
        projectId: data.projectId,
        projectName: data.projectName,
        beginDate: data.beginDate,
        dueDate: data.dueDate,
        partList: partLists,
        isPartListChanged: true
    })

    const handleInputProject = (event) => {
        setProject({
            ...project,
            [event.target.name]: event.target.value
        })
        if (event.target.name === 'projectName') {
            setProjectName(event.target.value)
          } else if (event.target.name === 'beginDate') {
            setBeginDate(event.target.value)
          } else if (event.target.name === 'dueDate') {
            setDueDate(event.target.value)
          }
    }

    const navigate = useNavigate()
    const handleSubmit = event => {
        event.preventDefault()
        api.put('/projects', project)
          .then(response => {
            setProjectId(response.data.data.projectId)
            setProjectName(response.data.data.projectName)
            setBeginDate(response.data.data.beginDate)
            setDueDate(response.data.data.dueDate)
            setPartList(response.data.data.partList)

            setIsUpdate(false)
            onValueProject(response.data.data)
            navigate(process.env.PUBLIC_URL + '/home')
          })
          .catch(error => {
            console.log(project)
            console.error(error)
          })
    }

    const teamMenuRef = useRef(null)
    const [isTeam, setTeam] = useState(false)
    const [isAddTeam, setAddTeam] = useState(false)
    const [isDeleteTeam, setDeleteTeam] = useState(false)
    const [imageUrl, setImageUrl] = useState(dot);

    function handleClick() {
      setTeam(isTeam => !isTeam)
    }

    const addTeamMenu = () => {
        setAddTeam(isAddTeam => !isAddTeam);
        setTeam(false);
    }

    const deleteTeam = () => {
        setDeleteTeam(isDeleteTeam => !isDeleteTeam)
        setTeam(false)
    }

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isTeam && (!teamMenuRef.current || !teamMenuRef.current.contains(e.target))) setTeam(isTeam => !isTeam)
        }
        document.addEventListener('click', handleOutsideClose)
      
        return () => document.removeEventListener('click', handleOutsideClose)
    }, [isTeam])

    const handleChange = (inputName, newValue) => {
      if (inputName === 'partList') {
        const temp = [...partList]
        const userId = parseInt(newValue.userId)
        const userIdExists = temp.some(item => item.userId === userId)

        const newArray = [...partList, newValue]

        if (userIdExists === false) {
          setPartList(newArray)
          const newPartList = [...project.partList, userId]
          setProject(prevProject => ({
            ...prevProject,
            partList: newPartList
          }))
        }
      }
    }
    
    const handleDeleteChange = (inputName, newValue) => {
      if (inputName === 'partList') {
        setPartList(newValue)

        const newPartList = newValue.map(item => parseInt(item.userId)).filter(id => !isNaN(id))
        setProject(prevProject => ({
          ...prevProject,
          partList: newPartList
        }))
      }
  }

    return(
        <Modal isOpen={isOpen} onRequestClose={onClose} className="modal">
          <div className="project-box" >
          <div className="close-box"><span className="closeTxt" onClick={ onClose }>x</span></div>
            <div className="project-name-box">
                <div className="project-name-sec"><span className="project-name">프로젝트명</span></div>
                <div className="project-name-sec">
                    <input 
                    className='projectName-Input' 
                    type='text' 
                    name='projectName' 
                    value={projectName} 
                    onChange={handleInputProject} 
                    maxLength={28}
                    />
                </div>
            </div>
            <div className="updateDate-box">
                <div className="date-sec-box">
                    <span>시작일</span>
                    <label className="datePicker-label">
                        <DatePicker
                        className="datepicker"
                        name="beginDate" 
                        selected={beginDate} 
                        onChange={(beginDate) => handleInputProject({ target: { name: "beginDate", value: beginDate } })}
                        dateFormat="yyyy-MM-dd"
                        locale={ko}
                        />
                    </label>
                </div>
                <div className="date-sec-box">
                    <span>마감일</span>
                    <label className="datePicker-label">
                        <DatePicker 
                        className="datepicker" 
                        name="dueDate"
                        selected={dueDate} 
                        onChange={(dueDate) => handleInputProject({ target: { name: "dueDate", value: dueDate } })}
                        dateFormat="yyyy-MM-dd"
                        locale={ko}
                        />
                    </label>
                </div>
            </div>
            <div className="dot-box" ref={ teamMenuRef } >
                <img className="dot" src={imageUrl} alt="Image" onClick={ handleClick } />
                    <div className={isTeam ? "teamShow-menu" : "teamHide-menu"}>
                        <div className="team-menu-insert"><span onClick={ addTeamMenu } >팀원 추가</span></div>
                        <div className="team-menu-remove"><span onClick={ deleteTeam }>팀원 제거</span></div>
                    </div>
            </div>
            <div className="team-create-box">
                <div className="team-sec"><span className="team-name">팀원</span></div>
                <div id="teamOne-scroll" className="team-people-sec">
                    {partList.map((part, index) => (
                      <div className="team-total-box">
                        <div className="team-txt-sec" key={index}>
                            <span className="team-name-txt">{part.lastName}{part.firstName}</span>
                            {user.userId === part.userId ? 
                              <div className="crown-box"> 
                                <img src={crown} className="crown-img"/> 
                              </div>
                              : <></>
                            }
                        </div>
                        <div className="team-txt-sec" key={index}>
                            <span className="team-email-txt">{part.email}</span>
                        </div>
                      </div>
                    ))}
                </div>
            </div>
            <div className="createProjectBtn-box">
                <button className='createProjectBtn' type='button' onClick={handleSubmit}>수정</button>
            </div>
            
            {isAddTeam ? <AddTeam isAddTeam={isAddTeam} onClose={addTeamMenu} onValueChange={handleChange} /> : <></>}
            {isDeleteTeam ? <DeleteTeam isDeleteTeam={isDeleteTeam} setDeleteTeam={setDeleteTeam} onClose={deleteTeam} partList={partList} onValueChange={handleDeleteChange} /> : <></> }
        </div>
        </Modal>
    
      )
    }
  
    export default UpdateProjectModal