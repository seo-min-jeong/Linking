import React, { useState } from "react"
import Modal from 'react-modal'
import './ProjectModal.css'

function DeleteTeam(props) {
    const storedUser = localStorage.getItem('user');
    const users = JSON.parse(storedUser);

    const { isDeleteTeam, onClose, partList, onValueChange } = props

    const handleBtnClick = () => {
        onClose(isDeleteTeam => !isDeleteTeam)
        const selectedUserIdsSet = new Set(selectedUser)
        const unselectedPartList = partList.filter(user => !selectedUserIdsSet.has(user.userId))
        onValueChange('partList', unselectedPartList)
      }

      const handleOkClick = () => {
        onClose(isDeleteTeam => !isDeleteTeam)
    }

      const [selectedUser, setSelectedUserIds] = useState([])

        const handleCheckboxChange = (e) => {
            const userId = parseInt(e.target.getAttribute('data-user-id'))

            if (e.target.checked) {
                setSelectedUserIds((prevSelectedUserIds) => [...prevSelectedUserIds, userId])
            } else {
                setSelectedUserIds((prevSelectedUserIds) => prevSelectedUserIds.filter((id) => id !== userId))
            }
        }

    return(
        <Modal isOpen={isDeleteTeam} onRequestClose={onClose} className="team-modal">
            <div className="team-select-box">
                <div className="team-Input-close"><span onClick={ onClose }>x</span></div>
                <div className="team-delete-box">
                    <div><span className="team-txt">팀원 목록</span></div>
                    <div className="team-small-box"><span className="team-small-txt">삭제할 팀원을 선택해주세요.</span></div>
                </div>
                {partList.length > 1 ?
                <div className='team-one-box'>
                    {partList.map((user, index) => (
                        <div>
                        {users.userId === user.userId ? 
                        <></> 
                        : 
                        <label className="project-team-label">
                            <input 
                            type="checkbox" 
                            className="team-chk"
                            value={user.email}
                            data-first-name={user.firstName}
                            data-last-name={user.lastName}
                            data-user-id={user.userId}
                            onChange={handleCheckboxChange}
                            />
                            <i class="circle1"></i>
                            <div className="project-label-name"><span>{user.lastName}{user.firstName}</span></div>
                            <div><span>{user.email}</span></div>
                        </label>
                        }
                        </div>
                    ))}
                </div>
                :
                <div className='team-no-box'>
                    <span className="team-no-txt">삭제할 팀원이 없습니다.</span>
                </div>
                }
                <div className="team-oneBtn-box">
                    {partList.length > 1 ?
                    <button className="team-oneBtn" type="button" onClick={ handleBtnClick }>팀원 삭제</button>
                    :
                    <button className="team-oneBtn" type="button" onClick={ handleOkClick }>확인</button>
                    }
                </div>
            </div>
        </Modal>
    
      )
    }
  
    export default DeleteTeam