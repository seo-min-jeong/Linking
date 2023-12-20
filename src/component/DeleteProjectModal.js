import React from "react"
import Modal from 'react-modal'
import './ProjectModal.css'
import { useNavigate } from "react-router-dom"
import api from "../utils/api"

function DeleteProjectModal(props) {
    const { isDeleteTeam, setDeleteTeam, onClose, projectId, onValueProject } = props
  
    const navigate = useNavigate()

    const onClickDelOk = event => {
        event.preventDefault()
        
        api.delete('/projects/' + projectId)
          .then(() => {
            onValueProject('delete', true)
          })
          .catch(error => {
            console.error(error)
          })
        setDeleteTeam(false)
        navigate(process.env.PUBLIC_URL + '/home')
    }

    const onClickDelCancel = () => {
        setDeleteTeam(false)
    }

      return(
        <Modal isOpen={isDeleteTeam} onRequestClose={onClose} className="delete-modal">
            <div className="del-checkBox">
                <div className="del-checkTxt-box"><span className="del-checkTxt">프로젝트를 삭제하시겠습니까?</span></div>
                <div className="delete-CheckBtn">
                  <button className="delBtn" onClick={ onClickDelOk }>확인</button>
                  <button className="delBtn" onClick={ onClickDelCancel }>취소</button>
                </div>
            </div> 
        </Modal>
    
      )
    }
  
    export default DeleteProjectModal