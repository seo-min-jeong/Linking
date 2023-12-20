import React, { useState, useRef, useEffect } from "react";
import './UpdateProject.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";
import { useNavigate } from "react-router-dom";

import close from "../icon/close.png"
import dot from "../icon/dot.png"
import del from "../icon/del.png"
import mag from "./icon/mag.png"

function UpdateProject() {
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())

    const teamMenuRef = useRef(null)
    const [isTeam, setTeam] = useState(false)
    const [isAddTeam, setAddTeam] = useState(false)
    const [isTeamOne, setTeamOne] = useState(false)
    const [isDeleteTeam, setDeleteTeam] = useState(false)

    const teamToggleMenu = () => {
        setTeam(isTeam => !isTeam)
    }

    const addTeamMenu = () => {
        setAddTeam(isAddTeam => !isAddTeam)
        setTeam(false)
    }

    const addTeamOneMenu = () => {
        setTeamOne(isTeamOne => !isTeamOne)
    }

    const closeTeamMenu = () => {
        setAddTeam(false)
        setTeamOne(false)
    }

    const deleteTeam = () => {
        setDeleteTeam(isDeleteTeam => !isDeleteTeam)
    }

    const onClickButton = () => {
        navigate('/home')
    }

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isTeam && (!teamMenuRef.current || !teamMenuRef.current.contains(e.target))) setTeam(isTeam => !isTeam)
        }
        document.addEventListener('click', handleOutsideClose)
        
        return () => document.removeEventListener('click', handleOutsideClose)
    }, [isTeam])

    const navigate = useNavigate()

    const onClickBack = () => {
        navigate(-1)
    }

    const onClickDelOk = () => {
        navigate('/home')
    }

    const onClickDelCancel = () => {
        setDeleteTeam(isDeleteTeam => !isDeleteTeam)
    }

    const [inputTeam, setInputTeam] = useState('')

    const handleInputTeam = (e) => {
        setInputTeam(e.target.value)
    }

    var projectName = "창의융합종합설계2"

    const [inputProject, setInputProject] = useState(projectName)

    const handleInputProject = (e) => {
        setInputProject(e.target.value)
    }

    return(
        <div className="project-box" >
            <div className="close-box"><img className="close" src={ close } onClick={ onClickBack } /></div>
            <div className="project-name-box">
                <div className="project-name-sec"><span className="project-name">프로젝트명</span></div>
                <div className="project-name-sec">
                    <input className='projectName-Input' type='text' name='project_team' value={inputProject} onChange={handleInputProject} />
                </div>
            </div>
            <div className="date-box">
                <div className="date-sec-box">
                    <span>시작일</span>
                    <label className="datePicker-label">
                        <DatePicker
                        className="datepicker" 
                        selected={startDate} 
                        onChange={(startDate) => setStartDate(startDate)}
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
                        selected={endDate} 
                        onChange={(endDate) => setEndDate(endDate)}
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
            <div className="team-box">
                <div className="team-sec"><span className="team-name">팀원</span></div>
                <div id="teamOne-scroll" className="team-people-sec">
                    <div className="team-txt-sec">
                        <span className="team-name-txt">서민정</span>
                        <span className="team-email-txt">smj3963@gmail.com</span>
                    </div>
                    <div className="team-txt-sec">
                        <span className="team-name-txt">윤겸지</span>
                        <span className="team-email-txt">ruawl@gmail.com</span>
                    </div>
                    <div className="team-txt-sec">
                        <span className="team-name-txt">이은빈</span>
                        <span className="team-email-txt">dmsqls@gmail.com</span>
                    </div>
                    <div className="team-txt-sec">
                        <span className="team-name-txt">최혜민</span>
                        <span className="team-email-txt">gPals@gmail.com</span>
                    </div>
                </div>
            </div>
            <div className="del-box">
                <img className="del" src={ del } onClick={ deleteTeam }/>
            </div>

            <div className={isDeleteTeam ? "del-checkBox" : "del-hideBox" }>
                <div>
                    <span className="del-checkTxt">프로젝트를 삭제하시겠습니까?</span>
                    <div className="delete-CheckBtn">
                        <button className="delBtn" onClick={ onClickDelOk }>확인</button>
                        <button className="delBtn" onClick={ onClickDelCancel }>취소</button>
                    </div>
                </div>
            </div>

            <div className={isAddTeam ? "team-select-box" : "team-hide-box"} >
                <div className="team-Input-close"><span onClick={ closeTeamMenu }>x</span></div>
                <div className="team-Input-box">
                    <input className='team-Input' type='text' name='input_team' value={inputTeam} onChange={handleInputTeam} />
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
            </div>
            <div className="updateProjectBtn-box">
                <button className='updateProjectBtn' type='button' onClick={ onClickButton }>수정</button>
            </div>

        </div>

    )
}

export default UpdateProject