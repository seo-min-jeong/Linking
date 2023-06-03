import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProjectModal from "../ProjectModal"
import UpdateProjectModal from "../UpdateProjectModal"
import DeleteProjectModal from "../DeleteProjectModal"
import api from "../../utils/api"
import { useCookies } from 'react-cookie';

import './Header.css';

import dot from "../../icon/dot.png"
import selectIcon from "../../icon/selectIcon.png"
import updateIcon from "../../icon/updateIcon.png"
import deleteIcon from "../../icon/deleteIcon.png"

function Dot( props ) {
  const { projectId, onValueProject, ownerId } = props
  const user = JSON.parse(localStorage.getItem('user'))
  const [cookies] = useCookies(['session'])

  const [project, setProject] = useState({
    projectId: projectId,
    projectName: '',
    beginDate: new Date(),
    dueDate: new Date(),
    partList: [],
    ownerId: 0
  });

  const handleSubmit = event => {
    event.preventDefault()
    api.get('/projects/' + projectId)
      .then(response => {
        console.log(response.data.data)
        setProject({
          projectId: response.data.data.projectId,
          projectName: response.data.data.projectName,
          beginDate: response.data.data.beginDate,
          dueDate: response.data.data.dueDate,
          partList: response.data.data.partList,
          ownerId: response.data.data.ownerId
        })
          
      })
      .catch(error => {
        console.error(error);
      });

      setMenu(false);
      setIsOpen(isOpen => !isOpen);
  };
  const handleUpdateSubmit = event => {
    event.preventDefault()
    api.get('/projects/' + projectId)
      .then(response => {
        setProject({
          projectId: response.data.data.projectId,
          projectName: response.data.data.projectName,
          beginDate: response.data.data.beginDate,
          dueDate: response.data.data.dueDate,
          partList: response.data.data.partList,
          ownerId: response.data.data.ownerId
        })
          
      })
      .catch(error => {
        console.error(error);
      });

      setMenu(false);
      setIsUpdate(isUpdate => !isUpdate);
  };

    const MenuRef = useRef(null);

    const [isMenu, setMenu] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDelete, setIsDelete] = useState(false);

    const onClickMenu = () => {
      setMenu(isMenu => !isMenu);
    }

    useEffect(() => {
      const handleOutsideClose = (e) => {
        if(isMenu && (!MenuRef.current || !MenuRef.current.contains(e.target))) setMenu(isMenu => !isMenu);
      };
      document.addEventListener('click', handleOutsideClose);
      
      return () => document.removeEventListener('click', handleOutsideClose);
  }, [isMenu]);

    const onClickButton = () => {
      setMenu(false);
      setIsOpen(isOpen => !isOpen);
    }

    const onClickUpdateButton = () => {
      setMenu(false);
      setIsUpdate(isUpdate => !isUpdate);
    }

    const onClickDeleteButton = event => {
      event.preventDefault()
      api.get('/projects/' + projectId)
      .then(response => {
        setProject({
          projectId: response.data.data.projectId,
          projectName: response.data.data.projectName,
          beginDate: response.data.data.beginDate,
          dueDate: response.data.data.dueDate,
          partList: response.data.data.partList,
          ownerId: response.data.data.ownerId
        })
          
      })
      .catch(error => {
        console.error(error)
      })

      setMenu(false)
      setIsDelete(isDelete => !isDelete)
    }

    const navigate = useNavigate();

    const handleDeleteProject = () => {
      api.get('/projects/list/part/' + user.userId, { validateStatus: false })
        .then(respon => {
          if (respon.status === 404) {
            const temp = []
            onValueProject(temp)
          } else {
            onValueProject(respon.data.data)
          }
        })
        .catch(error => {
          console.error(error);
        })
    }

    const handleUpdateProject = (newValue) => {
      console.log(newValue)
      setProject(newValue)
    }

    return(
        <div ref={ MenuRef }>
            <img className="header-bar" src = { dot } onClick={ onClickMenu } />
            <div className={isMenu ? "info-menu-box" : "info-hide-box"} >
                <div className="info-box">
                  <div className="info-sec-box" onClick={ handleSubmit }>
                    <div><img className="info-sec-img" src = { selectIcon } /></div>
                    <span>프로젝트 정보 조회</span>
                  </div>
                  {ownerId === user.userId ? 
                  <>
                    <div className="info-sec-box" onClick={ handleUpdateSubmit }>
                      <div><img className="info-sec-img" src = { updateIcon } /></div>
                      <span>프로젝트 정보 수정</span>
                    </div>
                    <div className="info-sec-box" onClick={ onClickDeleteButton }>
                      <div><img className="info-sec-img" src = { deleteIcon } /></div>
                      <span>프로젝트 정보 삭제</span>
                    </div>
                  </>
                  :
                  <></>}
                </div>
            </div>
            {isOpen ? <ProjectModal isOpen={isOpen} onClose={onClickButton} data={project} ownerId={ownerId}/> : <></>} 
            {isUpdate ? <UpdateProjectModal isOpen={isUpdate} setIsUpdate={setIsUpdate} onClose={onClickUpdateButton} data={project} ownerId={ownerId} onValueProject={handleUpdateProject}/> : <></>} 
            {isDelete ? <DeleteProjectModal isDeleteTeam={isDelete} setDeleteTeam={setIsDelete} onClose={onClickDeleteButton} projectId={project.projectId} onValueProject={handleDeleteProject} ownerId={ownerId}/> : <></> }
        </div>
    );
}

export default Dot;