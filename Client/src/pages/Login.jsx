import React, { useState, useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {

  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin } = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    try {
      axios.defaults.withCredentials = true

      let data;

      if (state === 'Sign Up') {
        ({ data } = await axios.post(
          backendUrl + '/api/auth/register',
          { name, email, password }
        ))
      } else {
        ({ data } = await axios.post(
          backendUrl + '/api/auth/login',
          { email, password }
        ))
      }

      if (data.success) {
        setIsLoggedin(true)
        navigate('/')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Authentication failed"
      )
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-indigo-300 to-purple-400'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </h2>

        <p className='text-center text-sm mb-6'>
          {state === 'Sign Up' ? 'Create your Account' : 'Login to your account!'}
        </p>

        <form onSubmit={onSubmitHandler}>

          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className='bg-transparent outline-none'
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className='mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} />
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='bg-transparent outline-none'
              type="email"
              placeholder="Email"
              required
            />
          </div>

          <div className='mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} />
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='bg-transparent outline-none'
              type="password"
              placeholder="Password"
              required
            />
          </div>

          {state !== 'Sign Up' && (
            <p
              onClick={() => navigate('/reset-password')}
              className='mb-4 text-indigo-500 cursor-pointer'
            >
              Forgot password?
            </p>
          )}

          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>
            {state}
          </button>
        </form>

        <p className='text-gray-400 text-center text-xs mt-4'>
          {state === 'Sign Up'
            ? <>Already have an Account? <span onClick={() => setState('Login')} className='text-blue-400 cursor-pointer underline'>Login here</span></>
            : <>Don't have an Account? <span onClick={() => setState('Sign Up')} className='text-blue-400 cursor-pointer underline'>Sign Up</span></>
          }
        </p>
      </div>
    </div>
  )
}

export default Login
