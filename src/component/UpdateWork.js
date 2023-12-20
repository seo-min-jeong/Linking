import React, { useState } from "react"
import './Work.css'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { ko } from "date-fns/esm/locale"
import { useNavigate } from "react-router-dom"

import close from "../icon/close.png"

function UpdateWork() {
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [isAddTeam, setAddTeam] = useState(false)

    const teamToggleMenu = () => {
        setAddTeam(isAddTeam => !isAddTeam)
    }

    const navigate = useNavigate()
    const onClickBack = () => {
        navigate(-1)
    }
    const onClickButton = () => {
        navigate('/calendar')
    }

    const onClickChkButton = () => {
        setAddTeam(false)
    }
    
    var workName = "요구명세서 작성"

    const [inputWork, setInputWork] = useState(workName)
    const handleInputWork = (e) => {
        setInputWork(e.target.value)
    }

    return(
        <div className="create-work-box" >
            <div className="close-box"><img className="close" src={ close } onClick={ onClickBack } /></div>
            <div className="work-name-box">
                <div className="work-name-sec"><span className="work-name">할 일</span></div>
                <div className="work-name-sec2">
                    <div><span className="work-name-small">할 일</span></div>
                    <input 
                    className='work-Input' 
                    type='text' 
                    name='input_project' 
                    value={inputWork} 
                    onChange={handleInputWork} 
                    maxLength={28}
                    />
                </div>
            </div>
            <div className="workDate-box">
                <div className="workDate-sec-box">
                    <span>시작일</span>
                    <label className="datePicker-label">
                        <DatePicker
                        className="workDatepicker" 
                        selected={startDate} 
                        onChange={(startDate) => setStartDate(startDate)}
                        dateFormat="yyyy-MM-dd"
                        locale={ko}
                        />
                    </label>
                </div>
                <div className="workDate-sec-box">
                    <span>마감일</span>
                    <label className="datePicker-label">
                        <DatePicker 
                        className="workDatepicker" 
                        selected={endDate} 
                        onChange={(endDate) => setEndDate(endDate)}
                        dateFormat="yyyy-MM-dd"
                        locale={ko}
                        />
                    </label>
                </div>
            </div>
            <div className="time-box">
                <div className="time-sec-box">
                    <div className="time-sec-txt"><span>마감시간(선택사항)</span></div>
                    <div className="time-sec"><span>PM 4 : 20</span></div>
                </div>
            </div>
            <div className="charge-box">
                <div className="charge-sec-box">
                    <div className="charge-sec-txt">
                        <span>담당자</span>
                    </div>
                    <div className="charge-person-box" onClick={ teamToggleMenu }>
                        <span className="charge-person-txt">서민정</span>
                    </div>
                </div>
            </div>
            <div className="createWorkBtn-box">
                <button className='createWorkBtn' type='button' onClick={ onClickButton }>수정</button>
            </div>
            <div className={isAddTeam ? "work-team-box" : "work-hide-box"} >
                <div className="teamOne-chkBox">
                    <div className="work-team-close"><span onClick={ onClickChkButton }>x</span></div>
                    <div id="teamOne-scroll" className="work-box">
                        <label className="work-label">
                            <span>서민정</span>
                            <input type="checkbox" id="chk"/>
                            <i class="circle"></i>
                        </label>
                        <label className="work-label">
                            <span>윤겸지</span>
                            <input type="checkbox" id="chk"/>
                            <i class="circle"></i>
                        </label>
                        <label className="work-label">
                            <span>이은빈</span>
                            <input type="checkbox" id="chk"/>
                            <i class="circle"></i>
                        </label>
                        <label className="work-label">
                            <span>최혜민</span>
                            <input type="checkbox" id="chk"/>
                            <i class="circle"></i>
                        </label>
                    </div>
                    <div className="workBtn-box">
                        <button className='workBtn' type='button' onClick={ onClickChkButton }>선택</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpdateWork