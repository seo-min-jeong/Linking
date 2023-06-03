import React, { useState, useRef, useEffect } from "react";
import Modal from 'react-modal';
import './WorkModal.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";
import { useNavigate } from "react-router-dom";
import 'react-time-picker/dist/TimePicker.css';

function WorkModal(props) {
    const { isWorkOpen, onWorkClose, event, onValueChange, onClose, isOpen } = props;
    const [isAddTeam, setAddTeam] = useState(false);

    const [valueWork, setValueWork] = useState('')
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [hour, setHour] = useState("00");
    const [minute, setMinute] = useState("00");
    const [ampm, setAmPm] = useState("AM");

    const hours = [];
    const minutes = [];
    const ampms = ["AM", "PM"];

    for (let i = 1; i <= 12; i++) {
        hours.push(i < 10 ? "0" + i : i.toString());
    }

    for (let i = 0; i <= 59; i++) {
        minutes.push(i < 10 ? "0" + i : i.toString());
    }

    const handleHourChange = (e) => {
        setHour(e.target.value);
    };
    const handleMinuteChange = (e) => {
        setMinute(e.target.value);
    };
    const handleAmPmChange = (e) => {
        setAmPm(e.target.value);
    };

    const navigate = useNavigate();

    const teamToggleMenu = () => {
        setAddTeam(isAddTeam => !isAddTeam);
    }

    const onClickChkButton = () => {
        setAddTeam(false);
    }

    const handleInputWork = (e) => {
        setValueWork(e.target.value);
    }

    const handleInputStartDate = (e) => {
        setStartDate(e);
        // onValueChange('valueStart', value);
    }

    const handleInputEndDate = (e) => {
        setEndDate(e);
        // onValueChange('valueEnd', value);
    }

    const handleInputTime = () => {
        const value = '${hour}:${minute}'
        onValueChange('valueTime', value);
    }

    const handleBtnClick = () => {
        let startYear = startDate.getFullYear();
        let startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
        let startDay = startDate.getDate().toString().padStart(2, '0');
        let valueStartDate = startYear;
        valueStartDate += '-';
        valueStartDate += startMonth;
        valueStartDate += '-';
        valueStartDate += startDay;

        let endYear = endDate.getFullYear();
        let endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
        let endDay = endDate.getDate().toString().padStart(2, '0');
        let valueEndDate = endYear;
        valueEndDate += '-';
        valueEndDate += endMonth;
        valueEndDate += '-';
        valueEndDate += endDay;
        valueEndDate += 'T';
        valueEndDate += hour;
        valueEndDate += ':';
        valueEndDate += minute;

        onValueChange('valueStart', valueStartDate);
        onValueChange('valueEnd', valueEndDate);
        onValueChange('valueWork', valueWork);

        onClose(isOpen => !isOpen);
      };

      const onClickClose = () => {
        onClose(isOpen => !isOpen);
      }
    

  
      return(
        <Modal isOpen={isOpen} onRequestClose={onClose} className="work-modal">
            <div className="create-work-box" >
                <div className="workClose-box"><span className="closeTxt" onClick={ onClickClose }>x</span></div>
                <div className="work-name-box">
                    <div className="work-name-sec"><span className="work-name">할 일</span></div>
                    <div className="work-name-sec2">
                        <div><span className="work-name-small">할 일</span></div>
                        <input 
                        className='work-Input' 
                        type='text' 
                        name='valueWork' 
                        value={event.title} 
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
                            selected={event.start} 
                            onChange={handleInputStartDate}
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
                            selected={event.end} 
                            onChange={handleInputEndDate}
                            dateFormat="yyyy-MM-dd"
                            locale={ko}
                            />
                        </label>
                    </div>
                </div>
                <div className="time-box">
                    <div className="time-sec-box">
                        <div className="time-sec-txt"><span>마감시간(선택사항)</span></div>
                        <select value={ampm} onChange={handleAmPmChange} className="time-custom">
                            {ampms.map((a) => (
                                <option key={a} value={a}>
                                {a}
                                </option>
                            ))}
                        </select>
                        <select value={hour} onChange={handleHourChange} className="time-custom">
                            {hours.map((h) => (
                                <option key={h} value={h}>
                                {h}
                                </option>
                            ))}
                        </select>
                        <span>:</span>
                        <select value={minute} onChange={handleMinuteChange} className="time-custom">
                            {minutes.map((m) => (
                                <option key={m} value={m}>
                                {m}
                                </option>
                            ))}
                        </select>
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
                    <button className='createWorkBtn' type='button' onClick={ handleBtnClick }>저장</button>
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
        </Modal>
      );
    }
  
    export default WorkModal;