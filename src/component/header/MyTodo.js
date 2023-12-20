import React, { useState, useRef } from "react"
import api from '../../utils/api'

import './Header.css'

import circleDefault from "../../icon/circleDefault.png"
import circleIng from "../../icon/circleIng.png"
import circleCheck from "../../icon/circleCheck.png"
import clockGreen from "../../icon/clockGreen.png"
import circleIncomplete from "../../icon/circleIncomplete.png"
import circleInprogress from "../../icon/circleInprogress.png"
import clockRed from "../../icon/clockRed.png"

function MyTodo(props) {
    const { projectId, onValueTodo } = props
    const user = JSON.parse(localStorage.getItem('user'))
    const [isTodo, setTodo] = useState(false)

    const [myTodo, setMyTodo] = useState([])
    const todoToggleMenu = () => {
        if(isTodo === false) {
            api.get('/todos/list/today/user/' + user.userId + '/urgent')
            .then(response => {
                const data  = response.data.data
                setMyTodo(data)
            })
            .catch(error => {
                console.error(error)
            })
            setTodo(true)
        } else {
            setTodo(false)
        }
    }

    let now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1

    //파란색 상태체크
    const handleClick = (i) => {
        setMyTodo(prevTodoList => {
            const updatedTodoList = [...prevTodoList]
            const updatedState = { ...updatedTodoList[i] }

            let now = new Date()
            const date = new Date(updatedTodoList[i].dueDate)

            if (updatedState.status === 'BEFORE_START') {
                updatedState.status = 'IN_PROGRESS'
            } else if (updatedState.status === 'IN_PROGRESS') {
                updatedState.status = 'COMPLETE'
            } else {
                if(date < now) {
                    updatedState.status = 'INCOMPLETE'
                } else {
                    updatedState.status = 'BEFORE_START'
                }
            }
            updatedTodoList[i] = updatedState;

            const todoStatus = {
                emitterId: -1,
                assignId: updatedState.assignId,
                status: updatedState.status,
            }

            api.put('/assigns/status', todoStatus)
            .then(() => {
                //할일 차트 비율
                api.get('/assigns/ratio/project/' + projectId)
                    .then(respon => {
                        //할일 리스트
                        api.get('/todos/list/today/project/' + projectId + '/urgent')
                        .then(response => {
                            onValueTodo('ratio', respon.data.data)
                            onValueTodo('todo', response.data.data)
                        })
                        .catch(error => {
                            console.error(error)
                        })
                    })
                    .catch(error => {
                        console.error(error)
                    })

                    //할일 페이지로 보내주기
                    api.get('/todos/list/monthly/project/' + projectId + '/' + year + '/' + month)
                    .then(response => {
                        onValueTodo('monthList', response.data.data)
                    })
                    .catch(error => {
                        console.error(error)
                    })
            })
            .catch(error => {
              console.error(error)
            });

            return updatedTodoList
            })
        }

        //빨강색 상태체크
        const handleLateClick = (i) => {
            setMyTodo(prevTodoList => {
                const updatedTodoList = [...prevTodoList]
                const updatedState = { ...updatedTodoList[i] }
    
                if (updatedState.status === 'INCOMPLETE') {
                    updatedState.status = 'INCOMPLETE_PROGRESS'
                } else if (updatedState.status === 'INCOMPLETE_PROGRESS') {
                    updatedState.status = 'COMPLETE'
                } else {
                    updatedState.status = 'INCOMPLETE'
                }
                updatedTodoList[i] = updatedState
    
                const todoStatus = {
                    emitterId: -1,
                    assignId: updatedState.assignId,
                    status: updatedState.status,
                }

                //할일 차트 비율
                api.put('/assigns/status', todoStatus)
                .then(() => {
                    //할일 차트 비율
                    api.get('/assigns/ratio/project/' + projectId)
                        .then(respon => {
                            //할일 리스트
                            api.get('/todos/list/today/project/' + projectId + '/urgent')
                            .then(response => {
                                onValueTodo('ratio', respon.data.data)
                                onValueTodo('todo', response.data.data)
                            })
                            .catch(error => {
                                console.error(error);
                            })
                        })
                        .catch(error => {
                            console.error(error);
                        })
                })
                .catch(error => {
                  console.error(error);
                });
    
                return updatedTodoList;
                })
            };

    return(
        <div className="todo-menu">
            <div className="todo-txt-box"><span className="todo-txt" onClick={ todoToggleMenu }>MY TODO</span></div>
            <div className={isTodo ? "todoShow-menu" : "todoHide-menu"}>
                <div className="todoMenu-bar">
                    <div className="todo-list-box">
                        <span className="todo-list">오늘 할 일</span>
                    </div>
                    {myTodo.length === 0 ? 
                    <div className="mytodo-no-box">
                        <span className="mytodo-no-txt">오늘 할일이 없습니다.</span>
                    </div> 
                    : 
                    <>
                    {myTodo.map((todo, i) => (
                        <div className="todo-box" key={i}>
                            {todo.status === 'INCOMPLETE' || todo.status === 'INCOMPLETE_PROGRESS' ?
                            <button style={{ cursor: 'pointer' }} onClick={() => handleLateClick(i)} className="mytodo-circle-btn">
                                <div>
                                    {todo.status === 'INCOMPLETE' && <img src={circleIncomplete} className='todo-check-img'/>}
                                    {todo.status === 'INCOMPLETE_PROGRESS' && <img src={circleInprogress} className='todo-check-img' />}
                                    {todo.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                </div>
                            </button>
                            :
                            <button style={{ cursor: 'pointer' }} onClick={() => handleClick(i)} className="mytodo-circle-btn">
                                <div>
                                    {todo.status === 'BEFORE_START' && <img src={circleDefault} className='todo-check-img'/>}
                                    {todo.status === 'IN_PROGRESS' && <img src={circleIng} className='todo-check-img' />}
                                    {todo.status === 'COMPLETE' && <img src={circleCheck} className='todo-check-img' />}
                                </div>
                            </button>
                            }
                            <div className="mytodo-box">
                                <li className="todo-content">{todo.content}</li>
                                {todo.status === 'INCOMPLETE' || todo.status === 'INCOMPLETE_PROGRESS' ?
                                    <div>
                                        <img className='work-green-clock' src={ clockRed }/>
                                        <span className="mytodo-red-txt">{todo.dueDate.substring(11, 19)}</span>    
                                    </div>
                                    : 
                                    <div>
                                        <img className='work-green-clock' src={ clockGreen }/>
                                        <span className="mytodo-txt">{todo.dueDate.substring(11, 19)}</span>    
                                    </div>
                                }
                            </div>
                            <div className="todo-charge">{todo.projectName}</div>
                        </div>
                    ))}
                    </>
                    }
                </div>
            </div>
        </div>
    )
}

export default MyTodo