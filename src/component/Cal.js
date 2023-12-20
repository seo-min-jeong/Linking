import React, { useState, useRef, useEffect } from "react"
import 'react-calendar/dist/Calendar.css'
import { useNavigate } from "react-router-dom"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGripPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { useLocation } from 'react-router-dom'
import api from '../utils/api'

import "./Cal.css"

function Cal(props) {
  const{ events, setEvents, onTableList } = props
  const navigate = useNavigate()
  const location = useLocation()
  const [monthList, setMonthList] = useState(location.state.data)
  const [partList, setPartList] = useState(location.state.partList)
  const projectId = location.state.projectId
  const [dayList, setDayList] = useState([])

  let now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1

    //View Monthly 클릭
    const onClickMonthly = () => {
      api.get('/todos/list/monthly/project/' + projectId + '/' + year + '/' + month)
        .then(response => {
          setMonthList(response.data.data)
          const data  = response.data.data
            if(data === null) {
              onTableList([])
            } else {
              onTableList(response.data.data)
            }
      })
    }

    const handleDateClick = (clickInfo) => {
      const dateArr = clickInfo.dateStr.split("-")
      const year = dateArr[0];
      const month = dateArr[1];
      const day = dateArr[2];

      api.get('/todos/list/daily/project/' + projectId + '/' + year + '/' + month + '/' + day)
            .then(response => {
                setDayList(response.data.data)
                console.log(response.data.data)
                const data  = response.data.data
                if(data === null) {
                    data = []
                }
                const info  = { data: data, projectId: projectId, partList: partList }
                navigate(process.env.PUBLIC_URL + '/calendar', {state: info})
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

  useEffect(() => {
    setIsWorkOpen(true);
    setMonthList(monthList)
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
             </div>
            </div>
       </div>
    )
}

export default Cal