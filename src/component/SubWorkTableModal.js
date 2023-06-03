import React, { useState, useRef, useEffect } from "react";
import Modal from 'react-modal';
import './WorkModal.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";
import 'react-time-picker/dist/TimePicker.css';
import api from '../utils/api'
import { useCookies } from 'react-cookie'

function SubWorkTableModal(props) {
    const { isOpen, onClose, onValueChange, partList, emitterId, projectId, parentId, onValueTodo, setIsWorkOpen } = props;
    const [isAddTeam, setAddTeam] = useState(false)
    // const [cookies] = useCookies(['session'])

    const [content, setContent] = useState('')
    const [startDate, setStartDate] = useState(new Date())
    const [dueDate, setDueDate] = useState(new Date())
    const [hour, setHour] = useState("01")
    const [minute, setMinute] = useState("00")
    const [ampm, setAmpm] = useState("AM")

    const hours = []
    const minutes = []
    const ampms = ["AM", "PM"]
    const [assignList, setAssignList] = useState([])

    let now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1

    for (let i = 1; i <= 12; i++) {
        hours.push(i < 10 ? "0" + i : i.toString());
    }

    for (let i = 0; i <= 59; i++) {
        minutes.push(i < 10 ? "0" + i : i.toString());
    }

    const handleHourChange = (e) => {
        setHour(e.target.value)
    }
    const handleMinuteChange = (e) => {
        setMinute(e.target.value)
    }
    const handleAmpmChange = (e) => {
        setAmpm(e.target.value)
    }

    const teamToggleMenu = () => {
        setAddTeam(isAddTeam => !isAddTeam)
        setAssignList([])
    }

    const onClickChkButton = () => {
        setAddTeam(false);
    }

    const [work, setWork] = useState({
        emitterId: emitterId,
        projectId: projectId,
        parentId: parentId,
        isParent: true,
        startDate: '',
        dueDate: '',
        content: '',
        assignList: [],
    })

    const handleInputWork = (event) => {
        const { name, value } = event.target;
        setWork({
            ...work,
            [name]: value
        })
        if (name === 'content') {
            setContent(value)
        } else if (name === 'startDate') {
            setStartDate(value)
        } else if (name === 'dueDate') {
            setDueDate(value)
        } 
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

        let endYear = dueDate.getFullYear();
        let endMonth = (dueDate.getMonth() + 1).toString().padStart(2, '0');
        let endDay = dueDate.getDate().toString().padStart(2, '0');
        let valueEndDate = endYear;
        valueEndDate += '-';
        valueEndDate += endMonth;
        valueEndDate += '-';
        valueEndDate += endDay

        const work = {
            emitterId: emitterId,
            projectId: projectId,
            parentId: parentId,
            isParent: false,
            startDate: valueStartDate + ' 10:10 PM',
            dueDate: valueEndDate + ' ' + hour + ':' + minute + ' ' + ampm,
            content: content,
            assignList: assignList,
        }

        api.post('/todos/new', work)
        .then(() => {
            api.get('/todos/list/monthly/project/' + projectId + '/' + year + '/' + month)
                .then(response => {
                    onValueTodo(response.data.data)
                })
        })
        .catch(error => {
            console.error(error);
        })

        onClose(isOpen => !isOpen);
    }

    const onClickClose = () => {
        onClose(isOpen => !isOpen);
        setIsWorkOpen(true)
    }
    
    const [selectedPeoples, setSelectedPeoples] = useState([]);
    const [chargeText, setChargeText] = useState('담당자 선택');

    const handleCheckboxChange = (e) => {
        const value = e.target.value
        const [lastName, firstName, userId] = value.split('_')
        if (selectedPeoples.includes(value)) {
            setSelectedPeoples(selectedPeoples.filter((p) => p !== value));
            console.log(userId)
          } else {
            setSelectedPeoples([...selectedPeoples, value]);
            console.log(userId)
          }
    }

    const handleTextboxChange = (e) => {
        if(selectedPeoples.length >= 2) {
            const [lastName, firstName] = selectedPeoples[0].split('_')
            setChargeText(lastName + firstName + " 외 " + (selectedPeoples.length-1) + "명")

            setAssignListForSelectedPeoples(selectedPeoples)
        } else {
            if(selectedPeoples.length === 0) {
                setChargeText('담당자 선택')
            } else {
                const [lastName, firstName, userId] = selectedPeoples[0].split('_')
                setChargeText(lastName + firstName)
                setAssignList([parseInt(userId)])
            }
        }
        setAddTeam(false);
    }

    const setAssignListForSelectedPeoples = (selectedPeoples) => {
        selectedPeoples.forEach((person) => {
          const [lastName, firstName, userId] = person.split('_')
          setAssignList((prevList) => [...prevList, parseInt(userId)])
        })
    }


    return(
        <Modal isOpen={isOpen} onRequestClose={onClose} className="work-modal">
            <div className="create-work-box" >
                <div className="workClose-box"><span className="closeTxt" onClick={ onClickClose }>x</span></div>
                <div className="work-name-box">
                    <div className="work-name-sec"><span className="work-name">할 일</span></div>
                    <div className="work-name-sec2">
                        <div><span className="work-name-small">하위 할 일</span></div>
                        <input 
                        className='work-Input' 
                        type='text' 
                        name='content' 
                        value={content} 
                        onChange={handleInputWork} 
                        placeholder="Enter the Top todo"
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
                            name="startDate"
                            selected={startDate} 
                            onChange={(startDate) => handleInputWork({ target: { name: "startDate", value: startDate } })}
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
                            name="dueDate"
                            selected={dueDate} 
                            onChange={(dueDate) => handleInputWork({ target: { name: "dueDate", value: dueDate } })}
                            dateFormat="yyyy-MM-dd"
                            locale={ko}
                            />
                        </label>
                    </div>
                </div>
                <div className="time-box">
                    <div className="time-sec-box">
                        <div className="time-sec-txt"><span>마감시간</span></div>
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
                        <select value={ampm} onChange={handleAmpmChange} className="time-custom">
                            {ampms.map((a) => (
                                <option key={a} value={a}>
                                {a}
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
                            <span className="charge-person-txt">{chargeText}</span>
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
                            {partList.map((people) => (
                                <div key={people}>
                                <label className="work-label">
                                <input
                                    type="checkbox"
                                    value={`${people.lastName}_${people.firstName}_${people.userId}`}
                                    checked={selectedPeoples.includes(`${people.lastName}_${people.firstName}_${people.userId}`)}
                                    onChange={handleCheckboxChange}
                                    id="chk"
                                    />
                                    <i class="circle"></i>
                                    {people.lastName}{people.firstName}
                                </label>
                                </div>
                            ))}
                        </div>

                        <div className="workBtn-box">
                            <button className='workBtn' type='button' onClick={ handleTextboxChange }>선택</button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
      );
    }
  
    export default SubWorkTableModal;