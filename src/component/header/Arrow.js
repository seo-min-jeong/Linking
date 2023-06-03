import React, { useState, useRef, useEffect } from "react";
import './Header.css';
import './Arrow.css';
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../CreateProjectModal"
import api from '../../utils/api';
import { useCookies } from 'react-cookie'

import arrowBelow from '../../icon/arrowBelow.png'
import arrowUp from '../../icon/arrowUp.png'
import plus from '../../icon/plus.png'

function Arrow(props) {
  const user = JSON.parse(localStorage.getItem('user'));
    const { onValueChange, onValueDocument, projectList, setMenu, onValueProjectLists, setIsNo, isNo } = props;
    const [projects, setProjects] = useState([])
    const [cookies] = useCookies(['session']);

    let now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1
    let day = now.getDate()

    useEffect(() => {
      setProjects(projectList)
  }, [projectList]);

    const handleSubmit = event => {
      if(isArrow == false) {
        setArrow(true)
        api.get('/projects/list/part/' + user.userId)
            .then(response => {
                setProjects(response.data.data)
            })
            .catch(error => {
                console.error(error)
            })
      } else {
        setArrow(false)
      }

    }

    const arrowMenuRef = useRef(null);
    const [isArrow, setArrow] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isArrow && (!arrowMenuRef.current || !arrowMenuRef.current.contains(e.target))) setArrow(isArrow => !isArrow);
        };
        document.addEventListener('click', handleOutsideClose);
        
        return () => document.removeEventListener('click', handleOutsideClose);
    }, [isArrow]);

    const onClickButton = () => {
        setArrow(false);
        setIsOpen(isOpen => !isOpen);
    }
    
    const navigate = useNavigate()

    const onChangeProject = (part) => {
      api.get('/todos/list/monthly/project/' + part.projectId + '/' + year + '/' + month)
            .then(response => {
                const todoMonth  = response.data.data
                if(todoMonth === null) {
                    todoMonth = []
                }

                api.get('/todos/list/today/project/' + part.projectId + '/urgent')
                .then(response => {
                    const todoDay  = response.data.data
                    if(todoDay === null) {
                      todoDay = []
                    }

                    api.get('/assigns/ratio/project/' + part.projectId)
                    .then(response => {
                      const graph  = response.data.data
                      const totalTodo  = { todoMonth: todoMonth, todoDay: todoDay, beginDate: part.beginDate, dueDate: part.dueDate, graph:graph, newProjectId: part.projectId }
                      navigate(process.env.PUBLIC_URL + '/home', {state: totalTodo})
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
            })
     
      setArrow(false);
      onValueChange('projectName', part.projectName)
      onValueChange('projectId', part.projectId)
      onValueChange('beginDate', part.beginDate)
      onValueChange('dueDate', part.dueDate)
      onValueChange('partList', part.partList)
      onValueChange('ownerId', part.ownerId)
      onValueChange('isRegister', false)

      setMenu(false)
    }

    return(
        <div className="arrow-menu" ref={ arrowMenuRef }> 
          <button className="arrowBtn" onClick={ handleSubmit }>
            {isArrow ? 
            <div className="arrowBox"><img className="arrowBelow" src = { arrowBelow }/></div> : <div className="arrowBox"><img className="arrowUp" src = { arrowUp }/></div>}
          </button>
          <div className={isArrow ? "arrowShow-menu" : "arrowHide-menu"}>
            <div className="arrowMenu-bar">
            {projects.map((part, index) => (
              <div className="arrow-project" key={index}>
                <span className="arrow-txt" onClick={() => onChangeProject({ projectName: part.projectName, projectId: part.projectId, beginDate: part.beginDate, dueDate: part.dueDate, partList: part.partList, ownerId: part.ownerId })}>{part.projectName}</span>
              </div>
            ))}
              <div className="arrow-project">
                <img className="arrow-plus" src= { plus } onClick={ onClickButton } />
                <span className="arrow-plus-txt">&nbsp;&nbsp;&nbsp;프로젝트 생성</span>    
              </div>
            </div>
          </div>
          {isOpen ? <CreateProjectModal isOpen={isOpen} setIsOpen={setIsOpen} onClose={onClickButton} /> : <></> }

        </div>
    );
}

export default Arrow;