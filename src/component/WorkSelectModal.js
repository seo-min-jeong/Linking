import React, { useState } from "react"
import Modal from 'react-modal'
import './WorkModal.css'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { ko } from "date-fns/esm/locale"
import 'react-time-picker/dist/TimePicker.css'
import api from '../utils/api'

import deleteIcon from "../icon/trash.png"

//상위할일 조회
function WorkSelectModal(props) {
    const { isOpen, onClose, data, projectId, emitterId, onValueAll, partList } = props
    const [isAddTeam, setAddTeam] = useState(false)

    const [content, setContent] = useState(data.content)

    const tempStartDate = new Date()
    tempStartDate.setFullYear(data.startDate.substring(0,4))
    tempStartDate.setMonth(data.startDate.substring(6,7)-1)
    tempStartDate.setDate(data.startDate.substring(8,10))

    const tempDueDate = new Date()
    tempDueDate.setFullYear(data.dueDate.substring(0,4))
    tempDueDate.setMonth(data.dueDate.substring(6,7)-1)
    tempDueDate.setDate(data.dueDate.substring(8,10))


    const [startDate, setStartDate] = useState(tempStartDate)
    const [dueDate, setDueDate] = useState(tempDueDate)

    const [hour, setHour] = useState(data.dueDate.substring(11,13))
    const [minute, setMinute] = useState(data.dueDate.substring(14,16))
    const [ampm, setAmpm] = useState(data.dueDate.substring(17,19))
    const [assignList, setAssignList] = useState(data.assignList.map((item) => item.userId))

    let now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1

    const hours = []
    const minutes = []
    const ampms = ["AM", "PM"]

    for (let i = 1; i <= 12; i++) {
        hours.push(i < 10 ? "0" + i : i.toString())
    }

    for (let i = 0; i <= 59; i++) {
        minutes.push(i < 10 ? "0" + i : i.toString())
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
        setAddTeam(false)
    }

    const handleInputWork = (event) => {
        const { name, value } = event.target;

        if (name === 'content') {
            setContent(value)
        } else if (name === 'startDate') {
            setStartDate(value)
        } else if (name === 'dueDate') {
            setDueDate(value)
        } 
    }

    const handleBtnClick = () => {
        let startYear = startDate.getFullYear()
        let startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0')
        let startDay = startDate.getDate().toString().padStart(2, '0')
        let valueStartDate = startYear
        valueStartDate += '-'
        valueStartDate += startMonth
        valueStartDate += '-'
        valueStartDate += startDay

        let endYear = dueDate.getFullYear()
        let endMonth = (dueDate.getMonth() + 1).toString().padStart(2, '0')
        let endDay = dueDate.getDate().toString().padStart(2, '0')
        let valueEndDate = endYear
        valueEndDate += '-'
        valueEndDate += endMonth
        valueEndDate += '-'
        valueEndDate += endDay

        const work = {
            emitterId: emitterId,
            todoId: data.todoId,
            projectId: projectId,
            isParent: data.isParent,
            startDate: valueStartDate + ' 12:00 PM',
            dueDate: valueEndDate + ' ' + hour + ':' + minute + ' ' + ampm,
            content: content,
            isAssignListChanged: true,
            assignList: assignList
        }

        api.put('/todos', work)
        .then(() => {
            api.get('/todos/list/monthly/project/' + projectId + '/' + year + '/' + month)
                .then(response => {
                    onValueAll(response.data.data)
                    onClose(isOpen => !isOpen)
                })
        })
        .catch(error => {
            console.error(error)
        })
    }

    const onClickClose = () => {
        onClose(isOpen => !isOpen)
    }

    const [selectedPeoples, setSelectedPeoples] = useState([])
    const [chargeText, setChargeText] = useState(data.assignList[0].userName + " 외 " + (data.assignList.length-1) + "명")

    const handleCheckboxChange = (e) => {
        const value = e.target.value
        const [lastName, firstName, userId] = value.split('_')
        if (selectedPeoples.includes(value)) {
            setSelectedPeoples(selectedPeoples.filter((p) => p !== value))
          } else {
            setSelectedPeoples([...selectedPeoples, value])
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
        setAddTeam(false)
    }

    const setAssignListForSelectedPeoples = (selectedPeoples) => {
        selectedPeoples.forEach((person) => {
          const [userId] = person.split('_')
          setAssignList((prevList) => [...prevList, parseInt(userId)])
        })
    }

    const handleDeleteIcon = () => {
        const work = {
            todoId: data.todoId,
            emitterId: emitterId
        }

        api.post('/todos', work)
        .then(() => {
            api.get('/todos/list/monthly/project/' + projectId + '/' + year + '/' + month)
                .then(response => {
                    onValueAll(response.data.data)
                    onClose(isOpen => !isOpen)
                })
        })
        .catch(error => {
            console.error(error);
        })
    }

      return(
        <Modal isOpen={isOpen} onRequestClose={onClose} className="work-modal">
            <div className="create-work-box" >
                <div className="workClose-box"><span className="closeTxt" onClick={ onClickClose }>x</span></div>
                <div className="work-name-box">
                    <div className="work-name-sec"><span className="work-name">할 일</span></div>
                    <div className="work-name-sec2">
                        <div><span className="work-name-small">상위 할 일</span></div>
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
                <div className="todo-delete-box">
                    <img src={deleteIcon} className="todo-delete-img" onClick={ handleDeleteIcon }/>
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
                                    className="assign-chk"
                                    value={`${people.lastName}_${people.firstName}_${people.userId}`}
                                    checked={selectedPeoples.includes(`${people.lastName}_${people.firstName}_${people.userId}`)}
                                    onChange={handleCheckboxChange}
                                    />
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
      )
    }
  
    export default WorkSelectModal