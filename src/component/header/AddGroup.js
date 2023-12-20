import React, { useState } from "react"
import Modal from 'react-modal'
import './Group.css'
import api from "../../utils/api"

function AddGroup(props) {
    const { onClose, onButtonClick, projectId, order } = props
    const user = JSON.parse(localStorage.getItem('user'))
    const [name, setName] = useState('')

    const onClickClose = () => {
        onClose(false);
    }

    const [inputCount, setInputCount] = useState(0)

    const handleChange = event => {
        setInputCount(event.target.value.length);
        setGroup({
            ...group,
            [event.target.name]: event.target.value
        })
        if (event.target.name === 'name') {
            setName(event.target.value)
          } 
    }

    const [group, setGroup] = useState({
        projectId: projectId,
        name: '',
        order: order
    })

    const [newGroup, setNewGroup] = useState({
        projectId: projectId,
        name: '',
        pageResList: [],
        groupId: 0
    })

    const handleClick = event => {
        event.preventDefault()
        api.post('/groups', group, {
            headers: {
                'userId': user.userId,
            }
        })
          .then(response => {
            const updatedNewGroup = {
                projectId: projectId,
                name: response.data.data.name,
                pageResList: [],
                groupId: response.data.data.groupId
            }
            console.log(group)
            setNewGroup(updatedNewGroup)
            onButtonClick('newGroup', updatedNewGroup)
            onClose(false)
          })
          .catch(error => {
            console.log(group)
            console.error(error);
          })
      }

    return(
        <Modal
        isOpen={true}
        className="group-modal"
        >
            <div className="group-modalBox">
                <div className="group-closeBox"><span className="group-closeTxt" onClick={ onClickClose }>x</span></div>
                <div className="group-txt-box"><span className="group-txt">추가할 그룹 명을 입력해 주세요.</span></div>
                <div className='group-Input-box'>
                    <input 
                    className='group-Input' 
                    type='text' 
                    name='name' 
                    value={name} 
                    onChange={handleChange} 
                    placeholder="Enter the group name"
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

export default AddGroup;