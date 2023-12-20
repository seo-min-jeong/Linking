import React, { useState, useRef, useEffect } from "react"
import api from '../utils/api'
import { useLocation } from 'react-router-dom'

import SubWorkModal from "./SubWorkModal"
import WorkSelectModal from "./WorkSelectModal"
import WorkSelectSubModal from "./WorkSelectSubModal"
import CreateWorkModal from "./CreateWorkModal"
import Cal from "./Cal"

import dot from "../icon/dot.png"
import noti from "../icon/bell.png"
import arrowtriangle from "../icon/lefttriangle.png"
import plusIcon from "../icon/plusIcon.png"
import clockGreen from "../icon/clockGreen.png"
import clockRed from "../icon/clockRed.png"
import bellRed2 from "../icon/bellRed.png"
import bellGreen2 from "../icon/bellGreen.png"
import circleDefault from "../icon/circleDefault.png"
import circleIng from "../icon/circleIng.png"
import circleCheck from "../icon/circleCheck.png"
import circleIncomplete from "../icon/circleIncomplete.png"
import circleInprogress from "../icon/circleInprogress.png"
import plus from "./icon/plus.png"

//월 할일
function WorkAllTable() {
    const location = useLocation()
    const [tableList, setTableList] = useState(location.state.data)
    const user = JSON.parse(localStorage.getItem('user'))
    const [partList, setPartList] = useState(location.state.partList)
    const projectId = location.state.projectId
    const [activeTodoIndex, setActiveTodoIndex] = useState(tableList.length)

    useEffect(() => {
      setTableList(location.state.data)
      setPartList(location.state.partList)
    }, [location.state])

    const [parentId, setParentId] = useState(-1)

    const workMenuRef = useRef(null)
    const [isWork, setWork] = useState(false)

    const [isNoti, setIsNoti] = useState(false)
    const [isTodoDot, setIsTodoDot] = useState(tableList ? new Array(tableList.length).fill(false) : [])
    const [isUpAssignDot, setIsUpAssignDot] = useState(tableList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))

    const [isChildTodoDot, setIsChildTodoDot] = useState(tableList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
    const [isChildAssignDot, setIsChildAssignDot] = useState([])

    useEffect(() => {
      setActiveTodoIndex(tableList.length)
        setIsTodoDot(tableList ? new Array(tableList.length).fill(false) : [])
        setIsUpAssignDot(tableList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))
        setIsChildTodoDot(tableList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
        setIsChildAssignDot([])
    }, [tableList])

    const [events, setEvents] = useState(tableList.map((item) => ({
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
      })))

    const[emitterId, setEmitterId] = useState()
    let emitter = 0
    useEffect(() => {
        const newEventSource = new EventSource('https://mylinking.shop/todos/connect/web/project/' + projectId + '/user/' + user.userId,
            { 
              headers: { 
                'Cache-Control': 'no-cache',
                'Last-Event-ID': '',
                'Content-Type': 'text/event-stream',
                'X-Accel-Buffering': 'no'
               },
              retry: 600000,
              timeout: 6000000
            }
          )
    
        newEventSource.onopen = () => {
            console.log('!!!!!!!Calendar Connected to server!')
        }
      
        //연결
        newEventSource.addEventListener('connect', (event) => {
            const newData = JSON.parse(event.data)
            console.log(event.data)
            emitter = newData.emitterId
            setEmitterId(newData.emitterId)
        })
        
        //상위할일 추가
        newEventSource.addEventListener('postParent', (event) => {
          const newData = JSON.parse(event.data)
    
          setEvents(prevEvents => [
            ...prevEvents, 
            {
              title: newData.content,
              start: new Date(
                Date.UTC(
                  parseInt(newData.startDate.split(/[- :]/)[0]), // year
                  parseInt(newData.startDate.split(/[- :]/)[1])-1, // month
                  parseInt(newData.startDate.split(/[- :]/)[2]), // day
                  parseInt(newData.startDate.split(/[- :]/)[3]), // hour
                  parseInt(newData.startDate.split(/[- :]/)[4]), // minute
                  0, 
                  0 
                )
              ).toISOString(),
              end: new Date(
                Date.UTC(
                  parseInt(newData.dueDate.split(/[- :]/)[0]), // year
                  parseInt(newData.dueDate.split(/[- :]/)[1])-1, // month
                  parseInt(newData.dueDate.split(/[- :]/)[2]), // day
                  parseInt(newData.dueDate.split(/[- :]/)[3]), // hour
                  parseInt(newData.dueDate.split(/[- :]/)[4]), // minute
                  0, 
                  0 
                )
              ).toISOString(),
              id: newData.todoId
            }
          ])
          setTableList(prevMonthList => [...prevMonthList, newData])
        })
    
        //하위할일 추가
        newEventSource.addEventListener('postChild', (event) => {
          const newData = JSON.parse(event.data)
          const updatedMonthList = tableList.map(item => {
            if (item.todoId === newData.parentId) {
              return {
                ...item,
                childTodoList: [...item.childTodoList, newData]
              }
            }
            return item
          })
          
          setTableList([...updatedMonthList])
        })
    
        //상위할일 수정
        newEventSource.addEventListener('updateParent', (event) => {
          const newData = JSON.parse(event.data)
          setEvents(prevEvents => {
            return prevEvents.map(prevEvent => {
              if (prevEvent.id === newData.todoId) {
                return {
                  ...prevEvent, // Preserve existing event properties
                  title: newData.content,
                  start: new Date(
                    Date.UTC(
                      parseInt(newData.startDate.split(/[- :]/)[0]), // year
                      parseInt(newData.startDate.split(/[- :]/)[1])-1, // month
                      parseInt(newData.startDate.split(/[- :]/)[2]), // day
                      parseInt(newData.startDate.split(/[- :]/)[3]), // hours
                      parseInt(newData.startDate.split(/[- :]/)[4]), // minutes
                      0, // second
                      0 // millisecond
                    )
                  ).toISOString(),
                  end: new Date(
                    Date.UTC(
                      parseInt(newData.dueDate.split(/[- :]/)[0]), // year
                      parseInt(newData.dueDate.split(/[- :]/)[1])-1, // month
                      parseInt(newData.dueDate.split(/[- :]/)[2]), // day
                      parseInt(newData.dueDate.split(/[- :]/)[3]), // hour
                      parseInt(newData.dueDate.split(/[- :]/)[4]), // minutes
                      0, // second
                      0 // millisecond
                    )
                  ).toISOString(),
                  id: newData.todoId
                }
              } else {
                return prevEvent
              }})
          })
    
          setTableList(prevMonthList => {
            const updatedMonthList = prevMonthList.map(item => {
              if (item.todoId === newData.todoId) {
                return newData
              }
              return item
            })
          
            return updatedMonthList
          })
      })
    
        //하위할일 수정
        newEventSource.addEventListener('updateChild', (event) => {
          const newData = JSON.parse(event.data)
    
          setTableList(prevMonthList => {
            return prevMonthList.map(item => {
              if (item.todoId === newData.parentId) {
                const updatedChildTodoList = item.childTodoList.map(childTodo => {
                  if (childTodo.todoId === newData.todoId) {
                    return {
                      ...childTodo,
                      ...newData
                    }
                  }
                  return childTodo;
                })
          
                return {
                  ...item,
                  childTodoList: updatedChildTodoList
                }
              }
              return item
            })
          })
        })
    
        //상위할일 상태 업데이트
        newEventSource.addEventListener('updateParentStatus', (event) => {
          const newData = JSON.parse(event.data)
          const updatedMonthList = tableList.map((item) => {
            if (item.todoId === newData.todoId) {
              const updatedAssignList = item.assignList.map((assignItem) => {
                if (assignItem.assignId === newData.assignId) {
                  return {
                    ...assignItem,
                    status: newData.status,
                  }
                }
                return assignItem
              })
        
              return {
                ...item,
                assignList: updatedAssignList,
              }
            }
            return item
          })
        
          setTableList(updatedMonthList)
        })
    
        //하위할일 상태 업데이트
        newEventSource.addEventListener('updateChildStatus', (event) => {
          const newData = JSON.parse(event.data)
          const updatedMonthList = tableList.map((item) => {
            if (item.todoId === newData.parentId) {
              const updatedChildTodoList = item.childTodoList.map((childTodo) => {
                if (childTodo.todoId === newData.todoId) {
                  const updatedAssignList = childTodo.assignList.map((assignItem) => {
                    if (assignItem.assignId === newData.assignId) {
                      return {
                        ...assignItem,
                        status: newData.status,
                      }
                    }
                    return assignItem
                  })
        
                  return {
                    ...childTodo,
                    assignList: updatedAssignList,
                  }
                }
                return childTodo;
              })
        
              return {
                ...item,
                childTodoList: updatedChildTodoList,
              }
            }
            return item;
          })
        
          setTableList(updatedMonthList);
        })
    
        //상위할일 삭제
        newEventSource.addEventListener('deleteParent', (event) => {
          const newData = JSON.parse(event.data)
     
          setEvents(prevEvents => {
            return prevEvents.filter(prevEvent => prevEvent.id !== newData.todoId)
          })
          setTableList(prevMonthList => {
            return prevMonthList.filter(item => item.todoId !== newData.todoId)
          })
        })
    
        //하위할일 삭제
        newEventSource.addEventListener('deleteChild', (event) => {
          const newData = JSON.parse(event.data)
          const updatedMonthList = tableList.map(item => {
            if (item.todoId === newData.parentId) {
              const updatedChildTodoList = item.childTodoList.filter(childTodo => childTodo.todoId !== newData.todoId)
              return {
                ...item,
                childTodoList: updatedChildTodoList
              }
            }
            return item;
          })
          setTableList(updatedMonthList)
        })
    
        //할일 sse 종료
        return() => {
            newEventSource.close()
            api.get('/todos/disconnect/' + emitter)
            .then()
            .catch(error => {
                console.error(error)
            })
            console.log('Calendar close')
        }
      }, [user.userId])

    //상위할일 ...
    const onToggleMenu = (i, k) => {
        if(k === -1) {
            setIsTodoDot(prevState => {
                const newState = [...prevState]
                newState[i] = !newState[i]
                return newState
            })
            setActiveTodoIndex(i)
            setIsUpAssignDot(tableList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))
            setIsChildAssignDot([])
            setIsChildTodoDot(tableList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
        } else {
          
            setIsUpAssignDot(prevState => {
                const newState = [...prevState]
                newState[i] = prevState[i]
                newState[i][k] = !newState[i][k];
                return newState
              })
              setIsChildAssignDot([])
              setIsTodoDot(tableList ? new Array(tableList.length).fill(false) : [])
              setIsChildTodoDot(tableList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
        }
        setIsNoti(false)
    }

    //하위할일 ...
    const onToggleChildMenu = (i, j, l) => {
        if(l === -1) {
            setIsChildTodoDot(prevState => {
                const newState = [...prevState]
                newState[i] = prevState[i]
                newState[i][j] = !newState[i][j]
                return newState
              })
              setIsSubNoti(false)
              setIsTodoDot(tableList ? new Array(tableList.length).fill(false) : [])
              setIsUpAssignDot(tableList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))
              setIsChildAssignDot([])

        } else {
          const myArray = new Array(tableList.length).fill(false)
            const test = tableList[i].childTodoList.map(todo => new Array(todo.assignList.length).fill(false))
            for(let k = 0; k < myArray.length; k++) {
                if(i === k) {
                    myArray[k] = test
                }
            }

            setIsChildAssignDot(() => {
                const newState = myArray
                newState[i] = myArray[i]
                newState[i][j] = myArray[i][j]
                newState[i][j][l] = !newState[i][j][l]
                return newState
            })
        setIsSubNoti(false)
        setIsTodoDot(tableList ? new Array(tableList.length).fill(false) : [])
        setIsUpAssignDot(tableList.map(todo => todo.assignList ? new Array(todo.assignList.length).fill(false) : [] ))
        setIsChildTodoDot(tableList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
        }
    }

    const [isSubWork, setIsSubWork] = useState(false)

    const onToggleNoti = () => {
        setIsNoti(isNoti => !isNoti)
    }

    const [isSubNoti, setIsSubNoti] = useState(false)
    const onToggleSubNoti = () => {
        setIsSubNoti(isSubNoti => !isSubNoti)
    }

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isWork && (!workMenuRef.current || !workMenuRef.current.contains(e.target))) setWork(isWork => !isWork)
        }
        document.addEventListener('click', handleOutsideClose)
        
        return () => document.removeEventListener('click', handleOutsideClose)
    }, [isWork])

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isSubWork && (!workMenuRef.current || !workMenuRef.current.contains(e.target))) setIsSubWork(isSubWork => !isSubWork)
        }
        document.addEventListener('click', handleOutsideClose)
        
        return () => document.removeEventListener('click', handleOutsideClose)
    }, [isSubWork])

    //하위할일 추가버튼
    const [isOpen, setIsOpen] = useState(false)
    const [isSubOpen, setIsSubOpen] = useState(false)
    const onClickButton = (i, todoId) => {
        setWork(false)
        setIsSubOpen(isSubOpen => !isSubOpen)
        
        setIsTodoDot(prevState => {
            const newState = [...prevState]
            newState[i] = !newState[i]
            return newState
        })
        setActiveTodoIndex(i)
        setParentId(todoId)
        setIsTodoDot(new Array(tableList.length).fill(false))
        setIsUpAssignDot(tableList.map(todo => new Array(todo.assignList.length).fill(false)))
        setIsNoti(false)
    }

    //상위할일 오픈
    const onClickOpen = () => {
        setIsOpen(isOpen => !isOpen)
    }

    const [valueWork, setValueWork] = useState('')
    const [valueStart, setValueStart] = useState('')
    const [valueEnd, setValueEnd] = useState('')
    const [valueTime, setValueTime] = useState('')
    const [valuePeople, setValuePeople] = useState([])

    const handleChange = (inputName, newValue) => {
        if (inputName === 'valueWork') {
            setValueWork(newValue);
          } else if (inputName === 'valueStart') {
            setValueStart(newValue);
          } else if (inputName === 'valueEnd') {
            setValueEnd(newValue);
          } else if (inputName === 'valueTime') {
            setValueTime(newValue);
          } else if (inputName === 'valuePeople') {
            setValuePeople(newValue);
          }
    }

    const [isWorkOpen, setIsWorkOpen] = useState(true)
    const [clickedEvent, setClickedEvent] = useState(null)
    const handleEventClick = (info) => {
        setIsWorkOpen(false)
        info.event.people = valuePeople
        setClickedEvent(info.event)
    }

    const[isSelectModal, setIsSelectModal] = useState(false)
    const[selectData, setSelectData] = useState()
    const[isSelectSubModal, setIsSelectSubModal] = useState(false)
    const[selectSubData, setSelectSubData] = useState()
    const onClickWorkSelectModal = (part) => {
        setIsSelectModal(isSelectModal => !isSelectModal)
        setSelectData(part)
    }
    const onClickWorkSubSelectModal = (part) => {
        setIsSelectSubModal(isSelectSubModal => !isSelectSubModal)
        setSelectSubData(part)
    }

    //상위할일 상태변경
    const handleTodoClick = (todoIndex, assignIndex) => {
        let state = tableList[todoIndex].assignList[assignIndex]
        setTableList(prevTodoList => {
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
            emitterId: emitterId,
            assignId: tableList[todoIndex].assignList[assignIndex].assignId,
            status: state.status
        } 

        api.put('/assigns/status', todoStatus)
        .then(response => {
            console.log(response.data.data)
        })
        .catch(error => {
            console.error(error)
        })
          return updatedTodoList
        })
    }

    //상위 빨강색 상태변경
    const handleLateClick = (todoIndex, assignIndex) => {
        let state = tableList[todoIndex].assignList[assignIndex]
        setTableList(prevTodoList => {
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
            emitterId: emitterId,
            assignId: tableList[todoIndex].assignList[assignIndex].assignId,
            status: state.status
        } 

        api.put('/assigns/status', todoStatus)
        .then(response => {
            console.log(response.data.data)
        })
        .catch(error => {
            console.error(error)
        })
          return updatedTodoList
        })
    }

    //하위할일 상태변경
    const handleChildTodoClick = (todoIndex, todoChildIndex, assignIndex) => {
        let state = tableList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex]
        setTableList(prevTodoList => {
          const updatedTodoList = [...prevTodoList];
          state = updatedTodoList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex];
          
          let now = new Date()
          const date = new Date(updatedTodoList[todoIndex].childTodoList[todoChildIndex].dueDate)

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
            emitterId: emitterId,
            assignId: tableList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex].assignId,
            status: state.status
        } 

        api.put('/assigns/status', todoStatus)
        .then(response => {
            console.log(response.data.data)
        })
        .catch(error => {
            console.error(error)
        })
          return updatedTodoList
        })
    }

    //하위할일 빨강색 상태변경
    const handleLateChildTodoClick = (todoIndex, todoChildIndex, assignIndex) => {
        let state = tableList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex]
        setTableList(prevTodoList => {
          const updatedTodoList = [...prevTodoList]
          state = updatedTodoList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex]
          if (state.status === 'INCOMPLETE') {
            state.status = 'INCOMPLETE_PROGRESS'
          } else if (state.status === 'INCOMPLETE_PROGRESS') {
            state.status = 'COMPLETE'
          } else {
            state.status = 'INCOMPLETE'
          }

          const todoStatus = {
            emitterId: emitterId,
            assignId: tableList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex].assignId,
            status: state.status
        } 

        api.put('/assigns/status', todoStatus)
        .then(response => {
            console.log(response.data.data)
        })
        .catch(error => {
            console.error(error)
        })
          return updatedTodoList
        })
    }

    const handleTodo = (newValue) => {
        setTableList(newValue)
        setEvents(newValue.map((item) => ({
            title: item.content,
            start: new Date(
              Date.UTC(
                parseInt(item.startDate.split(/[- :]/)[0]), 
                parseInt(item.startDate.split(/[- :]/)[1])-1, 
                parseInt(item.startDate.split(/[- :]/)[2]), 
                parseInt(item.startDate.split(/[- :]/)[3]), 
                parseInt(item.startDate.split(/[- :]/)[4]), 
                0, 
                0 
              )
            ).toISOString(),
            end: new Date(
              Date.UTC(
                parseInt(item.dueDate.split(/[- :]/)[0]), 
                parseInt(item.dueDate.split(/[- :]/)[1])-1, 
                parseInt(item.dueDate.split(/[- :]/)[2]), 
                parseInt(item.dueDate.split(/[- :]/)[3]), 
                parseInt(item.dueDate.split(/[- :]/)[4]), 
                0, 
                0 
              )
            ).toISOString(),
            id: item.todoId
          }))
      
        )
    } 

    const handleWorkAll = (newValue) => {
        setTableList(newValue)
        setEvents(newValue.map((item) => ({
          title: item.content,
          start: new Date(
            Date.UTC(
              parseInt(item.startDate.split(/[- :]/)[0]), 
              parseInt(item.startDate.split(/[- :]/)[1])-1, 
              parseInt(item.startDate.split(/[- :]/)[2]), 
              parseInt(item.startDate.split(/[- :]/)[3]), 
              parseInt(item.startDate.split(/[- :]/)[4]), 
              0, 
              0 
            )
          ).toISOString(),
          end: new Date(
            Date.UTC(
              parseInt(item.dueDate.split(/[- :]/)[0]), 
              parseInt(item.dueDate.split(/[- :]/)[1])-1, 
              parseInt(item.dueDate.split(/[- :]/)[2]), 
              parseInt(item.dueDate.split(/[- :]/)[3]), 
              parseInt(item.dueDate.split(/[- :]/)[4]), 
              0, 
              0 
            )
          ).toISOString(),
          id: item.todoId
        }))
    
      )
    } 
    const handleSubWorkAll = (newValue) => {
        setTableList(newValue)
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

            setIsSubNoti(false)
            setIsNoti(false)
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
          console.log(noti)
        api.post('/push-notifications', noti)
        .then(response => {
            console.log('웹 알림 전송: ', response.data.data)
            setIsSubNoti(false)
            setIsNoti(false)
        })
        .catch(error => {
            console.error(error)
        })
    }

    const handleTableList = (newValue) => {
      setTableList(newValue)
      setIsChildTodoDot(newValue.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
    }

    return (
        <div>
            <div className='todayBigBox'>
                <span className='todayBigText'>할 일</span>
                <div className='todayPlus-box'>
                    <img className='todayPlus' src={ plus } onClick={ onClickOpen } />
                </div>
            </div>
            <div className="cal-total-box" style={{ display: 'flex', justifyContent: 'center', margin: 'auto',  minWidth: '1380px' }}>
              <Cal events={events} setEvents={setEvents} onTableList={handleTableList}/>
            <div className='todaySmallBox' ref={ workMenuRef } style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className='smallTextBox'>
                    <div className="todaySmallText1-box"><span className='todaySmallText1'>할 일</span></div>
                    <div className="todaySmallText2-box"><span className='todaySmallText2'>마감 날짜</span></div>
                    <div className="todaySmallText3-box"><span className='todaySmallText2'>담당자</span></div>
                </div>
                
                <div className="today-small-box">
                {tableList.map((todo, i) => (
                    <div className="work-content-box" key={i}>
                        {todo.assignList.length > 1 ? 
                        //상위할일-assignList 여러명 존재할 경우
                        <div>
                            {todo.assignList.map((assign, k) => (
                                <div className='work-top-content-box' ref={ workMenuRef } key={`${i}-${k}`}>
                                {assign.userId === user.userId ? 
                                        <div>
                                            {assign.status === 'INCOMPLETE' || assign.status === 'INCOMPLETE_PROGRESS' ?
                                            <button style={{ cursor: 'pointer' }} onClick={() => handleLateClick(i, k)} className="todo-circle-btn">
                                                <div>
                                                    {assign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                    {assign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                    {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                </div>
                                            </button>
                                            :
                                            <button style={{ cursor: 'pointer' }} onClick={() => handleTodoClick(i, k)} className="todo-circle-btn">
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
                                            <button className="todo-circle-btn">
                                                <div>
                                                    {assign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                    {assign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                    {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                </div>
                                            </button>
                                            :
                                            <button className="todo-circle-btn">
                                                <div>
                                                    {assign.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                    {assign.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                    {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                </div>
                                            </button>
                                            }
                                        </div>
                                        }
                                <div className='todaySmall-txt1-box'>
                                    {assign.userId === user.userId ? 
                                        <span className="todaySmall-txt1 tooltip" onClick={() => onClickWorkSelectModal(todo)}>
                                        {todo.content}
                                      </span>
                                      
                                        : 
                                        <span className='todaySmall-txt1'>{todo.content}</span>
                                    }
                                </div>
                                {assign.status === 'INCOMPLETE' || assign.status === 'INCOMPLETE_PROGRESS' ?
                                <>
                                  <div className='todaySmall-txt2-box'>
                                    <span className='todaySmall-red-txt2'>{todo.dueDate.substring(0,11)}</span>
                                  </div>
                                  <div className='todaySmall-txt3-box'>
                                    <img className='work-green-clock' src={ clockRed }/>
                                    <span className='todaySmall-red-txt'>{todo.dueDate.substring(11, 19)}</span>
                                  </div>
                                </> 
                                : 
                                <>
                                  <div className='todaySmall-txt2-box'>
                                    <span className='todaySmall-txt2'>{todo.dueDate.substring(0,11)}</span>
                                  </div>
                                  <div className='todaySmall-txt3-box'>
                                    <img className='work-green-clock' src={ clockGreen }/>
                                    <span className='todaySmall-txt3'>{todo.dueDate.substring(11, 19)}</span>
                                  </div>
                                </>
                                }
        
                                <div className='todaySmall-txt4-box'>
                                    <span className='todaySmall-txt4'>{assign.userName}</span>
                                </div>
        
                                <div className='todaySmall-img-box'>
                                    <img className='work-team-dot' src={ dot } onClick={() => {
                                        onToggleMenu(i, k)
                                    }}/>
                                    <div className={isUpAssignDot && isUpAssignDot[i] && isUpAssignDot[i][k] ? 'work-toggle-box' : 'work-hide-box'} >
                                        <div className='work-menu-box'>
                                            <div className='work-menu-sec'>
                                                <div className="work-arrow-imgBox">
                                                    <img className='work-arrow' src={ arrowtriangle } onClick={ onToggleNoti } />
                                                    <div className={isNoti ? 'workNoti-toggle-box' : 'workNoti-hide-box'} >
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
                                                <div className="work-menu-imgBox"><img className='work-plusIcon' src={ noti }/></div>
                                                <div className="work-menu-txtBox"><span className="work-menu-txt">알림 보내기</span></div>
                                            </div>
                                            <div className='work-menu-sec'>
                                                <div className="work-menu-imgBox"><img className='work-plusIcon' src={ plusIcon } onClick={() => onClickButton(i, todo.todoId)}/></div>
                                                <div className="work-menu-txtBox"><span className="work-menu-txt" onClick={() => onClickButton(i, todo.todoId)} >하위 할 일 추가</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>
                        :
                        //상위할일-assignList 1명 존재할 경우
                        <div className='work-top-content-box' ref={ workMenuRef } >
                            {todo.assignList[0].userId === user.userId ? 
                                            <div>
                                                {todo.assignList[0].status === 'INCOMPLETE' || todo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleLateClick(i, 0)} className="todo-circle-btn">
                                                    <div>
                                                        {todo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {todo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleTodoClick(i, 0)} className="todo-circle-btn">
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
                                                <div>
                                                    {todo.assignList[0].status === 'INCOMPLETE' || todo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                    <button className="todo-circle-btn">
                                                        <div>
                                                            {todo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                            {todo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                            {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                        </div>
                                                    </button>
                                                    :
                                                    <button className="todo-circle-btn">
                                                        <div>
                                                            {todo.assignList[0].status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                            {todo.assignList[0].status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                            {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                        </div>
                                                    </button>
                                                    }
                                                </div>
                                            </div>
                                        }
                            <div className='todaySmall-txt1-box'>
                                {todo.assignList[0].userId === user.userId ? 
                                    <span className='todaySmall-txt1 tooltip' onClick={() => onClickWorkSelectModal(todo)} >{todo.content}</span>
                                    : 
                                    <span className='todaySmall-txt2'>{todo.content}</span>
                                }
                            </div>
                            {todo.assignList[0].status === 'INCOMPLETE' || todo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                              <>
                                <div className='todaySmall-txt2-box'>
                                    <span className='todaySmall-red-txt2'>{todo.dueDate.substring(0,11)}</span>
                                </div>
                                <div className='todaySmall-txt3-box'>
                                    <img className='work-green-clock' src={ clockRed }/>
                                    <span className='todaySmall-red-txt'>{todo.dueDate.substring(11, 19)}</span>
                                </div>
                              </> 
                              : 
                              <>
                                <div className='todaySmall-txt2-box'>
                                  <span className='todaySmall-txt2'>{todo.dueDate.substring(0,11)}</span>
                                </div>
                                <div className='todaySmall-txt3-box'>
                                  <img className='work-green-clock' src={ clockGreen }/>
                                  <span className='todaySmall-txt3'>{todo.dueDate.substring(11, 19)}</span>
                                </div>
                              </>
                            }
                            <div className='todaySmall-txt4-box'>
                                <span className='todaySmall-txt4'>{todo.assignList[0].userName}</span>
                            </div>
                            <div className='todaySmall-img-box'>
                                <img className='work-team-dot' src={ dot } onClick={() => {
                                    if (activeTodoIndex !== null && activeTodoIndex !== i) {
                                        setIsTodoDot(prevState => {
                                            const newState = [...prevState];
                                            newState[activeTodoIndex] = false;
                                            return newState;
                                        });
                                    }
                                    onToggleMenu(i, -1)
                                }}/>
                                <div className={isTodoDot && isTodoDot[i] ? 'work-toggle-box' : 'work-hide-box'} >
                                    <div className='work-menu-box'>
                                        <div className='work-menu-sec'>
                                            <div className="work-arrow-imgBox">
                                                <img className='work-arrow' src={ arrowtriangle } onClick={ onToggleNoti } />
                                                <div className={isNoti ? 'workNoti-toggle-box' : 'workNoti-hide-box'} >
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
                                            <div className="work-menu-imgBox"><img className='work-plusIcon' src={ noti }/></div>
                                            <div className="work-menu-txtBox"><span className="work-menu-txt">알림 보내기</span></div>
                                        </div>
                                        <div className='work-menu-sec'>
                                            <div className="work-menu-imgBox"><img className='work-plusIcon' src={ plusIcon } onClick={() => onClickButton(i, todo.todoId)}/></div>
                                            <div className="work-menu-txtBox"><span className="work-menu-txt" onClick={() => onClickButton(i, todo.todoId)} >하위 할 일 추가</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        }
                        { todo.childTodoList && todo.childTodoList.length > 0 && (
                            //하위할일-assignList 여러명 존재할 경우
                            <div>
                                {todo.childTodoList.map((childTodo, j) => (
                                <div key={j}>  
                                    {childTodo.assignList.length > 1 ?
                                    <div>
                                        {childTodo.assignList.map((childAssign, l) => (
                                        <div className="work-sub-content-box" key={`${i}-${j}-${l}`}>
                                            {childAssign.userId === user.userId ? 
                                                <div>
                                                    {childAssign.status === 'INCOMPLETE' || childAssign.status === 'INCOMPLETE_PROGRESS' ?
                                                    <button style={{ cursor: 'pointer' }} onClick={() => handleLateChildTodoClick(i, j, l)} className="todo-circle-btn">
                                                        <div>
                                                            {childAssign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                            {childAssign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                            {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                        </div>
                                                    </button>
                                                    :
                                                    <button style={{ cursor: 'pointer' }} onClick={() => handleChildTodoClick(i, j, l)} className="todo-circle-btn">
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
                                                    <button className="todo-circle-btn">
                                                        <div>
                                                            {childAssign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                            {childAssign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                            {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                        </div>
                                                    </button>
                                                    :
                                                    <button className="todo-circle-btn">
                                                        <div>
                                                            {childAssign.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                            {childAssign.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                            {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                        </div>
                                                    </button>
                                                    }
                                                </div>
                                            }
                                            <div className='todaySub-txt1-box'>
                                                {childAssign.userId === user.userId ? 
                                                    <span className='todaySmall-txt1 tooltip' onClick={() => onClickWorkSubSelectModal(childTodo)} >{childTodo.content}</span>
                                                    : 
                                                    <span className='todaySmall-txt2'>{childTodo.content}</span>
                                                }
                                            </div>
                                            {childAssign.status === 'INCOMPLETE' || childAssign.status === 'INCOMPLETE_PROGRESS' ?
                                              <>
                                                <div className='todaySmall-red-txt2-box'>
                                                  <span className='todaySmall-red-txt2'>{childTodo.dueDate.substring(0,11)}</span>
                                                </div>
                                                <div className='todaySmall-txt3-box'>
                                                  <img className='work-green-clock' src={ clockRed }/>
                                                  <span className='todaySmall-red-txt'>{childTodo.dueDate.substring(11, 19)}</span>
                                                </div>
                                              </> 
                                              : 
                                              <>
                                                <div className='todaySmall-txt2-box'>
                                                  <span className='todaySmall-txt2'>{childTodo.dueDate.substring(0,11)}</span>
                                                </div>
                                                <div className='todaySmall-txt3-box'>
                                                  <img className='work-green-clock' src={ clockGreen }/>
                                                  <span className='todaySmall-txt3'>{childTodo.dueDate.substring(11, 19)}</span>
                                                </div>
                                              </>
                                            }
                                            <div className='todaySmall-txt4-box'>
                                                <span className='todaySmall-txt4'>{childAssign.userName}</span>
                                            </div>
                                            <div className='todaySmall-img-box'>
                                            <img className='work-team-dot' src={ dot } onClick={() => {
                                                    onToggleChildMenu(i, j, l)
                                                }}/>
                                                <div className={isChildAssignDot && isChildAssignDot[i] && isChildAssignDot[i][j] && isChildAssignDot[i][j][l] ? 'work-toggle-box' : 'work-hide-box'}>
                                                    <div className='work-menu-box'>
                                                        <div className='work-menu-sec'>
                                                            <div className="work-arrow-imgBox">
                                                                <img className='work-arrow' src={ arrowtriangle } onClick={ onToggleSubNoti } />
                                                                <div className={isSubNoti ? 'workNoti-toggle-box' : 'workNoti-hide-box'} >
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
                                                            <div className="work-menu-imgBox"><img className='work-plusIcon' src={ noti }/></div>
                                                            <div className="work-menu-txtBox"><span className="work-menu-txt">알림 보내기</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        ))}
                                    </div>
                                    :
                                    //하위할일-assignList 1명 존재할 경우
                                    <div className="work-sub-content-box" key={`${i}-${j}`}>
                                        {childTodo.assignList[0].userId === user.userId ? 
                                            <div>
                                                {childTodo.assignList[0].status === 'INCOMPLETE' || childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleLateChildTodoClick(i, j, 0)} className="todo-circle-btn">
                                                    <div>
                                                        {childTodo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :
                                                <button style={{ cursor: 'pointer' }} onClick={() => handleChildTodoClick(i, j, 0)} className="todo-circle-btn">
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
                                                <button className="todo-circle-btn">
                                                    <div>
                                                        {childTodo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :
                                                <button className="todo-circle-btn">
                                                    <div>
                                                        {childTodo.assignList[0].status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                                        {childTodo.assignList[0].status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                                        {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                }
                                            </div>
                                        }
                                        <div className='todaySub-txt1-box'>
                                            {childTodo.assignList[0].userId === user.userId ? 
                                                <span className='todaySmall-txt1 tooltip' onClick={() => onClickWorkSubSelectModal(childTodo)} >{childTodo.content}</span>
                                                : 
                                                <span className='todaySmall-txt2'>{childTodo.content}</span>
                                            }
                                        </div>
                                        {childTodo.assignList[0].status === 'INCOMPLETE' || childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' ?
                                          <>
                                            <div className='todaySmall-txt2-box'>
                                              <span className='todaySmall-red-txt2'>{childTodo.dueDate.substring(0,11)}</span>
                                            </div>
                                            <div className='todaySmall-txt3-box'>
                                              <img className='work-green-clock' src={ clockRed }/>
                                              <span className='todaySmall-red-txt'>{childTodo.dueDate.substring(11, 19)}</span>
                                            </div>
                                          </> 
                                          : 
                                          <>
                                            <div className='todaySmall-txt2-box'>
                                              <span className='todaySmall-txt2'>{childTodo.dueDate.substring(0,11)}</span>
                                            </div>
                                            <div className='todaySmall-txt3-box'>
                                              <img className='work-green-clock' src={ clockGreen }/>
                                              <span className='todaySmall-txt3'>{childTodo.dueDate.substring(11, 19)}</span>
                                            </div>
                                          </>
                                        }
                                        <div className='todaySmall-txt4-box'>
                                            <span className='todaySmall-txt4'>{childTodo.assignList[0].userName}</span>
                                        </div>
                                        <div className='todaySmall-img-box'>
                                            <img className='work-team-dot' src={ dot } onClick={() => {
                                                onToggleChildMenu(i, j, -1)
                                            }}/>
                                            <div className={isChildTodoDot && isChildTodoDot[i] && isChildTodoDot[i][j] ? 'work-toggle-box' : 'work-hide-box'} >
                                                <div className='work-menu-box'>
                                                    <div className='work-menu-sec'>
                                                        <div className="work-arrow-imgBox">
                                                            <img className='work-arrow' src={ arrowtriangle } onClick={ onToggleSubNoti } />
                                                            <div className={isSubNoti ? 'workNoti-toggle-box' : 'workNoti-hide-box'} >
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
                                                        <div className="work-menu-imgBox"><img className='work-plusIcon' src={ noti }/></div>
                                                        <div className="work-menu-txtBox"><span className="work-menu-txt">알림 보내기</span></div>
                                                    </div>
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
                ))}
                </div>
                {isOpen ? <CreateWorkModal isOpen={isOpen} onClose={setIsOpen} onValueChange={handleChange} onValue = { handleEventClick } partList={partList} emitterId={emitterId} projectId={projectId} onValueTodo={handleTodo} setIsWorkOpen={setIsWorkOpen}/> : <></> }
                {isSubOpen ? <SubWorkModal isOpen={isSubOpen} onClose={setIsSubOpen} onValueChange={handleChange} onValue = { handleEventClick } partList={partList} emitterId={emitterId} projectId={projectId} parentId={parentId} onValueTodo={handleTodo} setIsWorkOpen={setIsWorkOpen} /> : <></> }
                {isSelectModal ? <WorkSelectModal isOpen={isSelectModal} onClose={setIsSelectModal} data={selectData} projectId={projectId} emitterId={emitterId} onValueAll={handleWorkAll} partList={partList}/> : <></> }
                {isSelectSubModal ? <WorkSelectSubModal isOpen={isSelectSubModal} onClose={setIsSelectSubModal} data={selectSubData} projectId={projectId} emitterId={emitterId} onValueAll={handleSubWorkAll} partList={partList} /> : <></> }
            </div>
          </div>
        </div>

    )

}

export default WorkAllTable