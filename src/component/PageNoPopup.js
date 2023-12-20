import React from "react"
import Modal from 'react-modal'
import './PagePopup.css'
import { useNavigate } from "react-router-dom"

function PageNoPopup(props) {
    const { isNoPage, setIsNoPage } = props
  
    const navigate = useNavigate()

    const onClickDelOk = () => {
        setIsNoPage(null)
        navigate(process.env.PUBLIC_URL + '/home')
    }

      return(
        <Modal isOpen={isNoPage} className="no-page-modal">
            <div className="no-page-checkBox">
                <div className="no-page-box">
                    <span className="no-page-txt" style={{ whiteSpace: "pre-line" }}>
                        해당 페이지가 삭제되어 홈으로 이동합니다.
                    </span>
                </div>
                <div className="no-page-btn">
                    <button className="no-page-okBtn" onClick={ onClickDelOk }>확인</button>
                </div>
            </div> 
          
        </Modal>
    
      )
    }
  
    export default PageNoPopup