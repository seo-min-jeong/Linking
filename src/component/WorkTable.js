import React, { useState, useRef, useEffect } from "react";
import api from '../utils/api';
import { useCookies } from 'react-cookie'

import SubWorkTableModal from "./SubWorkTableModal"
import WorkTableSelectModal from "./WorkTableSelectModal"
import WorkTableSelectSubModal from "./WorkTableSelectSubModal"

import dot from "../icon/dot.png"
import clockGreen from "../icon/clockGreen.png"
import plusIcon from "../icon/plusIcon.png"
import noti from "../icon/bell.png"
import arrowtriangle from "../icon/arrowtriangle.png"
import circleDefault from "../icon/circleDefault.png"
import circleIng from "../icon/circleIng.png"
import circleCheck from "../icon/circleCheck.png"
import bellRed2 from "../icon/bell-red.png"
import bellGreen2 from "../icon/bell-green.png"
import circleIncomplete from "../icon/circleIncomplete.png"
import circleInprogress from "../icon/circleInprogress.png"

//일 조회
function WorkTable( props ) {
    const { event, projectId, emitterId, partList, onValueWorkOne } = props
    const user = JSON.parse(localStorage.getItem('user'))
    // const [cookies] = useCookies(['session'])

    const [tableList, setTableList] = useState(event)
    const [activeTodoIndex, setActiveTodoIndex] = useState(tableList.length)
    const [parentId, setParentId] = useState(-1)

    useEffect(() => {
        setTableList(event)
        setActiveTodoIndex(tableList.length)
    }, [event, activeTodoIndex, projectId, emitterId, partList])

    const workMenuRef = useRef(null);
    const [isWork, setWork] = useState(false);

    const [isNoti, setIsNoti] = useState(false);
    const [isTodoDot, setIsTodoDot] = useState(new Array(tableList.length).fill(false));
    const [isUpAssignDot, setIsUpAssignDot] = useState(tableList.map(todo => new Array(todo.assignList.length).fill(false)));

    const [isChildTodoDot, setIsChildTodoDot] = useState(tableList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
    const [isChildAssignDot, setIsChildAssignDot] = useState([]);

    //상위할일 ...
    const onToggleMenu = (i, k) => {
        if(k === -1) {
            setIsTodoDot(prevState => {
                const newState = [...prevState]; 
                newState[i] = !newState[i]; 
                return newState;
            });
            setActiveTodoIndex(i)
        } else {
            setIsUpAssignDot(prevState => {
                const newState = [...prevState];
                newState[i] = prevState[i]; 
                newState[i][k] = !newState[i][k]; 
                return newState;
              })
        }
        setIsNoti(false)
        setIsChildAssignDot([])
        setIsChildTodoDot(tableList.map(todo => todo.childAllList ? new Array(todo.childAllList.length).fill(false) : [] ))
        
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
              setIsSubNoti(false)
        } else {
            const myArray = new Array(tableList.length).fill(false)
            // const t = tableList.map(todo => new Array(todo.childTodoList.length).fill(false))
            const test = tableList[i].childTodoList.map(todo => new Array(todo.assignList.length).fill(false))
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
            setIsSubNoti(false)
        }
    }

    const [isSubWork, setIsSubWork] = useState(false);

    const onToggleNoti = () => {
        setIsNoti(isNoti => !isNoti);
    }

    const [isSubNoti, setIsSubNoti] = useState(false);
    const onToggleSubNoti = () => {
        setIsSubNoti(isSubNoti => !isSubNoti);
    }

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isWork && (!workMenuRef.current || !workMenuRef.current.contains(e.target))) setWork(isWork => !isWork);
        };
        document.addEventListener('click', handleOutsideClose);
        
        return () => document.removeEventListener('click', handleOutsideClose);
    }, [isWork]);

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isSubWork && (!workMenuRef.current || !workMenuRef.current.contains(e.target))) setIsSubWork(isSubWork => !isSubWork);
        };
        document.addEventListener('click', handleOutsideClose);
        
        return () => document.removeEventListener('click', handleOutsideClose);
    }, [isSubWork]);

    const [isOpen, setIsOpen] = useState(false);
    const onClickButton = (i, todoId) => {
        setWork(false);
        setIsOpen(isOpen => !isOpen);
        
        setIsTodoDot(prevState => {
            const newState = [...prevState]; 
            newState[i] = !newState[i]; 
            return newState;
        });
        setActiveTodoIndex(i)
        setParentId(todoId)
        setIsTodoDot(new Array(tableList.length).fill(false))
        setIsUpAssignDot(tableList.map(todo => new Array(todo.assignList.length).fill(false)))
        setIsNoti(false)
    }

    const [valueWork, setValueWork] = useState('');
    const [valueStart, setValueStart] = useState('');
    const [valueEnd, setValueEnd] = useState('');
    const [valueTime, setValueTime] = useState('');
    const [valuePeople, setValuePeople] = useState([]);

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
    };

    const [isWorkOpen, setIsWorkOpen] = useState(true);
    const [clickedEvent, setClickedEvent] = useState(null);
    const handleEventClick = (info) => {
        setIsWorkOpen(false);
        info.event.people = valuePeople;
        setClickedEvent(info.event); 
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
          const updatedTodoList = [...prevTodoList];
          state = updatedTodoList[todoIndex].assignList[assignIndex]

          let now = new Date()
          const date = new Date(updatedTodoList[todoIndex].dueDate)

          if (state.status === 'BEFORE_START') {
            state.status = 'IN_PROGRESS';
          } else if (state.status === 'IN_PROGRESS') {
            state.status = 'COMPLETE';
          } else {
            if(date < now) {
                state.status = 'INCOMPLETE'
            } else {
                state.status = 'BEFORE_START';
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
            console.error(error);
        })

          return updatedTodoList;
        })
    }

    //상위 빨강색 상태변경
    const handleLateClick = (todoIndex, assignIndex) => {
        let state = tableList[todoIndex].assignList[assignIndex]
        setTableList(prevTodoList => {
          const updatedTodoList = [...prevTodoList];
          state = updatedTodoList[todoIndex].assignList[assignIndex];
          if (state.status === 'INCOMPLETE') {
            state.status = 'INCOMPLETE_PROGRESS';
          } else if (state.status === 'INCOMPLETE_PROGRESS') {
            state.status = 'COMPLETE';
          } else {
            state.status = 'INCOMPLETE';
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
            console.error(error);
        })

          return updatedTodoList;
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
            state.status = 'IN_PROGRESS';
          } else if (state.status === 'IN_PROGRESS') {
            state.status = 'COMPLETE';
          } else {
            if(date < now) {
                state.status = 'INCOMPLETE'
            } else {
                state.status = 'BEFORE_START';
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
            console.error(error);
        })

          return updatedTodoList;
        })
    }

    //하위할일 빨강색 상태변경
    const handleLateChildTodoClick = (todoIndex, todoChildIndex, assignIndex) => {
        let state = tableList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex]
        setTableList(prevTodoList => {
          const updatedTodoList = [...prevTodoList];
          state = updatedTodoList[todoIndex].childTodoList[todoChildIndex].assignList[assignIndex];
          if (state.status === 'INCOMPLETE') {
            state.status = 'INCOMPLETE_PROGRESS';
          } else if (state.status === 'INCOMPLETE_PROGRESS') {
            state.status = 'COMPLETE';
          } else {
            state.status = 'INCOMPLETE';
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
            console.error(error);
        })

          return updatedTodoList;
        })
    }

    const handleTodo = (newValue) => {
        setTableList(newValue)
    } 
    const handleWorkAll = (newValue) => {
        onValueWorkOne(newValue)
        setTableList(newValue)
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

    return (
        <div className='todaySmallBox' ref={ workMenuRef }>
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
                                        <button onClick={() => handleLateClick(i, k)} className="todo-circle-btn">
                                            <div>
                                                {assign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                {assign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                {assign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                            </div>
                                        </button>
                                        :
                                        <button onClick={() => handleTodoClick(i, k)} className="todo-circle-btn">
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
                                    <span className='todaySmall-txt1' onClick={() => onClickWorkSelectModal(todo)} >{todo.content}</span>
                                    : 
                                    <span className='todaySmall-txt2'>{todo.content}</span>
                                }
                            </div>
                            <div className='todaySmall-txt2-box'>
                                <span className='todaySmall-txt2'>{todo.dueDate.substring(0,11)}</span>
                            </div>
                            <div className='todaySmall-txt3-box'>
                                <img className='work-green-clock' src={ clockGreen }/>
                                <span className='todaySmall-txt3'>{todo.dueDate.substring(11, 19)}</span>
                            </div>
    
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
                                                        <img className='work-noti' src={ bellRed2 } />
                                                        <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: todo.content, targetUserId: assign.userId })}>Web & Mail</span>
                                                    </div>
                                                    <div className="workNoti-box">
                                                        <img className='work-noti' src={ bellGreen2 } />
                                                        <span className="workNoti-txt" onClick={() => onClickWeb({ content: todo.content, targetUserId: assign.userId })}>Web</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="work-menu-imgBox"><img className='work-plusIcon' src={ noti }/></div>
                                            <div className="work-menu-txtBox"><span className="work-menu-txt">알림 보내기</span></div>
                                        </div>
                                        <div className='work-menu-sec'>
                                            <div className="work-menu-imgBox"><img className='work-plusIcon' src={ plusIcon }/></div>
                                            <div className="work-menu-txtBox"><span className="work-menu-txt" onClick={() => onClickButton(i, todo.todoId) } >하위 할 일 추가</span></div>
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
                                            <button onClick={() => handleLateClick(i, 0)} className="todo-circle-btn">
                                                <div>
                                                    {todo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                    {todo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                    {todo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                </div>
                                            </button>
                                            :
                                            <button onClick={() => handleTodoClick(i, 0)} className="todo-circle-btn">
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
                                <span className='todaySmall-txt1' onClick={() => onClickWorkSelectModal(todo)} >{todo.content}</span>
                                : 
                                <span className='todaySmall-txt2'>{todo.content}</span>
                            }
                        </div>
                        <div className='todaySmall-txt2-box'>
                            <span className='todaySmall-txt2'>{todo.dueDate.substring(0,11)}</span>
                        </div>
                        <div className='todaySmall-txt3-box'>
                            <img className='work-green-clock' src={ clockGreen }/>
                            <span className='todaySmall-txt3'>{todo.dueDate.substring(11, 19)}</span>
                        </div>
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
                            <div className={isTodoDot[i] ? 'work-toggle-box' : 'work-hide-box'} >
                                <div className='work-menu-box'>
                                    <div className='work-menu-sec'>
                                        <div className="work-arrow-imgBox">
                                            <img className='work-arrow' src={ arrowtriangle } onClick={ onToggleNoti } />
                                            <div className={isNoti ? 'workNoti-toggle-box' : 'workNoti-hide-box'} >
                                                <div className="workNoti-box">
                                                    <img className='work-noti' src={ bellRed2 } />
                                                    <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: todo.content, targetUserId: todo.assignList[0].userId })}>Web & Mail</span>
                                                </div>
                                                <div className="workNoti-box">
                                                    <img className='work-noti' src={ bellGreen2 } />
                                                    <span className="workNoti-txt" onClick={() => onClickWeb({ content: todo.content, targetUserId: todo.assignList[0].userId })}>Web</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="work-menu-imgBox"><img className='work-plusIcon' src={ noti }/></div>
                                        <div className="work-menu-txtBox"><span className="work-menu-txt">알림 보내기</span></div>
                                    </div>
                                    <div className='work-menu-sec'>
                                        <div className="work-menu-imgBox"><img className='work-plusIcon' src={ plusIcon }/></div>
                                        <div className="work-menu-txtBox"><span className="work-menu-txt" onClick={() => onClickButton(i, todo.todoId) } >하위 할 일 추가</span></div>
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
                                                <button onClick={() => handleLateChildTodoClick(i, j, l)} className="todo-circle-btn">
                                                    <div>
                                                        {childAssign.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                        {childAssign.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                        {childAssign.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                    </div>
                                                </button>
                                                :
                                                <button onClick={() => handleChildTodoClick(i, j, l)} className="todo-circle-btn">
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
                                                <span className='todaySmall-txt1' onClick={() => onClickWorkSubSelectModal(childTodo)} >{childTodo.content}</span>
                                                : 
                                                <span className='todaySmall-txt2'>{childTodo.content}</span>
                                            }
                                        </div>
                                        <div className='todaySmall-txt2-box'>
                                            <span className='todaySmall-txt2'>{childTodo.dueDate.substring(0,11)}</span>
                                        </div>
                                        <div className='todaySmall-txt3-box'>
                                            <img className='work-green-clock' src={ clockGreen }/>
                                            <span className='todaySmall-txt3'>{childTodo.dueDate.substring(11, 19)}</span>
                                        </div>
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
                                                                    <img className='work-noti' src={ bellRed2 } />
                                                                    <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: childTodo.content, targetUserId: childAssign.userId })}>Web & Mail</span>
                                                                </div>
                                                                <div className="workNoti-box">
                                                                    <img className='work-noti' src={ bellGreen2 } />
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
                                            <button onClick={() => handleLateChildTodoClick(i, j, 0)} className="todo-circle-btn">
                                                <div>
                                                    {childTodo.assignList[0].status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                                    {childTodo.assignList[0].status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                                    {childTodo.assignList[0].status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                                </div>
                                            </button>
                                            :
                                            <button onClick={() => handleChildTodoClick(i, j, 0)} className="todo-circle-btn">
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
                                            <span className='todaySmall-txt1' onClick={() => onClickWorkSubSelectModal(childTodo)} >{childTodo.content}</span>
                                            : 
                                            <span className='todaySmall-txt2'>{childTodo.content}</span>
                                        }
                                    </div>
                                    <div className='todaySmall-txt2-box'>
                                        <span className='todaySmall-txt2'>{childTodo.dueDate.substring(0,11)}</span>
                                    </div>
                                    <div className='todaySmall-txt3-box'>
                                        <img className='work-green-clock' src={ clockGreen }/>
                                        <span className='todaySmall-txt3'>{childTodo.dueDate.substring(11, 19)}</span>
                                    </div>
                                    <div className='todaySmall-txt4-box'>
                                        <span className='todaySmall-txt4'>{childTodo.assignList[0].userName}</span>
                                    </div>
                                    <div className='todaySmall-img-box'>
                                        <img className='work-team-dot' src={ dot } onClick={() => {
                                            onToggleChildMenu(i, j, -1)
                                        }}/>
                                        <div className={isChildTodoDot[i][j] ? 'work-toggle-box' : 'work-hide-box'} >
                                            <div className='work-menu-box'>
                                                <div className='work-menu-sec'>
                                                    <div className="work-arrow-imgBox">
                                                        <img className='work-arrow' src={ arrowtriangle } onClick={ onToggleSubNoti } />
                                                        <div className={isSubNoti ? 'workNoti-toggle-box' : 'workNoti-hide-box'} >
                                                            <div className="workNoti-box">
                                                                <img className='work-noti' src={ bellRed2 } />
                                                                <span className="workNoti-txt" onClick={() => onClickWebAndMail({ content: childTodo.content, targetUserId: childTodo.assignList[0].userId })}>Web & Mail</span>
                                                            </div>
                                                            <div className="workNoti-box">
                                                                <img className='work-noti' src={ bellGreen2 } />
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

            {isOpen ? <SubWorkTableModal isOpen={isOpen} onClose={setIsOpen} onValueChange={handleChange} onValue = { handleEventClick } partList={partList} emitterId={emitterId} projectId={projectId} parentId={parentId} onValueTodo={handleTodo} setIsWorkOpen={setIsWorkOpen}/> : <></> }
            {isSelectModal ? <WorkTableSelectModal isOpen={isSelectModal} onClose={setIsSelectModal} data={selectData} projectId={projectId} emitterId={emitterId} onValueAll={handleWorkAll} partList={partList}/> : <></> }
            {isSelectSubModal ? <WorkTableSelectSubModal isOpen={isSelectSubModal} onClose={setIsSelectSubModal} data={selectSubData} projectId={projectId} emitterId={emitterId} partList={partList} onValueAll={handleSubWorkAll} /> : <></> }
        </div>
        

    );

}

export default WorkTable;