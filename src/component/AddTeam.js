import React, { useState } from "react"
import Modal from 'react-modal'
import './ProjectModal.css'
import api from "../utils/api"
import { useCookies } from 'react-cookie'


import mag from "./icon/mag.png"

function AddTeam(props) {
    const storedUser = localStorage.getItem('user')
    const user = JSON.parse(storedUser)
    const [cookies] = useCookies(['session'])

    const { isAddTeam, onClose, onValueChange } = props

    const [partOfEmail, setPartOfEmail] = useState('')
    const [userList, setUserList] = useState([])

    const [email, setEmail] = useState({
        projectId: -1,
        partOfEmail: ''
    })

    const handleSubmit = event => {
        event.preventDefault()
        if(partOfEmail !== '') {
            api.post('/users/email', email)
            .then(response => {
                console.log(response.data)

                setUserList(response.data.data.userList)
            })
            .catch(error => {
                console.log(email)
                console.error(error)
            });
            setTeamOne(true)
        }
    }

    const [isTeamOne, setTeamOne] = useState(false)

    const handleInputTeam = (event) => {
        setEmail({
            ...email,
            [event.target.name]: event.target.value
        })
        if (event.target.name === 'partOfEmail') {
            setPartOfEmail(event.target.value)
          }
    }

    const handleBtnClick = () => {
        onClose(isAddTeam => !isAddTeam)
        onValueChange('partList', selectedUser)
      }

      const [selectedUser, setSelectedUser] = useState({})

        const handleCheckboxChange = (event) => {
            const email = event.target.value;
            setSelectedUser({
                firstName: event.target.dataset.firstName,
                lastName: event.target.dataset.lastName,
                email: email,
                userId: parseInt(event.target.dataset.userId)
            })
        }

    return(
        <Modal isOpen={isAddTeam} onRequestClose={onClose} className="team-modal">
            <div className="team-select-box">
                <div className="team-Input-close"><span onClick={ onClose }>x</span></div>
                <div className="team-Input-box">
                    <input 
                    className='team-Input' 
                    type='text' 
                    name='partOfEmail' 
                    value={partOfEmail} 
                    onChange={handleInputTeam} 
                    placeholder="Search user email"
                    />
                    <div className="mag-img-box"><img className="mag-img" src={ mag } onClick={ handleSubmit } /></div>
                </div>
                <div className={userList.length > 0 ? "team-one-box" : "team-one-hideBox"} >
                    {userList.map((user, index) => (
                        <label className="project-team-label" >
                            <input 
                            type="checkbox" 
                            className="team-chk"
                            value={user.email}
                            data-first-name={user.firstName}
                            data-last-name={user.lastName}
                            data-user-id={user.userId}
                            checked={selectedUser.email === user.email}
                            onChange={handleCheckboxChange}
                            />
                            <div className="project-label-name"><span>{user.lastName}{user.firstName}</span></div>
                            <div><span>{user.email}</span></div>
                        </label>
                    ))}
                </div>
                <div className="team-oneBtn-box">
                    <button className="team-oneBtn" type="button" onClick={ handleBtnClick }>팀원 추가</button>
                </div>
            </div>
        </Modal>
    
      )
    }
  
    export default AddTeam