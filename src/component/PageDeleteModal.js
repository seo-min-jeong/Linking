import React from "react"
import Modal from 'react-modal'
import './ProjectModal.css'
import api from '../utils/api'
import { useNavigate } from "react-router-dom"

function PageDeleteModal(props) {
    const { isDeletePage, setIsDeletePage, onClose, pageId } = props
    const user = JSON.parse(localStorage.getItem('user'))
  
    const navigate = useNavigate();

    const onClickDelOk = () => {
        setIsDeletePage(false);
        api.delete('/pages/' + pageId, {
            headers: {
                userId: user.userId
            }
        })
        .catch(error => {
          console.error(error)
        })
        navigate('/home')
    }

    const onClickDelCancel = () => {
        setIsDeletePage(false);
    }

      return(
        <Modal isOpen={isDeletePage} onRequestClose={onClose} className="delete-modal">
            <div className="del-checkBox">
                <div className="del-checkTxt-box"><span className="del-checkTxt">해당 페이지를 삭제하시겠습니까?</span></div>
                <div className="delete-CheckBtn">
                     <button className="delBtn" onClick={ onClickDelOk }>확인</button>
                    <button className="delBtn" onClick={ onClickDelCancel }>취소</button>
                </div>
            </div> 
        </Modal>
      )
    }
  
    export default PageDeleteModal