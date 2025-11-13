import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data.user)
        initializeSocket(token, res.data.user)
      })
      .catch(() => {
        localStorage.removeItem('token')
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  function initializeSocket(token, userData) {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token
      }
    })

    newSocket.on('connect', () => {
      newSocket.emit('user:join', {
        userId: userData.id,
        username: userData.username
      })
    })

    setSocket(newSocket)
    setLoading(false)
  }

  function login(userData, token) {
    localStorage.setItem('token', token)
    setUser(userData)
    initializeSocket(token, userData)
  }

  function logout() {
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    socket,
    login,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

