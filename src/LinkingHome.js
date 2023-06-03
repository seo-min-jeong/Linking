import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

import InitialProjectModal from "./component/InitialProjectModal";

function LinkingHome(props) {
    const { onValueProjectList, setIsLoggedIn } = props
    const navigate = useNavigate()

    const [isOpen, setIsOpen] = useState(true)

    const onClickButton = () => {
        setIsOpen(isOpen => !isOpen)
    }

    const handleProjectList = (newValue) => {
        console.log(newValue)
        onValueProjectList(newValue)
        navigate(process.env.PUBLIC_URL + '/home')
        setIsLoggedIn(true)
    }

    return (
        <div>
            <InitialProjectModal 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            onClose={onClickButton} 
            onValueProjectList={handleProjectList}
            />
        </div>
    )
}

export default LinkingHome