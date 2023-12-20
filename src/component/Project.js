import React from "react"
import { useNavigate } from "react-router-dom"
import './Project.css'

import close from "../icon/close.png"
import pencil from "../icon/pencil.png"

function Project() {

    const navigate = useNavigate();

    const onClickBack = () => {
        navigate(-1);
    }

    const onClickUpdateProject = () => {
        navigate('/updateProject')
    }

    return(
        <div className="project-box" >
            <div className="close-box"><img className="close" src={ close } onClick={ onClickBack } /></div>
            <div className="project-name-box">
                <div className="project-name-sec"><span className="project-name">프로젝트명</span></div>
                <div className="project-name-sec">
                    <span className="project-name-txt">창의융합프로젝트2</span>
                    <div className="pencil-box">
                        <img className="pencil" src={ pencil } onClick={ onClickUpdateProject }/>
                    </div>
                </div>
            </div>
            <div className="date-box">
                <div className="date-sec1-box">
                    <span>시작일</span>
                    <label className="datePicker-label">
                        <span className="project-date">2022-02-27</span>
                    </label>
                </div>
                <div className="date-sec1-box">
                    <span>마감일</span>
                    <label className="datePicker-label">
                        <span className="project-date">2022-06-27</span>
                    </label>
                </div>
            </div>
            <div className="project-select-box">
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

        </div>

    )
}

export default Project