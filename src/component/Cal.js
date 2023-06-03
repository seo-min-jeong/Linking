import React, { useState, useRef, useEffect } from "react";
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from "react-router-dom";
import CreateWorkModal from "./CreateWorkModal"
import "./CustomCalendar.css";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGripPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from '@fullcalendar/core/locales/ko';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import api from '../utils/api'
import { useCookies } from 'react-cookie'

import WorkModal from "./WorkModal";
import WorkTable from "./WorkTable";
import WorkAllTable from "./WorkAllTable";

import plus from "./icon/plus.png"
import dot from "../icon/dot.png"

import "./Cal.css"

function Cal(props) {
  const{ events, setEvents } = props
  const navigate = useNavigate()
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'))
  const [monthList, setMonthList] = useState(location.state.data)
  const [partList, setPartList] = useState(location.state.partList)
  const projectId = location.state.projectId
  // const [cookies] = useCookies(['session'])
  const [dayList, setDayList] = useState([])

  let now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  let day = now.getDate()

  // const [events, setEvents] = useState(monthList.map((item) => ({
  //   title: item.content,
  //   start: new Date(
  //     Date.UTC(
  //       parseInt(item.startDate.split(/[- :]/)[0]), // year
  //       parseInt(item.startDate.split(/[- :]/)[1])-1, // month
  //       parseInt(item.startDate.split(/[- :]/)[2]), // day
  //       parseInt(item.startDate.split(/[- :]/)[3]), // hour
  //       parseInt(item.startDate.split(/[- :]/)[4]), // minute
  //       0, // second
  //       0 // millisecond
  //     )
  //   ).toISOString(),
  //   end: new Date(
  //     Date.UTC(
  //       parseInt(item.dueDate.split(/[- :]/)[0]), // year
  //       parseInt(item.dueDate.split(/[- :]/)[1])-1, // month
  //       parseInt(item.dueDate.split(/[- :]/)[2]), // day
  //       parseInt(item.dueDate.split(/[- :]/)[3]), // hour
  //       parseInt(item.dueDate.split(/[- :]/)[4]), // minute
  //       0, // second
  //       0 // millisecond
  //     )
  //   ).toISOString(),
  //   id: item.todoId
  // })))

//   const[emitterId, setEmitterId] = useState()
//   let emitter = 0
//   const EventSource = EventSourcePolyfill

// console.log(monthList)

//   useEffect(() => {
//     const newEventSource = new EventSource('http://43.201.231.51:8080/todos/connect/web/project/' + projectId + '/user/' + user.userId,
//         { 
//           headers: { 
//             'Cache-Control': 'no-cache',
//             'Last-Event-ID': '',
//             'Content-Type': 'text/event-stream',
//             'X-Accel-Buffering': 'no'
//            },
//           retry: 600000,
//           timeout: 6000000
//         }
//       )

//     newEventSource.onopen = () => {
//         console.log('!!!!!!!Calendar Connected to server!')
//     }
  
//     //연결
//     newEventSource.addEventListener('connect', (event) => {
//         const newData = JSON.parse(event.data)
//         console.log(event.data)
//         emitter = newData.emitterId
//         setEmitterId(newData.emitterId)
//     })
    
//     //상위할일 추가
//     newEventSource.addEventListener('postParent', (event) => {
//       const newData = JSON.parse(event.data)

//       setEvents(prevEvents => [
//         ...prevEvents, 
//         {
//           title: newData.content,
//           start: new Date(
//             Date.UTC(
//               parseInt(newData.startDate.split(/[- :]/)[0]), // year
//               parseInt(newData.startDate.split(/[- :]/)[1])-1, // month
//               parseInt(newData.startDate.split(/[- :]/)[2]), // day
//               parseInt(newData.startDate.split(/[- :]/)[3]), // hour
//               parseInt(newData.startDate.split(/[- :]/)[4]), // minute
//               0, 
//               0 
//             )
//           ).toISOString(),
//           end: new Date(
//             Date.UTC(
//               parseInt(newData.dueDate.split(/[- :]/)[0]), // year
//               parseInt(newData.dueDate.split(/[- :]/)[1])-1, // month
//               parseInt(newData.dueDate.split(/[- :]/)[2]), // day
//               parseInt(newData.dueDate.split(/[- :]/)[3]), // hour
//               parseInt(newData.dueDate.split(/[- :]/)[4]), // minute
//               0, 
//               0 
//             )
//           ).toISOString(),
//           id: newData.todoId
//         }
//       ])
//       setMonthList(prevMonthList => [...prevMonthList, newData]);
//     })

//     //하위할일 추가
//     newEventSource.addEventListener('postChild', (event) => {
//       const newData = JSON.parse(event.data)
//       const updatedMonthList = monthList.map(item => {
//         if (item.todoId === newData.parentId) {
//           return {
//             ...item,
//             childTodoList: [...item.childTodoList, newData]
//           };
//         }
//         return item;
//       });
      
//       setMonthList([...updatedMonthList]);
//     })

//     //상위할일 수정
//     newEventSource.addEventListener('updateParent', (event) => {
//       const newData = JSON.parse(event.data)
//       setEvents(prevEvents => {
//         return prevEvents.map(prevEvent => {
//           if (prevEvent.id === newData.todoId) {
//             return {
//               ...prevEvent, // Preserve existing event properties
//               title: newData.content,
//               start: new Date(
//                 Date.UTC(
//                   parseInt(newData.startDate.split(/[- :]/)[0]), // year
//                   parseInt(newData.startDate.split(/[- :]/)[1])-1, // month
//                   parseInt(newData.startDate.split(/[- :]/)[2]), // day
//                   parseInt(newData.startDate.split(/[- :]/)[3]), // hours
//                   parseInt(newData.startDate.split(/[- :]/)[4]), // minutes
//                   0, // second
//                   0 // millisecond
//                 )
//               ).toISOString(),
//               end: new Date(
//                 Date.UTC(
//                   parseInt(newData.dueDate.split(/[- :]/)[0]), // year
//                   parseInt(newData.dueDate.split(/[- :]/)[1])-1, // month
//                   parseInt(newData.dueDate.split(/[- :]/)[2]), // day
//                   parseInt(newData.dueDate.split(/[- :]/)[3]), // hour
//                   parseInt(newData.dueDate.split(/[- :]/)[4]), // minutes
//                   0, // second
//                   0 // millisecond
//                 )
//               ).toISOString(),
//               id: newData.todoId
//             }
//           } else {
//             return prevEvent; 
//           }})
//       })

//       setMonthList(prevMonthList => {
//         const updatedMonthList = prevMonthList.map(item => {
//           if (item.todoId === newData.todoId) {
//             return newData;
//           }
//           return item;
//         });
      
//         return updatedMonthList;
//       })
//   })

//     //하위할일 수정
//     newEventSource.addEventListener('updateChild', (event) => {
//       const newData = JSON.parse(event.data)

//       setMonthList(prevMonthList => {
//         return prevMonthList.map(item => {
//           if (item.todoId === newData.parentId) {
//             const updatedChildTodoList = item.childTodoList.map(childTodo => {
//               if (childTodo.todoId === newData.todoId) {
//                 return {
//                   ...childTodo,
//                   ...newData
//                 }
//               }
//               return childTodo;
//             })
      
//             return {
//               ...item,
//               childTodoList: updatedChildTodoList
//             }
//           }
//           return item;
//         })
//       })
//     })

//     //상위할일 상태 업데이트
//     newEventSource.addEventListener('updateParentStatus', (event) => {
//       const newData = JSON.parse(event.data)
//       const updatedMonthList = monthList.map((item) => {
//         if (item.todoId === newData.todoId) {
//           const updatedAssignList = item.assignList.map((assignItem) => {
//             if (assignItem.assignId === newData.assignId) {
//               return {
//                 ...assignItem,
//                 status: newData.status,
//               };
//             }
//             return assignItem;
//           });
    
//           return {
//             ...item,
//             assignList: updatedAssignList,
//           };
//         }
//         return item;
//       });
    
//       setMonthList(updatedMonthList);
//     })

//     //하위할일 상태 업데이트
//     newEventSource.addEventListener('updateChildStatus', (event) => {
//       const newData = JSON.parse(event.data)
//       const updatedMonthList = monthList.map((item) => {
//         if (item.todoId === newData.parentId) {
//           const updatedChildTodoList = item.childTodoList.map((childTodo) => {
//             if (childTodo.todoId === newData.todoId) {
//               const updatedAssignList = childTodo.assignList.map((assignItem) => {
//                 if (assignItem.assignId === newData.assignId) {
//                   return {
//                     ...assignItem,
//                     status: newData.status,
//                   };
//                 }
//                 return assignItem;
//               });
    
//               return {
//                 ...childTodo,
//                 assignList: updatedAssignList,
//               };
//             }
//             return childTodo;
//           });
    
//           return {
//             ...item,
//             childTodoList: updatedChildTodoList,
//           };
//         }
//         return item;
//       });
    
//       setMonthList(updatedMonthList);
//     })

//     //상위할일 삭제
//     newEventSource.addEventListener('deleteParent', (event) => {
//       const newData = JSON.parse(event.data)
 
//       setEvents(prevEvents => {
//         return prevEvents.filter(prevEvent => prevEvent.id !== newData.todoId)
//       })
//       setMonthList(prevMonthList => {
//         return prevMonthList.filter(item => item.todoId !== newData.todoId)
//       })
//     })

//     //하위할일 삭제
//     newEventSource.addEventListener('deleteChild', (event) => {
//       const newData = JSON.parse(event.data)
//       const updatedMonthList = monthList.map(item => {
//         if (item.todoId === newData.parentId) {
//           const updatedChildTodoList = item.childTodoList.filter(childTodo => childTodo.todoId !== newData.todoId)
//           return {
//             ...item,
//             childTodoList: updatedChildTodoList
//           }
//         }
//         return item;
//       })
//       setMonthList(updatedMonthList)
//     })

//     //할일 sse 종료
//     return() => {
//         newEventSource.close()
//         api.get('/todos/disconnect/' + emitter)
//         .then()
//         .catch(error => {
//             console.error(error)
//         })
//         console.log('Calendar close!!!!!!!!!!!!!!!!!!!!')
//     }
//   }, [user.userId])

    const [isWork, setWork] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const onToggleMenu = () => {
        setWork(isWork => !isWork);
    }

    const onClickButton = () => {
        setIsOpen(isOpen => !isOpen)
    }

    const [valuePeople, setValuePeople] = useState([])

    const [isWorkOpen, setIsWorkOpen] = useState(true);
    const [clickedEvent, setClickedEvent] = useState(null);
    const handleEventClick = (info) => {
        setIsWorkOpen(false);
        info.event.people = valuePeople;
        setClickedEvent(info.event); 
    }

    //View Monthly 클릭
    const onClickMonthly = () => {
      api.get('/todos/list/monthly/project/' + projectId + '/' + year + '/' + month)
        .then(response => {
          setMonthList(response.data.data)
          const data  = response.data.data
            if(data === null) {
                data = []
            }
            const info  = { data: data, projectId: projectId, partList: partList }
            navigate(process.env.PUBLIC_URL + '/calendar', {state: info})
      })
      // setIsWorkOpen(true)
    }

    const handleDateClick = (clickInfo) => {
      const dateArr = clickInfo.dateStr.split("-")
      const year = dateArr[0];
      const month = dateArr[1];
      const day = dateArr[2];

      api.get('/todos/list/daily/project/' + projectId + '/' + year + '/' + month + '/' + day)
            .then(response => {
                setDayList(response.data.data)
                const data  = response.data.data
                if(data === null) {
                    data = []
                }
                const info  = { data: data, projectId: projectId, partList: partList }
                navigate(process.env.PUBLIC_URL + '/calendar', {state: info})
                // setIsWorkOpen(false)
            })
            .catch(error => {
                console.error(error)
            })
    }

  const calendarRef = useRef(null);

  function handlePreMonth() {
    const calendarApi = calendarRef.current.getApi()
    const currentYear = calendarApi.getDate().getFullYear();
    const currentMonth = calendarApi.getDate().getMonth();
    const firstDayOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    calendarApi.gotoDate(firstDayOfPrevMonth);

    const prevMonth = firstDayOfPrevMonth.getMonth() + 1
    const prevYear = firstDayOfPrevMonth.getFullYear()
    api.get('/todos/list/monthly/project/' + projectId + '/' + prevYear + '/' + prevMonth)
        .then(response => {
            setEvents(response.data.data.map((item) => ({
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
            setMonthList(response.data.data)
        })
        .catch(error => {
            console.error(error)
        })
  }
  function handleNextMonth() {
    const calendarApi = calendarRef.current.getApi()
    const currentYear = calendarApi.getDate().getFullYear();
    const currentMonth = calendarApi.getDate().getMonth();
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
    calendarApi.gotoDate(firstDayOfNextMonth)

    const nextMonth = firstDayOfNextMonth.getMonth() + 1
    const nextYear = firstDayOfNextMonth.getFullYear()
    api.get('/todos/list/monthly/project/' + projectId + '/' + nextYear + '/' + nextMonth)
        .then(response => {
          setEvents(response.data.data.map((item) => ({
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
          setMonthList(response.data.data)
        })
        .catch(error => {
            console.error(error)
        })
  }

  const handleTodo = (newValue) => {
    setMonthList(newValue)
    setEvents(newValue.map((item) => ({
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

    )
    setIsWorkOpen(true);
  } 

  const handleWorkAll = (newValue) => {
    setEvents(newValue.map((item) => ({
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

    )
  } 

  const handleWorkOne = (newValue) => {
    setEvents(newValue.map((item) => ({
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

    )
  } 

  useEffect(() => {
    setIsWorkOpen(true);
    setMonthList(monthList)
    console.log(monthList, '바뀜')
  }, [monthList]);

    return (
        <div className='calendarBox'>
          <div>
            <div className='totalCalBox'>
                <div className='calendarBox2'>
                    <div className='calenBox'><span className='cal-total-txt' onClick={onClickMonthly}>View Monthly</span></div>
                    <div className="custom-calendar">
                        <FullCalendar 
                        defaultView="dayGridMonth" 
                        plugins={[ dayGridPlugin, timeGripPlugin, interactionPlugin ]}
                        className="custom-fullCal"
                        headerToolbar={{
                            // start: "title prevYear nextYear",
                            start: "title",
                            center: "",
                            end: "prev today next",
                        }}
                        dateClick={handleDateClick}
                        events={events}
                        ref={calendarRef}

                        eventLimit={true}
                        dayMaxEvents={1}

                        titleFormat={{
                            year: 'numeric',
                            month: 'long'
                          }} 
                          customButtons={{
                            // prevYear: {
                            //   text: 'Previous Year',
                            //   click: handlePrevYear
                            // },
                            // nextYear: {
                            //   text: 'Next Year',
                            //   click: handleNextYear
                            // },
                            prev: {
                              click: handlePreMonth
                            },
                            next: {
                              click: handleNextMonth
                            }
                          }}
                        />
                    </div>
                </div>
                {/* {isWorkOpen ? <WorkAllTable tableList={monthList} setTableList={setMonthList}  projectId={projectId} emitterId={emitterId} partList={partList} onValueWorkAll={handleWorkAll}/> : <WorkTable event={dayList} projectId={projectId} emitterId={emitterId} partList={partList} onValueWorkOne={handleWorkOne} />} */}
            </div>
            </div>
            {/* {isOpen ? <CreateWorkModal isOpen={isOpen} onClose={setIsOpen} onValueChange={handleChange} onValue = { handleEventClick } partList={partList} emitterId={emitterId} projectId={projectId} onValueTodo={handleTodo} setIsWorkOpen={setIsWorkOpen}/> : <></> } */}
        </div>

    );

}

export default Cal;