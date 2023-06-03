import React, { useState, useRef, useEffect } from "react";
import Modal from 'react-modal';
import api from "../utils/api"

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";

import AddTeam from "./AddTeam";
import DeletePartModal from "./DeletePartModal";

import dot from "../icon/dot.png"
import crown from "../icon/crown.png"

function InitialProjectModal(props) {
    const user = JSON.parse(localStorage.getItem('user'));
    const { isOpen, onClose, setIsOpen, onValueProjects, isNewData, onValueProjectList } = props

    const [projectId, setProjectId] = useState(0);
    const [beginDate, setBeginDate] = useState(new Date());
    const [dueDate, setDueDate] = useState(new Date());
    const [projectName, setProjectName] = useState('');
    const [partList, setPartList] = useState([{ lastName: user.lastName, firstName: user.firstName, email: user.email, userId: user.userId }])

    const [project, setProject] = useState({
        projectName: '',
        beginDate: '',
        dueDate: '',
        partList: [user.userId]
      });
      
      //프로젝트 생성버튼
      const handleSubmit = event => {
        event.preventDefault()
        
        api.post('/projects', project)
          .then(() => {
            api.get('/projects/list/part/' + user.userId)
              .then(respon => {
                  onValueProjectList(respon.data.data)
                  setIsOpen(false)
              })
              .catch(error => {
                console.error(error);
              })
          .catch(error => {
            console.error(error);
          })
        })
    }

    const teamMenuRef = useRef(null);
    const [isTeam, setTeam] = useState(false);
    const [isAddTeam, setAddTeam] = useState(false);

    const teamToggleMenu = () => {
        setTeam(isTeam => !isTeam);
    }

    const addTeamMenu = () => {
        setTeam(false);
        setAddTeam(isAddTeam => !isAddTeam);
    }

    const [isDeleteTeam, setDeleteTeam] = useState(false);
    const deleteTeam = () => {
      setDeleteTeam(isDeleteTeam => !isDeleteTeam)
      setTeam(false)
    }

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isTeam && (!teamMenuRef.current || !teamMenuRef.current.contains(e.target))) setTeam(isTeam => !isTeam);
        };
        document.addEventListener('click', handleOutsideClose);
        
        return () => document.removeEventListener('click', handleOutsideClose);
    }, [isTeam]);

    const handleInputProject = (event) => {
        setProject({
            ...project,
            [event.target.name]: event.target.value
        });
        if (event.target.name === 'projectName') {
            setProjectName(event.target.value)
          } else if (event.target.name === 'beginDate') {
            setBeginDate(event.target.value)
          } else if (event.target.name === 'dueDate') {
            setDueDate(event.target.value)
          }
    }

    const handleChange = (inputName, newValue) => {
      if (inputName === 'partList') {
        const temp = [...partList]
        const userId = parseInt(newValue.userId)
        const userIdExists = temp.some(item => item.userId === userId);

        const newArray = [...partList, newValue];

        if (userIdExists === false) {
          setPartList(newArray)
          const newPartList = [...project.partList, userId];
          setProject(prevProject => ({
            ...prevProject,
            partList: newPartList
          }))
        }
      }
    }

    const handleDeleteChange = (inputName, newValue) => {
      if (inputName === 'partList') {
        setPartList(newValue); 

        const newPartList = newValue.map(item => parseInt(item.userId)).filter(id => !isNaN(id))

        setProject(prevProject => ({
          ...prevProject,
          partList: newPartList
        }));
      }
  };

    useEffect(() => {
        setPartList(partList)
    }, [partList]);

    return(
        <Modal isOpen={isOpen} onRequestClose={onClose} className="modal">
        <div className="create-project-box">
            <div className="close-box"><span className="closeTxt"></span></div>
            <div className="project-name-box">
                <div className="project-name-sec"><span className="project-name">프로젝트명</span></div>
                <input 
                className='project-Input' 
                type='text' 
                name='projectName' 
                value={projectName} 
                onChange={handleInputProject} 
                placeholder="Enter the Project Name"
                maxLength={28}
                />
            </div>
            <div className="createDate-box">
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
                <img className="dot" src={ dot } onClick={ teamToggleMenu } />
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
                <button className='createProjectBtn' type='button' onClick={handleSubmit} >생성</button>
            </div>
            {isAddTeam ? <AddTeam isAddTeam={isAddTeam} onClose={addTeamMenu} onValueChange={handleChange} /> : <></>}
            {isDeleteTeam ? <DeletePartModal isDeleteTeam={isDeleteTeam} setDeleteTeam={setDeleteTeam} onClose={deleteTeam} partList={partList} onValueChange={handleDeleteChange} /> : <></> }
        </div>
      </Modal>
    )
}

export default InitialProjectModal