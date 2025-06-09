


import React, { useState, useEffect, useCallback, useRef } from "react";
import Cross from "../../public/images/cross.png";
import CopyImage from "../../public/images/copy.png";
import InputField from "./InputField";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const socket = io(baseUrl);
const ShareModal = ({
  ownerId,
  roomId,
  openModal,
  setopenModal,
  isReadOnly,
  setIsReadOnly,
  token,
}) => {

  const CopyRef = useRef(null);
  const [Copy, setCopy] = useState(window.location.href);
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden";
      setCopy(window.location.href);
    } else {
      document.body.style.overflow = "auto";
    }
  }, [openModal]);

  const CopyCode = useCallback(() => {
    CopyRef.current?.select();
    window.navigator.clipboard.writeText(Copy);
  }, [Copy]);

  const handleToggleViewOnly = () => {
    if(isLoggedIn){
      const newStatus = !isReadOnly;
      setIsReadOnly(newStatus);
      socket.emit("update-readonly-status", roomId, newStatus);
  }
  };

  if (!openModal) return null;

  return (
    <div className="w-full h-screen bg-[#16161694] top-0 left-0 fixed z-10 flex items-center justify-center">
      <div className="relative w-[90%] md:w-[70%] lg:w-[50%] xl:w-[40%] bg-white rounded-lg shadow-lg py-6 md:px-6 px-4 overflow-y-auto md:h-[520px]">
        <div
          className="absolute right-4 top-4 cursor-pointer z-50 text-black"
          onClick={() => setopenModal(false)}
        >
          <img className="w-4 h-4" src={Cross} alt="cross" />
        </div>
        <p className="w-full text-black lg:text-[38px] md:text-[30px] text-[22px] mx-auto p-2">
          Share Code
        </p>

        <p className="w-full text-black mx-auto p-2">
          Anyone with access to this URL will see your code in real time.
        </p>

        <p className="text-[#8e9095] w-full text-[16px] mx-auto p-2">
          Share this URL
        </p>
        <div className="md:w-[70%] w-[90%] p-2">
          <InputField
            innerDiv="w-full text11 outline-none"
            inputStyle="bg-transparent text-black w-full py-3 p-2 border-[1px] rounded-md border-[#8e9095]"
            readOnly
            values={Copy}
            trailingImage={CopyImage}
            imageStyle="w-[30px] cursor-pointer"
            inputRef={CopyRef}
            imgClick={CopyCode}
          />
        </div>
        {isLoggedIn && ownerId && user?.id === ownerId && (
        <>
        <p className="text-[#8e9095] w-full mx-auto p-2">"View only" mode</p>
        
        <label className="flex items-center cursor-pointer bg-white rounded-full p-2">
          <div className="relative w-[106px] h-[56px]">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isReadOnly}
              onChange={()=>handleToggleViewOnly()}
              disabled={!token}
            />
            <div className="w-full h-full bg-gray-300 rounded-full transition-colors duration-300 peer-checked:bg-blue-600 flex items-center justify-between px-2">
              <span className="text-white font-bold text-sm">ON</span>
              <span className="text-white font-bold text-sm">OFF</span>
            </div>
            <div className="absolute left-1 top-1 w-[48px] h-[48px] bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-[48px]"></div>
          </div>
        </label>

        <p className="text-[#8e9095] w-full mx-auto p-2">
          Turn on "view only" mode if you don't want others to edit the code
        </p>
          </>
          )}
        <div className="mt-4 p-2">
          <button
            className="bg-[#ec3360] text-white px-4 py-2 rounded-md"
            onClick={() => setopenModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
