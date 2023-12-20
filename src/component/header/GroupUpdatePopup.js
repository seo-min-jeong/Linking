import React, { useState } from "react"
import Modal from 'react-modal'
import './Group.css'


function GroupUpdatePopup(props) {
    const { onClose, onButtonClick, name } = props
    const [groupName, setGroupName] = useState('')

    function handleClick() {
        onButtonClick('name', groupName)
        onClose(false)
    }

    const onClickClose = () => {
        onClose(false)
    }

    const [inputCount, setInputCount] = useState(0)

    const handleChange = event => {
        setInputCount(event.target.value.length)
        if (event.target.name === 'groupName') {
            setGroupName(event.target.value)
          } 
    };

    return(
        <Modal
        isOpen={true} 
        className="group-modal"
        >
            <div className="group-modalBox">
                <div className="group-closeBox"><span className="group-closeTxt" onClick={ onClickClose }>x</span></div>
                <div className="group-txt-box"><span className="group-txt">수정할 그룹 명을 입력해 주세요.</span></div>
                <div className='group-Input-box'>
                    <input 
                    className='group-Input' 
                    type='text' 
                    name='groupName' 
                    value={groupName} 
                    onChange={handleChange} 
                    placeholder={name}
                    maxLength={15}
                    >
                    </input>
                    <p className="input-count-txt">
                        <span>{inputCount}</span>
                        <span>&nbsp;/ 15</span>
                    </p>
                    </div>
                <div className="groupBtn-box"><button className="groupBtn" onClick={handleClick}>저장</button></div>
            </div>
        </Modal>
    )
}

export default GroupUpdatePopup