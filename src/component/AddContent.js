import React, { useState } from "react"
import Modal from 'react-modal'
import './Content.css'


function AddContent(props) {
    const { onClose, onButtonClick } = props
    const [title, setTitle] = useState('')

    const handleChange = (event) => {
        setTitle(event.target.value)
    }
    function handleClick() {
        onButtonClick('title', title)
        onClose(false)
    }

    const onClickClose = () => {
        onClose(false)
    }

    return(
        <Modal
        isOpen={true}
        className="content-modal"
        >
            <div className="content-modalBox">
                <div className="content-closeBox"><span className="content-closeTxt" onClick={ onClickClose }>x</span></div>
                <div><span className="content-txt">추가할 목차 명을 입력해주세요.</span></div>
                <div className='content-Input-box'><input className='content-Input' type='text' name='title' value={title} onChange={handleChange} /></div>
                <div className="contentBtn-box"><button className="contentBtn" onClick={handleClick}>저장</button></div>
            </div>
        </Modal>
    )
}

export default AddContent