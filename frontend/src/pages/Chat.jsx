import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'

export default function Chat() {
  const { user } = useAuth()
  const [workspaceId, setWorkspaceId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  // Load workspace on mount
  useEffect(() => {
    api.workspaces.list().then(data => {
      if (data.workspaces?.length > 0) {
        setWorkspaceId(data.workspaces[0].id)
      }
    })
  }, [])

  // Load conversations when workspace is set
  useEffect(() => {
    if (!workspaceId) return
    loadConversations()
  }, [workspaceId])

  const loadConversations = async () => {
    try {
      const data = await api.chat.listConversations(workspaceId)
      setConversations(data.conversations || [])
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }

  const handleNewChat = async () => {
    try {
      const conv = await api.chat.createConversation(workspaceId)
      setConversations(prev => [conv, ...prev])
      setActiveConversation(conv)
      setMessages([])
    } catch (err) {
      console.error('Failed to create conversation:', err)
    }
  }

  const handleSelectConversation = async (conv) => {
    setActiveConversation(conv)
    setLoading(true)
    try {
      const data = await api.chat.getConversation(conv.id)
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (content) => {
    if (!activeConversation || sending) return
    setSending(true)

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const response = await api.chat.sendMessage(activeConversation.id, content)
      setMessages(prev => [...prev, response])

      // Refresh conversation list to update titles
      loadConversations()
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ Error: ' + err.message,
        created_at: new Date().toISOString(),
      }])
    } finally {
      setSending(false)
    }
  }

  const handleRename = async (convId, title) => {
    await api.chat.renameConversation(convId, title)
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c))
    if (activeConversation?.id === convId) {
      setActiveConversation(prev => ({ ...prev, title }))
    }
  }

  const handleDelete = async (convId) => {
    await api.chat.deleteConversation(convId)
    setConversations(prev => prev.filter(c => c.id !== convId))
    if (activeConversation?.id === convId) {
      setActiveConversation(null)
      setMessages([])
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <Sidebar
        user={user}
        conversations={conversations}
        activeConversation={activeConversation}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onRename={handleRename}
        onDelete={handleDelete}
      />
      <ChatWindow
        conversation={activeConversation}
        messages={messages}
        loading={loading}
        sending={sending}
        onSendMessage={handleSendMessage}
        onNewChat={handleNewChat}
      />
    </div>
  )
}