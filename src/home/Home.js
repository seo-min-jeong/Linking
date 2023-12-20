import React, { useState, useRef, useEffect } from 'react'
import 'react-calendar/dist/Calendar.css'
import { useLocation } from 'react-router-dom'
import api from '../utils/api'
import {useMediaQuery} from 'react-responsive'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGripPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"

import './Home.css'
import Chart from "./Chart"
import circleDefault from "../icon/circleDefault.png"
import circleIng from "../icon/circleIng.png"
import circleCheck from "../icon/circleCheck.png"
import clockGreen from "../icon/clockGreen.png"
import clockRed from "../icon/clockRed.png"
import circleIncomplete from "../icon/circleIncomplete.png"
import circleInprogress from "../icon/circleInprogress.png"
import dot from "../icon/dot.png"
import bellRed2 from "../icon/bellRed.png"
import bellGreen2 from "../icon/bellGreen.png"

function Home(props) {
    const { todoList, todoMonthly, setTodoMonthly, setTodoList, beginDate, dueDate, setBeginDate, setDueDate, graph, setGraph, projectId, setProjectId } = props
    const user = JSON.parse(localStorage.getItem('user'))

    const location = useLocation()
    
    useEffect(() => {
        if (location.state) {
          const { todoDay, todoMonth, beginDate, dueDate, graph, newProjectId } = location.state
          setTodoMonthly(todoMonth)
          setTodoList(todoDay)
          setBeginDate(beginDate)
          setDueDate(dueDate)
          setGraph(graph)
          setProjectId(newProjectId)
        } 
      }, [location.state, setTodoList, setTodoMonthly, setBeginDate, setDueDate, setGraph])

    //퍼센트바
    const endDate = new Date(dueDate)
    const startDate = new Date(beginDate)

    const today = new Date()
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24))
    const percent = Math.round((elapsedDays / totalDays) * 100)
    
    const timeDiff = endDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    const events = todoMonthly?.map((item) => ({
        title: item.content,
        start: new Date(
            Date.UTC(
              parseInt(item.startDate.split(/[- :]/)[0]), // year
              parseInt(item.startDate.split(/[- :]/)[1])-1, // month
              parseInt(item.startDate.split(/[- :]/)[2]), // day
              parseInt(item.startDate.split(/[- :]/)[3]), // hour
              parseInt(item.startDate.split(/[- :]/)[4]), // minute
              0, // second
              0 // millisecond
            )
          ).toISOString(),
          end: new Date(
            Date.UTC(
              parseInt(item.dueDate.split(/[- :]/)[0]), // year
              parseInt(item.dueDate.split(/[- :]/)[1])-1, // month
              parseInt(item.dueDate.split(/[- :]/)[2]), // day
              parseInt(item.dueDate.split(/[- :]/)[3]), // hour
              parseInt(item.dueDate.split(/[- :]/)[4]), // minute
              0, // second
              0 // millisecond
            )
          ).toISOString(),
        id: item.todoId
    }))

    const calendarRef = useRef(null)

    //상위할일 상태변경
    const handleTodoClick = (todoIndex, assignIndex) => {
        let state = todoList[todoIndex].assignList[assignIndex].status
        setTodoList(prevTodoList => {
          const updatedTodoList = [...prevTodoList]
          state = updatedTodoList[todoIndex].assignList[assignIndex]

          let now = new Date()
          const date = new Date(updatedTodoList[todoIndex].dueDate)

          if (state.status === 'BEFORE_START') {
            state.status = 'IN_PROGRESS'
          } else if (state.status === 'IN_PROGRESS') {
            state.status = 'COMPLETE'
          } else {
            if(date < now) {
                state.status = 'INCOMPLETE'
            } else {
                state.status = 'BEFORE_START'
            }
          }

        const todoStatus = {
            emitterId: -1,
            assignId: todoList[todoIndex].assignList[assignIndex].assignId,
            status: state.status
        }

            api.put('/assigns/status', todoStatus)
            .then(() => {
                api.get('/assigns/ratio/project/' + projectId)
                .then(response => {
                    setGraph(response.data.data)
                })
                .catch(error => {
                    console.error(error)
                })
            })
            .catch(error => {
                console.error(error)
            })

          return updatedTodoList
        })
      }

      //상위할일 빨강색 상태변경
      const handleLateClick = (todoIndex, assignIndex) => {
        let state = todoList[todoIndex].assignList[assignIndex].status
        setTodoList(prevTodoList => {
          const updatedTodoList = [...prevTodoList]
          state = updatedTodoList[todoIndex].assignList[assignIndex]

          if (state.status === 'INCOMPLETE') {
            state.status = 'INCOMPLETE_PROGRESS'
          } else if (state.status === 'INCOMPLETE_PROGRESS') {
            state.status = 'COMPLETE'
          } else {
            state.status = 'INCOMPLETE'
          }

          const todoStatus = {
            emitterId: -1,
            assignId: todoList[todoIndex].assignList[assignIndex].assignId,
            status: state.status
        } 

        api.put('/assigns/status', todoStatus)
        .then(() => {
            api.get('/assigns/ratio/project/' + projectId)
                    .then(response => {
                        setGraph(response.data.data)
                    })
                    .catch(error => {
                        console.error(error)
                    })
        })
        .catch(error => {
            console.error(error)
        })

          return updatedTodoList
        })
    }

    //하위할일 상태변경
    const handleChildClick = (todoIndex, todoChildIndex, assignIndex) => {
        let state = todoList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex]
        setTodoList(prevTodoList => {
          const updatedTodoList = [...prevTodoList]
          state = updatedTodoList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex]

          let now = new Date()
          const date = new Date(updatedTodoList[todoIndex].dueDate)

          if (state.status === 'BEFORE_START') {
            state.status = 'IN_PROGRESS'
          } else if (state.status === 'IN_PROGRESS') {
            state.status = 'COMPLETE'
          } else {
            if(date < now) {
                state.status = 'INCOMPLETE'
            } else {
                state.status = 'BEFORE_START'
            }
          }

        const todoStatus = {
            emitterId: -1,
            assignId: todoList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex].assignId,
            status: state.status
        }

            api.put('/assigns/status', todoStatus)
            .then(() => {
                api.get('/assigns/ratio/project/' + projectId)
                .then(response => {
                    setGraph(response.data.data)
                })
                .catch(error => {
                    console.error(error)
                })
            })
            .catch(error => {
                console.error(error)
            })

          return updatedTodoList;
        })
      }

    //하위할일 빨강색 상태변경
    const handleLateChildClick = (todoIndex, childIndex, assignIndex) => {
        let state = todoList[todoIndex].childTodoList[childIndex].assignList[assignIndex]
        setTodoList(prevTodoList => {
          const updatedTodoList = [...prevTodoList]
          state = updatedTodoList[todoIndex].childTodoList[childIndex].assignList[assignIndex]

          if (state.status === 'INCOMPLETE') {
            state.status = 'INCOMPLETE_PROGRESS'
          } else if (state.status === 'INCOMPLETE_PROGRESS') {
            state.status = 'COMPLETE'
          } else {
            state.status = 'INCOMPLETE'
          }

          const todoStatus = {
            emitterId: -1,
            assignId: todoList[todoIndex].childTodoList[childIndex].assignList[assignIndex].assignId,
            status: state.status
        } 

        api.put('/assigns/status', todoStatus)
        .then(() => {
            api.get('/assigns/ratio/project/' + projectId)
                .then(response => {
                    setGraph(response.data.data)
                })
                .catch(error => {
                    console.error(error)
                })
        })
        .catch(error => {
            console.error(error)
        })

          return updatedTodoList
        })
    }

    const [isTodoDot, setIsTodoDot] = useState(todoList ? new Array(todoList.length).fill(false) : [])
    const [isUpAssignDot, setIsUpAssignDot] = useState(todoList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))

    const [isChildTodoDot, setIsChildTodoDot] = useState(todoList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
    const [isChildAssignDot, setIsChildAssignDot] = useState([])
    
    useEffect(() => {
        setIsTodoDot(todoList ? new Array(todoList.length).fill(false) : [])
        setIsUpAssignDot(todoList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))
        setIsChildTodoDot(todoList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
        setIsChildAssignDot([])
    }, [todoList, setTodoList])

    //상위할일 ...
    const onToggleMenu = (i, k) => {
        if(k === -1) {
            setIsTodoDot(prevState => {
                const newState = [...prevState];
                newState[i] = !newState[i];
                return newState
            })
            setIsUpAssignDot(todoList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))
            setIsChildAssignDot([])
            setIsChildTodoDot(todoList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
        } else {
            setIsUpAssignDot(prevState => {
                const newState = [...prevState]
                newState[i] = prevState[i]
                newState[i][k] = !newState[i][k]
                return newState
              })
              setIsChildAssignDot([])
              setIsTodoDot(todoList ? new Array(todoList.length).fill(false) : [])
              setIsChildTodoDot(todoList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
        }
    }

    //하위할일 ...
    const onToggleChildMenu = (i, j, l) => {
        if(l === -1) {
            setIsChildTodoDot(prevState => {
                const newState = [...prevState]
                newState[i] = prevState[i]
                newState[i][j] = !newState[i][j]
                return newState;
              })
              setIsTodoDot(todoList ? new Array(todoList.length).fill(false) : [])
              setIsUpAssignDot(todoList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))
              setIsChildAssignDot([])

        } else {
          const myArray = new Array(todoList.length).fill(false)
            const test = todoList[i].childTodoList.map(todo => new Array(todo.assignList.length).fill(false))
            for(let k = 0; k < myArray.length; k++) {
                if(i === k) {
                    myArray[k] = test;
                }
            }

            setIsChildAssignDot(prevState => {
                const newState = myArray;
                newState[i] = myArray[i]
                newState[i][j] = myArray[i][j]
                newState[i][j][l] = !newState[i][j][l];
                return newState;
            })
        setIsTodoDot(todoList ? new Array(todoList.length).fill(false) : [])
        setIsUpAssignDot(todoList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))
        setIsChildTodoDot(todoList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
        
        }
    }

    //웹&메일 발송
    const onClickWebAndMail = (part) => {
        const noti = {
            projectId: projectId,
            userId: part.targetUserId,
            sender: user.lastName+user.firstName,
            priority: 0,
            noticeType: 'TODO',
            body: part.content
          }

        api.post('/push-notifications', noti)
        .then(response => {
            console.log('웹 & 메일 알림 전송: ', response.data.data)
            setIsTodoDot(todoList ? new Array(todoList.length).fill(false) : [])
            setIsUpAssignDot(todoList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))
            setIsChildTodoDot(todoList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
            setIsChildAssignDot([])
        })
        .catch(error => {
            console.error(error)
        })
    }
    
    const onClickWeb = (part) => {
        const noti = {
            projectId: projectId,
            userId: part.targetUserId,
            sender: user.lastName+user.firstName,
            priority: 1,
            noticeType: 'TODO',
            body: part.content
          }
    
        api.post('/push-notifications', noti)
        .then(response => {
            setIsTodoDot(todoList ? new Array(todoList.length).fill(false) : [])
            setIsUpAssignDot(todoList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))
            setIsChildTodoDot(todoList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
            setIsChildAssignDot([])
        })
        .catch(error => {
            console.error(error)
        })
    }

    const isDesktopOrLaptop = useMediaQuery({ query: "(min-width: 1000px)" })
    const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1000px)" })


    return(
    <div>
        {isDesktopOrLaptop &&
        <div className='totalBox' style={{ minHeight: '740px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
            <div>
                <div className='blockBox'>
                    <div className='blockBox1'>
                        <div className='docBox' style={{ minWidth: '630px', minHeight: '285px'}}>
                            <div className='chart'><Chart graph={graph} /></div>
                        </div>
                        <div className='widgetText'>
                            <span className='txt'>할 일 완료 비율</span>
                        </div> 

                        <div className='todayBox' style={{ minWidth: '540px', minHeight: '285px'}}>
                            {todoList.length === 0 ? 
                            <div className="todo-no-box">
                                <span className="todo-no-txt">오늘 할일이 없습니다.</span>
                            </div> 
                            : 
                            <>
                            {todoList?.map((todo, i) => (
                                //상위할일 assertList 여러개
                                <div className="home-today-box" key={i}>
                                    {todo.assignList.length > 1 ?
                                    <div>
                                        {todo.assignList.map((assign, k) => (
                                        <div className='home-today1-box' key={`${i}-${k}`}>
                                            {assign.userId === user.userId ? 
                                            <div>
                                                {assign.status === 'INCOMPLETE' || assign.status === 'INCOMPLETE_PROGRESS' ?
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleLateClick(i, k)} className="home-circle-btn">
                                                    <div>
                                                        {assign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {assign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleTodoClick(i, k)} className="home-circle-btn">
                                                    <div>
                                                        {assign.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                        {assign.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                        {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                }
                                            </div>
                                            : 
                                            <div>
                                                {assign.status === 'INCOMPLETE' || assign.status === 'INCOMPLETE_PROGRESS' ?
                                                <button className="home-circle-btn">
                                                    <div>
                                                        {assign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {assign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :
                                                <button className="home-circle-btn">
                                                    <div>
                                                        {assign.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                        {assign.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                        {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                }
                                            </div>
                                            }
                                            <div className="home-today-sec">
                                                <span>{todo.content}</span>
                                            </div>
                                            {assign.status === 'INCOMPLETE' || assign.status === 'INCOMPLETE_PROGRESS' ?
                                                <div className='home-today-time'>
                                                    <img className='work-green-clock' src={ clockRed }/>
                                                    <span className="mytodo-red-txt">{todo.dueDate.substring(11, 19)}</span>    
                                                </div>
                                                : 
                                                <div className='home-today-time'>
                                                    <img className='work-green-clock' src={ clockGreen }/>
                                                    <span className="mytodo-txt">{todo.dueDate.substring(11, 19)}</span>    
                                                </div>
                                            }
                                            <div className="home-today-sec2">
                                                <span>{assign.userName}</span>
                                            </div>
                                            <div>
                                                <img className='home-team-dot' src={ dot } onClick={() => {
                                                    onToggleMenu(i, k)
                                                }}/>
                                                <div className={isUpAssignDot && isUpAssignDot[i] && isUpAssignDot[i][k] ? 'home-team-box' : 'home-hide-box'} >
                                                    <div className="workNoti-box">
                                                        <img className='work-noti' src={ bellRed2 } onClick={() => onClickWebAndMail({ content: todo.content, targetUserId: assign.userId })}/>
                                                        <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: todo.content, targetUserId: assign.userId })}>Web & Mail</span>
                                                    </div>
                                                    <div className="workNoti-box">
                                                        <img className='work-noti' src={ bellGreen2 } onClick={() => onClickWeb({ content: todo.content, targetUserId: assign.userId })}/>
                                                        <span className="workNoti-txt" onClick={() => onClickWeb({ content: todo.content, targetUserId: assign.userId })}>Web</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </div>
                                        ))}

                                    </div>
                                    :
                                    //상위할일 assertList 한 개
                                    <div className='home-today1-box'> 
                                        {todo.assignList[0].userId === user.userId ? 
                                            <div>
                                                {todo.assignList[0].status === 'INCOMPLETE' || todo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleLateClick(i, 0)} className="home-circle-btn">
                                                    <div>
                                                        {todo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {todo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleTodoClick(i, 0)} className="home-circle-btn">
                                                    <div>
                                                        {todo.assignList[0].status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                        {todo.assignList[0].status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                        {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                }
                                            </div>
                                            : 
                                            <div>
                                                {todo.assignList[0].status === 'INCOMPLETE' || todo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                <button className="home-circle-btn">
                                                    <div>
                                                        {todo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {todo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :   
                                                <button className="home-circle-btn">
                                                    <div>
                                                        {todo.assignList[0].status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                        {todo.assignList[0].status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                        {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                }
                                            </div>
                                        }
                                        <div className="home-today-sec">
                                            <span>{todo.content}</span>
                                        </div>
                                        {todo.assignList[0].status === 'INCOMPLETE' || todo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                            <div className='home-today-time'>
                                                <img className='work-green-clock' src={ clockRed }/>
                                                <span className="mytodo-red-txt">{todo.dueDate.substring(11, 19)}</span>    
                                            </div>
                                            : 
                                            <div className='home-today-time'>
                                                <img className='work-green-clock' src={ clockGreen }/>
                                                <span className="mytodo-txt">{todo.dueDate.substring(11, 19)}</span>    
                                            </div>
                                        }
                                        <div className="home-today-sec2">
                                            <span>{todo.assignList[0].userName}</span>
                                        </div>
                                        <div>
                                            <img className='home-team-dot' src={ dot } onClick={() => {
                                                onToggleMenu(i, -1)
                                            }}/>
                                            <div className={isTodoDot && isTodoDot[i] ? 'home-team-box' : 'home-hide-box'} >
                                                <div className="workNoti-box">
                                                    <img className='work-noti' src={ bellRed2 } onClick={() => onClickWebAndMail({ content: todo.content, targetUserId: todo.assignList[0].userId })}/>
                                                    <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: todo.content, targetUserId: todo.assignList[0].userId })}>Web & Mail</span>
                                                </div>
                                                <div className="workNoti-box">
                                                    <img className='work-noti' src={ bellGreen2 } onClick={() => onClickWeb({ content: todo.content, targetUserId: todo.assignList[0].userId })}/>
                                                    <span className="workNoti-txt" onClick={() => onClickWeb({ content: todo.content, targetUserId: todo.assignList[0].userId })}>Web</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    }
                                    
                                    {todo.childTodoList.length > 0 && (
                                        //하위할일 assertList 여러개
                                        <div>
                                            {todo.childTodoList.map((childTodo, j) => (
                                            <div key={j}>
                                                {childTodo.assignList.length > 1 ?
                                                <div>
                                                    {childTodo.assignList.map((childAssign, l) => (
                                                        <div className="home-today1-box" key={`${i}-${j}-${l}`}>
                                                            {childAssign.userId === user.userId ? 
                                                            <div>
                                                                {childAssign.status === 'INCOMPLETE' || childAssign.status === 'INCOMPLETE_PROGRESS' ?
                                                                <button style={{ cursor: 'pointer' }} onClick={() => handleLateChildClick(i, j, l)} className="home-circle-btn">
                                                                    <div>
                                                                        {childAssign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                                        {childAssign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                                        {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                :
                                                                <button style={{ cursor: 'pointer' }} onClick={() => handleChildClick(i, j, l)} className="home-circle-btn">
                                                                    <div>
                                                                        {childAssign.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                                        {childAssign.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                                        {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                }
                                                            </div>
                                                            : 
                                                            <div>
                                                                {childAssign.status === 'INCOMPLETE' || childAssign.status === 'INCOMPLETE_PROGRESS' ?
                                                                <button className="home-circle-btn">
                                                                    <div>
                                                                        {childAssign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                                        {childAssign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                                        {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                :
                                                                <button className="home-circle-btn">
                                                                    <div>
                                                                        {childAssign.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                                        {childAssign.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                                        {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                }
                                                            </div>
                                                            }
                                                            <div className="home-today-sec">
                                                                <span>{childTodo.content}</span>
                                                            </div>
                                                            {childAssign.status === 'INCOMPLETE' || childAssign.status === 'INCOMPLETE_PROGRESS' ?
                                                                <div className='home-today-time'>
                                                                    <img className='work-green-clock' src={ clockRed }/>
                                                                    <span className="mytodo-red-txt">{childTodo.dueDate.substring(11, 19)}</span>    
                                                                </div>
                                                                : 
                                                                <div className='home-today-time'>
                                                                    <img className='work-green-clock' src={ clockGreen }/>
                                                                    <span className="mytodo-txt">{childTodo.dueDate.substring(11, 19)}</span>    
                                                                </div>
                                                            }
                                                            <div className="home-today-sec2">
                                                                <span>{childAssign.userName}</span>
                                                            </div>
                                                            <div>
                                                                <img className='home-team-dot' src={ dot } onClick={() => {
                                                                    onToggleChildMenu(i, j, l)
                                                                }}/>
                                                                <div className={isChildAssignDot && isChildAssignDot[i] && isChildAssignDot[i][j] && isChildAssignDot[i][j][l] ? 'home-team-box' : 'home-hide-box'} >
                                                                    <div className="workNoti-box">
                                                                        <img className='work-noti' src={ bellRed2 } onClick={() => onClickWebAndMail({ content: childTodo.content, targetUserId: childAssign.userId })}/>
                                                                        <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: childTodo.content, targetUserId: childAssign.userId })}>Web & Mail</span>
                                                                    </div>
                                                                    <div className="workNoti-box">
                                                                        <img className='work-noti' src={ bellGreen2 } onClick={() => onClickWeb({ content: childTodo.content, targetUserId: childAssign.userId })}/>
                                                                        <span className="workNoti-txt" onClick={() => onClickWeb({ content: childTodo.content, targetUserId: childAssign.userId })}>Web</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                :
                                                //하위할일 assertList 한 개
                                                <div className="home-today1-box" key={`${i}-${j}`}>
                                                    {childTodo.assignList[0].userId === user.userId ? 
                                                            <div>
                                                                {childTodo.assignList[0].status === 'INCOMPLETE' || childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                                <button style={{ cursor: 'pointer' }} onClick={() => handleLateChildClick(i, j, 0)} className="home-circle-btn">
                                                                    <div>
                                                                        {childTodo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                                        {childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                :
                                                                <button style={{ cursor: 'pointer' }} onClick={() => handleChildClick(i, j, 0)} className="home-circle-btn">
                                                                    <div>
                                                                        {childTodo.assignList[0].status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                                        {childTodo.assignList[0].status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                }
                                                            </div>
                                                            : 
                                                            <div>
                                                                {childTodo.assignList[0].status === 'INCOMPLETE' || childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                                <button className="home-circle-btn">
                                                                    <div>
                                                                        {childTodo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                                        {childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                :
                                                                <button className="home-circle-btn">
                                                                    <div>
                                                                        {childTodo.assignList[0].status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                                        {childTodo.assignList[0].status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                }
                                                            </div>
                                                        }
                                                            <div className="home-today-sec">
                                                                <span>{childTodo.content}</span>
                                                            </div>
                                                            {childTodo.assignList[0].status === 'INCOMPLETE' || childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                                <div className='home-today-time'>
                                                                    <img className='work-green-clock' src={ clockRed }/>
                                                                    <span className="mytodo-red-txt">{childTodo.dueDate.substring(11, 19)}</span>    
                                                                </div>
                                                                : 
                                                                <div className='home-today-time'>
                                                                    <img className='work-green-clock' src={ clockGreen }/>
                                                                    <span className="mytodo-txt">{childTodo.dueDate.substring(11, 19)}</span>    
                                                                </div>
                                                            }
                                                            <div className="home-today-sec2">
                                                                <span>{childTodo.assignList[0].userName}</span>
                                                            </div>
                                                            <div>
                                                                <img className='home-team-dot' src={ dot } onClick={() => {
                                                                    onToggleChildMenu(i, j, -1)
                                                                }}/>
                                                                <div className={isChildTodoDot && isChildTodoDot[i] && isChildTodoDot[i][j] ? 'home-team-box' : 'home-hide-box'} >
                                                                    <div className="workNoti-box">
                                                                        <img className='work-noti' src={ bellRed2 } onClick={() => onClickWebAndMail({ content: childTodo.content, targetUserId: childTodo.assignList[0].userId })}/>
                                                                        <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: childTodo.content, targetUserId: childTodo.assignList[0].userId })}>Web & Mail</span>
                                                                    </div>
                                                                    <div className="workNoti-box">
                                                                        <img className='work-noti' src={ bellGreen2 } onClick={() => onClickWeb({ content: childTodo.content, targetUserId: childTodo.assignList[0].userId })}/>
                                                                        <span className="workNoti-txt" onClick={() => onClickWeb({ content: childTodo.content, targetUserId: childTodo.assignList[0].userId })}>Web</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                }
                                            </div>  
                                            ))}
                                        </div>
                                        )}
                                    </div>
                                    ))
                            }
                            </>
                            }
                            </div>
                        <div className='widgetText'>
                            <span className='txt'>오늘 할 일</span>
                        </div> 
                    </div>

                    <div className='blockBox2'>
                        <div className='calBox' style={{ minWidth: '650px', minHeight: '586px'}}>
                            <div>
                                <FullCalendar 
                                defaultView="dayGridMonth" 
                                plugins={[ dayGridPlugin, timeGripPlugin, interactionPlugin ]}
                                className="custom-fullCal"
                                headerToolbar={{
                                    start: "title",
                                    center: "",
                                    end: "prev today next",
                                }}
                                events={events}
                                ref={calendarRef}
                                titleFormat={{
                                    year: 'numeric',
                                    month: 'long'
                                }} 
                                eventLimit={true}
                                dayMaxEvents={1}
                                />
                            </div>
                        </div>
                        <div className='widgetText'><span className='txt'>달력<span/></span></div>
                    </div>
                </div>
                <div className='percent-box'>
                    <div className='percentBar' style={{ width: `${percent}%` }}>
                        {daysRemaining < 1 ? 
                        <span className='percentLabel'>마감된 프로젝트입니다.</span>
                        :
                        <span className='percentLabel'>마감까지 {daysRemaining}일</span>
                        }
                    </div>
                    {daysRemaining < 1 ? 
                    <div className='remain-percentBar' style={{ width: `0%` }}>
                            <span className='remain-percentLabel'>100%</span>
                    </div>
                    :
                    <div className='remain-percentBar' style={{ width: `${100-percent}%` }}>
                            <span className='remain-percentLabel'>{percent}%</span>
                    </div>
                    }
                </div>
            </div>
        </div>
        }
        {isTabletOrMobile &&
        <div className='totalBox' style={{ minHeight: '740px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
            <div>
                <div className='small-blockBox'>
                    <div className='blockBox1'>
                        <div className='docBox' style={{ minWidth: '630px', minHeight: '285px'}}>
                            <div className='chart'><Chart graph={graph} /></div>
                        </div>
                        <div className='widgetText'>
                            <span className='txt'>할 일 완료 비율</span>
                        </div> 

                        <div className='small-todayBox' style={{ minWidth: '540px', minHeight: '285px'}}>
                            {todoList.length === 0 ? 
                            <div className="todo-no-box">
                                <span className="todo-no-txt">오늘 할일이 없습니다.</span>
                            </div> 
                            : 
                            <>
                            {todoList?.map((todo, i) => (
                                //상위할일 assertList 여러개
                                <div className="home-today-box" key={i}>
                                    {todo.assignList.length > 1 ?
                                    <div>
                                        {todo.assignList.map((assign, k) => (
                                        <div className='home-today1-box' key={`${i}-${k}`}>
                                            {assign.userId === user.userId ? 
                                            <div>
                                                {assign.status === 'INCOMPLETE' || assign.status === 'INCOMPLETE_PROGRESS' ?
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleLateClick(i, k)} className="home-circle-btn">
                                                    <div>
                                                        {assign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {assign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleTodoClick(i, k)} className="home-circle-btn">
                                                    <div>
                                                        {assign.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                        {assign.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                        {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                }
                                            </div>
                                            : 
                                            <div>
                                                {assign.status === 'INCOMPLETE' || assign.status === 'INCOMPLETE_PROGRESS' ?
                                                <button className="home-circle-btn">
                                                    <div>
                                                        {assign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {assign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :
                                                <button className="home-circle-btn">
                                                    <div>
                                                        {assign.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                        {assign.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                        {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                }
                                            </div>
                                            }
                                            <div className="home-today-sec">
                                                <span>{todo.content}</span>
                                            </div>
                                            {assign.status === 'INCOMPLETE' || assign.status === 'INCOMPLETE_PROGRESS' ?
                                                <div className='home-today-time'>
                                                    <img className='work-green-clock' src={ clockRed }/>
                                                    <span className="mytodo-red-txt">{todo.dueDate.substring(11, 19)}</span>    
                                                </div>
                                                : 
                                                <div className='home-today-time'>
                                                    <img className='work-green-clock' src={ clockGreen }/>
                                                    <span className="mytodo-txt">{todo.dueDate.substring(11, 19)}</span>    
                                                </div>
                                            }
                                            <div className="home-today-sec2">
                                                <span>{assign.userName}</span>
                                            </div>
                                            <div>
                                                <img className='home-team-dot' src={ dot } onClick={() => {
                                                    onToggleMenu(i, k)
                                                }}/>
                                                <div className={isUpAssignDot && isUpAssignDot[i] && isUpAssignDot[i][k] ? 'home-team-box' : 'home-hide-box'} >
                                                    <div className="workNoti-box">
                                                        <img className='work-noti' src={ bellRed2 } onClick={() => onClickWebAndMail({ content: todo.content, targetUserId: assign.userId })}/>
                                                        <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: todo.content, targetUserId: assign.userId })}>Web & Mail</span>
                                                    </div>
                                                    <div className="workNoti-box">
                                                        <img className='work-noti' src={ bellGreen2 } onClick={() => onClickWeb({ content: todo.content, targetUserId: assign.userId })}/>
                                                        <span className="workNoti-txt" onClick={() => onClickWeb({ content: todo.content, targetUserId: assign.userId })}>Web</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </div>
                                        ))}

                                    </div>
                                    :
                                    //상위할일 assertList 한 개
                                    <div className='home-today1-box'> 
                                        {todo.assignList[0].userId === user.userId ? 
                                            <div>
                                                {todo.assignList[0].status === 'INCOMPLETE' || todo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleLateClick(i, 0)} className="home-circle-btn">
                                                    <div>
                                                        {todo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {todo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleTodoClick(i, 0)} className="home-circle-btn">
                                                    <div>
                                                        {todo.assignList[0].status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                        {todo.assignList[0].status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                        {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                }
                                            </div>
                                            : 
                                            <div>
                                                {todo.assignList[0].status === 'INCOMPLETE' || todo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                <button className="home-circle-btn">
                                                    <div>
                                                        {todo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {todo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :   
                                                <button className="home-circle-btn">
                                                    <div>
                                                        {todo.assignList[0].status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                        {todo.assignList[0].status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                        {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                }
                                            </div>
                                        }
                                        <div className="home-today-sec">
                                            <span>{todo.content}</span>
                                        </div>
                                        {todo.assignList[0].status === 'INCOMPLETE' || todo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                            <div className='home-today-time'>
                                                <img className='work-green-clock' src={ clockRed }/>
                                                <span className="mytodo-red-txt">{todo.dueDate.substring(11, 19)}</span>    
                                            </div>
                                            : 
                                            <div className='home-today-time'>
                                                <img className='work-green-clock' src={ clockGreen }/>
                                                <span className="mytodo-txt">{todo.dueDate.substring(11, 19)}</span>    
                                            </div>
                                        }
                                        <div className="home-today-sec2">
                                            <span>{todo.assignList[0].userName}</span>
                                        </div>
                                        <div>
                                            <img className='home-team-dot' src={ dot } onClick={() => {
                                                onToggleMenu(i, -1)
                                            }}/>
                                            <div className={isTodoDot && isTodoDot[i] ? 'home-team-box' : 'home-hide-box'} >
                                                <div className="workNoti-box">
                                                    <img className='work-noti' src={ bellRed2 } onClick={() => onClickWebAndMail({ content: todo.content, targetUserId: todo.assignList[0].userId })}/>
                                                    <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: todo.content, targetUserId: todo.assignList[0].userId })}>Web & Mail</span>
                                                </div>
                                                <div className="workNoti-box">
                                                    <img className='work-noti' src={ bellGreen2 } onClick={() => onClickWeb({ content: todo.content, targetUserId: todo.assignList[0].userId })}/>
                                                    <span className="workNoti-txt" onClick={() => onClickWeb({ content: todo.content, targetUserId: todo.assignList[0].userId })}>Web</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    }
                                    
                                    {todo.childTodoList.length > 0 && (
                                        //하위할일 assertList 여러개
                                        <div>
                                            {todo.childTodoList.map((childTodo, j) => (
                                            <div key={j}>
                                                {childTodo.assignList.length > 1 ?
                                                <div>
                                                    {childTodo.assignList.map((childAssign, l) => (
                                                        <div className="home-today1-box" key={`${i}-${j}-${l}`}>
                                                            {childAssign.userId === user.userId ? 
                                                            <div>
                                                                {childAssign.status === 'INCOMPLETE' || childAssign.status === 'INCOMPLETE_PROGRESS' ?
                                                                <button style={{ cursor: 'pointer' }} onClick={() => handleLateChildClick(i, j, l)} className="home-circle-btn">
                                                                    <div>
                                                                        {childAssign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                                        {childAssign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                                        {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                :
                                                                <button style={{ cursor: 'pointer' }} onClick={() => handleChildClick(i, j, l)} className="home-circle-btn">
                                                                    <div>
                                                                        {childAssign.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                                        {childAssign.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                                        {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                }
                                                            </div>
                                                            : 
                                                            <div>
                                                                {childAssign.status === 'INCOMPLETE' || childAssign.status === 'INCOMPLETE_PROGRESS' ?
                                                                <button className="home-circle-btn">
                                                                    <div>
                                                                        {childAssign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                                        {childAssign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                                        {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                :
                                                                <button className="home-circle-btn">
                                                                    <div>
                                                                        {childAssign.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                                        {childAssign.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                                        {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                }
                                                            </div>
                                                            }
                                                            <div className="home-today-sec">
                                                                <span>{childTodo.content}</span>
                                                            </div>
                                                            {childAssign.status === 'INCOMPLETE' || childAssign.status === 'INCOMPLETE_PROGRESS' ?
                                                                <div className='home-today-time'>
                                                                    <img className='work-green-clock' src={ clockRed }/>
                                                                    <span className="mytodo-red-txt">{childTodo.dueDate.substring(11, 19)}</span>    
                                                                </div>
                                                                : 
                                                                <div className='home-today-time'>
                                                                    <img className='work-green-clock' src={ clockGreen }/>
                                                                    <span className="mytodo-txt">{childTodo.dueDate.substring(11, 19)}</span>    
                                                                </div>
                                                            }
                                                            <div className="home-today-sec2">
                                                                <span>{childAssign.userName}</span>
                                                            </div>
                                                            <div>
                                                                <img className='home-team-dot' src={ dot } onClick={() => {
                                                                    onToggleChildMenu(i, j, l)
                                                                }}/>
                                                                <div className={isChildAssignDot && isChildAssignDot[i] && isChildAssignDot[i][j] && isChildAssignDot[i][j][l] ? 'home-team-box' : 'home-hide-box'} >
                                                                    <div className="workNoti-box">
                                                                        <img className='work-noti' src={ bellRed2 } onClick={() => onClickWebAndMail({ content: childTodo.content, targetUserId: childAssign.userId })}/>
                                                                        <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: childTodo.content, targetUserId: childAssign.userId })}>Web & Mail</span>
                                                                    </div>
                                                                    <div className="workNoti-box">
                                                                        <img className='work-noti' src={ bellGreen2 } onClick={() => onClickWeb({ content: childTodo.content, targetUserId: childAssign.userId })}/>
                                                                        <span className="workNoti-txt" onClick={() => onClickWeb({ content: childTodo.content, targetUserId: childAssign.userId })}>Web</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                :
                                                //하위할일 assertList 한 개
                                                <div className="home-today1-box" key={`${i}-${j}`}>
                                                    {childTodo.assignList[0].userId === user.userId ? 
                                                            <div>
                                                                {childTodo.assignList[0].status === 'INCOMPLETE' || childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                                <button style={{ cursor: 'pointer' }} onClick={() => handleLateChildClick(i, j, 0)} className="home-circle-btn">
                                                                    <div>
                                                                        {childTodo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                                        {childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                :
                                                                <button style={{ cursor: 'pointer' }} onClick={() => handleChildClick(i, j, 0)} className="home-circle-btn">
                                                                    <div>
                                                                        {childTodo.assignList[0].status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                                        {childTodo.assignList[0].status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                }
                                                            </div>
                                                            : 
                                                            <div>
                                                                {childTodo.assignList[0].status === 'INCOMPLETE' || childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                                <button className="home-circle-btn">
                                                                    <div>
                                                                        {childTodo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                                        {childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                :
                                                                <button className="home-circle-btn">
                                                                    <div>
                                                                        {childTodo.assignList[0].status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                                        {childTodo.assignList[0].status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                                    </div>
                                                                </button>
                                                                }
                                                            </div>
                                                        }
                                                            <div className="home-today-sec">
                                                                <span>{childTodo.content}</span>
                                                            </div>
                                                            {childTodo.assignList[0].status === 'INCOMPLETE' || childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                                <div className='home-today-time'>
                                                                    <img className='work-green-clock' src={ clockRed }/>
                                                                    <span className="mytodo-red-txt">{childTodo.dueDate.substring(11, 19)}</span>    
                                                                </div>
                                                                : 
                                                                <div className='home-today-time'>
                                                                    <img className='work-green-clock' src={ clockGreen }/>
                                                                    <span className="mytodo-txt">{childTodo.dueDate.substring(11, 19)}</span>    
                                                                </div>
                                                            }
                                                            <div className="home-today-sec2">
                                                                <span>{childTodo.assignList[0].userName}</span>
                                                            </div>
                                                            <div>
                                                                <img className='home-team-dot' src={ dot } onClick={() => {
                                                                    onToggleChildMenu(i, j, -1)
                                                                }}/>
                                                                <div className={isChildTodoDot && isChildTodoDot[i] && isChildTodoDot[i][j] ? 'home-team-box' : 'home-hide-box'} >
                                                                    <div className="workNoti-box">
                                                                        <img className='work-noti' src={ bellRed2 } onClick={() => onClickWebAndMail({ content: childTodo.content, targetUserId: childTodo.assignList[0].userId })}/>
                                                                        <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: childTodo.content, targetUserId: childTodo.assignList[0].userId })}>Web & Mail</span>
                                                                    </div>
                                                                    <div className="workNoti-box">
                                                                        <img className='work-noti' src={ bellGreen2 } onClick={() => onClickWeb({ content: childTodo.content, targetUserId: childTodo.assignList[0].userId })}/>
                                                                        <span className="workNoti-txt" onClick={() => onClickWeb({ content: childTodo.content, targetUserId: childTodo.assignList[0].userId })}>Web</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                }
                                            </div>  
                                            ))}
                                        </div>
                                        )}
                                    </div>
                                    ))
                            }
                            </>
                            }
                            </div>
                        <div className='widgetText'>
                            <span className='txt'>오늘 할 일</span>
                        </div> 
                    </div>

                    <div className='blockBox2'>
                        <div className='small-calBox' style={{ minWidth: '650px', minHeight: '586px'}}>
                            <div>
                                <FullCalendar 
                                defaultView="dayGridMonth" 
                                plugins={[ dayGridPlugin, timeGripPlugin, interactionPlugin ]}
                                className="custom-fullCal"
                                headerToolbar={{
                                    start: "title",
                                    center: "",
                                    end: "prev today next",
                                }}
                                events={events}
                                ref={calendarRef}
                                titleFormat={{
                                    year: 'numeric',
                                    month: 'long'
                                }} 
                                eventLimit={true}
                                dayMaxEvents={1}
                                />
                            </div>
                        </div>
                        <div className='widgetText'><span className='txt'>달력<span/></span></div>
                    </div>
                </div>
            </div>
        </div>
        }
    </div>
    )
}

export default Home