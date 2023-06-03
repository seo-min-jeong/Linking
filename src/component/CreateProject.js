import React, { useState, useRef, useEffect } from "react";
import './CreateProject.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";
import { useNavigate } from "react-router-dom";
import api from '../utils/api'
import { useCookies } from 'react-cookie'

import close from "../icon/close.png"
import mag from "./icon/mag.png"
import dot from "../icon/dot.png"

function CreateProject() {
    const user = JSON.parse(localStorage.getItem('user'))
    const [cookies] = useCookies(['session'])

    const [projectName, setProjectName] = useState(null)
    const [beginDate, setBeginDate] = useState(new Date());
    const [dueDate, setDueDate] = useState(new Date());
    const [partList, setPartList] = useState([]);

    const teamMenuRef = useRef(null);
    const [isTeam, setTeam] = useState(false);
    const [isAddTeam, setAddTeam] = useState(false);
    const [isTeamOne, setTeamOne] = useState(false);

    const teamToggleMenu = () => {
        setTeam(isTeam => !isTeam);
    }

    const addTeamMenu = () => {
        setAddTeam(isAddTeam => !isAddTeam);
        setTeam(false);
    }

    const addTeamOneMenu = () => {
        setTeamOne(isTeamOne => !isTeamOne);
    }

    const closeTeamMenu = () => {
        setAddTeam(false);
        setTeamOne(false);
    }

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isTeam && (!teamMenuRef.current || !teamMenuRef.current.contains(e.target))) setTeam(isTeam => !isTeam);
        };
        document.addEventListener('click', handleOutsideClose);
        
        return () => document.removeEventListener('click', handleOutsideClose);
    }, [isTeam]);

    const [inputProject, setInputProject] = useState('')

    const handleInputProject = (e) => {
        setInputProject(e.target.value)
    }

    const navigate = useNavigate();
    const onClickButton = () => {
        navigate(process.env.PUBLIC_URL + '/home')
    }

    const [inputTeam, setInputTeam] = useState('')

    const handleInputTeam = (e) => {
        setInputTeam(e.target.value);
    }

    const [project, setProject] = useState({
        projectName: '',
        beginDate: new Date(),
        dueDate: new Date(),
        partList: []
      });

      const handleSubmit = event => {
        event.preventDefault()
        api.post('/projects', project, {
            headers: {
                Cookie: 'SESSION=' + cookies.session
            }
        })
          .then(response => {
            console.log(response.data);

            setProjectName(response.data.userId)
            setBeginDate(response.data.email)
            setDueDate(response.data.password)
            setPartList(response.data.firstName)

          })
          .catch(error => {
            console.log(project);
            console.error(error);
          });

          navigate(process.env.PUBLIC_URL + '/home');
    };

    const handleChange = event => {
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
          } else if (event.target.name === 'partList') {
            setPartList(event.target.value)
          }
    };

    return(
        <div className="create-project-box">
            <div className="close-box"><span className="closeTxt">x</span></div>
            <div className="project-name-box">
                <div className="project-name-sec"><span className="project-name">프로젝트명</span></div>
                <input className='project-Input' type='text' name='projectName' value={projectName} onChange={handleChange} />
            </div>
            <div className="date-box">
                <div className="date-sec-box">
                    <span>시작일</span>
                    <label className="datePicker-label">
                        <DatePicker
                        className="datepicker" 
                        selected={beginDate} 
                        onChange={ handleChange }
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
                        selected={dueDate} 
                        onChange={ handleChange }
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
                        <div className="team-menu-remove"><span>팀원 제거</span></div>
                    </div>
            </div>
            <div className="team-create-box">
                <div className="team-sec"><span className="team-name">팀원</span></div>
                <div className="team-txt-sec">
                    <div><span className="team-name-txt">{user.lastName}{user.firstName}</span></div>
                    <div className="team-email-box"><span className="team-name-txt">{user.email}</span></div>
                </div>
            </div>
            <div className={isAddTeam ? "team-select-box" : "team-hide-box"} >
                <div className="team-Input-close"><span onClick={ closeTeamMenu }>x</span></div>
                <div className="team-Input-box">
                    <input className='team-Input' type='text' name='input_team' value={inputTeam} onChange={handleInputTeam} placeholder="Search user email"/>
                    <div className="mag-img-box"><img className="mag-img" src={ mag } onClick={ addTeamOneMenu } /></div>
                </div>
                <div className={isTeamOne ? "team-one-box" : "team-one-hideBox"}>
                    <div className="team-one">
                        <span>새싹이</span>
                        <span>, </span>
                        <span>saessak@naver.com</span>
                    </div>
                    <div className="team-one">
                        <span>새싹22</span>
                        <span>, </span>
                        <span>saessak22@naver.com</span>
                    </div>
                </div>
                <button className="team-oneBtn" type="button">팀원 추가</button>
            </div>
            <div className="createProjectBtn-box">
                <button className='createProjectBtn' type='button' onClick={ onClickButton }>생성</button>
            </div>
        </div>

    );
}

export default CreateProject;