import {useCallback, useState} from 'react'
import {io} from "socket.io-client";
import {Message} from "@/types/ChatThread";
import {NewMessage, RCConversation, NewTitelessConversation} from '@my-monorepo/shared';

const PATH = process.env.NEXT_PUBLIC_BACKEND_API + '/conversational-retrieval-qa'

const useConversation = (
  onQuestionReceived: (message: Message) => void,
  onLatestResponseComplete: (message: Message) => void,
  setConversationId: (id: number) => void) => {
  const [response, setResponse] = useState<NewMessage>();
  const [resources, setResources] = useState<any>();

  const sendQuestion = useCallback((question: string, conversationId?: number, newConversation?: NewTitelessConversation ) => {
    const socket = io(PATH)
    console.log('sendQuestion')
    socket.emit('getCompletion', {
      conversationId,
      question,
      newConversation
    })
    socket.on('data', (data) => {
      console.log('handle emitted data', data)
      const tokenMessage = data.content as NewMessage
      if (data.type === 'conversationDetails') {
        const conversation = data.content as RCConversation
        setConversationId(conversation.id)
      }
      console.log(tokenMessage)
      if (data.type === 'token' && tokenMessage.type === 'response-token') {
        setResponse((prev) => {
          if (!prev) return tokenMessage
          return {
            ...tokenMessage,
            content: prev.content + tokenMessage.content
          }
        })
      }
      if (data.type === 'retrieval') {
        onLatestResponseComplete(data.content)
      }
      if (data.type === 'response') {
        onLatestResponseComplete(data.content)
        setResponse(undefined)
      }
      if (data.type === 'question') {
        onQuestionReceived(data.content)
      }
    })
    socket.on('error', (error) => {
      console.error('error', error)
    })
    socket.on('disconnect', (reason) => {
      console.log('disconnect', reason)
    })

    return () => {
      socket.close()
    };
  }, [onLatestResponseComplete]);

  return {response, sendQuestion, resources};
}

export default useConversation
