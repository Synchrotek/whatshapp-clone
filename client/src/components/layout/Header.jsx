import { useState } from "react";
import { IoMdAdd, IoMdSearch, IoMdNotificationsOutline } from "react-icons/io";
import { MdLogout, MdGroups } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const [isSearch, setIsSearch] = useState(false);
    const [isNewGroup, setIsNewGroup] = useState(false);
    const [isNotification, setIsNotification] = useState(false);

    const openSearchDialog = () => {
        setIsSearch(prev => !prev)
    }

    const openNotification = () => {
        setIsNotification(prev => !prev);
    }

    const openNewGroup = () => {
        setIsNewGroup(prev => !prev);
    };

    const logoutHandler = () => {

    };

    const navigateToGroup = () => navigate('/groups');

    return (
        <div className="flex p-2 gap-2">
            <button
                className="tooltip tooltip-bottom"
                data-tip="Search"
                onClick={openSearchDialog}
            >
                <IoMdSearch />
            </button>
            <button
                className="tooltip tooltip-bottom"
                data-tip="New Group"
                onClick={openNewGroup}
            >
                <IoMdAdd />
            </button>
            <button
                className="tooltip tooltip-bottom"
                data-tip="Manage groups"
                onClick={navigateToGroup}
            >
                <MdGroups />
            </button>
            <button
                className="tooltip tooltip-bottom"
                data-tip="Notifications"
                onClick={openNotification}
            >
                <IoMdNotificationsOutline />
            </button>
            <button
                className="tooltip tooltip-bottom"
                data-tip="Logout"
                onClick={logoutHandler}
            >
                <MdLogout />
            </button>
        </div>
    )
}

export default Header