import React from 'react'
import { useNavigate } from 'react-router-dom'
function ForgetPassword() {
    const navigate = useNavigate()
  return (

    <div>
      <h1>Check your Gmail inbox for new Password</h1>
      <button onClick={navigate('/login')}>Login</button>
    </div>
  )
}

export default ForgetPassword
